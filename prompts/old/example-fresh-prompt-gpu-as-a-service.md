# Example Fresh Prompt for GPU-as-a-Service Content (Chapter 4)

This is a complete, ready-to-paste example for creating Chapter 4 content in a fresh conversation with Claude.

---

## COPY EVERYTHING BELOW THIS LINE AND PASTE INTO NEW CHAT

---

I'm creating content for the **maas-kueue-enablement** course. This is part of an ongoing content development effort, and I need to maintain consistency with existing materials.

## Course Information

**Course**: MaaS Workload Scheduling with Kueue (maas-kueue-enablement)
**Working Directory**: `/Users/kaknox/Documents/GitHub/maas-kueue-enablement/`
**Current Chapter**: Chapter 4 - GPU as a Service (NEW CHAPTER)
**Target Section**: [Specify section, e.g., s1-gpu-service-overview.adoc, s2-configure-quotas-lab.adoc, etc.]

## Style and Quality Standards

**Style Guide**:
Follow the patterns documented in:
`/Users/kaknox/Documents/GitHub/maas-kueue-enablement/references/STYLE-GUIDE.md`

**Terminology Reference**:
Check canonical definitions in:
`/Users/kaknox/Documents/GitHub/maas-kueue-enablement/references/TERMINOLOGY.md`

**Key Style Requirements**:
- Depth: Conceptual (WHY) + Architectural (WHAT) + Tactical (HOW)
- Tone: Technical depth with business context
- Audience: Platform Engineers and DevOps/SREs with Kueue experience (Chapters 1-3 completed)
- Examples: Concrete scenarios with specific timing/metrics (not "quickly" - use "45 seconds")
- Callouts: Production guidance (TIP), warnings (WARNING), critical info (IMPORTANT)
- Integration: Reference Chapters 1-3 concepts (Kueue foundations, cohorts, preemption)

## Integration Requirements

**This content builds on**:
- Chapter 1 (Foundations): ResourceFlavors, ClusterQueues, LocalQueues, Kueue architecture
- Chapter 2 (Cohorts): Cohort-based borrowing, nominal quota, elastic utilization
- Chapter 3 (Preemption): Priority-based preemption, WorkloadPriorityClasses, `reclaimWithinCohort`, `borrowWithinCohort`

**This content prepares for**:
- Production deployment scenarios
- Multi-tenant GPU operations
- Day 2 operational troubleshooting

**Cross-references needed**:
- Link to ClusterQueue definition from Chapter 1
- Reference preemption policies from Chapter 3
- Reference cohort borrowing from Chapter 2

## Content Request

**GOAL**: Create Chapter 4 content on GPU-as-a-Service, integrating all Kueue concepts from Chapters 1-3 into a complete, production-ready multi-tenant GPU quota management solution.

**TARGET AUDIENCE**:
- Role: Platform Engineer, DevOps/SRE
- Expertise Level: Intermediate (completed Chapters 1-3 on Kueue foundations, cohorts, and preemption)
- Use Case Context: Production enterprise AI platform with multiple teams (inference and training) competing for limited GPU resources

**SCOPE**:

Must Cover:
- **Use Case**: Multi-tenant GPU scarcity problem (resource starvation, unpredictable scheduling, manual intervention, poor utilization)
- **Business Value**: Guaranteed quotas, priority-based preemption, self-service, monitoring (increased utilization from 40% to 85-90%)
- **Architecture**: Cohort structure, ClusterQueue design (inference vs. training), LocalQueue routing, ResourceFlavors for GPU nodes
- **Asymmetric Preemption**: Inference can preempt training to borrow/reclaim, but training cannot preempt inference
- **Quota Allocation**: Reference architecture (4 GPUs: inference 3 guaranteed + 1 borrowable, training 1 guaranteed + 2 borrowable)
- **Hardware Profiles**: OpenShift AI dashboard integration for self-service (highPriority, lowPriority profiles)
- **Monitoring**: Grafana dashboard (6 sections: Workload Overview, Lifecycle, Latency, Utilization, Throughput, Scrape Health)
- **Deployment**: Kustomize/ArgoCD deployment options, prerequisites, post-deployment configuration
- **Hands-on Lab**: Deploy GPU-as-a-Service configuration, submit workloads, observe preemption, verify monitoring

Must Exclude:
- GPU driver/operator installation (covered in prerequisite maas-gpu-enablement course)
- Basic Kueue concepts (covered in Chapters 1-3)
- Multi-Instance GPU (MIG) configuration (different topic, covered in maas-gpu-enablement)
- Alternative queueing systems (focus on Kueue)
- Advanced Kueue features not used in reference architecture (AdmissionChecks, ProvisioningRequest, MultiKueue)

Placement:
- Course: maas-kueue-enablement
- Chapter: ch4-gpu-as-a-service (NEW)
- Position: New chapter after Chapter 3 (Preemption)
- Estimated Total Time: 2 hours 35 minutes

**REFERENCE MATERIALS**:

GPU-as-a-Service Reference (Primary):
- Architecture: `/Users/kaknox/Documents/GitHub/maas-kueue-enablement/references/gpu-as-a-service/architecture-overview.md`
- YAML Examples: `/Users/kaknox/Documents/GitHub/maas-kueue-enablement/references/gpu-as-a-service/yaml-examples.md`
- Monitoring: `/Users/kaknox/Documents/GitHub/maas-kueue-enablement/references/gpu-as-a-service/monitoring-guide.md`
- Reference README: `/Users/kaknox/Documents/GitHub/maas-kueue-enablement/references/gpu-as-a-service/README.md`

Source Repository (Secondary):
- Original configuration: `/Users/kaknox/Documents/GitHub/gpu-as-a-service/` (for deployment commands, file paths)

Existing Course Chapters:
- Chapter 1: `/Users/kaknox/Documents/GitHub/maas-kueue-enablement/modules/ch1-foundations/`
- Chapter 2: `/Users/kaknox/Documents/GitHub/maas-kueue-enablement/modules/ch2-cohorts/`
- Chapter 3: `/Users/kaknox/Documents/GitHub/maas-kueue-enablement/modules/ch3-preemption/`

**DEPTH AND STYLE**:

Chapter 4 Structure (Proposed):

| Section | Format | Reading Time | Lab Time | Total |
|---------|--------|--------------|----------|-------|
| **s1-gpu-service-overview.adoc** | Presentation | 30 min | — | 30 min |
| **s2-configure-quotas-lab.adoc** | Lab | 5 min | 40 min | 45 min |
| **s3-hardware-profiles-lab.adoc** | Lab | 5 min | 25 min | 30 min |
| **s4-monitoring-observability.adoc** | Presentation | 20 min | — | 20 min |
| **s5-troubleshooting-lab.adoc** | Lab (Day 2) | 5 min | 25 min | 30 min |
| **Chapter Total** | | | | **2h 35m** |

Content Balance:
- Conceptual (WHY): 30% - Business case for GPU-as-a-Service (utilization, cost savings, SLA protection)
- Architectural (WHAT): 40% - Multi-tenant architecture, quota design, preemption rules, monitoring strategy
- Practical (HOW): 30% - Deployment steps, configuration, verification, troubleshooting

Tone:
- [X] Technical depth with business context
- [X] Production-ready guidance (decision matrices, operational runbooks)
- [X] Builds on Chapters 1-3 knowledge (assumes deep Kueue understanding)

Required Elements (Per Section):

**For s1-gpu-service-overview.adoc** (Presentation):
- [ ] Concrete example: Multi-tenant scenario (inference team vs. training team competing for 4 GPUs)
- [ ] Before/After comparison: GPU utilization without/with GPU-as-a-Service (40% → 85-90%)
- [ ] ASCII diagram: Cohort structure with ClusterQueues, LocalQueues, HardwareProfiles
- [ ] Decision matrix: When to use cohorts vs. separate clusters, single cohort vs. multiple cohorts
- [ ] Table: Quota allocation (guaranteed, borrowing limit, max usable, priority)
- [ ] Table: Scheduling scenarios (only inference, only training, both teams, contention)
- [ ] Preemption rules explanation: Asymmetric policies (inference can preempt training, not vice versa)
- [ ] Callouts: TIP for quota sizing, WARNING about preemption churn
- [ ] Specific metrics: "85-90% utilization", "inference SLA protected within 30 seconds"
- [ ] Integration: References ClusterQueue (Ch1), cohort borrowing (Ch2), preemption policies (Ch3)

**For s2-configure-quotas-lab.adoc** (Lab):
- [ ] Lab objective: Deploy Cohort, ClusterQueues, LocalQueues, ResourceFlavors
- [ ] Before you begin: Prerequisites (Kueue enabled, GPU Operator installed, GPU nodes tainted)
- [ ] Step-by-step: Deploy using Kustomize or ArgoCD
- [ ] Annotated YAML: ClusterQueue with preemption policies (reference yaml-examples.md)
- [ ] Verification: Check ClusterQueue status, quota metrics
- [ ] What's next: Transition to Hardware Profiles

**For s3-hardware-profiles-lab.adoc** (Lab):
- [ ] Lab objective: Configure HardwareProfiles for OpenShift AI dashboard self-service
- [ ] Annotated YAML: HardwareProfile with LocalQueue routing, PriorityClass assignment
- [ ] Hands-on: Create workbench using Hardware Profile in OpenShift AI dashboard
- [ ] Verification: Check workload labels, queue assignment, priority
- [ ] What's next: Transition to Monitoring

**For s4-monitoring-observability.adoc** (Presentation):
- [ ] Grafana dashboard structure: 6 sections (Workload Overview, Lifecycle, Latency, Utilization, Throughput, Scrape Health)
- [ ] Key metrics table: Metrics, what they measure, healthy baselines
- [ ] Alert rules table: 6 alerts with trigger conditions and action items
- [ ] Dashboard screenshot or ASCII mockup showing panel layout
- [ ] Callouts: TIP for baseline metrics, WARNING for alert fatigue
- [ ] What's next: Transition to Troubleshooting Lab

**For s5-troubleshooting-lab.adoc** (Day 2 Lab):
- [ ] Lab objective: Diagnose and resolve common GPU-as-a-Service operational issues
- [ ] Scenario 1: Inference workloads waiting too long (quota exhaustion)
- [ ] Scenario 2: Training workloads never admitted (misconfigured queue routing)
- [ ] Scenario 3: High eviction rate alert (expected vs. unexpected preemption)
- [ ] Verification: Use Grafana dashboard and oc commands to diagnose
- [ ] Resolution steps: Fix configuration or adjust quotas

**SUCCESS CRITERIA**:

Learning Objectives - Students should be able to:
- Explain what GPU-as-a-Service is and articulate business value (improved utilization, SLA protection, self-service)
- Design multi-tenant GPU quota architecture (cohort, ClusterQueues, quotas, borrowing limits)
- Configure asymmetric preemption policies (protect inference, allow training to borrow opportunistically)
- Deploy GPU-as-a-Service configuration using Kustomize or ArgoCD
- Integrate HardwareProfiles with OpenShift AI dashboard for self-service
- Monitor GPU quota utilization, borrowing, and preemption using Grafana
- Troubleshoot common operational issues (quota exhaustion, high latency, eviction churn)

Verification:
- Students can explain when to use GPU-as-a-Service vs. separate clusters
- Students can configure ClusterQueue preemption policies for asymmetric behavior
- Students can deploy and verify GPU-as-a-Service in a lab environment
- Students can use Grafana dashboard to diagnose quota and latency issues
- Students can resolve common Day 2 operational scenarios

Integration Points:
- Builds on: Chapter 1 ClusterQueue/LocalQueue, Chapter 2 cohort borrowing, Chapter 3 preemption policies
- Prepares for: Production multi-tenant GPU operations, real-world MaaS deployments
- Cross-references: ClusterQueue (ch1), cohort (ch2), preemption (ch3), ResourceFlavor (ch1)

## Instructions

1. **Read the GPU-as-a-Service reference materials**:
   - Start with `references/gpu-as-a-service/architecture-overview.md` for comprehensive architecture understanding
   - Review `references/gpu-as-a-service/yaml-examples.md` for annotated configuration examples
   - Study `references/gpu-as-a-service/monitoring-guide.md` for monitoring and observability content

2. **Read the style guide and terminology**:
   - Check `references/STYLE-GUIDE.md` for writing patterns and quality standards
   - Verify `references/TERMINOLOGY.md` for canonical definitions of Kueue terms (ClusterQueue, cohort, preemption, etc.)

3. **Review existing chapters** to understand integration points:
   - Skim `modules/ch1-foundations/pages/` to understand how ClusterQueue and LocalQueue are introduced
   - Skim `modules/ch2-cohorts/pages/` to understand how cohort borrowing is explained
   - Skim `modules/ch3-preemption/pages/` to understand how preemption policies are taught

4. **Use Plan Mode** to design the page/section outline before writing any content

5. **Present the plan** for my review and approval before implementing

6. **After approval**, create the content following the approved plan

7. **Verify integration** by checking that:
   - ClusterQueue, LocalQueue, cohort, preemption concepts reference earlier chapters
   - YAML examples match the source repository configurations
   - Monitoring guidance aligns with the Grafana dashboard structure
   - Transitions between sections are smooth

8. **Update files**:
   - Create `modules/ch4-gpu-as-a-service/` directory structure
   - Create `modules/ch4-gpu-as-a-service/nav.adoc` with section navigation
   - Create `modules/ch4-gpu-as-a-service/pages/index.adoc` (chapter overview)
   - Create `modules/ch4-gpu-as-a-service/pages/s1-gpu-service-overview.adoc` (and other sections as planned)
   - Update `antora.yml` to add `modules/ch4-gpu-as-a-service/nav.adoc` to course navigation

9. **Build and verify** with `npm run build` to ensure no errors

---

## END OF PROMPT TO PASTE

---

# How to Use This Example

1. **Copy everything between the "COPY EVERYTHING BELOW" markers above**
2. **Customize for your specific section**:
   - Update `Target Section` to specify which section you're creating (s1, s2, s3, s4, or s5)
   - Adjust `Required Elements` to focus on the section you're creating
   - If creating a lab, emphasize hands-on steps and verification
   - If creating a presentation, emphasize architecture diagrams and decision matrices
3. **Paste into new Claude conversation**
4. **Wait for Claude to read reference materials and create plan**
5. **Review plan and approve**
6. **Claude implements**

## Customization Points

When adapting this for specific sections:

- **For s1-gpu-service-overview.adoc** (Presentation):
  - Focus on WHY and WHAT
  - Emphasize business value, architecture, preemption rules
  - Use `architecture-overview.md` heavily

- **For s2-configure-quotas-lab.adoc** or **s3-hardware-profiles-lab.adoc** (Labs):
  - Focus on HOW
  - Emphasize step-by-step deployment, verification, troubleshooting
  - Use `yaml-examples.md` for annotated configurations

- **For s4-monitoring-observability.adoc** (Presentation):
  - Focus on WHAT to monitor and WHY
  - Emphasize dashboard structure, key metrics, alert rules
  - Use `monitoring-guide.md` heavily

- **For s5-troubleshooting-lab.adoc** (Day 2 Lab):
  - Focus on HOW to diagnose and resolve issues
  - Emphasize operational runbooks, real-world scenarios
  - Use `monitoring-guide.md` operational runbooks section

## What NOT to Change

Keep these sections as-is:
- Style Guide reference
- Terminology reference
- Key Style Requirements (depth approach, tone)
- Integration Requirements (builds on Ch1-3)
- Instructions section (the workflow)
- Reference materials paths

## Course Structure After Chapter 4

```
maas-kueue-enablement/
├── modules/
│   ├── ROOT/
│   ├── LABENV/
│   ├── ch1-foundations/         (60 min)
│   ├── ch2-cohorts/             (60 min)
│   ├── ch3-preemption/          (90 min)
│   └── ch4-gpu-as-a-service/    (155 min) ← NEW
│       ├── nav.adoc
│       └── pages/
│           ├── index.adoc
│           ├── s1-gpu-service-overview.adoc
│           ├── s2-configure-quotas-lab.adoc
│           ├── s3-hardware-profiles-lab.adoc
│           ├── s4-monitoring-observability.adoc
│           └── s5-troubleshooting-lab.adoc
└── antora.yml  (updated to include ch4-gpu-as-a-service)
```

**New Course Total**: 6 hours 5 minutes (from 3.5 hours)
