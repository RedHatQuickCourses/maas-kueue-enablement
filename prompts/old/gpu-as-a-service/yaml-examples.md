# GPU-as-a-Service: Annotated YAML Configuration Examples

**Source**: Production reference implementation from `/Users/kaknox/Documents/GitHub/gpu-as-a-service/base/`

This document provides fully annotated YAML examples for all Kueue components in the GPU-as-a-Service architecture, with detailed explanations of each field and its purpose.

---

## Table of Contents

1. [Cohort](#cohort)
2. [ClusterQueues](#clusterqueues)
3. [LocalQueues](#localqueues)
4. [ResourceFlavors](#resourceflavors)
5. [WorkloadPriorityClasses](#workloadpriorityclasses)
6. [HardwareProfiles](#hardwareprofiles)

---

## Cohort

**Purpose**: Groups ClusterQueues to enable elastic quota sharing (borrowing) across teams.

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: Cohort
metadata:
  name: gpu-cohort  # <1>
```

**Annotations**:

<1> **Cohort name**: Referenced by ClusterQueues via `spec.cohortName`. All ClusterQueues in the same cohort can borrow idle quota from each other, subject to preemption policies.

**Key Concepts**:
- **Nominal quota**: Each ClusterQueue's guaranteed allocation within the cohort
- **Borrowing**: ClusterQueues can exceed their nominal quota by using idle quota from other ClusterQueues in the cohort
- **Cohort total**: Sum of all nominal quotas across ClusterQueues in the cohort (4 GPUs in reference architecture)

---

## ClusterQueues

ClusterQueues define **guaranteed quotas**, **borrowing limits**, and **preemption policies** for a team or workload class.

### Inference ClusterQueue (High Priority)

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: ClusterQueue
metadata:
  name: inference-cq  # <1>
spec:
  preemption:
    reclaimWithinCohort: Any  # <2>
    borrowWithinCohort:
      policy: LowerPriority  # <3>
      maxPriorityThreshold: 100  # <4>
    withinClusterQueue: LowerPriority  # <5>
  namespaceSelector:  # <6>
    matchLabels:
      kubernetes.io/metadata.name: team-inference
  queueingStrategy: BestEffortFIFO  # <7>
  cohortName: gpu-cohort  # <8>
  resourceGroups:  # <9>
  - coveredResources:  # <10>
    - cpu
    - memory
    flavors:
    - name: default-flavor  # <11>
      resources:
      - name: cpu
        nominalQuota: 32  # <12>
      - name: memory
        nominalQuota: 36Gi
  - coveredResources:
    - nvidia.com/gpu
    flavors:
    - name: gpu-flavor  # <13>
      resources:
      - name: nvidia.com/gpu
        nominalQuota: "3"  # <14>
        borrowingLimit: "1"  # <15>
```

**Annotations**:

<1> **ClusterQueue name**: Cluster-scoped resource. Referenced by LocalQueues.

<2> **reclaimWithinCohort: Any**: Allows this ClusterQueue to reclaim its lent quota from **any** workload in the cohort, regardless of priority. If inference lent 1 GPU to training and now needs it back, inference can preempt training even though training has lower priority.

<3> **borrowWithinCohort.policy: LowerPriority**: Allows this ClusterQueue to preempt **lower-priority** workloads in the cohort when borrowing. Inference (priority 1000) can preempt training (priority 100) to borrow GPUs.

<4> **maxPriorityThreshold: 100**: Only preempts workloads with priority ≤ 100. Inference can preempt training (priority 100) but not other high-priority inference workloads.

<5> **withinClusterQueue: LowerPriority**: Within the inference queue itself, lower-priority workloads are preempted first.

<6> **namespaceSelector**: Restricts which namespaces can use this ClusterQueue via LocalQueues. Only `team-inference` namespace can reference this ClusterQueue.

<7> **queueingStrategy: BestEffortFIFO**: Workloads are scheduled in FIFO order with best-effort fairness. Alternative: `StrictFIFO` (strict ordering, may block smaller workloads behind large ones).

<8> **cohortName**: Associates this ClusterQueue with the `gpu-cohort` Cohort, enabling quota borrowing from `training-cq`.

<9> **resourceGroups**: Groups resources by type (CPU/Memory vs. GPU) and assigns flavors to each group.

<10> **coveredResources**: Resources managed by this resource group. CPU and memory use `default-flavor`, GPUs use `gpu-flavor`.

<11> **default-flavor**: No node selectors or tolerations—workloads can schedule anywhere.

<12> **nominalQuota: 32**: Guaranteed allocation of 32 CPUs for inference team. No borrowing limit specified = unlimited borrowing for CPU/memory.

<13> **gpu-flavor**: Includes node selector (`nvidia.com/gpu.present: "true"`) and toleration (`nvidia.com/gpu`), ensuring GPU workloads land on GPU nodes.

<14> **nominalQuota: "3"**: Guaranteed allocation of 3 GPUs. Even if training is using GPUs, inference is guaranteed 3.

<15> **borrowingLimit: "1"**: Inference can borrow up to 1 additional GPU from the cohort, for a maximum of 4 GPUs (3 guaranteed + 1 borrowed).

**Production Insight**:
- **Asymmetric preemption**: Inference can preempt training to borrow, but training cannot preempt inference. This protects customer-facing inference workloads while allowing training to opportunistically use idle GPUs.
- **Reclaim vs. Borrow**: `reclaimWithinCohort: Any` ensures inference can **always** get its quota back. `borrowWithinCohort: LowerPriority` allows inference to **borrow more** by preempting training.

---

### Training ClusterQueue (Low Priority)

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: ClusterQueue
metadata:
  name: training-cq  # <1>
spec:
  preemption:
    reclaimWithinCohort: LowerPriority  # <2>
    # NO borrowWithinCohort policy  # <3>
    withinClusterQueue: LowerPriority
  namespaceSelector:
    matchLabels:
      kubernetes.io/metadata.name: team-training
  queueingStrategy: BestEffortFIFO
  cohortName: gpu-cohort
  resourceGroups:
  - coveredResources:
    - cpu
    - memory
    flavors:
    - name: default-flavor
      resources:
      - name: cpu
        nominalQuota: 32
      - name: memory
        nominalQuota: 36Gi
  - coveredResources:
    - nvidia.com/gpu
    flavors:
    - name: gpu-flavor
      resources:
      - name: nvidia.com/gpu
        nominalQuota: "1"  # <4>
        borrowingLimit: "2"  # <5>
```

**Annotations**:

<1> **ClusterQueue name**: Training team's queue.

<2> **reclaimWithinCohort: LowerPriority**: Training can only reclaim its lent quota by preempting workloads with **lower priority**. Since inference has priority 1000 and training has priority 100, training **cannot** reclaim from inference. This creates asymmetric reclaim behavior.

<3> **No borrowWithinCohort policy**: Training **cannot** preempt other workloads to borrow. It can only borrow from genuinely idle quota. This prevents training from disrupting inference.

<4> **nominalQuota: "1"**: Training is guaranteed 1 GPU, even if inference is using all 4.

<5> **borrowingLimit: "2"**: Training can borrow up to 2 additional GPUs from the cohort, for a maximum of 3 GPUs (1 guaranteed + 2 borrowed). This prevents training from consuming all 4 GPUs and leaving none for inference.

**Production Insight**:
- **Opportunistic borrowing**: Training can use up to 3 GPUs when inference is idle, maximizing utilization.
- **Cannot block inference**: Training has no preemption power, so it can never delay inference workloads.
- **Max limit protects inference**: Training's max of 3 GPUs ensures at least 1 GPU is always available for inference to borrow back if needed.

---

## LocalQueues

LocalQueues are **namespace-scoped** and route workloads from a namespace to a ClusterQueue.

### Inference LocalQueue

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: LocalQueue
metadata:
  name: team-inference  # <1>
  namespace: team-inference  # <2>
spec:
  clusterQueue: inference-cq  # <3>
```

**Annotations**:

<1> **LocalQueue name**: Referenced by HardwareProfiles (`spec.scheduling.kueue.localQueueName`).

<2> **Namespace**: Must match the `namespaceSelector` in the ClusterQueue (`kubernetes.io/metadata.name: team-inference`).

<3> **clusterQueue**: Routes workloads in this namespace to the `inference-cq` ClusterQueue, inheriting its quota and preemption policies.

### Training LocalQueue

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: LocalQueue
metadata:
  name: team-training
  namespace: team-training
spec:
  clusterQueue: training-cq
```

**Production Insight**:
- **Workload submission**: Pods, Jobs, or custom workloads (RayClusters, TrainJobs) in the namespace must set `metadata.labels['kueue.x-k8s.io/queue-name']: team-inference` to be routed to this LocalQueue.
- **HardwareProfile integration**: HardwareProfiles automatically set this label, providing self-service queueing.

---

## ResourceFlavors

ResourceFlavors define **node selectors** and **tolerations** for workload placement.

### GPU Flavor

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: ResourceFlavor
metadata:
  name: gpu-flavor  # <1>
spec:
  nodeLabels:  # <2>
    nvidia.com/gpu.present: "true"
  tolerations:  # <3>
    - key: nvidia.com/gpu
      operator: Exists
      effect: NoSchedule
```

**Annotations**:

<1> **ResourceFlavor name**: Referenced by ClusterQueue `resourceGroups.flavors`.

<2> **nodeLabels**: Kueue adds this as a `nodeSelector` to workloads using this flavor. Ensures GPU workloads only schedule on nodes labeled `nvidia.com/gpu.present=true` by the GPU Operator.

<3> **tolerations**: Kueue adds this toleration to workloads using this flavor. GPU nodes are typically tainted with `nvidia.com/gpu=Exists:NoSchedule` to prevent non-GPU workloads from scheduling on them.

**Production Insight**:
- **Automatic scheduling constraints**: Developers don't need to specify node selectors or tolerations—Kueue injects them based on the ResourceFlavor.
- **Multi-GPU-type support**: You can create multiple ResourceFlavors for different GPU types (e.g., `gpu-a100-flavor`, `gpu-l4-flavor`) and assign them to different ClusterQueues or resource groups.

### Default Flavor

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: ResourceFlavor
metadata:
  name: default-flavor  # <1>
# No spec: no node selectors or tolerations
```

**Annotations**:

<1> **Default flavor**: Used for CPU/memory-only workloads. No scheduling constraints—workloads can land on any node.

---

## WorkloadPriorityClasses

WorkloadPriorityClasses assign numeric priority values to workloads, enabling preemption decisions.

### Inference Priority (High)

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: WorkloadPriorityClass
metadata:
  name: inference-priority  # <1>
value: 1000  # <2>
description: "Priority class for inference jobs"  # <3>
```

**Annotations**:

<1> **WorkloadPriorityClass name**: Referenced by HardwareProfiles (`spec.scheduling.kueue.priorityClass`).

<2> **value: 1000**: Numeric priority. **Higher values = higher priority**. Inference (1000) can preempt training (100).

<3> **description**: Human-readable description for documentation and debugging.

### Training Priority (Low)

```yaml
apiVersion: kueue.x-k8s.io/v1beta2
kind: WorkloadPriorityClass
metadata:
  name: training-priority
value: 100  # <1>
description: "Priority class for training jobs"
```

**Annotations**:

<1> **value: 100**: Lower priority than inference. Training workloads can be preempted by inference.

**Production Insight**:
- **Priority ranges**: Use meaningful ranges (e.g., 100-199 for training, 1000-1999 for inference, 5000+ for critical) to allow fine-grained control.
- **Default priority**: Workloads without a WorkloadPriorityClass get priority 0 (lowest).

---

## HardwareProfiles

HardwareProfiles integrate Kueue with the **OpenShift AI dashboard**, enabling self-service GPU selection.

### High-Priority Profile (Inference)

```yaml
apiVersion: infrastructure.opendatahub.io/v1
kind: HardwareProfile
metadata:
  annotations:
    opendatahub.io/dashboard-feature-visibility: '[]'  # <1>
    opendatahub.io/disabled: "false"  # <2>
    opendatahub.io/display-name: highPriority  # <3>
  name: highpriority  # <4>
  namespace: redhat-ods-applications  # <5>
spec:
  identifiers:  # <6>
  - defaultCount: 8  # <7>
    displayName: CPU
    identifier: cpu
    maxCount: 32
    minCount: 1
    resourceType: CPU
  - defaultCount: 16Gi
    displayName: Memory
    identifier: memory
    maxCount: 128Gi
    minCount: 2Gi
    resourceType: Memory
  - defaultCount: 1  # <8>
    displayName: NVIDIA L4
    identifier: nvidia.com/gpu
    maxCount: 4  # <9>
    minCount: 1
    resourceType: Accelerator
  scheduling:  # <10>
    kueue:
      localQueueName: team-inference  # <11>
      priorityClass: inference-priority  # <12>
    type: Queue
```

**Annotations**:

<1> **dashboard-feature-visibility**: Controls which OpenShift AI features show this profile. Empty `[]` = visible to all.

<2> **disabled: "false"**: Profile is enabled and visible in the dashboard.

<3> **display-name**: User-facing name in the OpenShift AI dashboard dropdown.

<4> **HardwareProfile name**: Kubernetes resource name (lowercase).

<5> **namespace**: Must be `redhat-ods-applications` (OpenShift AI's namespace).

<6> **identifiers**: Resource types available in this profile. Users see sliders/inputs for CPU, Memory, and GPU in the dashboard.

<7> **defaultCount: 8**: Default value shown in the dashboard. Users can adjust between `minCount` and `maxCount`.

<8> **defaultCount: 1**: Default GPU allocation. Most inference workloads start with 1 GPU.

<9> **maxCount: 4**: Maximum GPUs a user can request with this profile. Matches the inference ClusterQueue's max usable quota (3 guaranteed + 1 borrowed).

<10> **scheduling**: Tells OpenShift AI to use Kueue for scheduling (not direct pod scheduling).

<11> **localQueueName**: Workloads using this profile are automatically routed to the `team-inference` LocalQueue in the `team-inference` namespace.

<12> **priorityClass**: Workloads are assigned `inference-priority` (value 1000), enabling preemption of training.

**User Experience**:
1. Data scientist opens OpenShift AI dashboard
2. Clicks "Create Workbench" or "Deploy Model"
3. Selects "highPriority" from hardware profile dropdown
4. Adjusts GPU count (1-4 GPUs)
5. Clicks "Create"
6. Platform automatically:
   - Sets `kueue.x-k8s.io/queue-name: team-inference` label
   - Sets `kueue.x-k8s.io/priority-class: inference-priority` label
   - Workload queues in `team-inference` LocalQueue → `inference-cq` ClusterQueue
   - Kueue schedules based on quota, borrowing, and preemption

### Low-Priority Profile (Training)

```yaml
apiVersion: infrastructure.opendatahub.io/v1
kind: HardwareProfile
metadata:
  annotations:
    opendatahub.io/disabled: "false"
    opendatahub.io/display-name: lowPriority
  name: lowpriority
  namespace: redhat-ods-applications
spec:
  identifiers:
  - defaultCount: 8
    displayName: CPU
    identifier: cpu
    maxCount: 32
    minCount: 1
    resourceType: CPU
  - defaultCount: 16Gi
    displayName: Memory
    identifier: memory
    maxCount: 128Gi
    minCount: 2Gi
    resourceType: Memory
  - defaultCount: 1
    displayName: NVIDIA L4
    identifier: nvidia.com/gpu
    maxCount: 3  # <1>
    minCount: 1
    resourceType: Accelerator
  scheduling:
    kueue:
      localQueueName: team-training  # <2>
      priorityClass: training-priority  # <3>
    type: Queue
```

**Annotations**:

<1> **maxCount: 3**: Training is limited to 3 GPUs (1 guaranteed + 2 borrowed), ensuring inference can always reclaim at least 1 GPU.

<2> **localQueueName: team-training**: Routes to training queue.

<3> **priorityClass: training-priority**: Assigns priority 100 (lower than inference).

---

## Complete Example: Deploying a Workload

### Manual Workload Submission (without HardwareProfile)

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: inference-job
  namespace: team-inference
  labels:
    kueue.x-k8s.io/queue-name: team-inference  # <1>
    kueue.x-k8s.io/priority-class: inference-priority  # <2>
spec:
  template:
    spec:
      containers:
      - name: inference
        image: my-inference-server:latest
        resources:
          requests:
            nvidia.com/gpu: "2"  # <3>
            cpu: "8"
            memory: "16Gi"
      restartPolicy: Never
```

**Annotations**:

<1> **queue-name label**: Routes this workload to the `team-inference` LocalQueue.

<2> **priority-class label**: Assigns `inference-priority` (value 1000).

<3> **GPU request**: Requests 2 GPUs. Kueue checks if inference ClusterQueue has quota (guaranteed 3, can borrow 1 more for total of 4). If available, workload is admitted. If not, workload stays pending until quota is available or training workloads are preempted.

### Workload Lifecycle

1. **Submit**: User creates Job in `team-inference` namespace
2. **Queue**: Kueue detects the `kueue.x-k8s.io/queue-name` label and creates a Workload object
3. **Admit**: Kueue checks ClusterQueue quota:
   - If quota available: Admit workload (set `spec.suspend: false`)
   - If quota exceeded: Keep workload pending
   - If borrowing needed: Check cohort quota and preempt lower-priority workloads if allowed
4. **Schedule**: Kubernetes scheduler places pods on nodes matching ResourceFlavor constraints
5. **Run**: Workload executes
6. **Complete/Fail**: Kueue releases quota back to ClusterQueue

---

## Next Steps

- **Understand the architecture**: See [architecture-overview.md](./architecture-overview.md)
- **Set up monitoring**: See [monitoring-guide.md](./monitoring-guide.md)
- **Deploy the configuration**: Use `oc apply -k base/` or ArgoCD
