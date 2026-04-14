# Course Content Style Guide

**Reference Implementation**: `modules/ch1-gpu-operator/pages/s2-operators-overview.adoc`

This guide extracts the style patterns, depth approach, and writing conventions from the operators overview page to ensure consistency across all course materials.

---

## 1. Document Structure Pattern

### Required Frontmatter
```asciidoc
:time_estimate: [number]

= [Page Title]

_Estimated reading time: *{time_estimate} minutes*._

Objective::

[One-paragraph objective describing what students will understand/learn/do]
```

### Section Hierarchy
```asciidoc
= Page Title (level 0 - only once, at top)

== Major Section (level 1 - main topics)

=== Subsection (level 2 - detailed topics)

==== Sub-subsection (level 3 - specific details)
```

**Rule**: Never skip heading levels. Always progress = → == → === → ====

### Page Structure Flow
1. **Introduction** (Objective + brief context)
2. **Conceptual Foundation** (WHY it exists, problems it solves)
3. **Architecture/Components** (WHAT it is, how parts relate)
4. **Practical Application** (HOW to use it, examples)
5. **Production Considerations** (Decision points, best practices)
6. **Integration** (How it fits with other concepts)
7. **What's Next** (Transition to next section)

---

## 2. Writing Style Patterns

### Tone and Voice

**✅ DO:**
- Use second person: "You create a Subscription..."
- Present tense: "The operator reconciles..."
- Active voice: "OLM creates an InstallPlan" (not "An InstallPlan is created")
- Definitive statements: "Operators provide self-healing" (not "Operators can provide...")

**❌ DON'T:**
- Use passive voice excessively
- Use vague qualifiers: "generally", "usually", "might", "could", "critical"
- Use filler words: "basically", "simply", "just"
- Anthropomorphize: "The operator thinks..." → "The operator detects..."

### Concrete vs. Abstract

**✅ GOOD - Concrete:**
```
The controller recreates the DaemonSet automatically in ~30 seconds.
```

**❌ BAD - Vague:**
```
The controller quickly recreates the DaemonSet.
```

**✅ GOOD - Specific:**
```
With the NVIDIA GPU Operator, you declare your desired state in a ClusterPolicy Custom Resource.
```

**❌ BAD - Generic:**
```
You can use operators to manage resources.
```

### Business Context Integration

Always connect technical concepts to business value:

**Pattern**: `[Technical Capability] → [Business Outcome]`

**Examples:**
- "Operators transform GPU infrastructure from manually-managed silos into self-healing systems" → Business outcome: reduced operational toil
- "OLM automates operator upgrades" → Business outcome: consistent cluster state, reduced human error
- "MIG increases GPU utilization from 40% to 95%" → Business outcome: better ROI on GPU investment

---

## 3. Example Patterns

### Concrete Scenario Examples

**Structure:**
1. **Setup**: Describe the scenario
2. **Action**: What happens
3. **Result**: Observable outcome with specific timing/metrics

**Template:**
```asciidoc
**Scenario:** [Describe real-world situation]

[Action steps or commands]

**What happened:**

1. [Step 1 with specific details]
2. [Step 2 with specific details]
3. [Observable result with timing]

**Result:**

[Show output or state change]
```

**Example from Reference:**
```asciidoc
**Scenario:** Admin accidentally deletes the DCGM DaemonSet

[source,bash]
----
$ oc delete daemonset nvidia-dcgm -n nvidia-gpu-operator
daemonset.apps "nvidia-dcgm" deleted
----

**Controller detects the mismatch:**

* **Desired state (ClusterPolicy):** `dcgm.enabled: true`
* **Actual state (cluster):** No DCGM DaemonSet exists

**Controller acts within ~30 seconds:**

[numbered list of actions]

**Result:**

[source,bash]
----
$ oc get daemonset nvidia-dcgm -n nvidia-gpu-operator
[output showing recreated daemonset]
----
```

### Before/After Comparisons

**Use when**: Showing transformation, improvement, or evolution

**Pattern:**
```asciidoc
**[Old Approach] ([descriptor]):**

[Example or description]

**[New Approach] ([descriptor]):**

[Example or description]

[Key difference or improvement]
```

**Example from Reference:**
```asciidoc
**Imperative (manual scripting):**

[source,bash]
----
for node in $(oc get nodes -l gpu=true -o name); do
  ssh $node "curl -O https://driver-repo/driver-535.129.03.run"
  ...
done
# Script does NOT monitor or self-heal
----

**Declarative (operator-managed):**

[source,yaml]
----
apiVersion: nvidia.com/v1
kind: ClusterPolicy
spec:
  driver:
    version: "535.129.03"
# Operator CONTINUOUSLY enforces this state
----
```

---

## 4. Code Example Conventions

### YAML Examples

**Requirements:**
- Use `[source,yaml]` for syntax highlighting
- Include callout annotations `<1>`, `<2>` for important fields
- Provide explanation list after code block
- Show realistic, working examples (not placeholders)

**Template:**
```asciidoc
[source,yaml]
----
apiVersion: [api.group]/[version]
kind: [ResourceKind]
metadata:
  name: [specific-name]
spec:
  fieldOne: value             # <1>
  fieldTwo:
    nestedField: value        # <2>
----
<1> Explanation of fieldOne
<2> Explanation of nestedField
```

### Command Examples

**Requirements:**
- Use `[source,bash]` for shell commands
- Include expected output when showing verification
- Use `$` prompt for commands
- Use `#` for comments (sparingly)

**Pattern for Commands:**
```asciidoc
[source,bash]
----
$ command with flags
OUTPUT_SHOWN_HERE
----
```

**Pattern for Multi-step Workflows:**
```asciidoc
[source,bash]
----
# Step 1: Check current state
$ oc get csv -n namespace
NAME                VERSION   PHASE
operator.v1.0.0     1.0.0     Succeeded

# Step 2: Verify resources
$ oc get pods -n namespace
[output]
----
```

### ASCII Diagrams

**Use when**: Illustrating workflows, architecture, relationships

**Requirements:**
- Use simple box-drawing characters
- Keep width ≤ 60 characters for readability
- Include clear labels
- Use arrows (→, ↓) to show flow

**Template:**
```asciidoc
----
┌─────────────────────────────────────┐
│   [Component Name]                  │
│   [Key characteristic]              │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│   [Next Component]                  │
└─────────────────────────────────────┘
----
```

---

## 5. Callout Usage Patterns

### TIP - Production Best Practices

**Use for**: Recommended approaches for production environments

```asciidoc
[TIP]
====
For revenue-generating MaaS platforms, always configure `installPlanApproval: Manual` and pin to version-specific channels. This gives you control over when upgrades occur.
====
```

### WARNING - Critical Cautions

**Use for**: Actions that could cause problems, anti-patterns

```asciidoc
[WARNING]
====
Never use community operators in production AI platforms. They lack support SLAs, may have security vulnerabilities, and could be unmaintained.
====
```

### NOTE - Additional Information

**Use for**: Helpful context, clarifications, optional details

```asciidoc
[NOTE]
====
The label `feature.node.kubernetes.io/pci-10de.present=true` indicates NVIDIA hardware (vendor ID 10de) was detected on these nodes.
====
```

### IMPORTANT - Critical Information

**Use for**: Must-know information, non-obvious implications

```asciidoc
[IMPORTANT]
====
Changing MIG configuration requires draining GPU workloads and restarting driver pods. Plan MIG changes during maintenance windows.
====
```

**Usage Rules:**
- Maximum 3-4 callouts per major section
- Each callout should be ≤4 sentences
- Don't nest callouts inside other callouts
- Place callouts immediately after the relevant concept

---

## 6. Tables and Decision Matrices

### Decision Matrix Pattern

**Use for**: Production decision points with multiple options

**Structure:**
```asciidoc
[cols="1,2,2",options="header"]
|===
|Option |Characteristics |Recommendation

|Option A
|[Description and trade-offs]
|✅ **Recommended for [use case]**

|Option B
|[Description and trade-offs]
|⚠️ Use with caution

|Option C
|[Description and trade-offs]
|❌ **Avoid in production**
|===
```

### Comparison Tables

**Pattern:**
```asciidoc
[cols="1,3",options="header"]
|===
|Attribute |Description

|**Attribute 1**
|Detailed description

|**Attribute 2**
|Detailed description
|===
```

**Requirements:**
- Always specify column widths with `[cols=""]`
- Use `options="header"` for header row
- Bold first column if it's labels/categories
- Use ✅ ❌ ⚠️ sparingly for visual scanning

---

## 7. Depth Levels by Knowledge Type

### Layer 1: Conceptual (WHY)

**Purpose**: Establish business value and problem context

**Characteristics:**
- Starts with problem/pain point
- Quantifies impact (time saved, costs reduced, utilization improved)
- Explains evolution (manual → automated, imperative → declarative)
- Uses business language + technical terms

**Example Pattern:**
```
Organizations investing in GPU infrastructure face [PROBLEM].
[Current manual approach] requires [TIME/COST/EFFORT].

[Technology X] addresses this by [SOLUTION].
This transforms [OLD STATE] into [NEW STATE],
reducing [METRIC] from [BEFORE] to [AFTER].
```

### Layer 2: Architectural (WHAT)

**Purpose**: Explain components, relationships, and how they work together

**Characteristics:**
- Defines terms precisely
- Shows component relationships
- Explains responsibilities of each part
- Uses diagrams/architecture views

**Example Pattern:**
```
[Component X] is [DEFINITION].

It consists of [N] parts:
1. [Part 1]: [Responsibility]
2. [Part 2]: [Responsibility]

These parts work together to [OVERALL FUNCTION].

[Component X] interacts with [Component Y] by [MECHANISM].
```

### Layer 3: Tactical (HOW)

**Purpose**: Show how to use/configure/operate the technology

**Characteristics:**
- Concrete commands and configurations
- Step-by-step workflows
- Expected outputs
- Verification steps

**Example Pattern:**
```
To [ACCOMPLISH GOAL]:

1. [Action 1]
   [code/command]

2. [Action 2]
   [code/command]

3. Verify [EXPECTED STATE]:
   [verification command]
   [expected output]
```

### Integration Across Layers

**✅ GOOD - All Three Layers:**
```
WHY: "MIG improves GPU utilization from 40% to 95%, reducing infrastructure costs"
WHAT: "MIG partitions a single A100 into up to 7 independent GPU instances"
HOW: "Enable MIG by setting `mig.strategy: mixed` in ClusterPolicy"
```

**❌ BAD - Only One Layer:**
```
"You can enable MIG in the ClusterPolicy" ← Missing WHY and WHAT
```

---

## 8. Transition Patterns

### Between Sections (Within Page)

**Pattern for "What's Next" within page:**
```asciidoc
Now that you understand [CONCEPT FROM THIS SECTION],
the next section covers [CONCEPT IN NEXT SECTION]
and how it [RELATIONSHIP TO CURRENT SECTION].
```

### Between Pages

**Pattern for final "What's Next":**
```asciidoc
== What's Next

In the next [section|lab], you will [ACTION VERB] [SPECIFIC TASK].
You'll [SPECIFIC ACTIVITY 1], [SPECIFIC ACTIVITY 2], and [SPECIFIC ACTIVITY 3].

This [hands-on experience|understanding] will [LEARNING OUTCOME].
```

**Example:**
```asciidoc
== What's Next

In the next lab, you will deploy the foundational Layer 1 operators—Node Feature Discovery and NVIDIA GPU Operator—using OpenShift's Operator Lifecycle Manager. You'll create Subscriptions, configure the ClusterPolicy Custom Resource, and verify the complete GPU software stack is running.

This hands-on experience will reinforce your understanding of OLM workflow, Custom Resource activation, and operator reconciliation in action.
```

---

## 9. Common Patterns from Reference

### Problem → Solution Pattern

```
[Problem description]
Traditional approach: [Manual/old way with pain points]
With [Technology]: [Automated/new way with benefits]
```

### Component Inventory Pattern

**Use for**: Listing components with their roles

```
[System X] consists of [N] components:

* **Component 1**
  * [Responsibility 1]
  * [Responsibility 2]
  * [Key characteristic]

* **Component 2**
  * [Responsibility 1]
  * [Responsibility 2]
  * [Key characteristic]
```

### Workflow Visualization Pattern

```asciidoc
The complete workflow:

----
1. [Step 1 description]
         ↓
2. [Step 2 description]
         ↓
3. [Step 3 description]
         ↓
4. If [condition] → [action A]
   If [condition] → [action B]
         ↓
5. [Final step]
----
```

### Multi-Option Explanation Pattern

**Use for**: Explaining variations or options

```
[Technology X] provides [N] modes:

* **Mode A:** [Description]
  * [Use case]
  * [Trade-off]

* **Mode B:** [Description]
  * [Use case]
  * [Trade-off]
```

---

## 10. Quality Standards

### Depth Standards

**Minimum Requirements for Each Page:**
- [ ] At least one concrete, real-world scenario example
- [ ] At least one before/after comparison
- [ ] At least one decision matrix or comparison table
- [ ] At least one annotated code example
- [ ] Business value connected to technical capability
- [ ] Production guidance (best practices, warnings)

### Precision Standards

**❌ Avoid Vague Terms:**
- "quickly", "slowly", "soon" → Use specific timing: "within 30 seconds"
- "many", "several" → Use specific counts: "5 components"
- "high", "low" → Use specific metrics: "95% utilization"
- "important", "critical" → Explain why it matters

**✅ Use Specific Language:**
- "The controller reconciles every 5 seconds"
- "MIG supports 7 partition profiles on A100-40GB"
- "Driver installation completes in 3-4 minutes on first deployment"

### Completeness Standards

**Each major concept must include:**
1. **Definition**: What it is (1 sentence)
2. **Purpose**: Why it exists / problem it solves
3. **Components**: What it consists of (if applicable)
4. **Operation**: How it works
5. **Example**: Concrete demonstration
6. **Integration**: How it relates to other concepts

---

## 11. Anti-Patterns to Avoid

### ❌ Information Dumps

**Bad:**
```
CatalogSources contain operators. Subscriptions install operators.
CSVs are operator versions. InstallPlans execute installations.
```

**Good:**
```
OLM uses five core resources that work together:

1. CatalogSource: Repository of available operators
2. Subscription: Your intent to install an operator
   → Creates InstallPlan
3. InstallPlan: OLM's execution plan
   → Deploys ClusterServiceVersion
4. ClusterServiceVersion: Operator version metadata
   → Starts operator pod

This workflow automates...
```

### ❌ Tutorial-Style Step Lists Without Context

**Bad:**
```
1. Run oc create subscription
2. Run oc get csv
3. Run oc describe csv
```

**Good:**
```
To verify operator installation:

1. Check that OLM created the CSV:
   $ oc get csv -n namespace
   
   Expected: Phase shows "Succeeded"

2. Verify operator pod is running:
   $ oc get pods -n namespace
   
This confirms the operator is ready to reconcile...
```

### ❌ Assuming Knowledge Not Yet Taught

**Bad (in early chapter):**
```
Configure the ClusterPolicy to enable MIG partitioning
```

**Good:**
```
The ClusterPolicy Custom Resource (introduced in Section 2)
allows you to configure MIG partitioning by setting...
```

---

## 12. Review Checklist

Before submitting content, verify against this checklist:

### Structure
- [ ] Reading time estimate in frontmatter
- [ ] Clear Objective statement
- [ ] Logical progression (WHY → WHAT → HOW)
- [ ] "What's Next" transition at end

### Depth
- [ ] Business value explained (WHY)
- [ ] Architecture/components explained (WHAT)  
- [ ] Usage/configuration shown (HOW)
- [ ] All three layers present for major concepts

### Examples
- [ ] At least one concrete scenario with timing
- [ ] At least one before/after comparison
- [ ] Code examples are annotated
- [ ] Commands show expected output

### Production Guidance
- [ ] Decision matrices for choices
- [ ] TIP callouts for best practices
- [ ] WARNING callouts for anti-patterns
- [ ] Specific version/compatibility requirements

### Integration
- [ ] References prior concepts correctly
- [ ] Prepares for next concepts
- [ ] Cross-references are valid
- [ ] Terminology is consistent with course

### Technical Quality
- [ ] YAML is valid and realistic
- [ ] Commands are accurate
- [ ] Version numbers are current
- [ ] No placeholders (all examples are complete)

### Readability
- [ ] Headings follow hierarchy (no skipped levels)
- [ ] Callouts are ≤4 sentences
- [ ] Tables use proper column widths
- [ ] ASCII diagrams are ≤60 characters wide
- [ ] No passive voice in key explanations
- [ ] No vague qualifiers (specific metrics instead)
