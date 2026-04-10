# MaaS Workload Scheduling with Kueue

**Click here: [![Contribute](https://www.eclipse.org/che/contribute.svg)](https://devspaces.apps.tools-na100.dev.ole.redhat.com/#https://github.com/RedHatQuickCourses/maas-kueue-enablement) to start the development using devspace.**

This training course equips Platform Engineers and DevOps/SREs with the knowledge and skills required to configure, manage, and deploy the workload scheduling and resource quota pillar of a Models-as-a-Service (MaaS) architecture on Red Hat OpenShift AI. The course focuses on maximizing GPU ROI by driving utilization up to 90%, enforcing fair resource sharing across multi-tenant environments, and prioritizing critical AI workloads using the Red Hat build of Kueue.

## Course Objectives

On completing this course, you should be able to:

* **Understand and Deploy Kueue Foundations** - Overcome rigid Kubernetes scheduling limitations that lead to idle GPUs and rejected workloads by deploying Kueue's velvet-rope queueing layer with ResourceFlavors, ClusterQueues, and LocalQueues.

* **Configure Cohorts and Quota Borrowing** - Implement elastic resource sharing across multi-tenant environments using cohort-based models that allow workloads to borrow unused quota to accommodate bursty demand without violating resource guarantees.

* **Implement Priority and Preemption** - Guarantee deterministic scheduling under contention using Kubernetes PriorityClasses and Kueue preemption policies to ensure critical workloads receive resources when needed.

## Target Audience

* **Platform Engineers** - Responsible for designing scheduling queues, cluster quotas, resource flavors, and establishing cohort-based borrowing strategies.

* **DevOps/SREs** - Focused on monitoring queue lengths, job priorities, and resource utilization, as well as troubleshooting preemption events or suspended workloads.

## Prerequisites

This course assumes that you have the following experience:

* Successful completion of the foundational *Nvidia GPU Enablement* module
* Deep understanding of Kubernetes ResourceQuotas, Requests/Limits, and PriorityClasses
* Familiarity with Kubernetes Batch Jobs and distributed training concepts (e.g., RayClusters)

## Course Structure

### Chapter 1: Understand and Deploy Kueue Foundations (60 minutes)
- The GPU Efficiency Challenge
- Lab: Deploying the Base Configuration
- Lab: Troubleshooting Operator Upgrades (Day 2)

### Chapter 2: Configure Cohorts and Quota Borrowing (60 minutes)
- Elastic Resource Sharing
- Lab: Building the Multi-Tenant Architecture

### Chapter 3: Implement Priority and Preemption (90 minutes)
- Deterministic Scheduling
- Lab: Configuring Preemption
- Lab: Testing Preemption at Scale
- Lab: Troubleshooting Suspended Workloads (Day 2)

**Total Course Duration:** 3 Hours 30 Minutes

## Lab Requirements

* **Hardware:** At least 1 worker node equipped with 4 GPUs (e.g., AWS `p3.8xlarge` instance)
* **Software:** OpenShift Container Platform, Red Hat OpenShift AI 3.4+, Red Hat build of Kueue 1.2+
* **Pre-configured:** NVIDIA GPU Operator installed, GPU worker node pre-tainted with `nvidia.com/gpu=Exists:NoSchedule`

## Building the Course Locally

### Prerequisites
- Node.js and npm installed
- Git

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/RedHatQuickCourses/maas-kueue-enablement.git
   cd maas-kueue-enablement
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the course:
   ```bash
   npm run build
   ```

4. Serve the course locally:
   ```bash
   npm run serve
   ```

5. Open your browser to `http://localhost:8080` to view the course.

### Development Mode

For active development with auto-rebuild on file changes:

```bash
# In terminal 1 - watch for changes and rebuild
npm run watch:adoc

# In terminal 2 - serve the built site
npm run serve
```

## Additional Resources

- [Red Hat OpenShift AI Documentation](https://docs.redhat.com/en/documentation/red_hat_openshift_ai_self-managed/)
- [Kueue Upstream Documentation](https://kueue.sigs.k8s.io/)
- [Kubernetes Resource Management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)

## Contributing

Contributions are welcome! Please follow the standard Git workflow:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This course content is provided by Red Hat Product Portfolio Marketing & Learning.
