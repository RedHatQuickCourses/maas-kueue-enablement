# Course Terminology Reference

This document maintains canonical definitions for all technical terms used across the course. Use these exact definitions to ensure consistency.

**Last Updated**: 2026-04-12
**Maintainer**: Course authors

---

## How to Use This Document

1. **When writing new content**: Check this document first before defining any technical term
2. **On first use of a term**: Reference the chapter where it was first defined
3. **When introducing new terms**: Add the canonical definition here after the content is approved
4. **When updating definitions**: Update here and note which chapters need updating

---

## Operators and OLM

### Operator
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> A Kubernetes operator combines three essential components: (1) Custom Resource (CR) expressing desired state, (2) Controller software that watches CRs and reconciles cluster state, and (3) Reconciliation Loop that continuously monitors and corrects drift.

**First Defined**: Chapter 1, Section 2 (Understanding Operators and Platform Automation)

**Key Characteristics**:
- Encodes human operational knowledge into software
- Provides self-healing automation
- Uses declarative configuration

### Custom Resource (CR)
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> A Custom Resource is an instance of a Custom Resource Definition (CRD)—your actual configuration that declares desired state for an operator to reconcile.

**First Defined**: Chapter 1, Section 2

**Example**: ClusterPolicy for NVIDIA GPU Operator

### Custom Resource Definition (CRD)
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> A CRD is a schema that defines a new resource type in Kubernetes. It specifies API group, version, resource kind, allowed fields, and validation rules.

**First Defined**: Chapter 1, Section 2

**Relationship**: CRD defines the schema; CR is an instance of that schema

### Controller
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> Controller is software that watches for changes to Custom Resources, compares desired state (CR spec) to actual state (cluster resources), and takes actions to reconcile differences. Controllers run in a continuous loop.

**First Defined**: Chapter 1, Section 2

### Reconciliation Loop
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> The reconciliation loop is the continuous cycle where a controller: (1) OBSERVE—read current cluster state, (2) DIFF—compare to desired state in CR, (3) ACT—make changes to align, (4) REPEAT—every ~5 seconds.

**First Defined**: Chapter 1, Section 2

**Visual Reference**: See ASCII diagram in ch1-gpu-operator/s2-operators-overview.adoc

### Operator Lifecycle Manager (OLM)
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> OpenShift's Operator Lifecycle Manager (OLM) is a built-in framework for discovering, installing, and managing operators. It functions as a "package manager for operators" similar to how yum or apt manages system packages.

**First Defined**: Chapter 1, Section 2

### ClusterServiceVersion (CSV)
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> A ClusterServiceVersion (CSV) represents a specific version of an installed operator. It contains operator metadata, deployment specification, CRDs the operator manages, RBAC requirements, and upgrade path information.

**First Defined**: Chapter 1, Section 2

**CSV Phases**: Pending, Installing, Succeeded, Failed, Replacing

### Subscription
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> A Subscription declares your intent to install and maintain an operator. It specifies which operator to install, which catalog contains it, which update channel to track, and whether upgrades should be automatic or manual.

**First Defined**: Chapter 1, Section 2

**Key Fields**: channel, name, source, sourceNamespace, installPlanApproval

### InstallPlan
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> An InstallPlan is OLM's execution plan for installing or upgrading an operator. It lists which CSV version to install, CRDs to create or update, and RBAC resources to configure.

**First Defined**: Chapter 1, Section 2

**Approval Modes**: Automatic (dev/test), Manual (production)

### OperatorGroup
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> An OperatorGroup defines the scope where an operator can manage resources. It configures which namespaces the operator watches (single, multiple, or all) and controls RBAC generation for operator permissions.

**First Defined**: Chapter 1, Section 2

### CatalogSource
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> A CatalogSource represents a repository of available operators. It points to a catalog index container image that OLM queries to discover operators.

**First Defined**: Chapter 1, Section 2

**Default Catalogs**: redhat-operators, certified-operators, community-operators, redhat-marketplace

### Cluster Operator
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> Cluster operators are core OpenShift platform components managed by the Cluster Version Operator (CVO). They provide essential platform services like authentication, DNS, and ingress. Cluster operators cannot be uninstalled and are automatically upgraded with OpenShift.

**First Defined**: Chapter 1, Section 2

**Examples**: authentication, dns, ingress, network, storage

**Location**: openshift-* namespaces

### Add-on Operator
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> Add-on operators extend OpenShift with additional capabilities. They are user-managed through OLM, have user-controlled lifecycle, and are installed in user-created namespaces.

**First Defined**: Chapter 1, Section 2

**Examples**: Node Feature Discovery, NVIDIA GPU Operator, Red Hat OpenShift AI

---

## GPU Components and Stack

### Node Feature Discovery (NFD)
**Canonical Definition** (from ch1-gpu-operator/s1-hardware-stack.adoc):
> Node Feature Discovery scans the node's hardware via PCI IDs and applies Kubernetes labels to nodes where GPU hardware is detected. This enables the OpenShift scheduler to intelligently place GPU workloads on nodes with the appropriate hardware capabilities.

**First Defined**: Chapter 1, Section 1 (Deconstructing the Hardware Stack)

**Namespace**: openshift-nfd
**Catalog**: redhat-operators

### NVIDIA GPU Operator
**Canonical Definition** (from ch1-gpu-operator/s1-hardware-stack.adoc):
> The NVIDIA GPU Operator orchestrates several critical components that work together to enable GPU acceleration in containerized environments. It automates deployment and lifecycle management of GPU drivers, container toolkit, device plugin, and monitoring components.

**First Defined**: Chapter 1, Section 1

**Namespace**: nvidia-gpu-operator
**Catalog**: certified-operators

### ClusterPolicy
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> ClusterPolicy is the Custom Resource for the NVIDIA GPU Operator. It declares the desired state for the entire GPU software stack including driver version, enabled components (DCGM, MIG, GFD), and configuration settings.

**First Defined**: Chapter 1, Section 2

**API**: nvidia.com/v1
**Kind**: ClusterPolicy
**Scope**: Cluster-wide (not namespaced)

### NVIDIA Driver Container
**Canonical Definition** (from ch1-gpu-operator/s1-hardware-stack.adoc):
> The NVIDIA Driver Container deploys necessary GPU drivers directly via containers, eliminating the need to manually install kernel modules on the host operating system. This containerized approach provides simplified driver management, consistent versions across the cluster, and isolation from host OS dependencies.

**First Defined**: Chapter 1, Section 1

### NVIDIA Container Toolkit
**Canonical Definition** (from ch1-gpu-operator/s1-hardware-stack.adoc):
> The NVIDIA Container Toolkit plugs into the OpenShift container runtime (CRI-O) to ensure pods can securely request and access underlying GPU hardware. It provides runtime integration for GPU resource allocation, secure GPU device passthrough to containers, and environment configuration for CUDA applications.

**First Defined**: Chapter 1, Section 1

### GPU Feature Discovery (GFD)
**Canonical Definition** (from ch1-gpu-operator/s1-hardware-stack.adoc):
> GPU Feature Discovery gathers granular hardware capabilities including GPU model, VRAM size, and MIG profiles, then applies them as specific node labels. This detailed hardware inventory enables fine-grained workload placement decisions and MIG-aware scheduling.

**First Defined**: Chapter 1, Section 1

### Data Center GPU Manager (DCGM)
**Canonical Definition** (from ch1-gpu-operator/s1-hardware-stack.adoc):
> DCGM is a daemon that continuously monitors GPU health, diagnostics, and telemetry. It provides real-time GPU health monitoring, performance metrics collection, diagnostic capabilities for troubleshooting, and integration with cluster monitoring systems.

**First Defined**: Chapter 1, Section 1

### DCGM Exporter
**Canonical Definition** (from ch1-gpu-operator/s1-hardware-stack.adoc):
> The DCGM Exporter extracts metrics from DCGM and formats them for Prometheus scraping, enabling integration with OpenShift's monitoring stack. This component bridges GPU telemetry with cloud-native observability platforms.

**First Defined**: Chapter 1, Section 1

### GPU Silo Crisis
**Canonical Definition** (from ch1-gpu-operator/s1-hardware-stack.adoc):
> The "GPU Silo" problem occurs when expensive GPU hardware remains underutilized due to complex manual configuration, dependency management, and operational overhead. It represents the challenge organizations face before operator-based automation.

**First Defined**: Chapter 1, Section 1

**Key Metrics**: 150+ hours manual setup time, 40-60% idle time without automation

---

## Models-as-a-Service (MaaS) Architecture

### Models-as-a-Service (MaaS)
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> Models-as-a-Service (MaaS) is an enterprise AI platform pattern where machine learning models are deployed as scalable, managed services with automated infrastructure lifecycle, multi-tenant resource sharing, and production-grade observability.

**First Defined**: Chapter 1, Section 2

**Key Requirements**: GPU automation, workload queuing, inference serving, monitoring

### Three-Layer MaaS Operator Stack
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> The three-layer MaaS operator stack organizes operators into functional layers: Layer 1 (Core & Infrastructure: NFD, GPU Operator), Layer 2 (Inference at Scale: Kueue, KServe, Cert-manager, Kuadrant), and Layer 3 (Orchestration: Red Hat OpenShift AI). Each layer builds on the previous, with Layer 3 coordinating dependencies across all layers.

**First Defined**: Chapter 1, Section 2

**Visual Reference**: See architecture diagram in ch1-gpu-operator/s2-operators-overview.adoc

### Layer 1: Core & Infrastructure Operators
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> Layer 1 provides hardware detection and GPU software stack automation through Node Feature Discovery (NFD) and NVIDIA GPU Operator. This layer enables OpenShift to recognize GPU hardware and make it available as schedulable resources.

**First Defined**: Chapter 1, Section 2

**Purpose**: Hardware enablement foundation

### Layer 2: Operators for Inference at Scale
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> Layer 2 provides production-grade MaaS capabilities including certificate management (Cert-manager), rate limiting (Kuadrant/Connectivity Link), workload queueing (Kueue), and distributed training (LeaderWorkerSet). This layer transforms basic GPU resources into enterprise-ready inference infrastructure.

**First Defined**: Chapter 1, Section 2

**Purpose**: Production-grade MaaS capabilities

### Layer 3: Red Hat OpenShift AI Orchestration
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> Layer 3 coordinates the complete MaaS ecosystem through the Red Hat OpenShift AI Operator. It manages Layer 2 operator dependencies automatically via the DataScienceCluster Custom Resource, providing a single control point for the entire MaaS platform lifecycle.

**First Defined**: Chapter 1, Section 2

**Purpose**: Orchestrate complete MaaS ecosystem

---

## OpenShift AI Components

### Red Hat OpenShift AI
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> Red Hat OpenShift AI is an enterprise AI/ML platform built on OpenShift that provides a complete MaaS ecosystem. It orchestrates multiple operators for model serving, distributed training, workload queuing, and observability through a unified DataScienceCluster configuration.

**First Defined**: Chapter 1, Section 2

**Namespace**: redhat-ods-operator
**Catalog**: redhat-operators

### DataScienceCluster
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> DataScienceCluster is the Custom Resource for Red Hat OpenShift AI. It provides unified configuration for the complete MaaS platform, automatically managing dependencies for KServe, Kueue, Dashboard, and other components.

**First Defined**: Chapter 1, Section 2

**API**: datasciencecluster.opendatahub.io/v1
**Kind**: DataScienceCluster

### Kueue
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> Kueue provides workload queueing and quota management for multi-tenant GPU platforms. It enables fair sharing of GPU resources across teams, implements resource quotas, and queues workloads when resources are unavailable.

**First Defined**: Chapter 1, Section 2

**Namespace**: kueue-system
**Purpose**: Multi-tenant resource management

### KServe
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> KServe provides model serving capabilities for deploying ML models as scalable inference services. It supports multiple model formats, auto-scaling, canary rollouts, and integrates with the GPU Operator for GPU-accelerated inference.

**First Defined**: Chapter 1, Section 2

**API**: serving.kserve.io/v1beta1
**Key Resource**: InferenceService

### InferenceService
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> InferenceService is the Custom Resource for deploying ML models as managed services. It specifies the model format, runtime, resource requirements (including GPU allocation), and serving configuration.

**First Defined**: Chapter 1, Section 2

**API**: serving.kserve.io/v1beta1
**Kind**: InferenceService

---

## GPU Hardware and Architecture

### Streaming Multiprocessor (SM)
**Canonical Definition** (from ch2-mig/s1-mig-overview.adoc):
> Streaming Multiprocessors (SMs) are the fundamental compute units in NVIDIA GPUs that execute CUDA kernels. When MIG mode is enabled, these SMs are physically partitioned across MIG instances, providing dedicated compute resources for each instance.

**First Defined**: Chapter 2, Section 1 (Maximizing GPU ROI with Multi-Instance GPU)

**Key Characteristics**:
- Basic execution units for GPU computation
- A100-40GB has 108 SMs total (7/8ths available for MIG partitioning)
- MIG profiles allocate SMs in 1/7th increments (e.g., 3g.20gb = ~46 SMs)

**Example**: The `3g.20gb` MIG profile allocates approximately 46 streaming multiprocessors (3/7ths of 108 SMs).

### CUDA (Compute Unified Device Architecture)
**Canonical Definition**:
> CUDA is NVIDIA's parallel computing platform and programming model that enables developers to use GPUs for general-purpose computing. CUDA applications running in containers require the NVIDIA Container Toolkit for GPU access.

**First Defined**: Chapter 1, Section 1 (Deconstructing the Hardware Stack)

**Key Characteristics**:
- Enables GPU acceleration for non-graphics workloads
- Requires compatible NVIDIA drivers and runtime
- Containerized CUDA applications need Container Toolkit integration

### HBM2 (High Bandwidth Memory 2)
**Canonical Definition** (from ch2-mig/s1-mig-overview.adoc):
> HBM2 is the high-bandwidth GPU framebuffer memory technology used in A100 GPUs (40GB or 80GB capacity). MIG partitioning divides this memory into isolated regions with dedicated memory controllers for bandwidth isolation.

**First Defined**: Chapter 2, Section 1

**Example**: A100-40GB uses 40GB HBM2 memory, partitionable via MIG into separate allocations (e.g., 20GB + 10GB + 10GB).

### PCIe (Peripheral Component Interconnect Express)
**Canonical Definition**:
> PCIe is the physical bus interface connecting GPUs to the host system. Node Feature Discovery scans PCIe devices to detect GPU hardware presence and applies corresponding node labels.

**First Defined**: Chapter 1, Section 1

**Usage**: NFD detects GPUs via PCI IDs during hardware discovery phase.

### ECC (Error-Correcting Code)
**Canonical Definition** (from ch3-observability/s1-observability-stack.adoc):
> Error-Correcting Code (ECC) is GPU memory protection that detects and corrects data corruption. DCGM monitors ECC error rates, with correctable errors warranting investigation and uncorrectable errors requiring immediate node drain.

**First Defined**: Chapter 3, Section 1 (The MaaS Observability Stack)

**Alert Thresholds**:
- Any correctable ECC errors: Investigate
- Uncorrectable ECC errors: Immediate node drain required

**DCGM Metric**: `DCGM_FI_DEV_XID_ERRORS`

### Ampere Architecture
**Canonical Definition** (from ch2-mig/s1-mig-overview.adoc):
> Ampere is NVIDIA's GPU architecture generation (A-series: A30, A100) that introduced Multi-Instance GPU (MIG) capability, enabling hardware-level GPU partitioning for multi-tenant workloads.

**First Defined**: Chapter 2, Section 1

**Supported Models**: A30 (24GB), A100-40GB, A100-80GB

**Key Feature**: First architecture supporting MIG (up to 7 instances per GPU)

### Hopper Architecture
**Canonical Definition** (from ch2-mig/s1-mig-overview.adoc):
> Hopper is NVIDIA's next-generation GPU architecture (H-series: H100) that enhances MIG with confidential computing support per instance, improved memory bandwidth allocation, and faster reconfiguration (~15% faster than A100).

**First Defined**: Chapter 2, Section 1

**Enhancements Over Ampere**:
- Confidential computing per MIG instance
- Better memory bandwidth isolation
- Faster MIG mode changes

### vGPU (Virtual GPU)
**Canonical Definition** (from ch2-mig/s1-mig-overview.adoc):
> Virtual GPU (vGPU) is an alternative GPU sharing technology that requires additional NVIDIA licensing and virtualization overhead. It predates MIG and adds operational complexity compared to hardware-level MIG partitioning.

**First Defined**: Chapter 2, Section 1

**Trade-offs vs MIG**:
- Requires NVIDIA vGPU licensing
- Adds virtualization layer overhead
- More complex operations than MIG's label-driven configuration

### NVML (NVIDIA Management Library)
**Canonical Definition** (from ch2-mig/s1-mig-overview.adoc):
> NVIDIA Management Library (NVML) is the C-based API that enables programmatic GPU monitoring and management. GPU Feature Discovery and MIG Manager use NVML to query GPU capabilities and configure MIG instances.

**First Defined**: Chapter 2, Section 1

**Usage in GPU Operator**:
- MIG Manager queries GPU capabilities via NVML
- GPU Feature Discovery scans GPU hardware via NVML
- DCGM collects telemetry through NVML APIs

---

## Kubernetes/OpenShift Infrastructure Components

### ServiceMonitor
**Canonical Definition** (from ch3-observability/s2-expose-metrics-lab.adoc):
> ServiceMonitor is a Custom Resource that declaratively configures Prometheus to scrape metrics from a Kubernetes service. The GPU Operator automatically creates a ServiceMonitor for the DCGM Exporter when the namespace is labeled with `openshift.io/cluster-monitoring=true`.

**First Defined**: Chapter 3, Section 2 (Lab: Exposing GPU Metrics)

**API**: monitoring.coreos.com/v1
**Kind**: ServiceMonitor

**Example Configuration**:
```yaml
spec:
  endpoints:
  - interval: 30s
    port: metrics
  selector:
    matchLabels:
      app: nvidia-dcgm-exporter
```

**Purpose**: Enables automatic Prometheus metric collection without manual scrape configuration.

### ConfigMap
**Canonical Definition** (from ch2-mig/s2-mig-slicing-lab.adoc and ch3-observability/s2-expose-metrics-lab.adoc):
> ConfigMap is a Kubernetes resource for storing non-confidential configuration data as key-value pairs. In GPU operations, ConfigMaps configure cluster monitoring settings, user-workload monitoring retention, and custom MIG profiles via mig-parted configuration.

**First Defined**: Chapter 2, Section 2 (Lab: MIG Slicing Configuration)

**Key Use Cases**:
- `cluster-monitoring-config`: Enables user-workload monitoring
- `user-workload-monitoring-config`: Sets metric retention and storage
- Custom MIG ConfigMaps: Define heterogeneous MIG profiles beyond built-in options

**Example**: Custom MIG profile ConfigMap named `custom-mig-parted-config` in `nvidia-gpu-operator` namespace.

### DaemonSet
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> DaemonSet is a Kubernetes workload type that ensures exactly one pod runs on each matching node. The GPU Operator deploys critical components as DaemonSets: DCGM, DCGM Exporter, MIG Manager, GPU Feature Discovery, and Device Plugin run as DaemonSets on GPU nodes.

**First Defined**: Chapter 1, Section 2 (Understanding Operators and Platform Automation)

**GPU Operator DaemonSets**:
- `nvidia-dcgm`: GPU monitoring daemon
- `nvidia-dcgm-exporter`: Metric export for Prometheus
- `nvidia-mig-manager`: MIG configuration management
- `nvidia-device-plugin-daemonset`: GPU resource advertisement

**Purpose**: Ensures GPU software stack components run on every GPU node automatically.

### CRI-O
**Canonical Definition** (from ch1-gpu-operator/s1-hardware-stack.adoc):
> CRI-O is OpenShift's lightweight container runtime that implements the Kubernetes Container Runtime Interface. The NVIDIA Container Toolkit integrates with CRI-O to provide GPU device passthrough and resource allocation for containerized workloads.

**First Defined**: Chapter 1, Section 1 (Deconstructing the Hardware Stack)

**Integration Point**: Container Toolkit acts as CRI-O plugin for GPU access.

### NodeSelector
**Canonical Definition** (from ch2-mig/s1-mig-overview.adoc):
> NodeSelector is a Kubernetes pod scheduling constraint that places pods on nodes matching specific labels. For GPU workloads, nodeSelector targets nodes with GPU capabilities or specific MIG configurations.

**First Defined**: Chapter 2, Section 1

**Example Usage**:
```yaml
nodeSelector:
  node-role.kubernetes.io/gpu-inference-mig: "true"
```

**Purpose**: Route workloads to appropriate GPU node pools (training vs inference, MIG vs time-slicing).

### Taint and Toleration
**Canonical Definition** (from ch2-mig/s1-mig-overview.adoc):
> Taints are node properties that repel pods unless they have matching tolerations. In GPU platforms, taints prevent non-GPU workloads from consuming GPU nodes, reserving expensive hardware for workloads that explicitly tolerate the GPU taint.

**First Defined**: Chapter 2, Section 1

**Use Case**: Multi-strategy deployments use taints to segregate training node pools (full GPU) from inference pools (MIG or time-slicing).

---

## Observability Stack Components

### Prometheus
**Canonical Definition** (from ch3-observability/s1-observability-stack.adoc):
> Prometheus is an open-source time-series database and monitoring system that scrapes metrics from instrumented targets. OpenShift's built-in monitoring stack uses Prometheus to collect GPU telemetry from DCGM Exporter at configurable intervals (default: 30 seconds) with retention policies (default: 15 days).

**First Defined**: Chapter 3, Section 1 (The MaaS Observability Stack)

**Key Capabilities**:
- ServiceMonitor-based auto-discovery of scrape targets
- PromQL query language for metric analysis
- Configurable retention and storage via PersistentVolumeClaims
- Integration with Alertmanager for alerting

**OpenShift Instances**:
- Platform Prometheus: Cluster infrastructure metrics
- User Workload Prometheus: Application and GPU metrics

### Thanos Querier
**Canonical Definition** (from ch3-observability/s1-observability-stack.adoc):
> Thanos Querier is a component that federates metrics from multiple Prometheus instances, provides long-term storage integration, enables cross-cluster queries, and deduplicates metrics from HA Prometheus deployments. Grafana connects to Thanos Querier for unified metric access across the monitoring stack.

**First Defined**: Chapter 3, Section 1

**Service Endpoint**: `https://thanos-querier.openshift-monitoring.svc:9091`

**Purpose**: Provides single query interface for both platform and user-workload metrics.

### PromQL (Prometheus Query Language)
**Canonical Definition** (from ch3-observability/s1-observability-stack.adoc):
> PromQL is the query language for Prometheus that enables metric aggregation, filtering, mathematical operations, and time-series analysis. GPU monitoring uses PromQL to calculate utilization percentages, aggregate metrics by node or MIG instance, and create alerting rules.

**First Defined**: Chapter 3, Section 1

**Example Queries**:
- `DCGM_FI_DEV_GPU_UTIL` - GPU utilization metric
- `sum by (node) (DCGM_FI_DEV_GPU_UTIL)` - Aggregate by node
- `DCGM_FI_DEV_FB_USED / DCGM_FI_DEV_FB_FREE * 100` - Memory percentage calculation

### GrafanaDatasource
**Canonical Definition** (from ch3-observability/s3-grafana-setup-lab.adoc):
> GrafanaDatasource is a Custom Resource that declaratively configures data source connections for a Grafana instance. It specifies the datasource type (Prometheus), connection URL (Thanos Querier endpoint), authentication method (ServiceAccount bearer token), and TLS settings.

**First Defined**: Chapter 3, Section 3 (Lab: Deploying the Grafana Operator)

**API**: grafana.integreatly.org/v1beta1
**Kind**: GrafanaDatasource

**Example Configuration**:
```yaml
spec:
  datasource:
    name: Prometheus
    type: prometheus
    url: https://thanos-querier.openshift-monitoring.svc:9091
    access: proxy
```

**Purpose**: Enables Dashboard-as-Code for datasource configuration via GitOps workflows.

### GrafanaDashboard
**Canonical Definition** (from ch3-observability/s1-observability-stack.adoc):
> GrafanaDashboard is a Custom Resource that provisions dashboards into Grafana instances declaratively. It enables storing dashboards as code in Git repositories, supporting GitOps workflows for dashboard versioning, review, and deployment.

**First Defined**: Chapter 3, Section 1

**API**: grafana.integreatly.org/v1beta1
**Kind**: GrafanaDashboard

**Use Cases**:
- Import official NVIDIA DCGM dashboards
- Version control custom MIG-aware visualizations
- Deploy dashboards via GitOps pipelines

### ServiceAccount
**Canonical Definition** (from ch3-observability/s3-grafana-setup-lab.adoc):
> ServiceAccount is a Kubernetes identity for pods and automated processes. For Grafana metric access, a ServiceAccount with `cluster-monitoring-view` ClusterRole provides read-only access to Prometheus metrics without granting broader cluster permissions. A bearer token extracted from the ServiceAccount authenticates Grafana's queries to Thanos Querier.

**First Defined**: Chapter 3, Section 3

**Example**: `grafana-sa` ServiceAccount in `grafana` namespace with `cluster-monitoring-view` binding.

**Security Pattern**: Principle of least privilege—read-only metric access without cluster admin rights.

### ClusterRoleBinding
**Canonical Definition** (from ch3-observability/s3-grafana-setup-lab.adoc):
> ClusterRoleBinding grants a ClusterRole's permissions to a user or ServiceAccount across the entire cluster. For GPU observability, ClusterRoleBinding grants the `cluster-monitoring-view` ClusterRole to the Grafana ServiceAccount, enabling secure read-only access to cluster metrics.

**First Defined**: Chapter 3, Section 3

**Example Command**:
```bash
oc adm policy add-cluster-role-to-user cluster-monitoring-view -z grafana-sa
```

**Purpose**: RBAC authorization for Grafana to query metrics without cluster-wide write permissions.

---

## MIG-Specific Components

### MIG Manager
**Canonical Definition** (from ch2-mig/s1-mig-overview.adoc):
> MIG Manager is a component of the NVIDIA GPU Operator (deployed as a DaemonSet) that watches node labels for MIG configuration directives, validates MIG profiles against GPU capabilities, enables MIG mode via nvidia-smi commands, creates MIG instances, and manages the MIG lifecycle. It executes the 10-20 minute reconfiguration workflow when node labels change.

**First Defined**: Chapter 2, Section 1 (Maximizing GPU ROI with Multi-Instance GPU)

**Key Functions**:
1. Label-driven configuration watching
2. MIG profile validation
3. GPU hardware reset for MIG mode enablement
4. Instance creation and partition management

**Enablement**: Set `migManager.enabled: true` in ClusterPolicy.

### mig-parted
**Canonical Definition** (from ch2-mig/s2-mig-slicing-lab.adoc):
> mig-parted is the configuration format and tool for defining custom MIG profile combinations. It uses YAML syntax in a ConfigMap to specify heterogeneous MIG instance allocations beyond the built-in profiles (all-1g.5gb, all-2g.10gb, all-balanced).

**First Defined**: Chapter 2, Section 2 (Lab: MIG Slicing Configuration)

**Configuration Structure**:
```yaml
version: v1
mig-configs:
  mixed-inference:
    - devices: all
      mig-enabled: true
      mig-devices:
        "3g.20gb": 1
        "2g.10gb": 2
```

**Purpose**: Advanced heterogeneous MIG configurations for diverse workload requirements.

---

## Layer 2 MaaS Components

### Cert-manager
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> Cert-manager is a Kubernetes operator that automates TLS certificate provisioning and renewal for services. In the MaaS three-layer architecture, Cert-manager (Layer 2) provides certificate management for secure inference endpoints and internal service communication.

**First Defined**: Chapter 1, Section 2 (Understanding Operators and Platform Automation)

**Layer**: Layer 2 - Inference at Scale

**Purpose**: Automated certificate lifecycle for production MaaS deployments.

### Kuadrant (Connectivity Link)
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> Kuadrant (also called Connectivity Link) provides rate limiting and traffic management capabilities for inference services. In Layer 2 of the MaaS stack, it enables API rate limiting, quota enforcement, and traffic shaping for multi-tenant inference endpoints.

**First Defined**: Chapter 1, Section 2

**Layer**: Layer 2 - Inference at Scale

**Purpose**: Rate limiting and quota management for inference APIs.

### LeaderWorkerSet
**Canonical Definition** (from ch1-gpu-operator/s2-operators-overview.adoc):
> LeaderWorkerSet is a Kubernetes operator for distributed training workloads that coordinates leader and worker pod topologies. In Layer 2 of the MaaS stack, it orchestrates multi-GPU distributed training jobs with leader election and worker coordination.

**First Defined**: Chapter 1, Section 2

**Layer**: Layer 2 - Inference at Scale

**Purpose**: Distributed training orchestration for multi-GPU workloads.

---

## Workload and Application Terms

### vLLM
**Canonical Definition** (from ch2-mig/s1-mig-overview.adoc and ch3-observability/s1-observability-stack.adoc):
> vLLM is a high-performance inference engine optimized for large language models. It provides efficient memory management, continuous batching, and GPU utilization optimization. vLLM workloads expose metrics like `vllm:request_success_total`, `vllm:time_to_first_token_seconds`, and `vllm:request_params_n` for observability.

**First Defined**: Chapter 2, Section 1 (used in examples)

**Common Use Cases**:
- LLaMA model inference (e.g., LLaMA-7B requiring 14GB VRAM)
- Production LLM serving with GPU acceleration
- Multi-tenant inference deployments

**Integration**: Works with KServe InferenceService for managed deployments.

### P99 Latency
**Canonical Definition** (from ch2-mig/s1-mig-overview.adoc):
> P99 latency (99th percentile latency) is a performance metric indicating the latency threshold below which 99% of requests complete. For GPU workloads, MIG provides <1% P99 variance (predictable performance) while time-slicing experiences 15-40% P99 variance due to resource contention.

**First Defined**: Chapter 2, Section 1

**Performance Comparison**:
- Full GPU: Fully predictable P99
- MIG: <1% P99 variance
- Time-slicing: 15-40% P99 variance

**Example**: MIG-isolated inference maintains 45ms P99 latency; time-sliced inference varies 45-63ms.

### Batch Size
**Canonical Definition** (from ch3-observability/s1-observability-stack.adoc):
> Batch size is the number of inference requests processed together in a single GPU operation. Larger batch sizes improve GPU utilization but increase latency and memory consumption. Monitoring `vllm:request_params_n` tracks batch size patterns for optimization.

**First Defined**: Chapter 3, Section 1

**Trade-offs**:
- Larger batches: Higher throughput, higher latency, more VRAM
- Smaller batches: Lower latency, lower throughput, less VRAM

### Chargeback
**Canonical Definition** (from ch2-mig/s1-mig-overview.adoc):
> Chargeback is the practice of allocating infrastructure costs to specific teams or projects based on actual resource usage. MIG enables accurate GPU chargeback through per-MIG-instance DCGM metrics, allowing cost allocation based on dedicated GPU resources consumed by each tenant.

**First Defined**: Chapter 2, Section 1

**Enablement**: DCGM provides per-MIG-instance utilization metrics for accurate cost tracking.

**Example**: Assign 2x `2g.10gb` instances per team; bill based on `DCGM_FI_PROF_GR_ENGINE_ACTIVE` utilization.

---

## Production Operations Terms

### Cordon and Uncordon
**Canonical Definition** (from ch2-mig/s1-mig-overview.adoc):
> Cordon marks a node as unschedulable, preventing new pods from being placed on it while existing pods continue running. Uncordon reverses this, allowing new pod scheduling. For MIG reconfiguration, cordoning prevents new GPU workloads during the 10-20 minute reconfiguration window.

**First Defined**: Chapter 2, Section 1

**Commands**:
- `oc adm cordon worker-gpu-0` - Mark unschedulable
- `oc adm uncordon worker-gpu-0` - Allow scheduling

**Use Case**: Safe MIG profile changes without accepting new workloads during reconfiguration.

### Drain
**Canonical Definition** (from ch2-mig/s1-mig-overview.adoc):
> Drain safely evicts all pods from a node, respecting PodDisruptionBudgets and graceful termination periods. For MIG reconfiguration, draining migrates GPU workloads to other nodes before GPU hardware reset, preventing abrupt workload termination.

**First Defined**: Chapter 2, Section 1

**Command**: `oc adm drain worker-gpu-0 --ignore-daemonsets --delete-emptydir-data`

**Duration**: 5-10 minutes for workload migration before MIG reconfiguration.

### Telemetry
**Canonical Definition** (from ch3-observability/s1-observability-stack.adoc):
> Telemetry is the automated collection and transmission of measurements from remote systems. GPU telemetry flows from DCGM (collecting hardware metrics) through DCGM Exporter (formatting for Prometheus) to the observability stack for visualization, alerting, and historical analysis.

**First Defined**: Chapter 3, Section 1

**GPU Telemetry Flow**: DCGM → DCGM Exporter → Prometheus → Thanos → Grafana

**Metrics Categories**: Utilization, memory, temperature, power, errors, per-MIG-instance allocation.

---

## Updated: Terms Previously Marked "To Be Defined"

### Multi-Instance GPU (MIG)
**Status**: ✅ DEFINED in Chapter 2, Section 1
**See**: Main MaaS Architecture section for full canonical definition

### MIG Profile
**Status**: ✅ DEFINED in Chapter 2, Section 1
**See**: Main MaaS Architecture section for full canonical definition

### Time-Slicing
**Status**: TO BE DEFINED in future chapter update
**Brief Description**: Alternative to MIG for GPU sharing via temporal multiplexing

---

## Deprecated or Avoided Terms

### ❌ "GPU Operator" (ambiguous)
**Use instead**: "NVIDIA GPU Operator" (specific vendor)
**Reason**: Multiple vendors have GPU operators; be specific

### ❌ "Red Hat OpenShift Data Science" (old name)
**Use instead**: "Red Hat OpenShift AI"
**Reason**: Product was renamed in version 3.x

### ❌ "Community Operators" (in production context)
**Use instead**: "redhat-operators or certified-operators"
**Reason**: Community operators lack support SLAs for production use

---

## Acronym Reference

| Acronym | Full Term | First Defined |
|---------|-----------|---------------|
| AI | Artificial Intelligence | Course title |
| CRD | Custom Resource Definition | Chapter 1, Section 2 |
| CR | Custom Resource | Chapter 1, Section 2 |
| CRI-O | Container Runtime Interface - O | Chapter 1, Section 1 |
| CSV | ClusterServiceVersion | Chapter 1, Section 2 |
| CUDA | Compute Unified Device Architecture | Chapter 1, Section 1 |
| CVO | Cluster Version Operator | Chapter 1, Section 2 |
| DCGM | Data Center GPU Manager | Chapter 1, Section 1 |
| ECC | Error-Correcting Code | Chapter 3, Section 1 |
| GFD | GPU Feature Discovery | Chapter 1, Section 1 |
| GPU | Graphics Processing Unit | Course title |
| HBM2 | High Bandwidth Memory 2 | Chapter 2, Section 1 |
| MaaS | Models-as-a-Service | Chapter 1, Section 2 |
| MIG | Multi-Instance GPU | Chapter 2, Section 1 |
| ML | Machine Learning | Chapter 1, Section 2 |
| NFD | Node Feature Discovery | Chapter 1, Section 1 |
| NVML | NVIDIA Management Library | Chapter 2, Section 1 |
| OLM | Operator Lifecycle Manager | Chapter 1, Section 2 |
| P99 | 99th Percentile | Chapter 2, Section 1 |
| PCIe | Peripheral Component Interconnect Express | Chapter 1, Section 1 |
| PromQL | Prometheus Query Language | Chapter 3, Section 1 |
| RBAC | Role-Based Access Control | Chapter 1, Section 2 |
| ROI | Return on Investment | Chapter 1 index |
| SLA | Service Level Agreement | Chapter 1, Section 2 |
| SM | Streaming Multiprocessor | Chapter 2, Section 1 |
| TLS | Transport Layer Security | Chapter 1, Section 2 |
| vGPU | Virtual GPU | Chapter 2, Section 1 |
| vLLM | vLLM (inference engine) | Chapter 2, Section 1 |
| VRAM | Video Random Access Memory | Chapter 1, Section 1 |
| YAML | YAML Ain't Markup Language | Course prerequisites |

---

## Usage Guidelines

### When to Reference This Document

**Always reference before**:
- Defining a technical term for the first time in new content
- Writing transitions that reference prior concepts
- Creating cross-references to other chapters
- Updating existing content

### How to Reference Existing Terms

**Pattern for first use in a section**:
```asciidoc
The ClusterPolicy Custom Resource (introduced in Chapter 1, Section 2)
declares the desired state...
```

**Pattern for subsequent uses**:
```asciidoc
Edit the ClusterPolicy to change the driver version...
```

### How to Add New Terms

1. Define the term in your new content
2. After content is approved, add to this document with:
   - Canonical definition (exact text from content)
   - First defined location (chapter, section)
   - Key characteristics or related terms
   - Examples if applicable
3. Commit terminology update with content changes

---

## Maintenance Schedule

**Weekly**: Review new content for terms to add
**Monthly**: Check for deprecated terms or changed product names
**Per Release**: Verify all version-specific information is current

**Maintainer Notes**: 
- Last full review: 2026-04-12 (Added 30+ terms from Chapters 2-3: GPU hardware, observability stack, MIG components)
- Next review due: 2026-05-12
