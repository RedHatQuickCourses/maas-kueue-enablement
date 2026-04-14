# GPU-as-a-Service Architecture Reference

**Source**: Production reference implementation from `/Users/kaknox/Documents/GitHub/gpu-as-a-service/`

This document provides the architectural foundation for understanding multi-tenant GPU quota management using Red Hat Build of Kueue on OpenShift AI.

---

## Use Case: Multi-Tenant GPU Scarcity Management

Organizations running AI/ML workloads on OpenShift face a shared GPU scarcity problem: multiple teams (e.g., inference serving and model training) compete for the same limited pool of GPUs, leading to:

- **Resource starvation**: Critical inference workloads wait while training jobs consume all GPUs
- **Unpredictable scheduling**: No guarantees about when workloads will start
- **Manual intervention**: Platform teams manually adjust priorities and kill jobs
- **Poor GPU utilization**: Teams over-request GPUs "just in case," leading to idle resources

### Business Impact Without GPU-as-a-Service

| Problem | Business Impact |
|---------|----------------|
| Inference latency spikes during training runs | Customer-facing APIs degrade, SLA violations |
| Training jobs starved for days | Model development velocity drops 60% |
| Manual GPU rebalancing | Platform team spends 20+ hours/week firefighting |
| GPU utilization below 40% | $150K/year wasted on idle GPUs |

### Solution: GPU-as-a-Service with Kueue

This architecture implements a **GPU-as-a-Service** model that provides:

1. **Guaranteed GPU quotas per team** with elastic borrowing when capacity is idle
2. **Priority-based preemption** so high-priority inference workloads can reclaim GPUs from training
3. **Self-service integration** via OpenShift AI dashboard Hardware Profiles
4. **Real-time monitoring** with Grafana dashboards tracking utilization, borrowing, and preemption

**Result**: GPU utilization increases to 85-90%, inference SLAs protected, training throughput predictable.

---

## Architecture Overview

```
                         ┌──────────────┐
                         │  gpu-cohort   │
                         │   (Cohort)    │
                         │  4 GPUs total │
                         └──────┬───────┘
                                │
                ┌───────────────┼───────────────┐
                │                               │
       ┌────────┴─────────┐           ┌─────────┴────────┐
       │   inference-cq    │           │   training-cq     │
       │  (ClusterQueue)   │           │  (ClusterQueue)   │
       │                   │           │                   │
       │  Guaranteed: 3 GPU│           │  Guaranteed: 1 GPU│
       │  Borrow:  up to 1 │           │  Borrow:  up to 2 │
       │  Max:     4 GPUs  │           │  Max:     3 GPUs  │
       │  Priority: 1000   │           │  Priority: 100    │
       └────────┬──────────┘           └─────────┬─────────┘
                │                                │
       ┌────────┴──────────┐           ┌─────────┴─────────┐
       │   team-inference   │           │   team-training    │
       │   (LocalQueue)     │           │   (LocalQueue)     │
       │   ns: team-inference│          │   ns: team-training│
       └────────┬──────────┘           └─────────┬─────────┘
                │                                │
       ┌────────┴──────────┐           ┌─────────┴─────────┐
       │   highpriority     │           │   lowpriority      │
       │ (HardwareProfile)  │           │ (HardwareProfile)  │
       │   GPU: 1-4         │           │   GPU: 1-3         │
       └───────────────────┘           └────────────────────┘
```

### Component Hierarchy

| Component | Scope | Purpose | Count in Reference Architecture |
|-----------|-------|---------|--------------------------------|
| **Cohort** | Cluster | Groups ClusterQueues for elastic quota sharing | 1 (`gpu-cohort`) |
| **ClusterQueue** | Cluster | Defines nominal quota, borrowing limits, preemption policies | 2 (`inference-cq`, `training-cq`) |
| **LocalQueue** | Namespace | Namespace-scoped queue pointing to a ClusterQueue | 2 (`team-inference`, `team-training`) |
| **ResourceFlavor** | Cluster | Defines node selectors and tolerations for workload placement | 2 (`gpu-flavor`, `default-flavor`) |
| **WorkloadPriorityClass** | Cluster | Assigns numeric priority for preemption decisions | 2 (`inference-priority`: 1000, `training-priority`: 100) |
| **HardwareProfile** | Cluster | OpenShift AI dashboard integration for self-service | 2 (`highpriority`, `lowpriority`) |

---

## GPU Quota Allocation

The reference architecture manages a **4-GPU cluster** shared between two teams:

| ClusterQueue | Guaranteed GPUs | Borrowing Limit | Max Usable GPUs | Priority Value |
|--------------|----------------|----------------|-----------------|----------------|
| `inference-cq` | 3 | 1 | 4 | 1000 (high) |
| `training-cq` | 1 | 2 | 3 | 100 (low) |
| **Cohort Total** | **4** | — | — | — |

### Scheduling Scenarios

| Scenario | Inference GPUs in Use | Training GPUs in Use | Total GPUs Used | Notes |
|----------|----------------------|---------------------|----------------|-------|
| **Only inference active** | 4 (3 guaranteed + 1 borrowed) | 0 | 4 | Inference borrows training's idle quota |
| **Only training active** | 0 | 3 (1 guaranteed + 2 borrowed) | 3 | Training can borrow up to 2, hitting its max of 3 |
| **Both teams active, no contention** | 3 (guaranteed) | 1 (guaranteed) | 4 | Fair sharing under normal load |
| **Inference needs 4th GPU while training uses 1** | 4 (preempts training) | 0 (suspended) | 4 | Inference reclaims its lent GPU via preemption |

---

## Preemption Rules

The architecture implements **asymmetric preemption** to protect high-priority inference workloads:

### Inference ClusterQueue Preemption Policies

```yaml
preemption:
  reclaimWithinCohort: Any                    # Can reclaim lent quota from ANY workload
  borrowWithinCohort:
    policy: LowerPriority                     # Can preempt lower-priority workloads to borrow
    maxPriorityThreshold: 100                 # Only preempts workloads with priority ≤ 100
  withinClusterQueue: LowerPriority           # Can preempt lower-priority workloads within own queue
```

**Practical Effects**:
- ✅ **Inference can preempt training to borrow GPUs**: `borrowWithinCohort: LowerPriority` with `maxPriorityThreshold: 100` allows inference (priority 1000) to evict training workloads (priority 100) when it needs to borrow from the cohort.
- ✅ **Inference can always reclaim its lent quota**: With `reclaimWithinCohort: Any`, if training borrowed inference's idle GPUs and inference needs them back, inference preempts training regardless of priority.
- ✅ **Inference protects critical workloads**: Within the inference queue, lower-priority jobs are preempted first.

### Training ClusterQueue Preemption Policies

```yaml
preemption:
  reclaimWithinCohort: LowerPriority          # Can only reclaim from lower-priority workloads
  # NO borrowWithinCohort policy              # Cannot preempt to borrow
  withinClusterQueue: LowerPriority           # Can preempt within own queue
```

**Practical Effects**:
- ❌ **Training cannot preempt inference to borrow GPUs**: No `borrowWithinCohort` policy means training can only use GPUs that are genuinely idle in the cohort.
- ⚠️ **Training reclaim is limited**: With `reclaimWithinCohort: LowerPriority`, training can only reclaim its lent quota by preempting workloads with priority < 100. Since inference has priority 1000, training cannot reclaim from inference.
- ✅ **Training protects within its own queue**: Lower-priority training jobs are preempted first.

### Preemption Decision Matrix

| Scenario | Inference Action | Training Action |
|----------|-----------------|----------------|
| Inference needs 4th GPU, training using 1 guaranteed GPU | **Preempts training** (reclaim lent quota) | Training workload suspended |
| Inference idle with 3 GPUs, training wants to borrow | Training borrows up to 2 (total 3) | No preemption needed |
| Training using 3 borrowed GPUs, inference needs 1 | **Inference preempts training** (reclaim) | Training drops to 0, workload suspended |
| Both teams at guaranteed quotas (3+1), inference wants 4th | **Inference preempts training** (borrow via priority) | Training suspended |
| Both teams at guaranteed quotas (3+1), training wants 2nd | Training **cannot** preempt inference | Training workload stays pending |

---

## Resource Flavors

Resource flavors define **where** workloads can be scheduled and **how** they tolerate node taints.

### GPU Flavor

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: ResourceFlavor
metadata:
  name: gpu-flavor
spec:
  nodeLabels:
    nvidia.com/gpu.present: "true"           # Only schedule on GPU nodes
  tolerations:
    - key: nvidia.com/gpu                    # Tolerate GPU taint
      operator: Exists
      effect: NoSchedule
```

**Purpose**: Ensures GPU workloads land on GPU-enabled nodes and tolerate the `nvidia.com/gpu=Exists:NoSchedule` taint applied by the GPU Operator.

### Default Flavor

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: ResourceFlavor
metadata:
  name: default-flavor
```

**Purpose**: Allows CPU/memory-only workloads to schedule anywhere (no node selectors or tolerations).

### Usage in ClusterQueues

Each ClusterQueue defines **resource groups** that map resources to flavors:

```yaml
resourceGroups:
  - coveredResources: [cpu, memory]
    flavors:
      - name: default-flavor          # CPU/Memory can use any node
        resources:
          - name: cpu
            nominalQuota: 32
          - name: memory
            nominalQuota: 36Gi
  - coveredResources: [nvidia.com/gpu]
    flavors:
      - name: gpu-flavor              # GPUs use gpu-flavor (GPU nodes only)
        resources:
          - name: nvidia.com/gpu
            nominalQuota: "3"
            borrowingLimit: "1"
```

---

## Hardware Profiles: OpenShift AI Dashboard Integration

Hardware profiles provide **self-service** GPU selection in the OpenShift AI dashboard. Data scientists select a profile when launching a workbench or serving runtime, and the platform automatically routes the workload to the correct queue with the appropriate priority.

### High-Priority Profile (Inference Team)

```yaml
apiVersion: infrastructure.opendatahub.io/v1
kind: HardwareProfile
metadata:
  name: highpriority
  namespace: redhat-ods-applications
  annotations:
    opendatahub.io/display-name: highPriority
spec:
  identifiers:
    - identifier: nvidia.com/gpu
      displayName: NVIDIA L4
      resourceType: Accelerator
      minCount: 1
      maxCount: 4                       # Can request 1-4 GPUs
  scheduling:
    type: Queue
    kueue:
      localQueueName: team-inference    # Routes to inference queue
      priorityClass: inference-priority # Assigns priority 1000
```

**Effect**: Workloads using this profile are automatically queued in `team-inference` LocalQueue with priority 1000, enabling preemption of training workloads.

### Low-Priority Profile (Training Team)

```yaml
spec:
  identifiers:
    - identifier: nvidia.com/gpu
      maxCount: 3                       # Limited to 3 GPUs max
  scheduling:
    type: Queue
    kueue:
      localQueueName: team-training     # Routes to training queue
      priorityClass: training-priority  # Assigns priority 100
```

**Effect**: Workloads using this profile are queued in `team-training` LocalQueue with priority 100, subject to preemption by inference.

### User Experience

1. Data scientist opens OpenShift AI dashboard
2. Selects **"Create Workbench"** or **"Deploy Model"**
3. Chooses hardware profile: `highPriority` or `lowPriority`
4. Platform automatically:
   - Routes workload to correct LocalQueue
   - Assigns WorkloadPriorityClass
   - Schedules based on quota and preemption policies
5. Data scientist sees workload status in dashboard (Pending → Running)

---

## Prerequisites

| Component | Version | Installation Method |
|-----------|---------|-------------------|
| **Red Hat OpenShift** | 4.20+ | — |
| **Red Hat OpenShift AI** | 3.3+ | OperatorHub |
| **Red Hat Build of Kueue** | Enabled in `DataScienceCluster` CR | Set `kueue.managementState: Managed` |
| **Grafana Operator** | Community v5 | OperatorHub in `grafana` namespace |
| **NVIDIA GPU Operator** | Latest compatible | OperatorHub |

### Pre-deployment Validation

Before deploying GPU-as-a-Service, verify:

```bash
# 1. Kueue is enabled in OpenShift AI
oc get datasciencecluster -o jsonpath='{.items[0].spec.components.kueue.managementState}'
# Expected: "Managed"

# 2. GPU Operator is running
oc get pods -n nvidia-gpu-operator
# Expected: All pods Running

# 3. GPU nodes are labeled and tainted
oc get nodes -l nvidia.com/gpu.present=true -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints
# Expected: Nodes with nvidia.com/gpu=Exists:NoSchedule taint

# 4. Grafana Operator is installed
oc get pods -n grafana
# Expected: grafana-operator pod Running
```

---

## Deployment Options

### Option 1: ArgoCD (GitOps - Recommended)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: gpu-as-a-service
  namespace: openshift-gitops
spec:
  destination:
    server: https://kubernetes.default.svc
  source:
    repoURL: <your-repo-url>
    path: base
    targetRevision: main
  project: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

**Benefits**: Declarative, version-controlled, auditable, automatic drift correction.

### Option 2: Manual Kustomize

```bash
oc apply -k base/
```

**Use case**: Quick testing, non-production environments.

---

## Production Considerations

### Sizing Recommendations

| Cluster Size | Recommended Cohort Strategy | Notes |
|--------------|----------------------------|-------|
| **< 8 GPUs** | Single cohort, 2-3 ClusterQueues | Simple, effective for small teams |
| **8-32 GPUs** | 2-3 cohorts (by workload type: inference, training, interactive) | Balance fairness and utilization |
| **> 32 GPUs** | Multiple cohorts + hierarchical quotas | Consider geographic or org-unit based cohorts |

### When to Use Separate Cohorts vs. Single Cohort

| Use Case | Recommendation | Reason |
|----------|---------------|--------|
| Inference and training teams, both using GPUs regularly | **Single cohort** | Maximize utilization via borrowing |
| Separate business units with strict isolation requirements | **Separate cohorts** | No quota borrowing across BUs |
| Mix of preemptible (training) and non-preemptible (inference) workloads | **Single cohort with preemption policies** | Protect inference via priority |
| Development and production environments | **Separate cohorts** | Prevent dev workloads from affecting prod |

### Monitoring and Alerting

See [monitoring-guide.md](./monitoring-guide.md) for detailed dashboard and alert configuration.

**Key metrics to watch**:
- `kueue_cluster_queue_resource_usage / kueue_cluster_queue_nominal_quota > 0.95` (quota exhaustion)
- `kueue_pending_workloads > 10` for 5+ minutes (backlog)
- `rate(kueue_evicted_workloads_total[1h]) > 5` (high preemption rate)

---

## Next Steps

- **Learn the configuration**: See [yaml-examples.md](./yaml-examples.md) for annotated YAML examples
- **Understand monitoring**: See [monitoring-guide.md](./monitoring-guide.md) for Grafana dashboard setup
- **Deploy the architecture**: Use the configurations in `/Users/kaknox/Documents/GitHub/gpu-as-a-service/base/`
