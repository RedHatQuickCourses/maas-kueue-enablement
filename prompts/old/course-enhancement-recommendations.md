# Course Enhancement Recommendations

**Source Analysis**: rhoai3-hwprofiles and rhoai3-gpu-aas courses  
**Date**: 2026-04-14  
**Analyzed By**: Claude Code  

This document contains prioritized recommendations for enhancing the maas-kueue-enablement course based on content from related RHOAI courses.

---

## Executive Summary

**Total Recommended Additions**: 73 minutes of content  
**Priority 1 (Critical)**: 12 minutes  
**Priority 2 (High Value)**: 21 minutes  
**Priority 3 (Nice-to-Have)**: 40 minutes  

### Course Overlap Analysis

| Course | Focus | Overlap | Unique Value |
|--------|-------|---------|--------------|
| **rhoai3-gpu-aas** | GPU virtualization + Kueue + Hardware Profiles | 60% | Time-slicing config, Supply/Control/Demand model |
| **rhoai3-hwprofiles** | Hardware Profile design + Kueue integration | 70% | Profile tiering strategy, Taints/Tolerations deep dive |

---

## Priority 1: Critical Additions (12 minutes)

These additions fix critical gaps and prevent common stumbling blocks.

### 1.1 Dashboard Configuration Prerequisites (5 minutes)

**Source**: rhoai3-hwprofiles → `modules/chapter1/pages/kueue.adoc` (lines 61-81)  
**Impact**: High - Prevents "Why can't I see Kueue UI?" support tickets  
**Location**: Chapter 4, Section 2 (s2-configure-quotas-lab.adoc) - "Before you begin"  

**Current Gap**: Course assumes Kueue UI is already enabled in the OpenShift AI dashboard.

**Add After**: Prerequisites verification section

```asciidoc
**Enable Kueue in OpenShift AI Dashboard:**

Before deploying Kueue resources, ensure the Kueue UI is enabled in the OpenShift AI dashboard:

[source,console,subs="verbatim,quotes"]
----
$ *oc patch odhdashboardconfig odh-dashboard-config -n redhat-ods-applications \
  --type=merge -p '{"spec":{"dashboardConfig":{"disableKueue": false}}}'*
odhdashboardconfig.opendatahub.io/odh-dashboard-config patched
----

This enables the **Distributed Workloads** → **Resource Management** UI in the OpenShift AI dashboard, allowing visual monitoring of ClusterQueues and pending workloads.

[NOTE]
====
When `disableKueue` is set to `false`, RHOAI automatically configures new projects for Kueue management by applying required namespace labels and generating a default LocalQueue.
====
```

**Verification Command**:
```bash
oc get odhdashboardconfig odh-dashboard-config -n redhat-ods-applications \
  -o jsonpath='{.spec.dashboardConfig.disableKueue}'
# Expected: false
```

---

### 1.2 Hardware Profile Scheduling Type Warning (2 minutes)

**Source**: rhoai3-hwprofiles → `modules/chapter1/pages/tiering.adoc` (lines 143-153)  
**Impact**: Critical - Prevents misconfiguration causing stuck workloads  
**Location**: Chapter 4, Section 3 (s3-hardware-profiles-lab.adoc) - Before "Create High-Priority Hardware Profile"  

**Current Gap**: Course doesn't explain the mutual exclusivity of `scheduling.type: Node` vs `scheduling.type: Queue`.

**Add Before Step 1**:

```asciidoc
[WARNING]
====
**Critical Configuration Decision: Node vs. Queue Scheduling**

Hardware Profiles support two mutually exclusive scheduling strategies:

* **`scheduling.type: Node`**: Static placement using `nodeSelector` and `tolerations`. The Hardware Profile directly controls where pods run. **Cannot be used with Kueue.**
* **`scheduling.type: Queue`**: Dynamic placement via Kueue. The Hardware Profile routes workloads to a LocalQueue, and Kueue's ResourceFlavor handles node placement. **This is what we use in GPU-as-a-Service.**

**Never mix both strategies in the same profile.** If you define `scheduling.kueue.localQueueName`, do **not** add `nodeSelector` or `tolerations` to the profile—these belong in the ResourceFlavor, not the Hardware Profile.

**Consequence of mixing**: Workloads will be admitted by Kueue but fail Kubernetes scheduling due to conflicting placement constraints, resulting in "Pending" pods with "Unschedulable" events.
====
```

**Example of INCORRECT configuration** (for documentation):
```yaml
# ❌ WRONG - Do not mix Queue and Node strategies
spec:
  scheduling:
    type: Queue
    kueue:
      localQueueName: team-inference
    node:                              # ❌ This conflicts with Queue
      nodeSelector:
        nvidia.com/gpu.present: "true" # ❌ Should be in ResourceFlavor
```

---

### 1.3 Namespace Labeling Requirement (2 minutes)

**Source**: rhoai3-hwprofiles → `modules/chapter1/pages/kueue-lab.adoc` (lines 21-38)  
**Impact**: High - Required prerequisite often missed  
**Location**: Chapter 4, Section 2 (s2-configure-quotas-lab.adoc) - "Before you begin"  

**Current Gap**: Course doesn't mention that namespaces must be explicitly labeled for Kueue management.

**Add After**: Namespace creation commands

```asciidoc
**Label Namespaces for Kueue Management:**

Kueue only manages namespaces explicitly labeled with `kueue.openshift.io/managed=true`. Apply this label to both team namespaces:

[source,console,subs="verbatim,quotes"]
----
$ *oc label namespace team-inference kueue.openshift.io/managed=true*
namespace/team-inference labeled

$ *oc label namespace team-training kueue.openshift.io/managed=true*
namespace/team-training labeled
----

Without this label, Kueue's admission controller will not intercept workloads in these namespaces, and workloads will bypass the queue system entirely.

**Verification:**

[source,console,subs="verbatim,quotes"]
----
$ *oc get namespace team-inference -o jsonpath='{.metadata.labels.kueue\.openshift\.io/managed}'*
true
----
```

**Alternative**: If dashboard configuration from 1.1 is enabled with `disableKueue: false`, new projects created via the dashboard will be auto-labeled. This manual step is only needed for pre-existing namespaces.

---

### 1.4 GPU Virtualization Prerequisite Note (3 minutes)

**Source**: rhoai3-gpu-aas → `modules/chapter1/pages/section2.adoc` (lines 1-125)  
**Impact**: Medium - Clarifies prerequisite knowledge  
**Location**: Chapter 4, Section 1 (s1-gpu-service-overview.adoc) - After "GPU-as-a-Service Architecture"  

**Current Gap**: Course focuses on quota management but doesn't explain GPU virtualization prerequisites.

**Add After**: "GPU-as-a-Service Architecture" section

```asciidoc
[NOTE]
====
**GPU Virtualization Prerequisite**

This course focuses on **quota management and multi-tenancy** using Kueue. It assumes your GPU nodes are already configured with GPU virtualization (time-slicing or MIG) via the NVIDIA GPU Operator.

**GPU Partitioning Strategies**:

* **Time-Slicing**: Interleaves workloads on a single GPU (4x-10x density for small models)
  * Example: 1 L40S (48GB) → 4 virtual GPUs (12GB each)
  * Best for: Inference, lightweight training, development
  * Trade-off: Shared memory, temporal multiplexing (no hard isolation)

* **MIG (Multi-Instance GPU)**: Hardware-partitioned GPU instances (A100/H100 only)
  * Example: 1 A100-40GB → 7x `1g.5gb` instances
  * Best for: Multi-tenant isolation, predictable performance
  * Trade-off: A100/H100 only, coarser partitioning than time-slicing

* **No Virtualization**: Dedicated full GPUs
  * Example: 1 GPU per workload
  * Best for: Large model training, maximum performance
  * Trade-off: Lowest density (40-60% utilization typical)

**Where to learn GPU virtualization**: For time-slicing or MIG configuration details, refer to the **maas-gpu-enablement** prerequisite course or the **rhoai3-gpu-aas** course.

The reference architecture in this chapter uses **time-sliced L40S GPUs** configured as 4 virtual GPUs per physical GPU. The ResourceFlavor `gpu-flavor` targets these virtualized nodes via the label `nvidia.com/gpu.present=true`.
====
```

**Related ConfigMap example** (for reference only, not to include in course):
```yaml
# Time-slicing configuration (from rhoai3-gpu-aas)
apiVersion: v1
kind: ConfigMap
metadata:
  name: time-slicing-config
  namespace: nvidia-gpu-operator
data:
  high-density-slice: |-
    version: v1
    sharing:
      timeSlicing:
        resources:
        - name: nvidia.com/gpu
          replicas: 4  # 1 physical GPU = 4 virtual
```

---

## Priority 2: High-Value Enhancements (21 minutes)

These additions improve learning outcomes and provide production-ready guidance.

### 2.1 "Wild West" Problem Framing (10 minutes)

**Source**: rhoai3-hwprofiles → `modules/chapter1/pages/index.adoc` (lines 1-21), `modules/chapter1/pages/kueue-lab.adoc` (lines 1-12)  
**Impact**: High - Strengthens business case with emotional resonance  
**Location**: Chapter 4, Section 1 (s1-gpu-service-overview.adoc) - Enhance "The Multi-Tenant GPU Scarcity Problem"  

**Current State**: Section has good concrete example but could benefit from stronger "before state" framing.

**Add Subsection After**: Business impact table

```asciidoc
=== The "Wild West" Problem

Without GPU-as-a-Service, organizations operate in a "Wild West" environment where infrastructure consumption is treated like a free-for-all:

**Resource Hoarding:**
* Data scientists request entire A100 GPUs (80GB VRAM) for lightweight notebooks that only need 2GB
* Teams lock GPUs "just in case" they need them later, leaving hardware idle for days
* First-come-first-served scheduling creates a rush to claim resources at the start of each sprint

**Feast or Famine Dynamics:**
* One team consumes all GPUs while high-priority inference workloads wait indefinitely
* No borrowing mechanism—idle quota in one team cannot help starving workloads in another team
* Manual intervention required to rebalance: "Please kill your job so the inference team can run"

**Ticket-Based Provisioning:**
* Platform teams manually pin pods to specific nodes like air traffic controllers in a storm
* 20+ hours/week spent managing allocation tickets, priority negotiations, and manual preemptions
* No audit trail—who had what GPU when? Unknown.

**Crash Loop Chaos:**
* When total requested GPUs exceed capacity, Kubernetes scheduler fails pods immediately
* No queueing—jobs crash-loop with "Insufficient nvidia.com/gpu" errors
* Users spam submissions hoping to catch a free GPU, creating contention storms

**The Financial Cost:**
* 4x A100 GPUs at $3/hour = $105,120/year
* At 40% utilization, you're burning **$63,072/year** on idle silicon
* "We added more GPUs" becomes the only response, compounding waste

**The Human Cost:**
* Data scientists frustrated: "Why can't I just run my model?"
* Platform engineers burned out: "I'm a glorified ticket dispatcher"
* Business stakeholders skeptical: "We spent $500K on GPUs and still have delays?"

GPU-as-a-Service transforms this chaos into a governed utility.
```

**Follow-up Section**: Keep existing "Solution: GPU-as-a-Service with Kueue" section as the "after state."

---

### 2.2 WorkloadPriorityClass Value Ranges (5 minutes)

**Source**: rhoai3-hwprofiles → `modules/chapter1/pages/kueue-lab.adoc` (lines 104-130)  
**Impact**: Medium - Helps future-proof priority architecture  
**Location**: Chapter 4, Section 2 (s2-configure-quotas-lab.adoc) - Step 6: Verify WorkloadPriorityClasses  

**Add After**: Priority value verification

```asciidoc
[TIP]
====
**Priority Value Best Practices**

Use meaningful priority ranges to allow future expansion without refactoring:

[cols="1,2,3",options="header"]
|===
|Range |Use Case |Example

|**0-99**
|Background/experimental workloads
|Hyperparameter sweeps, exploratory notebooks

|**100-499**
|Standard training jobs
|Model fine-tuning, batch training (current `training-priority: 100`)

|**500-999**
|Batch inference (medium priority)
|Nightly prediction jobs, data pipeline inference

|**1000-4999**
|Real-time inference (high priority)
|Customer-facing APIs, SLA-protected serving (current `inference-priority: 1000`)

|**5000+**
|Critical production workloads
|Revenue-generating services, regulatory compliance jobs
|===

**This course uses:**
* **inference-priority: 1000** (high priority)
* **training-priority: 100** (low priority)

This 10x difference provides clear preemption behavior. In production, you might add intermediate tiers:
* **batch-inference-priority: 500** (can preempt training but not real-time inference)
* **critical-inference-priority: 5000** (reserved for SLA-critical customer-facing workloads)

**Avoid**: Tightly packed values (e.g., 100, 101, 102). Leave room for future insertion.
====
```

**Extended Example** (for advanced users):
```yaml
# Example: Four-tier priority system
apiVersion: kueue.x-k8s.io/v1beta2
kind: WorkloadPriorityClass
metadata:
  name: experimental
value: 10
description: "Dev notebooks, scratch work"
---
apiVersion: kueue.x-k8s.io/v1beta2
kind: WorkloadPriorityClass
metadata:
  name: training
value: 100
description: "Model training, fine-tuning"
---
apiVersion: kueue.x-k8s.io/v1beta2
kind: WorkloadPriorityClass
metadata:
  name: batch-inference
value: 500
description: "Scheduled prediction jobs"
---
apiVersion: kueue.x-k8s.io/v1beta2
kind: WorkloadPriorityClass
metadata:
  name: realtime-inference
value: 1000
description: "Customer-facing serving APIs"
```

---

### 2.3 Distributed Workloads Dashboard (3 minutes)

**Source**: rhoai3-hwprofiles → `modules/chapter1/pages/kueue-lab.adoc` (lines 244-247)  
**Impact**: Medium - Complements Grafana monitoring  
**Location**: Chapter 4, Section 4 (s4-monitoring-observability.adoc) - After "Grafana Dashboard Structure"  

**Add New Subsection**:

```asciidoc
=== OpenShift AI Distributed Workloads Dashboard

In addition to the Grafana dashboard, OpenShift AI provides a built-in **Distributed Workloads** UI for real-time queue monitoring.

**Access the Dashboard:**

1. Log in to the OpenShift AI dashboard
2. Navigate to **Distributed Workloads** → **Resource Management**
3. View ClusterQueue utilization, pending workload order, and priority-based queue ordering

**Dashboard Capabilities:**

[cols="2,3,3",options="header"]
|===
|Feature |Use Case |Advantage Over Grafana

|**ClusterQueue Status**
|See at a glance which ClusterQueues are consuming quota
|Real-time (no Prometheus scrape delay)

|**Pending Workload Order**
|Confirm high-priority workloads are ahead of low-priority in the queue
|Shows priority-based ordering visually

|**Quota Utilization Bars**
|Visual bars showing usage/nominal quota ratio
|Easier for non-technical users than PromQL

|**User Self-Service**
|Data scientists can check their workload position in the queue
|No Grafana access required
|===

**When to Use Each Dashboard:**

* **OpenShift AI Dashboard**:
  * Quick status checks during active incidents
  * User self-service ("Where is my workload in the queue?")
  * Demo/presentation to non-technical stakeholders

* **Grafana Dashboard**:
  * Historical trends (p95 latency over 7 days, eviction rate trends)
  * Alerting via PrometheusRules
  * Capacity planning (week-over-week utilization analysis)
  * Multi-cluster aggregation (if using Thanos federation)

**Screenshot Recommendation**: Include a screenshot of the Distributed Workloads UI showing:
* ClusterQueue `inference-cq` at 100% quota (4/4 GPUs in use)
* Pending queue showing 3 workloads ordered by priority
* Utilization bar graph

[TIP]
====
The Distributed Workloads dashboard auto-refreshes every 5 seconds, making it ideal for live troubleshooting. Grafana dashboards typically refresh every 30-60 seconds, better suited for trends.
====
```

**Access URL Pattern**:
```
https://<rhoai-dashboard-url>/distributedWorkloads/clusterQueue
```

---

### 2.4 Taints and Tolerations "Lock and Key" (3 minutes)

**Source**: rhoai3-hwprofiles → `modules/chapter1/pages/placement.adoc` (lines 1-47)  
**Impact**: Medium - Clarifies common scheduling confusion  
**Location**: Chapter 4, Section 2 (s2-configure-quotas-lab.adoc) - Step 5: Verify ResourceFlavors  

**Add After**: ResourceFlavor verification

```asciidoc
[NOTE]
====
**Why ResourceFlavors Need Tolerations: The "Lock and Key" Model**

GPU nodes are typically **tainted** with `nvidia.com/gpu=Exists:NoSchedule` to prevent non-GPU workloads from consuming expensive GPU nodes. Think of this as a "lock" on the node.

**The Three-Part System:**

1. **The Lock (Node Taint)**: Applied by GPU Operator during installation
   * Rule: "Reject all pods unless they have a specific key"
   * Example: `nvidia.com/gpu=Exists:NoSchedule` on all GPU nodes

2. **The Key (ResourceFlavor Toleration)**: Defined in `gpu-flavor` ResourceFlavor
   * Rule: "I have permission to bypass the GPU node lock"
   * Kueue injects this toleration into admitted workloads

3. **The Address (ResourceFlavor Node Labels)**: Targets specific GPU types
   * Rule: "Only schedule on nodes with this label"
   * Example: `nvidia.com/gpu.present=true`

**The Complete Workflow:**

1. User submits workload via Hardware Profile → Queued in `team-inference` LocalQueue
2. Kueue checks quota → Quota available, workload admitted
3. Kueue assigns `gpu-flavor` ResourceFlavor
4. Kueue injects into pod spec:
   * `nodeSelector: nvidia.com/gpu.present=true` (from ResourceFlavor)
   * `tolerations: key=nvidia.com/gpu, operator=Exists` (from ResourceFlavor)
5. Kubernetes scheduler sees nodeSelector → finds GPU nodes
6. Kubernetes scheduler sees toleration → bypasses taint
7. Pod scheduled successfully

**Without the toleration**: Workload would be Admitted by Kueue (quota OK) but stuck Pending by Kubernetes scheduler with event: `0/10 nodes available: 4 node(s) had untolerated taint {nvidia.com/gpu: }`.

**Verification Command:**

[source,console,subs="verbatim,quotes"]
----
$ *oc describe node <gpu-node> | grep Taints*
Taints:  nvidia.com/gpu=:NoSchedule
----
====
```

**Common Troubleshooting Scenario**:
```
Symptom: Workload shows "Admitted: True" but pod is "Pending"
Diagnosis: oc describe pod <pod> shows "untolerated taint"
Root Cause: ResourceFlavor missing tolerations for GPU node taint
Fix: Add tolerations to ResourceFlavor YAML
```

---

## Priority 3: Nice-to-Have (40+ minutes)

These additions are valuable but could be separate courses or appendices.

### 3.1 Hardware Profile Tiering Examples (15 minutes)

**Source**: rhoai3-hwprofiles → `modules/chapter1/pages/tiering.adoc` (entire file)  
**Impact**: Low - Provides production templates  
**Location**: New file `modules/ch4-gpu-as-a-service/pages/s6-profile-templates.adoc` or Appendix  

**Content Structure**:

```asciidoc
= Hardware Profile Templates

== Tier 1: General Purpose (CPU Only)

=== xSmall Profile (Dev Notebooks)
* **Use Case**: Documentation, code review, lightweight EDA
* **Resources**: 1-2 CPU, 2-4GiB RAM
* **YAML**: [Full template with annotations]

=== Medium Profile (Standard Data Science)
* **Use Case**: Pandas processing, scikit-learn training
* **Resources**: 4-8 CPU, 16-32GiB RAM
* **YAML**: [Full template]

=== DataPrep Heavy (ETL Workloads)
* **Use Case**: Spark-based ETL, heavy Pandas
* **Resources**: 8-16 CPU, 64-128GiB RAM
* **YAML**: [Full template]

== Tier 2: Accelerated Computing (NVIDIA GPU)

=== Shared GPU (Time-Slicing)
* **Use Case**: Inference, lightweight training
* **Resources**: 1x virtual GPU (time-sliced)
* **Scheduling**: `type: Queue` with Kueue routing
* **YAML**: [Full template]

=== Isolated Partition (MIG 1g.5gb)
* **Use Case**: Multi-tenant isolation, predictable latency
* **Resources**: 1x MIG instance
* **YAML**: [Full template]

== Tier 3: Training & Intensive Workloads

=== Dedicated A100 (Full GPU)
* **Use Case**: Large model training, LLM fine-tuning
* **Resources**: 1-8x A100 GPUs
* **YAML**: [Full template with node affinity]
```

**Decision Matrix**: When to use each tier.

---

### 3.2 Job `suspend: true` Requirement (5 minutes)

**Source**: rhoai3-hwprofiles → `modules/chapter1/pages/kueue-lab.adoc` (line 154)  
**Impact**: Low - Edge case for manual job submission  
**Location**: Chapter 4, Section 5 (s5-troubleshooting-lab.adoc) - Scenario 2  

**Add to Troubleshooting Section**:

```asciidoc
[IMPORTANT]
====
**Kueue-Managed Jobs Require `spec.suspend: true`**

When submitting Kubernetes Jobs manually (without Hardware Profiles), you **must** set `spec.suspend: true` in the Job spec. This tells Kubernetes to not start the job immediately, allowing Kueue to intercept and manage admission.

**Correct Manual Submission:**

[source,yaml]
----
apiVersion: batch/v1
kind: Job
metadata:
  name: training-job
  namespace: team-training
  labels:
    kueue.x-k8s.io/queue-name: team-training
spec:
  suspend: true  # ✅ Required for Kueue management
  template:
    spec:
      containers:
      - name: trainer
        image: my-training-image:latest
        resources:
          requests:
            nvidia.com/gpu: "1"
----
```

**Why This Matters:**
* Hardware Profiles automatically set `suspend: true` when routing to LocalQueues
* Manual job submissions (e.g., CI/CD pipelines, cron jobs) must set this explicitly
* Without `suspend: true`, the job bypasses Kueue and fails immediately if quota is unavailable

**Troubleshooting**: If a manually-created job isn't being queued, check:
```bash
oc get job training-job -o jsonpath='{.spec.suspend}'
# Expected: true
```
====
```

---

### 3.3 Advanced Taints/Tolerations Section (20 minutes)

**Source**: rhoai3-hwprofiles → `modules/chapter1/pages/placement.adoc` (entire file)  
**Impact**: Low - Deep dive for platform engineers  
**Location**: New appendix or advanced topics section  

**Content Outline**:

```asciidoc
= Advanced: Node Placement Strategies

== The Node vs. Queue Decision

[Decision matrix comparing static pinning vs dynamic queuing]

== Custom Node Labels for Team Isolation

Example: Finance team gets dedicated H100 nodes

[source,bash]
----
oc label node worker-h100-1 team=finance
oc adm taint nodes worker-h100-1 team=finance:NoSchedule
----

## Multiple Taint Effects

* NoSchedule: Prevent new pods
* PreferNoSchedule: Soft preference
* NoExecute: Evict existing pods

## Verification Checklist

1. Node has taint
2. Hardware Profile has matching toleration
3. Hardware Profile has nodeSelector
4. User selects correct profile
5. Pod schedules successfully
```

---

## Implementation Checklist

### Phase 1: Critical Fixes (Priority 1 - 12 minutes)
- [ ] 1.1 Add dashboard enablement to Section 2
- [ ] 1.2 Add scheduling type WARNING to Section 3
- [ ] 1.3 Add namespace labeling to Section 2
- [ ] 1.4 Add GPU virtualization note to Section 1

### Phase 2: High-Value Enhancements (Priority 2 - 21 minutes)
- [ ] 2.1 Enhance "Wild West" problem framing in Section 1
- [ ] 2.2 Add priority value best practices to Section 2
- [ ] 2.3 Add Distributed Workloads dashboard to Section 4
- [ ] 2.4 Add taints/tolerations note to Section 2

### Phase 3: Optional Additions (Priority 3 - 40+ minutes)
- [ ] 3.1 Create profile templates appendix
- [ ] 3.2 Add job suspend requirement to Section 5
- [ ] 3.3 Create advanced taints/tolerations appendix

---

## Files to Modify

### Priority 1 Changes
1. `modules/ch4-gpu-as-a-service/pages/s1-gpu-service-overview.adoc` (1.4)
2. `modules/ch4-gpu-as-a-service/pages/s2-configure-quotas-lab.adoc` (1.1, 1.3)
3. `modules/ch4-gpu-as-a-service/pages/s3-hardware-profiles-lab.adoc` (1.2)

### Priority 2 Changes
4. `modules/ch4-gpu-as-a-service/pages/s1-gpu-service-overview.adoc` (2.1)
5. `modules/ch4-gpu-as-a-service/pages/s2-configure-quotas-lab.adoc` (2.2, 2.4)
6. `modules/ch4-gpu-as-a-service/pages/s4-monitoring-observability.adoc` (2.3)

### Priority 3 Changes (New Files)
7. `modules/ch4-gpu-as-a-service/pages/s6-profile-templates.adoc` (3.1)
8. `modules/ch4-gpu-as-a-service/pages/s7-advanced-placement.adoc` (3.3)

---

## Testing Verification

After implementing Priority 1 changes, verify:

1. **Dashboard enablement works**:
   ```bash
   oc get odhdashboardconfig odh-dashboard-config -n redhat-ods-applications \
     -o jsonpath='{.spec.dashboardConfig.disableKueue}'
   # Should return: false
   ```

2. **Namespace labeling works**:
   ```bash
   oc get namespace team-inference \
     -o jsonpath='{.metadata.labels.kueue\.openshift\.io/managed}'
   # Should return: true
   ```

3. **Hardware Profile scheduling is correct**:
   ```bash
   oc get hardwareprofile highpriority -n redhat-ods-applications \
     -o jsonpath='{.spec.scheduling.type}'
   # Should return: Queue (not Node)
   ```

4. **Course builds without errors**:
   ```bash
   npm run build
   # Should complete successfully with no broken xrefs
   ```

---

## Related Courses for Further Reading

Students who complete maas-kueue-enablement and want to go deeper should take:

1. **rhoai3-gpu-aas**: End-to-end GPU-as-a-Service deployment (covers GPU Operator, time-slicing, Kueue, Hardware Profiles)
2. **rhoai3-hwprofiles**: Deep dive on Hardware Profile design patterns and placement strategies
3. **maas-gpu-enablement**: GPU Operator installation, time-slicing, MIG configuration

---

## Changelog

**2026-04-14**: Initial analysis based on rhoai3-hwprofiles and rhoai3-gpu-aas courses
