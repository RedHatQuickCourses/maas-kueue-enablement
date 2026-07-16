# Red Hat AI Training: Business Value of AI

## SMEs for Development

- Hunter Gerlach
- David Williams
- AI BU Performance Testing Team (For Inference/GPU ROI metrics)
- Business Value Proposition Team (For TCO/ROI framing)

## Tech Level / Target Audience

**Tech Level 2-3** (Internal Red Hat Field Teams: Solutions Architects, Technical Consultants, Pre-Sales Professionals, and SPT Leads). The personas these learners will confront in the field include IT Decision Makers (ITDMs), IT General Managers (ITGMs), CIOs, CEOs, CFOs, CISOs, and Platform Team Leads.

**Rollout Strategy:** Internal only. Initial mandated rollout targeting SPT leads and their teams for 100% compliance.

## Pre-requisite Knowledge Required

- Cloud-native architecture, OpenShift administration, and multi-cluster container environments.
- Basic AI model deployment concepts and inference runtimes (vLLM, Triton, llm-d).
- High-level understanding of model parameters, weights, and the performance differences between running quantized models and full-precision models.
- Core understanding of hardware bottlenecks, specifically how distributed model architectures impact network communication (e.g., East-West traffic constraints).

*Note: Learners are assumed to possess deep technical expertise; this course focuses entirely on extending that expertise into business and financial justification.*

## SME Input

- **The Laptop vs. Production Journey:** Customers do not grasp the qualitative and financial gulf between running a highly compressed, quantized model locally versus running a full-precision model at enterprise scale. SAs must map out the intermediate steps of the infrastructure journey to justify dedicated hardware spend.
- **The Balanced MaaS Approach:** While external public token providers carry data tracking risks, the Red Hat OpenShift AI Models-as-a-Service (MaaS) layer is designed to route to external providers and grant access to distinct models at different times. SAs must present both sides of this coin: leveraging public cloud APIs can be highly beneficial for project agility and rapid testing, provided the customer dynamically balances this against keeping proprietary data internal to retain core intellectual property.
- **The Data Exposure Risk:** Commercial customers must evaluate data governance carefully when utilizing public frontier models. Disclaimer: There is currently no public data to back up explicit exfiltration claims against specific providers; however, architects must conceptually educate customers on how public cloud models can ingest external points of view into shared training data pools.
- **The Interconnect Saturation Loop:** In high-stakes escalations where massive Mixture of Experts (MoE) models are spread across two nodes, performance failures occur even when using high-speed interconnects. The bottleneck is not a slow standard network; the model architecture simply forces every single token generated to be shared continuously between the nodes to keep them in sync, creating a continuous loop of network saturation that software operators cannot overcome.
- **The Implementation Cost of Strategic Gaps:** Architects must change how they approach the strategy gap. They are not simple high-level strategy consultants; they represent the organization that builds and supports the underlying platform. However, if the field cannot guide the conversation at a high strategic level early on, the project will pay for that lack of alignment during the downstream technical implementation.
- **The Ultimate Course Imperative:** Technical architecture alone does not win enterprise deals. To grow and sustain an AI project, the architect must be able to partner directly with the customer's finance teams to convey the cost, risk, and revenue that the project will generate, securing the necessary funding to scale the platform.

## Problem Statement

**Framework:** Cost Reduction, Risk Reduction, and Revenue Growth as the primary value proposition.

- "Sticker Shock," customer maturity, and high-level funding strategies.
- Field teams are great at technical details but miss the nuance of business justification for hardware spend.
- Quantify the incentive for customers to invest and the risk of unmanaged data exposure.
- Evaluate when on-prem vs. frontier AI is valuable (Build vs. Buy vs. Rent).
- Navigate the ability to deliver what the customer wants versus what their environment actually provides.
- 2-node deployments where the model is too large for one node and cross-node communication is too high for production SLAs.

## Course Goal

By the end of this training, participants will be able to translate advanced Red Hat AI infrastructure primitives into high-level business drivers (Cost Reduction, Risk Mitigation, and Revenue Growth). You will master the execution tools required to command mixed-stakeholder rooms, pivot legacy IT budgets to fund AI factories, and actively steer executives out of failing "Decision Past" configurations before relationships degrade.

- **Cost Reduction:** Optimizing hardware investment through intelligent scheduling (Kueue, InstaSlice), evaluating Build vs. Buy vs. Rent, and maximizing GPU utilization from stranded CapEx.
- **Risk Reduction:** Quantifying the "Risk of Data" through the subsidized token trap framework, configuring MaaS Gateway routing for data sovereignty, and deciding when to use on-prem vs. public frontier AI.
- **Revenue Growth:** Proving that the AI investment actually moves the revenue needle — diagnosing interconnect saturation failures, applying the Quantization VRAM Precision Matrix, and rescuing "Decision Past" environments before relationships degrade.

## Resources & Documentation

- The Findings of Forrester's Total Economic Impact on Red Hat AI

---

## Course Design

### Narrative Framework

The course is structured as a single continuous scenario: *your colleague is on parental leave and you have been tapped to cover their three highest-risk customer accounts.* Each module opens a new case file, escalating in complexity and stakes. Learners do not study abstract frameworks — they apply them under pressure, in the same customer situations they will face in the field.

### TL3 Skill & Task Mapping

| Learning Objective (LO) | Core Concept (The "Why") | Practical Task (The "How") | Executive Objection Handling Focus |
| :--- | :--- | :--- | :--- |
| **LO 1: Mapping the Multi-Step Journey & AI Factory Lifecycle** | Addressing the false equivalence between cheap laptop-based quantized models and enterprise production, while framing AI as a holistic factory. | Breaking down the intermediate steps and infrastructure knobs (context length, dense vs. sparse) between local testing and production to align hardware expectations. | Overcoming the CFO's "Sticker Shock" by proving that skipping intermediate architectural steps leads to unmanaged capital expenditure. |
| **LO 2: Balancing the MaaS Coin (Risk vs. Agility)** | Recognizing that while external tokens carry conceptual data tracking risks, the MaaS layer can safely route to external providers for agility. | Configuring the MaaS layer to leverage public cloud APIs for rapid testing, while retaining the flexibility to pull workloads back on-premise for IP protection. | Defending against vendor lock-in by proving to CISO/Legal that the architecture dynamically balances cloud agility with internal data sovereignty. |
| **LO 3: Rescuing "Decision Past" & Interconnect Saturation** | Drawing a direct line between scalable technical design decisions and the business's ability to execute revenue-generating AI use cases. | Diagnosing a failing 2-node environment choked by a Mixture of Experts (MoE) model due to continuous token-sharing saturation across high-speed interconnects. | Navigating the CEO's demand for the "biggest model" post-decision by stating the objective truth: they must either procure more hardware or select a different model. |
| **LO 4: Financial Team Collaboration & Platform-Rooted Strategy** | Proving that if field teams cannot guide high-level strategy early, the customer pays for it during downstream technical implementation. | Partnering directly with the customer's finance professionals to present clear cost, risk, and revenue metrics to secure funding to grow the project. | Differentiating Red Hat from generic strategy firms by demonstrating how root-level platform maintainer status prevents catastrophic implementation failures. |

### Module Structure

| Module | Format | Topics & Scenarios |
| :--- | :--- | :--- |
| **Module 1: The Translation Gap & Platform Strategy** (15 min) | Presentation | **Topic Scenario 1: The AI Factory Lifecycle:** Framing the offering as a complete "AI Factory" (from data science to distributed inference) to calculate comprehensive value instead of localized pilots. Introduces the "so-what ladder" for translating technical features into Cost, Risk, or Revenue outcomes.<br><br>**Topic Scenario 2: The Platform-Rooted Strategy:** Demonstrating how root-level platform maintainer status prevents catastrophic implementation failures. Dismantles the "laptop illusion" through a multi-step infrastructure journey (laptop → workstation → single server → multi-node → production fleet). |
| **Module 2: Cost & Infrastructure Economics** (20 min) | Arcade Interaction | **Topic Scenario 3: Mapping the Multi-Step Journey:** Defeating the laptop illusion by mapping AI unit economics — GPU depreciation rates ($25/day per H100), stranded CapEx ($2.7M/year at 15% utilization), and data center physics (power density, thermal CapEx).<br><br>**Topic Scenario 4: Sizing the Infrastructure Knobs:** Joint workshop converting fixed GPU silos into a dynamic utility pool using Kueue (workload queuing) and InstaSlice (GPU partitioning/MIG). Drives utilization from 15% to 80%, yielding $2.2M/year in recovered value with <2-month payback. |
| **Module 3: Risk, Data Governance, & Hybrid Agility** (15 min) | Arcade Interaction | **Topic Scenario 5: Balancing the MaaS Coin:** Navigating a CISO/developer standoff at a regulated financial services firm. Explains the "subsidized token trap" (adoption → dependency → monetization) and three levels of data risk (direct training, metadata leakage, third-party subprocessing).<br><br>**Topic Scenario 6: Conceptual Data Governance:** Deploying the MaaS Gateway for intelligent routing — data classification routing, rate limits/token quotas, and model abstraction — to satisfy auditability, enforceable policy, and gradual migration requirements. |
| **Module 4: Revenue & Rescuing "Decision Past"** (20 min) | Arcade Interaction | **Topic Scenario 7: The High-Speed Interconnect Loop:** Diagnosing a critical escalation where a 141B-parameter MoE model collapses under production load (200ms → 12s latency) due to continuous cross-node expert routing that saturates the interconnect.<br><br>**Topic Scenario 8: Rescuing the "Decision Past":** Delivering the objective architectural truth to the CIO — expand hardware ($2-5M) or compress the model via quantization (INT8/INT4). Introduces the Quantization VRAM Precision Matrix and recommends a phased approach. |
| **Module 5: Securing Funding & Adoption** (15 min) | Arcade Interaction | **Topic Scenario 9: Financial Team Collaboration:** Addressing the human-in-the-loop (HITL) trust gap that adds $550K/year in labor costs. Introduces the 5-persona Agentic Platform RACI Matrix for clear operational boundaries.<br><br>**Topic Scenario 10: Securing Bottom-Up Adoption:** Presenting the agentic platform stack — EvalHub (automated evaluation CI/CD), MLflow (agentic tracing), and MCP Gateway (tool decoupling) — to reduce HITL from 100% review to 5% statistical sampling. |
| **Course Wrap-Up: The Customer Journey** (5 min) | Presentation | **Mapping the Journey:** A Customer Maturity Stage Map linking all 10 scenarios to five maturity stages (Exploration, Investment, Governance, Scale, Adoption) with diagnostic customer signals and recommended deliverables.<br><br>**Downloadable Assets:** The "ROI Alignment Matrix" and "Troubleshooting Multi-Node Performance" field guides for immediate field use. |

### Interactive Scenario (Arcade) Requirements

- **Delivery Platform:** Self-paced, browser-based delivery utilizing RISE for modular structure, Synthesia for AI-narrated video elements, and Arcade embedded within the LMS for branching-logic simulations.
- **Environment Configuration:** No physical hardware labs are required. The high-stakes escalations (e.g., the 2-node MoE interconnect saturation loop, the MaaS cloud-routing configuration, the Kueue/InstaSlice utilization workshop) are handled entirely via conversational branching and architectural diagrams within Arcade.
- **Design Philosophy:** The scenarios focus on *conversational troubleshooting and objective truth-telling*. If a learner chooses a purely technical answer (e.g., explaining the token synchronization loop without the business impact), the simulation acknowledges their technical accuracy but gently guides them to partner with finance or attach the strategic "so what" to their response.

## Topic List & Scenarios

| # | Topic Name | Primary Persona | Key Takeaway / Technical Hook |
| :--- | :--- | :--- | :--- |
| 1 | The AI Factory Lifecycle | Pre-Sales / SA | **The Holistic Scope:** Framing the offering as a complete "AI Factory" (from data science and training to distributed inference) to calculate comprehensive value instead of localized pilots. Introduces the "so-what ladder" technique for translating features into Cost, Risk, or Revenue. |
| 2 | The Platform-Rooted Strategy | Both | **Architectural Authority:** Differentiating from generic strategy firms by demonstrating how root-level platform maintainer status prevents catastrophic implementation failures. Dismantles the "laptop illusion" via the multi-step infrastructure journey. |
| 3 | Mapping the Multi-Step Journey | Solutions Architect | **Defeating the Laptop Illusion:** Breaking down AI unit economics — GPU depreciation, stranded CapEx, data center physics — to reframe a CFO's frozen $8M GPU investment as an unlocked asset awaiting activation. |
| 4 | Sizing the Infrastructure Knobs | Solutions Architect | **Cost-Performance Alignment:** Deploying Kueue and InstaSlice to convert fixed GPU silos into a dynamic utility pool, driving utilization from 15% to 80% and cutting effective cost-per-GPU-hour by 81%. |
| 5 | Balancing the MaaS Coin | Technical Consultant | **Hybrid Agility:** Navigating the subsidized token trap and three levels of data risk to position a balanced hybrid approach — public APIs for speed, internal models for sovereignty. |
| 6 | Conceptual Data Governance | Solutions Architect | **Evaluating Exposure Risk:** Deploying the MaaS Gateway for intelligent routing with data classification, rate limits, and model abstraction to satisfy CISO auditability and enforceable policy requirements. |
| 7 | The High-Speed Interconnect Loop | Technical Consultant | **The Reality of MoE Syncing:** Diagnosing a 2-node escalation where continuous token-sharing saturates high-speed interconnects, proving that model sizing must match physical footprints. |
| 8 | Rescuing the "Decision Past" | Pre-Sales / SA | **Stating the Real Truth:** Delivering the Quantization VRAM Precision Matrix and phased remediation plan to a CIO — compress the model now (INT8), procure hardware for full-precision later. |
| 9 | Financial Team Collaboration | Pre-Sales / PSP | **Securing the Funds:** Addressing the HITL trust gap ($550K/year in labor) with the 5-persona Agentic Platform RACI Matrix and clear production accuracy SLAs. |
| 10 | Securing Bottom-Up Adoption | Both | **Eradicating Shelfware:** Deploying EvalHub, MLflow agentic tracing, and MCP Gateway to build mathematical proof of model accuracy, enabling reduction of human review from 100% to 5% statistical sampling. |

## Overall Course Timings

| Chapter / Section | Estimated Time |
| :--- | :--- |
| **Module 1:** The Translation Gap & Platform Strategy | 15 minutes |
| **Module 2:** Cost & Infrastructure Economics | 20 minutes |
| **Module 3:** Risk, Data Governance, & Hybrid Agility | 15 minutes |
| **Module 4:** Revenue & Rescuing "Decision Past" | 20 minutes |
| **Module 5:** Securing Funding & Adoption | 15 minutes |
| **Wrap-Up:** The Customer Journey | 5 minutes |
| **Course Total:** | **1 Hour 30 Minutes** |
