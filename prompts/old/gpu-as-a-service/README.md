# GPU-as-a-Service Reference Materials

This directory contains reference documentation for the GPU-as-a-Service architecture and implementation, derived from the production reference repository at `/Users/kaknox/Documents/GitHub/gpu-as-a-service/`.

---

## Purpose

These materials support the development of **Chapter 4: GPU as a Service** in the MaaS Workload Scheduling with Kueue course. They provide:

1. **Architecture foundation** for understanding multi-tenant GPU quota management
2. **Annotated YAML examples** for learning Kueue configuration patterns
3. **Monitoring guidance** for operational observability

---

## Contents

| File | Purpose | Use When |
|------|---------|----------|
| **[architecture-overview.md](./architecture-overview.md)** | Complete architectural reference covering use case, component hierarchy, quota allocation, preemption rules, and deployment | Creating presentation content explaining WHY GPU-as-a-Service is needed, WHAT the architecture looks like, and HOW it solves multi-tenant GPU scarcity |
| **[yaml-examples.md](./yaml-examples.md)** | Annotated YAML configurations for all Kueue components with detailed field-by-field explanations | Creating lab content, explaining configuration options, or building hands-on exercises |
| **[monitoring-guide.md](./monitoring-guide.md)** | Grafana dashboard structure, Prometheus metrics, alert rules, and operational runbooks | Creating monitoring/observability content or troubleshooting Day 2 operations |

---

## Relationship to Source Repository

These files are **derived from** but **independent of** the source repository:

- **Source**: `/Users/kaknox/Documents/GitHub/gpu-as-a-service/`
- **Format**: Source contains raw Kubernetes YAML and JSON; these files are prose documentation
- **Purpose**: Source is deployment-ready configuration; these files are educational reference materials
- **Maintenance**: If source repository is updated, these files should be reviewed and updated accordingly

---

## How to Use These Materials

### For Content Creation (Chapter 4)

When creating new course content for Chapter 4, use the **[example-fresh-prompt-gpu-as-a-service.md](../example-fresh-prompt-gpu-as-a-service.md)** template, which references these materials as context.

**Workflow**:
1. Start a fresh conversation with Claude
2. Paste the example fresh prompt
3. Claude reads these reference materials to understand the architecture
4. Claude creates course content (presentation pages, labs) based on this foundation

### For Specific Topics

| Course Content Topic | Primary Reference File | Key Sections |
|---------------------|----------------------|--------------|
| **Why GPU-as-a-Service?** | architecture-overview.md | Use Case, Business Impact, Solution |
| **Cohort and ClusterQueue design** | yaml-examples.md | Cohort, ClusterQueues sections |
| **Preemption policies** | architecture-overview.md + yaml-examples.md | Preemption Rules (arch), ClusterQueue annotations (yaml) |
| **Hardware Profiles** | architecture-overview.md + yaml-examples.md | Hardware Profiles sections in both |
| **Deployment lab** | architecture-overview.md | Deployment Options, Prerequisites |
| **Monitoring and Day 2 Ops** | monitoring-guide.md | All sections |

---

## Integration with Course Structure

These materials prepare for the following course sections (Chapter 4):

### Proposed Chapter 4 Structure

| Section | Format | Source Materials | Time |
|---------|--------|-----------------|------|
| **s1-gpu-service-overview.adoc** | Presentation | architecture-overview.md (Use Case, Architecture, Preemption Rules) | 30 min |
| **s2-configure-quotas-lab.adoc** | Lab | yaml-examples.md (Cohort, ClusterQueues, LocalQueues, ResourceFlavors) | 45 min |
| **s3-hardware-profiles-lab.adoc** | Lab | yaml-examples.md (HardwareProfiles, WorkloadPriorityClasses) | 30 min |
| **s4-monitoring-observability.adoc** | Presentation | monitoring-guide.md (Dashboard, Metrics, Alerts) | 20 min |
| **s5-troubleshooting-lab.adoc** | Lab (Day 2) | monitoring-guide.md (Operational Runbooks) | 30 min |

**Total Chapter 4 Time**: ~2 hours 35 minutes

---

## Updating These Materials

### When to Update

Update these files if:
- The source repository (`gpu-as-a-service/`) is updated with new features or configuration changes
- Kueue API versions change (e.g., `v1beta2` → `v1`)
- OpenShift AI introduces new HardwareProfile fields
- Prometheus metrics or alert rules are added/changed

### How to Update

1. **Identify changes** in the source repository:
   ```bash
   cd /Users/kaknox/Documents/GitHub/gpu-as-a-service
   git log --oneline --since="2026-01-01"
   ```

2. **Review affected YAML files**:
   ```bash
   git diff <commit-hash> base/
   ```

3. **Update reference materials**:
   - **architecture-overview.md**: Update diagrams, quota tables, preemption rules if changed
   - **yaml-examples.md**: Update YAML snippets and annotations if API fields changed
   - **monitoring-guide.md**: Update metrics, alert rules, or dashboard sections if monitoring changed

4. **Verify course content**: If reference materials change significantly, review Chapter 4 content for consistency

---

## Style and Terminology

These reference materials follow the course style guide:

- **Tone**: Technical depth with business context
- **Depth**: WHY (conceptual) + WHAT (architectural) + HOW (tactical)
- **Audience**: Platform Engineers and DevOps/SREs with Kubernetes and Kueue experience (Chapters 1-3 completed)
- **Examples**: Concrete scenarios with specific metrics (not vague terms like "quickly")
- **Terminology**: Canonical definitions from [../TERMINOLOGY.md](../TERMINOLOGY.md)

---

## Questions?

For questions about:
- **Using these materials for content creation**: See [../example-fresh-prompt-gpu-as-a-service.md](../example-fresh-prompt-gpu-as-a-service.md)
- **Course style and structure**: See [../STYLE-GUIDE.md](../STYLE-GUIDE.md)
- **Source repository and deployment**: See `/Users/kaknox/Documents/GitHub/gpu-as-a-service/README.md`
