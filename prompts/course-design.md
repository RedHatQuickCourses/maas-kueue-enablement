# Red Hat Product and Technical Learning Team
## MaaS Workload Scheduling with Kueue: Course High Level Design

### COURSE GOAL
To equip Platform Engineers and DevOps/SREs with the knowledge and skills required to configure, manage, and deploy the workload scheduling and resource quota pillar of a Models-as-a-Service (MaaS) architecture on OpenShift AI. This course ensures teams can maximize GPU ROI by driving utilization up to 90%, enforce fair resource sharing across multi-tenant environments, and prioritize critical AI workloads using the Red Hat build of Kueue.

### TARGET AUDIENCE
* **Platform Engineers:** Responsible for designing scheduling queues, cluster quotas, resource flavors, and establishing cohort-based borrowing strategies.
* **DevOps/SREs:** Focused on monitoring queue lengths, job priorities, and resource utilization, as well as troubleshooting preemption events or suspended workloads.

### PREREQUISITES
* Successful completion of the foundational *Nvidia GPU Enablement* module.
* Deep understanding of Kubernetes ResourceQuotas, Requests/Limits, and PriorityClasses.
* Familiarity with Kubernetes Batch Jobs and distributed training concepts (e.g., RayClusters).

---

### TL3 SKILL & TASK MAPPING (Depth Check)

| Learning Objective (LO) | Core Concept (The "Why") | Practical TL3 Task (The "How" - Day 1) | Day 2 / Troubleshooting Focus |
| :--- | :--- | :--- | :--- |
| **LO 1: Understand and Deploy Kueue Foundations** | *Understanding Kueue architecture and why vanilla Kubernetes scheduling limits GPU efficiency* | *Deploying ResourceFlavors, ClusterQueues, and LocalQueues.* | *Diagnosing failed installations due to legacy `v1alpha1` Kueue CRDs remaining from previous deployments.* |
| **LO 2: Configure Cohorts and Quota Borrowing** | *Moving from rigid quotas to elastic utilization using Cohorts for resource sharing across teams.* | *Establishing Team A and Team B namespaces with mapped LocalQueues and a shared cohort quota.* | *Diagnosing pending RayCluster workloads due to insufficient quota or mismatched ResourceFlavors.* |
| **LO 3: Implement Priority and Preemption** | *Guaranteeing deterministic scheduling under contention using PriorityClasses and preemption policies.* | *Applying `borrowWithinCohort` policies. Submitting competing workloads to observe priority-based preemption.* | *Troubleshooting suspended `TrainJob` workloads that fail to resume due to immutable JobSet specs.* |

---

### COURSE DESIGN

| Section | Format | Topics & Activities |
| :--- | :--- | :--- |
| **Learning Objective 1: Understand and Deploy Kueue Foundations** | Presentation | **The GPU Efficiency Challenge:**<br>Understand why rigid Kubernetes ResourceQuotas lead to idle GPUs and rejected workloads. Introduce Kueue as a velvet-rope queueing layer. Define core resources: `ResourceFlavor`, `ClusterQueue`, and `LocalQueue`. |
| | Lab | **Deploying the Base Configuration:**<br>Create `ResourceFlavors` to manage CPU/Memory and GPU resources. Configure the GPU `ResourceFlavor` to tolerate specific node taints (e.g., `nvidia.com/gpu=Exists:NoSchedule`). |
| | Lab | **Troubleshooting Operator Upgrades (Day 2):**<br>Simulate a failed Red Hat build of Kueue 1.2 installation caused by legacy OpenShift AI 2.x components. Diagnose the Data Science Cluster (DSC) `Not Ready` state and resolve it by deleting legacy CRDs (`cohorts.kueue.x-k8s.io/v1alpha1`). |
| **Learning Objective 2: Configure Cohorts and Quota Borrowing** | Presentation | **Elastic Resource Sharing:**<br>Understand the cohort-based model for organizational isolation and elastic utilization. Learn how workloads can borrow unused quota from one another to accommodate bursty demand without violating resource guarantees. |
| | Lab | **Building the Multi-Tenant Architecture:**<br>Create namespaces for `team-a` and `team-b`. Define a `ClusterQueue` for each team, grouping them into a shared cohort with a nominal quota (e.g., 10 CPUs, 64GB Mem). Define a `LocalQueue` in each namespace pointing to the respective `ClusterQueue`. |
| **Learning Objective 3: Implement Priority and Preemption** | Presentation | **Deterministic Scheduling:**<br>Understand how Kueue integrates with Kubernetes PriorityClasses. Discuss the lifecycle of a preempted job (suspended and requeued rather than terminated) and the importance of workload checkpointing. |
| | Lab | **Configuring Preemption:**<br>Configure the `team-a-cq` ClusterQueue with preemption policies, setting `reclaimWithinCohort: Any` and `borrowWithinCohort: LowerPriority`. |
| | Lab | **Testing Preemption at Scale:**<br>Submit a RayCluster workload to `team-b`'s queue and wait for it to reach a running state. Submit a higher-priority RayCluster to `team-a`. Observe Kueue automatically suspending the `team-b` cluster to free up GPU resources for `team-a`. |
| | Lab | **Troubleshooting Suspended Workloads (Day 2):**<br>Investigate a scenario where a preempted `TrainJob` fails to resume after an OpenShift AI platform upgrade. Identify the immutable `JobSet` spec error and perform the required workaround (deleting and recreating the job). |

### VIRTUAL LABS (CLASSROOM) REQUIREMENTS
* **Hardware:** Requires at least 1 worker node equipped with 4 GPUs (e.g., AWS `p3.8xlarge` instance) to properly demonstrate resource exhaustion and preemption.
* **Software/Operators:** OpenShift Container Platform, Red Hat OpenShift AI 3.4+, Red Hat build of Kueue 1.2+.
* **Pre-Provisioned State:** The NVIDIA GPU Operator must be installed. The GPU worker node must be pre-tainted with `nvidia.com/gpu=Exists:NoSchedule.

### OVERALL COURSE TIMINGS

| Chapter/Section | Estimated Time |
| :--- | :--- |
| **LO 1:** Understand and Deploy Kueue Foundations | 60 minutes |
| **LO 2:** Configure Cohorts and Quota Borrowing | 60 minutes |
| **LO 3:** Implement Priority and Preemption | 90 minutes |
| **Course Total:** | **3 Hours 30 Minutes** |