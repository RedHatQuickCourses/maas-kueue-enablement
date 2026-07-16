# Red Hat Product and Technical Learning Team
## Business Value of AI (Foundations Level 0): Course High Level Design

### COURSE GOAL
To equip internal Solutions Architects, Technical Consultants, and Pre-Sales professionals with the skills to perform technical architecture design while concurrently translating infrastructure primitives into the language of Cost, Risk, and Revenue. Due to intense market pressure, organizations often view moving from a local laptop environment to production as a simple, two-step transition, misaligning critical infrastructure requirements and resulting in severe executive sticker shock. This scenario-driven course trains the field to map the multi-step infrastructure journey, collaborate with customer finance teams to fund platform growth, state the objective truth in failing "Decision Past" environments, and establish a balanced hybrid architecture utilizing Models-as-a-Service (MaaS) to optimize both public cloud agility and internal data sovereignty.

### TARGET AUDIENCE
* **Solutions Architects & Technical Consultants:** Responsible for diagnosing "Decision Past" environmental failures, calculating infrastructure constraints, and realigning technical architecture with customer expectations.
* **Pre-Sales Professionals & SPT Leads:** Focused on delivering high-level CIO/CEO pitches, justifying capital expenditures, and leveraging platform-rooted knowledge to secure funding from corporate finance teams.
* **Rollout Strategy:** Internal only. Initial mandated rollout targeting SPT leads and their teams for 100% compliance.

### PREREQUISITES
* Foundational understanding of cloud-native architecture, OpenShift administration, and multi-cluster container environments.
* Basic AI model deployment concepts and inference runtimes (e.g., vLLM, Triton, llm-d).
* Comprehension of model parameters, weights, and the performance differences between running a quantized model and a full-precision model.
* Understanding of hardware bottlenecks, specifically how distributed model architectures impact East-West network communication.
* *Note: Learners are assumed to possess deep technical expertise; this course focuses entirely on extending that expertise into business and financial justification.*

---

### TL3 SKILL & TASK MAPPING (Business Translation & Scenario Depth)

| Learning Objective (LO) | Core Concept (The "Why") | Practical Task (The "How" - The Pitch) | Executive Objection Handling Focus |
| :--- | :--- | :--- | :--- |
| **LO 1: Mapping the Multi-Step Journey & AI Factory Lifecycle** | *Addressing the false equivalence between cheap laptop-based quantized models and enterprise production, while framing AI as a holistic factory.* | *Breaking down the intermediate steps and infrastructure knobs (context length, dense vs. sparse) between local testing and production to align hardware expectations.* | *Overcoming the CFO's "Sticker Shock" by proving that skipping intermediate architectural steps leads to unmanaged capital expenditure.* |
| **LO 2: Balancing the MaaS Coin (Risk vs. Agility)** | *Recognizing that while external tokens carry conceptual data tracking risks, the MaaS layer can safely route to external providers for agility.* | *Configuring the MaaS layer to leverage public cloud APIs for rapid testing, while retaining the flexibility to pull workloads back on-premise for IP protection.* | *Defending against vendor lock-in by proving to CISO/Legal that the architecture dynamically balances cloud agility with internal data sovereignty.* |
| **LO 3: Rescuing "Decision Past" & Interconnect Saturation** | *Drawing a direct line between scalable technical design decisions and the business's ability to execute revenue-generating AI use cases.* | *Diagnosing a failing 2-node environment choked by a "Mixture of Experts" (MoE) model due to continuous token-sharing saturation across high-speed interconnects.* | *Navigating the CEO's demand for the "biggest model" post-decision by stating the objective truth: they must either procure more hardware or select a different model.* |
| **LO 4: Financial Team Collaboration & Platform-Rooted Strategy** | *Proving that if field teams cannot guide high-level strategy early, the customer pays for it during downstream technical implementation.* | *Partnering directly with the customer's finance professionals to present clear cost, risk, and revenue metrics to secure funding to grow the project.* | *Differentiating Red Hat from generic strategy firms by demonstrating how root-level platform maintainer status prevents catastrophic implementation failures.* |

---

### COURSE DESIGN

| Section | Format | Topics & Activities |
| :--- | :--- | :--- |
| **Module 1: The Translation Gap & Platform Strategy** | Presentation (Video Hook) | **Topic Scenario 1: The AI Factory Lifecycle:** Framing the offering as a complete "AI Factory" (from data science to distributed inference) to calculate comprehensive value instead of localized pilots.<br><br>**Topic Scenario 2: The Platform-Rooted Strategy:** Demonstrating how root-level platform maintainer status prevents catastrophic implementation failures later, proving that disconnected business strategy leads to massive technical debt. |
| **Module 2: Cost & Infrastructure Economics** | Arcade Interaction | **Topic Scenario 3: Mapping the Multi-Step Journey:** Defeating the laptop illusion by breaking down the intermediate infrastructure steps between local testing and production.<br><br>**Topic Scenario 4: Sizing the Infrastructure Knobs:** Evaluating how specific technical choices (context length, dense vs. sparse architectures) act as financial knobs that impact GPU and memory budgets. |
| **Module 3: Risk, Data Governance, & Hybrid Agility** | Arcade Interaction | **Topic Scenario 5: Balancing the MaaS Coin:** Configuring the MaaS layer to safely route to external cloud providers for rapid agility while retaining the flexibility to pull workloads back on-premise.<br><br>**Topic Scenario 6: Conceptual Data Governance:** Educating commercial customers on exposure risk and shared training data pools without relying on unbacked exfiltration claims. |
| **Module 4: Revenue & Rescuing "Decision Past"** | Arcade Interaction | **Topic Scenario 7: The High-Speed Interconnect Loop:** Diagnosing a 2-node escalation where continuous token-sharing saturates high-speed interconnects, proving that model sizing must match physical footprints.<br><br>**Topic Scenario 8: Rescuing the "Decision Past":** Stepping into a post-decision environment and confidently advising the CIO whether they need to procure more hardware or select a different model. |
| **Module 5: Securing Funding & Adoption** | Arcade Interaction | **Topic Scenario 9: Financial Team Collaboration:** How to align with a customer's corporate finance professionals, presenting clear cost, risk, and revenue metrics to secure funding to grow the project.<br><br>**Topic Scenario 10: Securing Bottom-Up Adoption:** Utilizing self-service registries and pre-built operational workflows to ensure developers and line-of-business users organically adopt the platform, preventing shelfware. |
| **Course Wrap-Up: The Customer Journey** | Presentation / PDF | **Mapping the Journey:** A summary of how to map these 10 conversational scenarios to the specific maturity stage of the customer.<br><br>**Downloadable Assets:** The "ROI Alignment Matrix" and "Troubleshooting Multi-Node Performance" field guides for immediate field use. |

### INTERACTIVE SCENARIO (ARCADE) REQUIREMENTS
* **Delivery Platform:** Self-paced, browser-based delivery utilizing RISE for modular structure, Synthesia for AI-narrated video elements, and Arcade embedded within the LMS for branching-logic simulations.
* **Environment Configuration:** No physical hardware labs are required. The high-stakes escalations (e.g., the 2-node MoE interconnect saturation loop and the MaaS cloud-routing configuration) are handled entirely via conversational branching and architectural diagrams within Arcade.
* **Design Philosophy:** The scenarios must focus on *conversational troubleshooting and objective truth-telling*. If a learner chooses a purely technical answer (e.g., explaining the token synchronization loop without the business impact), the simulation acknowledges their technical accuracy but gently guides them to partner with finance or attach the strategic "so what" to their response.

### OVERALL COURSE TIMINGS

| Chapter/Section | Estimated Time |
| :--- | :--- |
| **Module 1:** The Translation Gap & Platform Strategy | 15 minutes |
| **Module 2:** Cost & Infrastructure Economics | 20 minutes |
| **Module 3:** Risk, Data Governance, & Hybrid Agility | 15 minutes |
| **Module 4:** Revenue & Rescuing "Decision Past" | 20 minutes |
| **Module 5:** Securing Funding & Adoption | 15 minutes |
| **Wrap-Up & Knowledge Validation:** | 5 minutes |
| **Course Total:** | **1 Hour 30 Minutes** |