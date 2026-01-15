# Agent Examples

> **Version:** 1.0
> **Date:** January 11, 2026
> **Status:** Design Phase

---

## Overview

This document provides detailed examples of agents that can be built on the platform, showcasing the full capabilities including evals, integrations, and self-evolution.

---

## Example 1: LinkedIn Content Poster

### Use Case

Automatically generate and post LinkedIn content about specific topics on a daily schedule.

### Agent Configuration

```yaml
agent:
  id: "linkedin-content-poster"
  name: "Daily LinkedIn AI Insights"
  description: "Posts daily content about AI trends on LinkedIn"
  version: "1.0.0"

  # Trigger: Daily at 10 AM user's timezone
  trigger:
    type: "cron"
    schedule: "0 10 * * *"
    timezone: "user_timezone"

  # Required integrations
  integrations:
    linkedin:
      permissions:
        - "write:posts"
        - "read:profile"
    web_search:
      permissions:
        - "search:news"

  # Behavior configuration
  config:
    topics:
      - "AI trends"
      - "Machine learning"
      - "LLMs"
    tone: "thought-leader"
    post_length: "medium"  # 150-300 words
    include_hashtags: true
    hashtag_count: 3-5
```

### Execution Flow

```
┌──────────────────────────────────────────────────────────────┐
│  DAILY EXECUTION: 10:00 AM                                    │
│                                                              │
│  PHASE 1: RESEARCH                                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  platform.tools.web_search({                           │ │
│  │    query: "AI trends news today",                      │ │
│  │    recency: "24 hours",                                │ │
│  │    count: 10                                           │ │
│  │  })                                                    │ │
│  │  → Returns: Latest AI news articles                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│                              ▼                               │
│  PHASE 2: CONTENT GENERATION                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  platform.llm.generate({                               │ │
│  │    prompt: "Write LinkedIn post about...",             │ │
│  │    context: research_results,                          │ │
│  │    tone: "thought-leader",                             │ │
│  │    length: "150-300 words"                             │ │
│  │  })                                                    │ │
│  │  → Returns: Generated post content + hashtags          │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│                              ▼                               │
│  PHASE 3: EVAL GATE (Before Posting)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ✅ content_quality_check      - PASS (4.2/5)         │ │
│  │  ✅ no_hallucinations          - PASS                 │ │
│  │  ✅ brand_safety               - PASS                 │ │
│  │  ✅ originality_check          - PASS (92% unique)    │ │
│  │  ✅ hashtag_relevance          - PASS                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│                              ▼                               │
│  PHASE 4: POST TO LINKEDIN                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  platform.integrations.linkedin.create_post({         │ │
│  │    content: generated_content,                         │ │
│  │    visibility: "public"                                │ │
│  │  })                                                    │ │
│  │  → Returns: { success: true, post_url: "..." }        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Auto-Generated Evals

```yaml
evals:
  # Functional
  - name: "linkedin_auth_valid"
    type: "functional"
    check: "OAuth token not expired"
    run_at: "pre_flight"
    severity: "critical"

  - name: "web_search_available"
    type: "functional"
    check: "Can execute web searches"
    run_at: "pre_flight"
    severity: "critical"

  # Quality
  - name: "content_quality_score"
    type: "quality"
    method: "llm_as_judge"
    check: "Content is engaging, informative, professional"
    threshold: "score >= 3.5/5"
    run_at: "post_generation"
    severity: "high"

  - name: "originality_check"
    type: "quality"
    method: "similarity_search"
    check: "Content is sufficiently unique"
    threshold: "uniqueness >= 85%"
    run_at: "post_generation"
    severity: "medium"

  # Safety
  - name: "no_hallucinations"
    type: "safety"
    method: "cross_reference"
    check: "All claims supported by research sources"
    run_at: "post_generation"
    severity: "critical"

  - name: "brand_safety"
    type: "safety"
    method: "content_filter"
    check: "No controversial, offensive, or risky content"
    run_at: "post_generation"
    severity: "critical"

  - name: "no_competitor_promotion"
    type: "safety"
    check: "Doesn't promote competitor products"
    run_at: "post_generation"
    severity: "high"

  # Freshness
  - name: "research_freshness"
    type: "freshness"
    check: "Research sources from last 24 hours"
    threshold: "all_sources_within_24h"
    run_at: "post_generation"
    severity: "high"
```

### Sandbox Mode Option

```yaml
# For users who want approval before posting
sandbox_config:
  mode: "approval_required"

  flow:
    1_generate: "Create draft"
    2_notify: "Send draft to user via email/Slack"
    3_wait: "Wait for approval (timeout: 2 hours)"
    4_action:
      approved: "Post to LinkedIn"
      rejected: "Archive draft"
      timeout: "Archive + notify user"

  approval_channels:
    - type: "slack_dm"
      actions: ["approve", "reject", "edit"]
    - type: "email"
      actions: ["approve", "reject"]
    - type: "platform_dashboard"
      actions: ["approve", "reject", "edit"]
```

---

## Example 2: Meeting Prep Assistant

### Use Case

Automatically prepare briefing documents before meetings with external attendees.

### Agent Configuration

```yaml
agent:
  id: "meeting-prep-assistant"
  name: "Meeting Prep Assistant"
  description: "Prepares comprehensive briefings before meetings"
  version: "1.0.0"

  # Trigger: Event-driven from calendar
  trigger:
    type: "event"
    source: "google_calendar"
    event: "meeting_starting"
    offset: "-1 hour"  # 1 hour before meeting
    filter:
      # Only external meetings with >1 attendee
      has_external_attendees: true
      min_attendees: 2

  # Required integrations
  integrations:
    google_calendar:
      permissions:
        - "read:events"
        - "read:attendees"
    gmail:
      permissions:
        - "read:threads"
      scope_filter: "participants:{{attendee_emails}}"
    linkedin:
      permissions:
        - "read:public_profiles"
    salesforce:
      permissions:
        - "read:contacts"
        - "read:opportunities"
    web_search:
      permissions:
        - "search:news"
        - "search:company"
    slack:
      permissions:
        - "write:dm"

  # Output configuration
  output:
    format: "markdown"
    delivery: "slack_dm"
    sections:
      - attendee_profiles
      - company_overview
      - recent_news
      - past_interactions
      - deal_history
      - talking_points
      - warnings
```

### Execution Flow

```
┌──────────────────────────────────────────────────────────────┐
│  TRIGGER: Meeting in 1 hour                                   │
│  Meeting: "Partnership Discussion" with satya@microsoft.com  │
│                                                              │
│  PHASE 1: PARALLEL RESEARCH                                   │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                                                          ││
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        ││
│  │  │ CALENDAR   │  │ LINKEDIN   │  │ WEB SEARCH │        ││
│  │  │            │  │            │  │            │        ││
│  │  │ Meeting    │  │ Satya's    │  │ Recent     │        ││
│  │  │ details    │  │ profile    │  │ news       │        ││
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘        ││
│  │        │               │               │                ││
│  │  ┌─────┴──────┐  ┌─────┴──────┐  ┌─────┴──────┐        ││
│  │  │ GMAIL      │  │ SALESFORCE │  │ COMPANY    │        ││
│  │  │            │  │            │  │ RESEARCH   │        ││
│  │  │ Past       │  │ Deal       │  │            │        ││
│  │  │ threads    │  │ history    │  │ Microsoft  │        ││
│  │  │ with Satya │  │            │  │ info       │        ││
│  │  └────────────┘  └────────────┘  └────────────┘        ││
│  │                                                          ││
│  └──────────────────────────────────────────────────────────┘│
│                              │                               │
│                              ▼                               │
│  PHASE 2: SYNTHESIS                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Compile all research into structured briefing:        │ │
│  │                                                        │ │
│  │  # Meeting Prep: Partnership Discussion                │ │
│  │  **With:** Satya Nadella, CEO @ Microsoft             │ │
│  │  **When:** Today 2:00 PM (1 hour)                     │ │
│  │                                                        │ │
│  │  ## About Satya Nadella                                │ │
│  │  - CEO since 2014, led cloud transformation           │ │
│  │  - Key focus: AI, cloud, enterprise                   │ │
│  │  [Source: LinkedIn, fetched today]                    │ │
│  │                                                        │ │
│  │  ## Recent News                                        │ │
│  │  - Microsoft AI partnership announced yesterday       │ │
│  │  [Source: TechCrunch, Jan 10 2026]                   │ │
│  │                                                        │ │
│  │  ## Your History                                       │ │
│  │  - 3 email exchanges about cloud partnership          │ │
│  │  - Met at Tech Summit 2024                            │ │
│  │  [Source: Gmail, Calendar]                            │ │
│  │                                                        │ │
│  │  ## Deal Status                                        │ │
│  │  - Open opportunity: $2M Azure deal (Stage 3)         │ │
│  │  [Source: Salesforce]                                 │ │
│  │                                                        │ │
│  │  ## Suggested Talking Points                           │ │
│  │  - Reference previous cloud discussion                │ │
│  │  - Ask about new AI partnership impact                │ │
│  │                                                        │ │
│  │  ## Watch Out For                                      │ │
│  │  - Competitor X just signed with Microsoft            │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│                              ▼                               │
│  PHASE 3: EVAL GATE                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ✅ information_accuracy       - PASS                  │ │
│  │  ✅ no_hallucinations          - PASS                  │ │
│  │  ✅ completeness               - PASS (7/7 sections)   │ │
│  │  ✅ attendee_disambiguation    - PASS                  │ │
│  │  ✅ source_attribution         - PASS (12 sources)     │ │
│  │  ✅ freshness                  - PASS (all current)    │ │
│  │  ✅ no_pii_exposure            - PASS                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│                              ▼                               │
│  PHASE 4: DELIVER                                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  platform.integrations.slack.send_dm({                │ │
│  │    user: "user@company.com",                           │ │
│  │    message: formatted_briefing,                        │ │
│  │    attachments: [{ title: "Full Brief", file: pdf }]  │ │
│  │  })                                                    │ │
│  │  → Delivered 59 minutes before meeting                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Auto-Generated Evals

```yaml
evals:
  # Functional
  - name: "calendar_access"
    type: "functional"
    severity: "critical"

  - name: "gmail_access"
    type: "functional"
    severity: "critical"

  - name: "linkedin_access"
    type: "functional"
    severity: "high"  # Can degrade gracefully

  - name: "salesforce_access"
    type: "functional"
    severity: "high"  # Can degrade gracefully

  # Quality
  - name: "information_accuracy"
    type: "quality"
    method: "llm_as_judge"
    check: "All facts accurate and supported"
    severity: "critical"

  - name: "completeness"
    type: "quality"
    check: "All required sections present"
    severity: "high"

  - name: "actionability"
    type: "quality"
    method: "llm_as_judge"
    check: "Talking points are specific and useful"
    severity: "medium"

  # Safety
  - name: "no_hallucinations"
    type: "safety"
    method: "cross_reference"
    severity: "critical"

  - name: "attendee_disambiguation"
    type: "safety"
    method: "identity_verification"
    check: "Person data matches meeting attendee"
    severity: "critical"

  - name: "no_pii_exposure"
    type: "safety"
    check: "No sensitive PII in output"
    severity: "critical"

  - name: "gmail_scope_compliance"
    type: "safety"
    check: "Only accessed threads with meeting attendees"
    severity: "critical"

  # Freshness
  - name: "linkedin_freshness"
    type: "freshness"
    threshold: "7 days"
    on_stale: "warn_user"
    severity: "medium"

  - name: "news_freshness"
    type: "freshness"
    threshold: "7 days"
    severity: "medium"

  # Latency
  - name: "delivery_timeliness"
    type: "latency"
    check: "Delivered at least 30 min before meeting"
    severity: "high"

  # Source Attribution
  - name: "all_sources_cited"
    type: "quality"
    check: "Every fact has source attribution"
    severity: "high"
```

---

## Example 3: Competitor Price Monitor

### Use Case

Monitor competitor pricing and alert when significant changes occur.

### Agent Configuration

```yaml
agent:
  id: "competitor-price-monitor"
  name: "Competitor Price Monitor"
  description: "Monitors competitor prices and alerts on changes"
  version: "1.0.0"

  trigger:
    type: "cron"
    schedule: "0 */6 * * *"  # Every 6 hours

  integrations:
    web_scraper:
      permissions:
        - "scrape:allowed_domains"
    slack:
      permissions:
        - "write:channels:#price-alerts"
    google_sheets:
      permissions:
        - "write:spreadsheet"

  config:
    competitors:
      - name: "Competitor A"
        url: "https://competitor-a.com/pricing"
        selectors:
          basic_price: ".pricing-basic .price"
          pro_price: ".pricing-pro .price"
          enterprise_price: ".pricing-enterprise .price"

      - name: "Competitor B"
        url: "https://competitor-b.com/plans"
        selectors:
          starter: "#starter-plan .amount"
          business: "#business-plan .amount"

    alert_thresholds:
      price_decrease: 5%   # Alert if price drops 5%+
      price_increase: 10%  # Alert if price increases 10%+
      any_change: false    # Don't alert on minor changes

    storage:
      type: "google_sheets"
      spreadsheet_id: "xxx"
      sheet_name: "Price History"
```

### Execution Flow

```
┌──────────────────────────────────────────────────────────────┐
│  SCHEDULED EXECUTION: Every 6 hours                           │
│                                                              │
│  PHASE 1: SCRAPE PRICES                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  FOR EACH competitor:                                  │ │
│  │    platform.tools.web_scraper.extract({               │ │
│  │      url: competitor.url,                              │ │
│  │      selectors: competitor.selectors                   │ │
│  │    })                                                  │ │
│  │                                                        │ │
│  │  Results:                                              │ │
│  │  ├── Competitor A: Basic $29, Pro $79, Ent $199      │ │
│  │  └── Competitor B: Starter $19, Business $99         │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│                              ▼                               │
│  PHASE 2: COMPARE TO HISTORY                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Load previous prices from Google Sheets               │ │
│  │                                                        │ │
│  │  Changes detected:                                     │ │
│  │  ├── Competitor A Pro: $99 → $79 (-20%) ⚠️ ALERT     │ │
│  │  └── Competitor B: No change                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│                              ▼                               │
│  PHASE 3: STORE NEW DATA                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  platform.integrations.google_sheets.append({         │ │
│  │    spreadsheet_id: "xxx",                              │ │
│  │    data: {                                             │ │
│  │      timestamp: "2026-01-11T14:00:00Z",               │ │
│  │      competitor_a_basic: 29,                           │ │
│  │      competitor_a_pro: 79,  // Changed!               │ │
│  │      ...                                               │ │
│  │    }                                                   │ │
│  │  })                                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│                              ▼                               │
│  PHASE 4: ALERT (if threshold met)                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  platform.integrations.slack.send({                   │ │
│  │    channel: "#price-alerts",                           │ │
│  │    message: """                                        │ │
│  │      🚨 *Price Alert: Competitor A*                   │ │
│  │                                                        │ │
│  │      *Pro Plan* dropped 20%                           │ │
│  │      - Previous: $99/month                            │ │
│  │      - Current: $79/month                             │ │
│  │                                                        │ │
│  │      _Detected: Jan 11, 2026 2:00 PM_                 │ │
│  │      <https://competitor-a.com/pricing|View Page>     │ │
│  │    """                                                 │ │
│  │  })                                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Example 4: Sales Pipeline Analyzer (A2A Orchestration)

### Use Case

A complex workflow that uses multiple specialized agents to analyze sales pipeline and generate recommendations.

### Workflow Definition

```yaml
workflow:
  id: "sales-pipeline-analysis"
  name: "Weekly Sales Pipeline Analysis"
  description: "Analyzes pipeline and generates strategic recommendations"

  trigger:
    type: "cron"
    schedule: "0 9 * * 1"  # Every Monday 9 AM

  # Multi-agent orchestration
  steps:
    - id: "extract_data"
      agent: "crm-data-extractor"
      capabilities_required: ["salesforce:read"]
      output: "pipeline_data"

    - id: "analyze_deals"
      agent: "deal-analyzer"
      capabilities_required: ["analysis:sales"]
      input: "{{steps.extract_data.output}}"
      output: "deal_analysis"

    - id: "identify_risks"
      agent: "risk-identifier"
      capabilities_required: ["analysis:risk"]
      input: "{{steps.extract_data.output}}"
      output: "risk_assessment"
      parallel_with: "analyze_deals"  # Run in parallel

    - id: "generate_recommendations"
      agent: "strategy-recommender"
      capabilities_required: ["generation:strategy"]
      input:
        deals: "{{steps.analyze_deals.output}}"
        risks: "{{steps.identify_risks.output}}"
      output: "recommendations"

    - id: "create_report"
      agent: "report-generator"
      capabilities_required: ["generation:report"]
      input: "{{steps.generate_recommendations.output}}"
      output: "final_report"

    - id: "deliver"
      agent: "notification-agent"
      capabilities_required: ["slack:write", "email:send"]
      input: "{{steps.create_report.output}}"
      delivery:
        - slack: "#sales-leadership"
        - email: "sales-team@company.com"
```

### A2A Flow Visualization

```
┌──────────────────────────────────────────────────────────────┐
│  WORKFLOW: Sales Pipeline Analysis                            │
│                                                              │
│  ┌─────────────────┐                                         │
│  │ CRM Data        │                                         │
│  │ Extractor       │                                         │
│  │                 │                                         │
│  │ Pulls pipeline  │                                         │
│  │ from Salesforce │                                         │
│  └────────┬────────┘                                         │
│           │                                                   │
│           ▼                                                   │
│  ┌────────────────────────────────────────┐                  │
│  │         CAPABILITY DISCOVERY           │                  │
│  │  "Need: analysis:sales, analysis:risk" │                  │
│  │                                         │                  │
│  │  Found:                                 │                  │
│  │  - deal-analyzer (score: 94%)          │                  │
│  │  - risk-identifier (score: 91%)        │                  │
│  └────────────────────────────────────────┘                  │
│           │                                                   │
│           ├────────────────┬──────────────┐                  │
│           ▼                ▼              │ (parallel)       │
│  ┌─────────────────┐  ┌─────────────────┐ │                  │
│  │ Deal Analyzer   │  │ Risk Identifier │ │                  │
│  │                 │  │                 │ │                  │
│  │ Analyzes each   │  │ Identifies at-  │ │                  │
│  │ deal's health   │  │ risk deals      │ │                  │
│  └────────┬────────┘  └────────┬────────┘ │                  │
│           │                    │          │                  │
│           └────────┬───────────┘          │                  │
│                    ▼                                         │
│  ┌─────────────────────────────────────────┐                 │
│  │         CAPABILITY DISCOVERY            │                 │
│  │  "Need: generation:strategy"            │                 │
│  │  Found: strategy-recommender (96%)      │                 │
│  └─────────────────────────────────────────┘                 │
│                    │                                         │
│                    ▼                                         │
│  ┌─────────────────┐                                         │
│  │ Strategy        │                                         │
│  │ Recommender     │                                         │
│  │                 │                                         │
│  │ Generates       │                                         │
│  │ action items    │                                         │
│  └────────┬────────┘                                         │
│           │                                                   │
│           ▼                                                   │
│  ┌─────────────────┐                                         │
│  │ Report          │                                         │
│  │ Generator       │                                         │
│  │                 │                                         │
│  │ Creates exec    │                                         │
│  │ summary report  │                                         │
│  └────────┬────────┘                                         │
│           │                                                   │
│           ▼                                                   │
│  ┌─────────────────┐                                         │
│  │ Notification    │                                         │
│  │ Agent           │                                         │
│  │                 │                                         │
│  │ Delivers via    │                                         │
│  │ Slack + Email   │                                         │
│  └─────────────────┘                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Agent Capability Contracts

```yaml
# Deal Analyzer Agent
agent:
  id: "deal-analyzer"
  capabilities:
    # Structured (required)
    inputs: ["pipeline_data", "deal_list"]
    outputs: ["deal_analysis"]
    analysis_types: ["health_score", "velocity", "conversion"]

    # Semantic (optional)
    description: |
      Expert at analyzing sales deals. Evaluates deal health,
      identifies stalled opportunities, and scores likelihood
      of close based on historical patterns.

  # Trust metrics (from platform)
  metrics:
    eval_score: 94.2
    production_calls: 45000
    failure_rate: 0.8%
```

---

## Self-Evolution Examples

### Example: Learning from User Feedback

```yaml
# Scenario: User feedback on Meeting Prep Agent

feedback_received:
  agent: "meeting-prep-assistant"
  timestamp: "2026-01-11T15:00:00Z"
  type: "user_feedback"
  content: "The company overview was too basic. I needed more detail about their recent acquisitions."

# Platform analysis
analysis:
  feedback_type: "quality_improvement"
  affected_section: "company_overview"
  requested_improvement: "more_depth"
  specific_request: "recent_acquisitions"

# Evolution action
evolution:
  type: "behavior_modification"
  change:
    section: "company_overview"
    modification: |
      Add sub-section for "Recent Acquisitions & Strategic Moves"
      when researching company information.

  # New eval generated
  new_eval:
    name: "company_overview_depth"
    type: "quality"
    check: |
      Company overview includes:
      - Basic info (industry, size, HQ)
      - Recent news (last 30 days)
      - Recent acquisitions (last 12 months)
      - Strategic initiatives
    threshold: "3/4 sections present"

  # Sandbox testing
  sandbox_test:
    status: "passed"
    improvement: "+15% on company_overview_depth eval"

  # Deployment
  deployed: true
  rollback_available: true
```

### Example: Learning from Failure

```yaml
# Scenario: Wrong person data

failure_detected:
  agent: "meeting-prep-assistant"
  timestamp: "2026-01-10T09:15:00Z"
  type: "incorrect_data"
  details:
    meeting: "Call with John Smith"
    error: "Included LinkedIn data for John Smith from different company"
    root_cause: "Common name, no disambiguation"

# Platform response
new_eval_generated:
  name: "attendee_disambiguation"
  type: "safety"
  severity: "critical"
  check: |
    When researching person:
    1. Verify email domain matches company
    2. Verify company name matches
    3. For common names, require 2+ matching identifiers
  on_failure: "block_delivery"

# Agent evolution
agent_updated:
  behavior_change: |
    Before including person data:
    - Cross-reference email domain with company
    - Require name + company + email match
    - Flag common names for extra verification

  evals_added:
    - "attendee_disambiguation"

  tested_in_sandbox: true
  promoted_to_production: true
```

---

*Document created: January 11, 2026*
*Last updated: January 11, 2026*
