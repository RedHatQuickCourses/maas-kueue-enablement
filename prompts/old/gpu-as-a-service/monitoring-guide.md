# GPU-as-a-Service: Monitoring and Observability Guide

**Source**: Production reference implementation from `/Users/kaknox/Documents/GitHub/gpu-as-a-service/base/monitoring/`

This document explains the monitoring strategy for GPU-as-a-Service, including Grafana dashboard configuration, Prometheus metrics, and alert rules.

---

## Monitoring Overview

Effective GPU-as-a-Service operations require real-time visibility into:

1. **Workload lifecycle**: How many workloads are pending, running, admitted, or evicted?
2. **Admission latency**: How long do workloads wait in the queue before starting?
3. **Quota utilization**: Are teams using their guaranteed quotas? Are they borrowing? How much?
4. **Preemption activity**: How often are workloads being preempted? Is this expected or problematic?
5. **System health**: Is Kueue controller healthy? Is Prometheus scraping metrics correctly?

### Monitoring Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **Grafana Dashboard** | Visual dashboard for operators | Grafana UI (namespace: `grafana`) |
| **ServiceMonitor** | Configures Prometheus to scrape Kueue metrics | `redhat-ods-applications` namespace |
| **PrometheusRule** | Alert rules for critical conditions | `redhat-ods-applications` namespace |
| **Grafana DataSource** | Connects Grafana to OpenShift Thanos Querier | `grafana` namespace |
| **ServiceAccount** | Grants Grafana read access to Prometheus | `kueue-monitoring` namespace |

---

## Grafana Dashboard: Kueue — OpenShift AI Monitoring

The dashboard provides comprehensive visibility across 6 sections:

### 1. Workload Overview

**Purpose**: High-level snapshot of cluster-wide workload state.

| Panel | Metric | Description | Alert Threshold |
|-------|--------|-------------|-----------------|
| **Active Workloads** | `sum(kueue_admitted_active_workloads)` | Total running workloads across all ClusterQueues | — |
| **Pending Workloads** | `sum(kueue_pending_workloads)` | Total workloads waiting for quota | Alert if > 10 for 5+ minutes |
| **Total Admitted (24h)** | `sum(increase(kueue_admitted_workloads_total[24h]))` | Throughput: How many workloads were admitted in the last 24 hours | — |
| **Evictions (24h)** | `sum(increase(kueue_evicted_workloads_total[24h]))` | Total preemptions in the last 24 hours | Alert if > 50 (indicates excessive preemption) |

**Usage**:
- **Healthy state**: Active workloads > 0, pending workloads < 5, steady admission rate, low eviction count
- **Problem indicators**:
  - High pending count (> 10) for extended periods → quota exhaustion or resource availability issues
  - Evictions > 50/day → preemption policies may be too aggressive, or priority assignments need review

---

### 2. Workload Lifecycle

**Purpose**: Per-queue breakdown of workload states.

| Panel | Metric | Description | Visualization |
|-------|--------|-------------|---------------|
| **Workloads by ClusterQueue** | `sum(kueue_admitted_active_workloads) by (cluster_queue)` (Active)<br>`sum(kueue_pending_workloads) by (cluster_queue)` (Pending)<br>`sum(rate(kueue_evicted_workloads_total[5m])) by (cluster_queue) * 60` (Evictions/min) | Time series showing active, pending, and eviction rates per ClusterQueue | Time series graph with 3 series |
| **ClusterQueue Status** | `kueue_cluster_queue_status` | Table showing each ClusterQueue's status (active, terminating, etc.) | Table |

**Usage**:
- **Identify bottlenecks**: If `inference-cq` shows high pending count while `training-cq` is idle, review quota allocation or borrowing limits.
- **Detect preemption patterns**: If `training-cq` shows frequent evictions (> 1/min), training workloads are being preempted regularly. Verify if this aligns with business expectations (e.g., inference SLAs require preemption).

**Key Metrics**:
- `kueue_admitted_active_workloads{cluster_queue="inference-cq"}` → Inference team's running workload count
- `kueue_pending_workloads{cluster_queue="training-cq"}` → Training workloads waiting for quota

---

### 3. Admission Latency

**Purpose**: Measure how long workloads wait in the queue before being admitted (quota becomes available).

| Panel | Metric | Description | SLA Guidance |
|-------|--------|-------------|--------------|
| **Admission Wait Time (p50 / p95 / p99)** | `histogram_quantile(0.50, sum(rate(kueue_admission_wait_time_seconds_bucket[5m])) by (le))`<br>`histogram_quantile(0.95, ...)`<br>`histogram_quantile(0.99, ...)` | Percentile distribution of wait times cluster-wide | p95 < 60s (healthy)<br>p95 < 120s (acceptable)<br>p95 > 120s (alert) |
| **Admission Latency p95 by ClusterQueue** | `histogram_quantile(0.95, sum(rate(kueue_admission_wait_time_seconds_bucket[5m])) by (le, cluster_queue))` | Per-queue p95 admission latency | Identify which queue has high latency |

**Usage**:
- **Inference SLAs**: If inference workloads must start within 30 seconds, monitor `p95` for `inference-cq`. If > 30s, investigate:
  - Is nominal quota too low?
  - Are preemption policies working correctly?
  - Are training workloads holding GPUs too long?
- **Training throughput**: If training p95 is > 5 minutes, training jobs are waiting too long. Consider increasing training's nominal quota or reducing inference's borrowing activity.

**Alert Condition**:
```yaml
alert: KueueAdmissionLatencyHigh
expr: histogram_quantile(0.95, sum(rate(kueue_admission_wait_time_seconds_bucket[5m])) by (le)) > 120
for: 10m
```

---

### 4. Resource Utilization & Quota

**Purpose**: Track how teams are using their quotas and borrowing from the cohort.

| Panel | Metric | Description | Interpretation |
|-------|--------|-------------|----------------|
| **Resource Usage / Nominal Quota** | `kueue_cluster_queue_resource_usage / kueue_cluster_queue_nominal_quota` | Ratio of used quota to guaranteed quota | > 1.0 = borrowing<br>< 0.5 = underutilized |
| **Resource Usage Over Time (Stacked)** | `kueue_cluster_queue_resource_usage` (stacked by ClusterQueue) | Time series showing total resource consumption | Visualize borrowing patterns |
| **Borrowing Usage / Borrowing Limit** | `kueue_cluster_queue_borrowing_usage / kueue_cluster_queue_borrowing_limit > 0` | How much borrowed quota is being used vs. the borrowing limit | 1.0 = hitting borrowing limit |
| **Nominal Quota Configuration** | `kueue_cluster_queue_nominal_quota` | Table showing each ClusterQueue's guaranteed quota by resource and flavor | Configuration reference |

**Usage Examples**:

#### Example 1: Inference Borrowing During Off-Peak
```
Time: 2:00 AM
inference-cq nvidia.com/gpu usage: 4 GPUs
inference-cq nominal quota: 3 GPUs
→ Usage / Nominal Quota = 4 / 3 = 1.33 (borrowing 1 GPU)
training-cq nvidia.com/gpu usage: 0 GPUs
→ Inference is using training's idle quota
```

#### Example 2: Quota Exhaustion Alert
```
Time: 10:00 AM
training-cq nvidia.com/gpu usage: 3 GPUs
training-cq nominal quota: 1 GPU
training-cq borrowing limit: 2 GPUs
→ Usage / Nominal Quota = 3.0 (borrowing 2 GPUs, at max)
→ Borrowing Usage / Borrowing Limit = 2 / 2 = 1.0 (100% of borrowing limit used)
→ Alert: Training cannot admit new workloads until inference releases GPUs or training workload completes
```

**Alert Condition**:
```yaml
alert: KueueQuotaExhausted
expr: (kueue_cluster_queue_resource_usage / kueue_cluster_queue_nominal_quota) > 0.95
for: 10m
```

**Key Metrics**:
- `kueue_cluster_queue_nominal_quota{cluster_queue="inference-cq", flavor="gpu-flavor", resource="nvidia.com/gpu"}` → 3 GPUs
- `kueue_cluster_queue_resource_usage{...}` → Current usage (could be 0-4 GPUs depending on borrowing)
- `kueue_cluster_queue_borrowing_limit{...}` → 1 GPU (max additional GPUs inference can borrow)

---

### 5. Throughput & Rates

**Purpose**: Measure admission and eviction velocity to understand system dynamics.

| Panel | Metric | Description | Healthy Baseline |
|-------|--------|-------------|------------------|
| **Admission & Eviction Rate (per minute)** | `sum(rate(kueue_admitted_workloads_total[5m])) by (cluster_queue) * 60`<br>`sum(rate(kueue_evicted_workloads_total[5m])) by (cluster_queue) * 60` | Per-queue admission and eviction rates per minute | Admission > eviction (steady state) |
| **Hourly Admission Throughput** | `sum(rate(kueue_admitted_workloads_total[1h])) * 3600` | Total workloads admitted per hour | Baseline for capacity planning |

**Usage**:
- **Capacity planning**: If admission rate is consistently 50 workloads/hour and pending queue is growing, cluster needs more GPUs or higher quotas.
- **Preemption churn**: If eviction rate is > 10/min for `training-cq`, training workloads are being preempted frequently. Investigate:
  - Is inference demand consistently high?
  - Should training quotas be reduced further?
  - Should some training workloads use a non-preemptible queue?

**Alert Condition**:
```yaml
alert: KueueHighEvictionRate
expr: sum by (cluster_queue) (rate(kueue_evicted_workloads_total[1h])) * 3600 > 5
for: 10m
```

---

### 6. Prometheus Scrape Health

**Purpose**: Verify Prometheus is successfully scraping Kueue metrics.

| Panel | Metric | Description | Alert Threshold |
|-------|--------|-------------|-----------------|
| **Kueue Scrape Target Status** | `up{job=~".*kueue.*"}` | 1 = scrape target healthy, 0 = down | Alert if 0 for 3+ minutes |
| **Scrape Duration** | `scrape_duration_seconds{job=~".*kueue.*"}` | How long each scrape takes | > 10s indicates performance issues |
| **Scraped Samples** | `scrape_samples_scraped{job=~".*kueue.*"}` | Number of metrics collected per scrape | Sudden drop indicates missing metrics |

**Usage**:
- **Troubleshooting missing metrics**: If dashboard panels show "No data," check this section first.
- **Scrape target down**: If `up` = 0, verify:
  - Kueue controller-manager pod is running: `oc get pods -n redhat-ods-applications -l control-plane=controller-manager`
  - ServiceMonitor exists: `oc get servicemonitor -n redhat-ods-applications`
  - Prometheus can reach the metrics endpoint

**Alert Condition**:
```yaml
alert: KueueTargetDown
expr: up{job=~".*kueue.*"} == 0
for: 3m
```

---

## Key Kueue Metrics Reference

### Workload State Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `kueue_pending_workloads` | Gauge | `cluster_queue` | Number of workloads waiting for quota |
| `kueue_admitted_active_workloads` | Gauge | `cluster_queue` | Number of running workloads |
| `kueue_admitted_workloads_total` | Counter | `cluster_queue` | Cumulative count of admitted workloads (use `rate()` for throughput) |
| `kueue_evicted_workloads_total` | Counter | `cluster_queue` | Cumulative count of preempted workloads |

### Quota Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `kueue_cluster_queue_nominal_quota` | Gauge | `cluster_queue`, `flavor`, `resource` | Guaranteed quota allocation (e.g., 3 GPUs) |
| `kueue_cluster_queue_resource_usage` | Gauge | `cluster_queue`, `flavor`, `resource` | Current resource usage (includes borrowed quota) |
| `kueue_cluster_queue_borrowing_limit` | Gauge | `cluster_queue`, `flavor`, `resource` | Maximum borrowable quota (e.g., 1 GPU) |
| `kueue_cluster_queue_borrowing_usage` | Gauge | `cluster_queue`, `flavor`, `resource` | Amount of currently borrowed quota |

### Latency Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `kueue_admission_wait_time_seconds_bucket` | Histogram | `le` (latency bucket) | Distribution of admission wait times (use `histogram_quantile()` for percentiles) |

### Status Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `kueue_cluster_queue_status` | Gauge | `cluster_queue`, `status` | ClusterQueue status (1 = active, 0 = inactive/terminating) |

---

## Prometheus Alert Rules

The monitoring stack includes 6 pre-configured alerts:

### 1. KueueHighPendingWorkloads

```yaml
alert: KueueHighPendingWorkloads
expr: sum by (cluster_queue) (kueue_pending_workloads) > 10
for: 5m
severity: warning
```

**Trigger**: More than 10 workloads pending in a ClusterQueue for 5+ minutes

**Action**:
1. Check quota utilization: Are teams at 100% of quota + borrowing limit?
2. Verify resource availability: Are GPU nodes healthy and available?
3. Review workload resource requests: Are workloads requesting more GPUs than available in a single flavor?

---

### 2. KueueClusterQueueDown

```yaml
alert: KueueClusterQueueDown
expr: kueue_cluster_queue_status{status="active"} == 0
for: 2m
severity: critical
```

**Trigger**: ClusterQueue status is not "active" for 2+ minutes

**Action**:
1. Check ClusterQueue resource: `oc get clusterqueue inference-cq -o yaml`
2. Check Kueue controller logs: `oc logs -n redhat-ods-applications deployment/kueue-controller-manager`
3. Verify ResourceFlavors exist: `oc get resourceflavor`

---

### 3. KueueHighEvictionRate

```yaml
alert: KueueHighEvictionRate
expr: sum by (cluster_queue) (rate(kueue_evicted_workloads_total[1h])) * 3600 > 5
for: 10m
severity: warning
```

**Trigger**: More than 5 evictions per hour in a ClusterQueue for 10+ minutes

**Action**:
1. **Expected behavior**: Inference preempting training is normal. Verify evictions are in `training-cq`.
2. **Unexpected behavior**: If inference is being preempted, investigate:
   - Are there multiple priority levels within inference queue?
   - Is there a misconfigured ClusterQueue with higher priority?
3. **Mitigation**: If training churn is excessive, consider:
   - Increasing training's nominal quota
   - Reducing inference's borrowing limit
   - Creating a non-preemptible training queue for long-running jobs

---

### 4. KueueQuotaExhausted

```yaml
alert: KueueQuotaExhausted
expr: (kueue_cluster_queue_resource_usage / kueue_cluster_queue_nominal_quota) > 0.95
for: 10m
severity: critical
```

**Trigger**: Resource usage > 95% of nominal quota + borrowing limit for 10+ minutes

**Action**:
1. **Short-term**: Wait for running workloads to complete, or manually evict low-priority workloads
2. **Medium-term**: Review quota allocation—should this team's nominal quota be increased?
3. **Long-term**: Capacity planning—cluster may need more GPUs

---

### 5. KueueAdmissionLatencyHigh

```yaml
alert: KueueAdmissionLatencyHigh
expr: histogram_quantile(0.95, sum(rate(kueue_admission_wait_time_seconds_bucket[5m])) by (le)) > 120
for: 10m
severity: warning
```

**Trigger**: p95 admission latency > 120 seconds for 10+ minutes

**Action**:
1. Check if quotas are exhausted (see alert #4)
2. Verify preemption is working: Are lower-priority workloads being evicted to make room?
3. Review borrowing limits: Can high-priority teams borrow more?

---

### 6. KueueTargetDown

```yaml
alert: KueueTargetDown
expr: up{job=~".*kueue.*"} == 0
for: 3m
severity: critical
```

**Trigger**: Prometheus cannot scrape Kueue metrics for 3+ minutes

**Action**:
1. Verify Kueue controller is running: `oc get pods -n redhat-ods-applications -l control-plane=controller-manager`
2. Check ServiceMonitor: `oc get servicemonitor -n redhat-ods-applications`
3. Verify Prometheus configuration: `oc get prometheus -n openshift-monitoring`

---

## Deployment Instructions

### 1. Deploy Monitoring Components

```bash
# Deploy all monitoring resources
oc apply -k /Users/kaknox/Documents/GitHub/gpu-as-a-service/base/monitoring/
```

This creates:
- `ServiceMonitor` in `redhat-ods-applications` namespace
- `PrometheusRule` (alerts) in `redhat-ods-applications` namespace
- `GrafanaDataSource` in `grafana` namespace
- `GrafanaDashboard` in `grafana` namespace
- `ServiceAccount` with RBAC in `kueue-monitoring` namespace

### 2. Configure Grafana DataSource Token

The Grafana datasource needs a ServiceAccount token to authenticate against OpenShift Thanos Querier:

```bash
# Extract ServiceAccount token
TOKEN=$(oc get secret grafana-sa-token -n kueue-monitoring -o jsonpath='{.data.token}' | base64 -d)

# Patch GrafanaDataSource with token
oc patch grafanadatasource prometheus-thanos -n grafana \
  --type merge \
  -p "{\"spec\":{\"datasource\":{\"secureJsonData\":{\"httpHeaderValue1\":\"Bearer ${TOKEN}\"}}}}"
```

### 3. Access the Dashboard

1. Open Grafana UI:
   ```bash
   oc get route grafana -n grafana -o jsonpath='{.spec.host}'
   ```

2. Log in with OpenShift credentials

3. Navigate to **Dashboards** → **Kueue — OpenShift AI Monitoring**

---

## Operational Runbooks

### Scenario 1: Inference Workloads Waiting Too Long

**Symptoms**: `inference-cq` shows high pending count, admission latency p95 > 60s

**Diagnosis**:
```bash
# Check inference quota usage
oc get clusterqueue inference-cq -o yaml | grep -A 20 resourceGroups

# Check training GPU usage (should be preemptible)
oc get pods -n team-training -o wide | grep Running

# Verify preemption is working
oc get workloads -n team-inference -o yaml | grep -A 5 conditions
```

**Resolution**:
- If training is using borrowed GPUs, preemption should occur automatically within 30 seconds
- If no preemption, verify `borrowWithinCohort.policy: LowerPriority` is set in `inference-cq`
- If preemption is working but still slow, increase inference nominal quota

---

### Scenario 2: Training Workloads Never Admitted

**Symptoms**: `training-cq` shows persistent pending count, even when inference is idle

**Diagnosis**:
```bash
# Check training quota status
oc describe clusterqueue training-cq

# Check inference GPU usage
oc get pods -n team-inference -o wide | grep Running | wc -l

# Check cohort status
oc get cohort gpu-cohort -o yaml
```

**Resolution**:
- Verify training LocalQueue is correctly routing to `training-cq`
- Check if training workloads have `kueue.x-k8s.io/queue-name: team-training` label
- Verify ResourceFlavor tolerations match GPU node taints

---

### Scenario 3: High Eviction Rate Alert

**Symptoms**: Alert fires: `KueueHighEvictionRate` for `training-cq`

**Diagnosis**:
```bash
# Check eviction rate
oc get prometheusrule kueue-alerts -n redhat-ods-applications -o yaml

# Review recent preemptions
oc get events -n team-training --field-selector reason=WorkloadEvicted --sort-by='.lastTimestamp'
```

**Resolution**:
- **If expected**: Inference demand is high, preemption is working as designed. Document as normal.
- **If unexpected**: Review if preemption policies are too aggressive. Consider:
  - Increasing training nominal quota
  - Creating a separate non-preemptible queue for critical training jobs
  - Adjusting `maxPriorityThreshold` in inference ClusterQueue

---

## Next Steps

- **Understand the architecture**: See [architecture-overview.md](./architecture-overview.md)
- **Learn the configuration**: See [yaml-examples.md](./yaml-examples.md)
- **Deploy monitoring**: Use `oc apply -k base/monitoring/`
