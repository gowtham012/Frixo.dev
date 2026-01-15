# Marketplace Guidelines

## Overview

This document defines the guidelines for the AI Agent Marketplace, including submission process, review criteria, revenue sharing, and policies.

---

## Marketplace Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Agent Marketplace                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │  Categories      │  │  Featured        │  │  Search          │      │
│  │  - Productivity  │  │  - Editor Picks  │  │  - By skill      │      │
│  │  - Development   │  │  - Trending      │  │  - By rating     │      │
│  │  - Marketing     │  │  - New           │  │  - By installs   │      │
│  │  - Sales         │  │                  │  │                  │      │
│  │  - Support       │  │                  │  │                  │      │
│  │  - Research      │  │                  │  │                  │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Submission Process

### 1. Preparation

Before submitting, ensure your agent meets these requirements:

| Requirement | Description |
|-------------|-------------|
| Working Agent | Agent must execute successfully |
| Documentation | Clear description and usage instructions |
| Error Handling | Graceful error handling |
| Testing | Minimum 5 test cases with >80% pass rate |
| Security | No sensitive data leakage |

### 2. Listing Information

```yaml
# marketplace-listing.yaml
title: "Research Assistant Pro"
short_description: "AI-powered research assistant that searches, analyzes, and summarizes information"
long_description: |
  Research Assistant Pro helps you:
  - Search across multiple sources (web, academic papers, news)
  - Analyze and synthesize findings
  - Generate comprehensive research reports

  ## Features
  - Multi-source search (Google, Arxiv, News APIs)
  - Citation management
  - Export to multiple formats (PDF, Markdown, Word)

  ## Use Cases
  - Market research
  - Academic research
  - Competitive analysis
  - Due diligence

category: research
tags:
  - research
  - search
  - summarization
  - analysis

pricing:
  model: free  # or: one_time, subscription, usage_based
  price: null

media:
  icon: ./assets/icon.png
  screenshots:
    - ./assets/screenshot-1.png
    - ./assets/screenshot-2.png
  demo_video: https://youtube.com/watch?v=xxx

requirements:
  integrations:
    - google_search
    - arxiv
  min_plan: starter
```

### 3. Submission Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Draft     │────►│  Submitted  │────►│  In Review  │────►│  Approved   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Rejected   │
                                        │ (with notes)│
                                        └─────────────┘
```

---

## Review Criteria

### Automated Checks

| Check | Criteria | Pass Threshold |
|-------|----------|----------------|
| Security Scan | No vulnerabilities detected | 100% |
| Test Suite | All test cases pass | 100% |
| Performance | Average execution < 30s | Required |
| Error Rate | Execution success rate | > 95% |
| Content | No prohibited content | 100% |

### Manual Review

Reviewers evaluate:

1. **Functionality**
   - Does the agent do what it claims?
   - Are the features useful?
   - Does it handle edge cases?

2. **Quality**
   - Response quality
   - Accuracy of outputs
   - Consistency

3. **User Experience**
   - Clear instructions
   - Helpful error messages
   - Intuitive configuration

4. **Documentation**
   - Complete description
   - Usage examples
   - Known limitations

### Review Rubric

| Criterion | Weight | Score (1-5) |
|-----------|--------|-------------|
| Functionality | 30% | - |
| Quality | 25% | - |
| User Experience | 20% | - |
| Documentation | 15% | - |
| Innovation | 10% | - |

**Minimum score to approve: 3.5/5**

---

## Categories

### Primary Categories

| Category | Description | Examples |
|----------|-------------|----------|
| Productivity | Task management, scheduling | Meeting scheduler, Task organizer |
| Development | Coding, DevOps | Code reviewer, Deploy assistant |
| Marketing | Content, campaigns | Content writer, Social scheduler |
| Sales | Lead gen, outreach | Lead qualifier, Email composer |
| Support | Customer service | Ticket responder, FAQ bot |
| Research | Information gathering | Research assistant, Data analyst |
| Finance | Accounting, analysis | Expense tracker, Report generator |
| HR | Recruiting, onboarding | Resume screener, Interview scheduler |

### Subcategories

Each primary category has subcategories for finer organization.

---

## Pricing Models

### Free

- No cost to users
- Good for exposure and adoption
- Platform takes no revenue share

### One-Time Purchase

- Single payment for permanent access
- Platform takes 20% revenue share
- Automatic license management

### Subscription

- Monthly or annual billing
- Platform takes 20% revenue share
- Handled through platform billing

### Usage-Based

- Pay per execution
- Platform takes 25% revenue share
- Real-time usage tracking

### Revenue Share Table

| Pricing Model | Creator Share | Platform Share |
|---------------|---------------|----------------|
| Free | 100% | 0% |
| One-Time | 80% | 20% |
| Subscription | 80% | 20% |
| Usage-Based | 75% | 25% |

---

## Policies

### Prohibited Content

The following are NOT allowed:

- Malware or harmful code
- Agents that scrape without permission
- Agents that generate illegal content
- Deceptive or misleading functionality
- Agents that violate third-party ToS
- Agents that collect data without consent
- Adult or explicit content
- Hate speech or harassment tools
- Copyright-infringing content

### Data Handling

Agents MUST:

- Not store user data beyond execution scope
- Not transmit data to unauthorized third parties
- Encrypt any stored credentials
- Comply with GDPR and CCPA
- Provide clear privacy policy

### Security Requirements

- No hardcoded credentials
- Use platform's secret management
- Implement input validation
- Follow OWASP guidelines
- Regular security updates

---

## Quality Standards

### Response Quality

```python
# Minimum quality thresholds
QUALITY_THRESHOLDS = {
    "accuracy": 0.90,      # Output accuracy
    "relevance": 0.85,     # Response relevance
    "completeness": 0.80,  # Answer completeness
    "coherence": 0.90,     # Response coherence
}
```

### Performance Standards

| Metric | Requirement |
|--------|-------------|
| Average Latency | < 30 seconds |
| P95 Latency | < 60 seconds |
| Success Rate | > 95% |
| Timeout Rate | < 2% |

### Uptime Requirements

- Free agents: No SLA
- Paid agents: 99% uptime
- Featured agents: 99.5% uptime

---

## Versioning

### Version Numbering

```
MAJOR.MINOR.PATCH
1.2.3
```

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Update Process

1. Create new version in draft
2. Submit for review
3. Once approved, publish
4. Users can choose to update or stay on current version

### Deprecation Policy

- 30 days notice before deprecation
- 90 days support after deprecation
- Automatic migration for minor updates

---

## Reviews and Ratings

### Review Guidelines

Users can rate agents 1-5 stars and leave written reviews.

**Review Requirements:**
- Must have installed/used the agent
- Must be factual and constructive
- No spam or promotional content
- No personal attacks

### Creator Responses

Creators can respond to reviews:
- Be professional and constructive
- Address user concerns
- Provide helpful solutions

### Moderation

Reviews are moderated for:
- Spam and fake reviews
- Inappropriate content
- Terms of service violations

---

## Featured Agents

### Selection Criteria

| Criterion | Weight |
|-----------|--------|
| Rating (avg) | 25% |
| Install count | 20% |
| Active usage | 20% |
| Review sentiment | 15% |
| Innovation | 10% |
| Documentation | 10% |

### Featured Placement

- **Editor's Choice**: Manually curated weekly
- **Trending**: Based on recent growth
- **New & Notable**: High-quality new listings
- **Category Leaders**: Top in each category

---

## Analytics for Creators

### Dashboard Metrics

```json
{
  "overview": {
    "total_installs": 1523,
    "active_users": 892,
    "executions_today": 3421,
    "revenue_mtd": 4521.00
  },
  "trends": {
    "installs_7d": [45, 52, 48, 61, 55, 49, 63],
    "executions_7d": [320, 412, 389, 456, 401, 378, 445]
  },
  "ratings": {
    "average": 4.6,
    "distribution": {
      "5": 234,
      "4": 89,
      "3": 23,
      "2": 5,
      "1": 2
    }
  }
}
```

### Available Metrics

- Install/uninstall counts
- Daily/weekly/monthly active users
- Execution counts and success rates
- Revenue and payouts
- Rating trends
- Review sentiment

---

## Support

### Creator Support

- Documentation and guides
- Community forum
- Email support (24h response)
- Priority support for top creators

### User Support

- Each listing should have support contact
- Platform handles billing issues
- Dispute resolution process

---

## Legal

### Terms of Service

All marketplace participants must agree to:
- Creator Agreement
- Acceptable Use Policy
- Revenue Share Terms

### Intellectual Property

- Creators retain IP rights
- Platform gets license to distribute
- Users get usage license only

### Liability

- Creators responsible for agent behavior
- Platform not liable for agent outputs
- Users accept usage at own risk
