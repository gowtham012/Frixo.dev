# Eval System Specification

> **Version:** 1.0
> **Date:** January 11, 2026
> **Status:** Design Phase

---

## Overview

The eval system is a core differentiator of the platform. Every agent built on the platform has comprehensive evaluations that ensure quality, safety, and reliability.

### The Eval Flywheel

```
┌──────────────────────────────────────────────────────────────┐
│                    THE EVAL FLYWHEEL                          │
│                                                               │
│      AUTO-GENERATE  →  EASY WRITING  →  CONTINUOUS RUN       │
│            ↑                                  │               │
│            │                                  │               │
│            └──────── LEARN FROM PROD ←────────┘               │
│                                                               │
│  The more agents run, the smarter the eval system becomes    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Platform Guarantee

Every agent output guarantees:
- **Up-to-Date**: Information is current, not stale
- **Valid**: Facts are verified against sources
- **Traceable**: Every claim links to its source
- **Safe**: No hallucinations, no harmful content
- **Compliant**: Meets enterprise/regulatory standards

**If evals fail → Output is NOT delivered**

---

## Eval Types

### 1. Functional Evals

Verify the agent performs its intended function.

```yaml
functional_eval:
  name: "api_connectivity"
  type: "functional"
  description: "Verify agent can connect to required integrations"

  check:
    method: "test_connection"
    integrations:
      - slack
      - google_calendar
      - salesforce

  pass_criteria:
    all_connections: "successful"

  run_at:
    - pre_flight
    - on_integration_change

  on_failure:
    severity: "critical"
    action: "block_execution"
```

**Common Functional Evals:**
| Eval | Checks | Criticality |
|------|--------|-------------|
| API Connectivity | Can reach required services | Critical |
| Auth Validity | Tokens not expired | Critical |
| Tool Availability | Required tools accessible | Critical |
| Input Parsing | Can process expected inputs | High |
| Output Format | Produces expected structure | Medium |

### 2. Quality Evals

Assess the quality of agent outputs.

```yaml
quality_eval:
  name: "information_accuracy"
  type: "quality"
  description: "Verify all facts are accurate against sources"

  check:
    method: "llm_as_judge"
    prompt: |
      Compare the generated content against the source data provided.
      For each factual claim, determine:
      1. Is it supported by the source?
      2. Is it accurately represented?
      3. Is there any distortion or hallucination?

      Return JSON:
      {
        "accurate": boolean,
        "claims_checked": number,
        "claims_verified": number,
        "errors": [{"claim": string, "issue": string}]
      }

  pass_criteria:
    accurate: true
    verification_rate: ">= 0.95"

  run_at:
    - post_generation

  on_failure:
    severity: "critical"
    action: "block_delivery"
```

**Common Quality Evals:**
| Eval | Checks | Method |
|------|--------|--------|
| Information Accuracy | Facts match sources | LLM-as-judge |
| Completeness | All required sections present | Programmatic |
| Coherence | Logical flow, no contradictions | LLM-as-judge |
| Relevance | Content matches request | LLM-as-judge |
| Actionability | Outputs are useful/actionable | LLM-as-judge |

### 3. Safety Evals

Ensure outputs don't cause harm.

```yaml
safety_eval:
  name: "no_hallucinations"
  type: "safety"
  description: "Verify no fabricated information in output"

  check:
    method: "cross_reference"
    strategy:
      - compare_to_sources: true
      - flag_unverifiable: true
      - check_temporal_consistency: true

  pass_criteria:
    hallucination_count: 0

  run_at:
    - post_generation

  on_failure:
    severity: "critical"
    action: "block_delivery"
    remediation: "remove_unverified_claims"
```

**Common Safety Evals:**
| Eval | Checks | Severity |
|------|--------|----------|
| No Hallucinations | Facts are verifiable | Critical |
| No PII Leak | Sensitive data not exposed | Critical |
| No Harmful Content | No toxic/dangerous content | Critical |
| Prompt Injection | Input not manipulating behavior | High |
| Data Scope | Only accessing permitted data | Critical |

### 4. Freshness Evals

Ensure data is current.

```yaml
freshness_eval:
  name: "data_freshness"
  type: "freshness"
  description: "Verify all data sources are within acceptable age"

  check:
    method: "timestamp_check"
    thresholds:
      news_articles: "24 hours"
      linkedin_profiles: "7 days"
      company_info: "30 days"
      stock_prices: "15 minutes"
      crm_data: "real_time"

  pass_criteria:
    all_sources_fresh: true

  run_at:
    - pre_generation
    - post_generation

  on_failure:
    severity: "warning"  # Or critical based on use case
    action: "warn_user"
    remediation: "refresh_stale_sources"
```

### 5. Latency Evals

Ensure performance requirements are met.

```yaml
latency_eval:
  name: "execution_time"
  type: "latency"
  description: "Verify agent completes within time budget"

  check:
    method: "timing"
    thresholds:
      total_execution: "60 seconds"
      research_phase: "30 seconds"
      generation_phase: "20 seconds"
      delivery_phase: "10 seconds"

  pass_criteria:
    within_budget: true

  run_at:
    - post_execution

  on_failure:
    severity: "warning"
    action: "log_and_alert"
```

### 6. Consistency Evals

Ensure stable, predictable outputs.

```yaml
consistency_eval:
  name: "format_consistency"
  type: "consistency"
  description: "Verify output matches expected format"

  check:
    method: "schema_validation"
    schema:
      required_sections:
        - "summary"
        - "details"
        - "sources"
      format: "markdown"
      max_length: 5000

  pass_criteria:
    schema_valid: true

  run_at:
    - post_generation

  on_failure:
    severity: "medium"
    action: "attempt_reformat"
```

### 7. Cost Evals

Monitor resource consumption.

```yaml
cost_eval:
  name: "token_budget"
  type: "cost"
  description: "Verify execution stays within cost budget"

  check:
    method: "resource_tracking"
    budgets:
      llm_tokens: 10000
      api_calls: 20
      compute_seconds: 60

  pass_criteria:
    within_budget: true

  run_at:
    - post_execution

  on_failure:
    severity: "warning"
    action: "alert_user"
```

---

## Eval Execution Flow

### Pre-Flight Evals

Run before agent execution starts:

```
TRIGGER RECEIVED
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│                    PRE-FLIGHT EVALS                       │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  □ Integration connectivity      [CHECKING...]     │ │
│  │  □ Auth token validity           [CHECKING...]     │ │
│  │  □ Required permissions          [CHECKING...]     │ │
│  │  □ Rate limits available         [CHECKING...]     │ │
│  │  □ Resource quota available      [CHECKING...]     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  RESULTS:                                                │
│  ✅ Integration connectivity     - PASS                 │
│  ✅ Auth token validity          - PASS                 │
│  ✅ Required permissions         - PASS                 │
│  ✅ Rate limits available        - PASS                 │
│  ✅ Resource quota available     - PASS                 │
│                                                          │
│  ALL PRE-FLIGHT EVALS PASSED → PROCEED TO EXECUTION     │
│                                                          │
└──────────────────────────────────────────────────────────┘
       │
       ▼
  AGENT EXECUTES
```

### Post-Generation Evals

Run after agent generates output, before delivery:

```
AGENT GENERATES OUTPUT
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│                  POST-GENERATION EVALS                    │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  □ Information accuracy          [CHECKING...]     │ │
│  │  □ No hallucinations             [CHECKING...]     │ │
│  │  □ Completeness                  [CHECKING...]     │ │
│  │  □ No PII exposure               [CHECKING...]     │ │
│  │  □ Format consistency            [CHECKING...]     │ │
│  │  □ Source attribution            [CHECKING...]     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  RESULTS:                                                │
│  ✅ Information accuracy         - PASS (98.5%)         │
│  ✅ No hallucinations            - PASS                 │
│  ✅ Completeness                 - PASS (5/5 sections)  │
│  ✅ No PII exposure              - PASS                 │
│  ⚠️  Format consistency          - WARN (minor issue)   │
│  ✅ Source attribution           - PASS (12 sources)    │
│                                                          │
│  CRITICAL EVALS PASSED → PROCEED TO DELIVERY            │
│  (Warning logged for format issue)                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
         │
         ▼
    DELIVER OUTPUT
```

### Failure Handling

```
EVAL FAILURE DETECTED
         │
         ├────────────────┬─────────────────┬──────────────┐
         ▼                ▼                 ▼              ▼
    CRITICAL          HIGH            MEDIUM          LOW
         │                │                 │              │
         ▼                ▼                 ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐
│ BLOCK       │  │ BLOCK +     │  │ WARN USER + │  │ LOG ONLY  │
│ DELIVERY    │  │ ATTEMPT     │  │ DELIVER     │  │           │
│             │  │ REMEDIATION │  │             │  │           │
│ Alert user  │  │             │  │             │  │           │
│ Log failure │  │ If fails:   │  │             │  │           │
│             │  │ block       │  │             │  │           │
└─────────────┘  └─────────────┘  └─────────────┘  └───────────┘
```

---

## Auto-Generation

### How Evals Are Auto-Generated

When an agent is created, the platform analyzes its configuration and generates relevant evals:

```
AGENT CONFIGURATION
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│                  EVAL AUTO-GENERATOR                      │
│                                                          │
│  INPUT: Agent config                                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │  name: "meeting-prep-assistant"                    │ │
│  │  trigger: "calendar_event"                         │ │
│  │  integrations: [calendar, linkedin, gmail, slack]  │ │
│  │  output_type: "prep_notes"                         │ │
│  │  delivery: "slack_dm"                              │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ANALYSIS:                                               │
│  ├── Uses calendar → needs freshness eval               │
│  ├── Uses linkedin → needs person data accuracy eval   │
│  ├── Uses gmail → needs privacy eval                   │
│  ├── Generates notes → needs completeness eval         │
│  ├── Sends to slack → needs delivery eval              │
│  └── Contains person info → needs no-hallucination     │
│                                                          │
│  GENERATED EVALS:                                        │
│  ┌────────────────────────────────────────────────────┐ │
│  │  1. functional/calendar_access                     │ │
│  │  2. functional/linkedin_access                     │ │
│  │  3. functional/gmail_access                        │ │
│  │  4. functional/slack_delivery                      │ │
│  │  5. quality/prep_note_completeness                 │ │
│  │  6. quality/information_accuracy                   │ │
│  │  7. safety/no_hallucinations                       │ │
│  │  8. safety/no_pii_leak                             │ │
│  │  9. safety/gmail_privacy_compliance                │ │
│  │  10. freshness/calendar_data_current               │ │
│  │  11. freshness/linkedin_data_recent                │ │
│  │  12. latency/delivery_before_meeting               │ │
│  │  13. consistency/format_matches_template           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Auto-Generation Rules

```yaml
# Eval Auto-Generation Rules
auto_generation_rules:

  # Integration-based rules
  - trigger: "uses_integration"
    integration: "*"
    generate:
      - type: "functional"
        name: "{integration}_connectivity"
        check: "test_connection"

  # Calendar-specific
  - trigger: "uses_integration"
    integration: "calendar"
    generate:
      - type: "freshness"
        name: "calendar_data_current"
        threshold: "real_time"

  # Person research
  - trigger: "researches_people"
    generate:
      - type: "safety"
        name: "no_person_hallucinations"
        method: "cross_reference"
        severity: "critical"
      - type: "quality"
        name: "person_info_accuracy"
        method: "llm_as_judge"

  # Email access
  - trigger: "uses_integration"
    integration: "gmail"
    generate:
      - type: "safety"
        name: "email_privacy_compliance"
        check: "only_authorized_threads"
        severity: "critical"

  # Content generation
  - trigger: "generates_content"
    generate:
      - type: "quality"
        name: "content_completeness"
        method: "section_check"
      - type: "safety"
        name: "no_hallucinations"
        method: "source_verification"
        severity: "critical"

  # Scheduled delivery
  - trigger: "has_schedule"
    generate:
      - type: "latency"
        name: "delivery_timeliness"
        check: "delivered_before_deadline"
```

---

## Learning from Production

### Feedback Loop

```
┌──────────────────────────────────────────────────────────┐
│              PRODUCTION LEARNING LOOP                     │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │                 PRODUCTION DATA                    │ │
│  │                                                    │ │
│  │  • Execution results                               │ │
│  │  • User feedback                                   │ │
│  │  • Failures and errors                             │ │
│  │  • Edge cases encountered                          │ │
│  │                                                    │ │
│  └────────────────────────┬───────────────────────────┘ │
│                           │                              │
│                           ▼                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │                 PATTERN ANALYZER                   │ │
│  │                                                    │ │
│  │  Detects:                                          │ │
│  │  • Recurring failure patterns                      │ │
│  │  • User correction patterns                        │ │
│  │  • Quality degradation trends                      │ │
│  │  • New edge cases                                  │ │
│  │                                                    │ │
│  └────────────────────────┬───────────────────────────┘ │
│                           │                              │
│                           ▼                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │                 EVAL GENERATOR                     │ │
│  │                                                    │ │
│  │  Creates new evals for:                            │ │
│  │  • Detected failure patterns                       │ │
│  │  • Edge cases not covered                          │ │
│  │  • User-reported issues                            │ │
│  │                                                    │ │
│  └────────────────────────┬───────────────────────────┘ │
│                           │                              │
│                           ▼                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │                 AGENT EVOLUTION                    │ │
│  │                                                    │ │
│  │  • New evals added to agent                        │ │
│  │  • Agent behavior adjusted                         │ │
│  │  • All via sandbox-first                           │ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Example: Learning from Failure

```yaml
# Scenario: Wrong person data in meeting prep

failure_detected:
  agent: "meeting-prep-assistant"
  timestamp: "2026-01-11T14:30:00Z"
  type: "incorrect_person_data"
  details:
    meeting_attendee: "John Smith <john@acme.com>"
    error: "Included LinkedIn data for different John Smith"
    root_cause: "Common name, didn't verify email/company match"

# Platform response:

new_eval_generated:
  name: "attendee_disambiguation"
  type: "safety"
  description: "Verify person data matches meeting attendee identity"

  check:
    method: "cross_reference"
    steps:
      - verify_email_matches_linkedin: true
      - verify_company_matches: true
      - verify_name_exact_match: true
      - flag_common_names: true

  pass_criteria:
    all_identifiers_match: true

  severity: "critical"
  action: "block_delivery"

# Applied to agent
agent_updated:
  evals_added:
    - "attendee_disambiguation"
  tested_in_sandbox: true
  promoted_to_production: true
```

---

## Eval Methods

### 1. Programmatic Checks

Direct code-based validation:

```python
# Example programmatic eval
def eval_completeness(output: dict, config: dict) -> EvalResult:
    required_sections = config["required_sections"]
    present_sections = output.get("sections", {}).keys()

    missing = set(required_sections) - set(present_sections)

    return EvalResult(
        passed=len(missing) == 0,
        score=len(present_sections) / len(required_sections),
        details={
            "required": required_sections,
            "present": list(present_sections),
            "missing": list(missing)
        }
    )
```

### 2. LLM-as-Judge

Using an LLM to evaluate quality:

```yaml
llm_judge_eval:
  name: "content_quality"
  method: "llm_as_judge"

  model: "claude-3-5-sonnet"  # Or configurable
  temperature: 0  # Deterministic

  prompt: |
    You are evaluating the quality of AI-generated content.

    CONTENT TO EVALUATE:
    {output}

    SOURCE DATA:
    {sources}

    Evaluate on these criteria:
    1. Accuracy: Are facts correct and supported by sources?
    2. Completeness: Are all relevant points covered?
    3. Clarity: Is the content clear and well-organized?
    4. Actionability: Can the user act on this information?

    Return JSON:
    {
      "accuracy_score": 1-5,
      "completeness_score": 1-5,
      "clarity_score": 1-5,
      "actionability_score": 1-5,
      "overall_pass": boolean,
      "issues": [string]
    }

  pass_criteria:
    overall_pass: true
    min_scores:
      accuracy: 4
      completeness: 3
      clarity: 3
      actionability: 3
```

### 3. Cross-Reference Verification

Validating claims against sources:

```yaml
cross_reference_eval:
  name: "fact_verification"
  method: "cross_reference"

  process:
    1_extract_claims:
      method: "llm_extraction"
      prompt: "Extract all factual claims from this content"

    2_match_to_sources:
      method: "semantic_search"
      threshold: 0.85

    3_verify_each:
      method: "llm_verification"
      prompt: "Does source X support claim Y?"

    4_aggregate:
      pass_if: "all claims verified OR unverified < 5%"

  output:
    verified_claims: [...]
    unverified_claims: [...]
    verification_rate: 0.98
```

### 4. Schema Validation

Structural validation:

```yaml
schema_eval:
  name: "output_structure"
  method: "schema_validation"

  schema:
    type: "object"
    required:
      - "summary"
      - "details"
      - "sources"
    properties:
      summary:
        type: "string"
        maxLength: 500
      details:
        type: "array"
        items:
          type: "object"
          required: ["heading", "content"]
      sources:
        type: "array"
        minItems: 1
        items:
          type: "object"
          required: ["url", "title", "fetched_at"]
```

---

## Eval Dashboard

### Agent-Level View

```
┌──────────────────────────────────────────────────────────────┐
│  AGENT: meeting-prep-assistant                                │
│  ────────────────────────────────────────────────────────────│
│                                                              │
│  EVAL HEALTH (Last 30 days)                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ████████████████████████████████░░░░░░  92.3%         │ │
│  │  156/169 executions passed all evals                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  BREAKDOWN BY TYPE                                           │
│  ├── Functional:    98.2%  ████████████████████░           │
│  ├── Quality:       94.1%  ██████████████████░░░           │
│  ├── Safety:       100.0%  █████████████████████  ✓        │
│  ├── Freshness:     91.7%  ██████████████████░░░           │
│  ├── Latency:       89.3%  █████████████████░░░░           │
│  └── Consistency:   95.2%  ███████████████████░░           │
│                                                              │
│  RECENT FAILURES                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Jan 11, 14:30  latency/delivery_before_meeting       │ │
│  │                 Delivered 2 min late (Slack API slow) │ │
│  │                                                        │ │
│  │  Jan 10, 09:15  quality/information_accuracy          │ │
│  │                 Wrong John Smith (disambiguation)      │ │
│  │                                                        │ │
│  │  Jan 08, 11:45  freshness/linkedin_data_recent        │ │
│  │                 LinkedIn API unavailable              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  AUTO-GENERATED EVALS (New)                                  │
│  ├── attendee_disambiguation (from Jan 10 failure)          │
│  └── linkedin_fallback_handling (from Jan 8 failure)        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Platform-Level Metrics

```
┌──────────────────────────────────────────────────────────────┐
│  PLATFORM EVAL METRICS                                        │
│  ────────────────────────────────────────────────────────────│
│                                                              │
│  TODAY'S STATS                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Total Executions:        1,247,832                    │ │
│  │  Evals Run:              8,734,824                    │ │
│  │  Pass Rate:                  97.3%                    │ │
│  │  Blocked Deliveries:         2,341  (bad output      │ │
│  │                                      prevented)       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  PLATFORM GUARANTEES                                         │
│  ├── Zero Hallucination Rate:   99.94%                      │
│  ├── Data Freshness Rate:       98.7%                       │
│  ├── Source Attribution:       100.0%                       │
│  └── Safety Compliance:        100.0%                       │
│                                                              │
│  "Today we prevented 2,341 outputs with quality issues      │
│   from reaching users."                                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Eval Configuration

### Global Settings

```yaml
# Platform-wide eval configuration
eval_config:
  global:
    # Minimum evals required per agent
    min_eval_coverage:
      functional: 2
      quality: 1
      safety: 2

    # Default severity levels
    default_severity:
      hallucination: "critical"
      pii_exposure: "critical"
      accuracy: "high"
      latency: "medium"
      format: "low"

    # LLM-as-judge settings
    llm_judge:
      model: "claude-3-5-sonnet"
      temperature: 0
      max_tokens: 1000
      retry_on_failure: 2

    # Performance budgets
    eval_budgets:
      max_eval_time: "30 seconds"
      max_llm_calls_per_eval: 3
      parallel_evals: true
```

### Agent-Level Overrides

```yaml
# Agent-specific eval configuration
agent_eval_config:
  agent_id: "meeting-prep-assistant"

  # Add custom evals
  custom_evals:
    - name: "meeting_relevance"
      type: "quality"
      # ... eval definition

  # Override thresholds
  threshold_overrides:
    latency/delivery_before_meeting:
      threshold: "30 minutes"  # Default was 60

  # Disable auto-generated evals (with reason)
  disabled_evals:
    - eval: "cost/token_budget"
      reason: "User opted for unlimited plan"

  # Severity overrides
  severity_overrides:
    freshness/linkedin_data_recent:
      severity: "warning"  # Downgraded from high
      reason: "LinkedIn data staleness is acceptable for this use case"
```

---

## Best Practices

### Eval Design Principles

1. **Be Specific**: Evals should test one thing clearly
2. **Be Measurable**: Pass/fail criteria must be unambiguous
3. **Be Fast**: Evals shouldn't significantly slow execution
4. **Be Comprehensive**: Cover all critical failure modes
5. **Be Maintainable**: Evals should be easy to update

### Common Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Overly strict evals | Blocks valid outputs | Calibrate thresholds from production data |
| Overlapping evals | Redundant checks, slow | Consolidate or remove duplicates |
| Vague pass criteria | Inconsistent results | Define precise thresholds |
| No remediation path | Users stuck when evals fail | Provide fallback actions |
| Missing safety evals | Critical issues reach production | Always include hallucination, PII checks |

---

*Document created: January 11, 2026*
*Last updated: January 11, 2026*
