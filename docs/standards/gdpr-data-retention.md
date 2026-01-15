# GDPR & Data Retention Policy

## Overview

This document defines the data protection, privacy compliance, and retention policies for the AI Agent Platform, ensuring compliance with GDPR, CCPA, and other data protection regulations.

---

## Data Classification

### Categories

| Category | Description | Sensitivity | Retention |
|----------|-------------|-------------|-----------|
| PII | Personal Identifiable Information | High | User-controlled |
| Account Data | User profiles, settings | Medium | Account lifetime |
| Agent Data | Agent configs, prompts | Medium | User-controlled |
| Execution Data | Logs, traces, outputs | Medium | 30-90 days |
| Analytics Data | Aggregated usage stats | Low | 2 years |
| Audit Logs | Security/compliance events | High | 7 years |

### Data Inventory

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Data Flow Diagram                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  User Input ──► API Gateway ──► Application ──► Database (Primary)      │
│      │              │              │                  │                  │
│      │              ▼              ▼                  ▼                  │
│      │         WAF Logs      App Logs           Backups                 │
│      │                            │                  │                  │
│      │                            ▼                  ▼                  │
│      └──────────────────► Analytics ◄───────── Archive (S3)            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## GDPR Compliance

### Lawful Basis for Processing

| Data Type | Lawful Basis | Justification |
|-----------|--------------|---------------|
| Account data | Contract | Required to provide service |
| Email | Contract + Consent | Service delivery + Marketing |
| Execution logs | Legitimate Interest | Service improvement, debugging |
| Payment data | Contract + Legal | Billing and tax compliance |
| Analytics | Legitimate Interest | Product improvement |

### Data Subject Rights Implementation

#### 1. Right to Access (Article 15)

```python
# app/services/gdpr_service.py
from typing import Dict, Any
from datetime import datetime

class GDPRService:
    """Service for handling GDPR data subject requests."""

    async def export_user_data(self, user_id: str) -> Dict[str, Any]:
        """
        Export all user data for Subject Access Request (SAR).
        Returns structured data package.
        """
        user = await self.db.users.get(user_id)

        export_data = {
            "export_date": datetime.utcnow().isoformat(),
            "data_controller": "Agent Platform Inc.",
            "user_id": user_id,
            "profile": {
                "email": user.email,
                "name": user.name,
                "created_at": user.created_at.isoformat(),
                "last_login": user.last_login.isoformat() if user.last_login else None,
            },
            "organization": await self._export_organization_data(user.organization_id),
            "agents": await self._export_agents_data(user_id),
            "executions": await self._export_executions_data(user_id),
            "api_keys": await self._export_api_keys_data(user_id),
            "audit_logs": await self._export_audit_logs(user_id),
            "consent_records": await self._export_consent_records(user_id),
        }

        return export_data

    async def _export_agents_data(self, user_id: str) -> list:
        agents = await self.db.agents.filter(created_by=user_id).all()
        return [
            {
                "id": a.id,
                "name": a.name,
                "created_at": a.created_at.isoformat(),
                "execution_count": a.execution_count,
            }
            for a in agents
        ]
```

#### 2. Right to Rectification (Article 16)

```python
async def update_user_data(
    self,
    user_id: str,
    updates: Dict[str, Any]
) -> None:
    """Update user's personal data."""
    allowed_fields = {"name", "email", "phone", "address"}

    # Filter to allowed fields only
    filtered_updates = {
        k: v for k, v in updates.items()
        if k in allowed_fields
    }

    await self.db.users.update(user_id, filtered_updates)

    # Log the rectification
    await self.audit_log.record(
        event="data_rectification",
        user_id=user_id,
        fields_updated=list(filtered_updates.keys())
    )
```

#### 3. Right to Erasure (Article 17)

```python
async def delete_user_data(
    self,
    user_id: str,
    deletion_type: str = "full"  # "full" or "anonymize"
) -> Dict[str, Any]:
    """
    Delete or anonymize user data.

    Args:
        user_id: User to delete
        deletion_type: "full" deletes everything, "anonymize" keeps anonymized records
    """
    deletion_report = {
        "user_id": user_id,
        "requested_at": datetime.utcnow().isoformat(),
        "deletion_type": deletion_type,
        "items_deleted": {},
    }

    # Check for legal holds
    if await self._has_legal_hold(user_id):
        raise GDPRException(
            "Cannot delete: data under legal hold",
            code="LEGAL_HOLD"
        )

    async with self.db.transaction():
        # Delete in dependency order

        # 1. Execution data
        exec_count = await self.db.executions.filter(
            user_id=user_id
        ).delete()
        deletion_report["items_deleted"]["executions"] = exec_count

        # 2. Agent data
        agent_count = await self.db.agents.filter(
            created_by=user_id
        ).delete()
        deletion_report["items_deleted"]["agents"] = agent_count

        # 3. API keys
        await self.db.api_keys.filter(user_id=user_id).delete()

        # 4. User profile
        if deletion_type == "full":
            await self.db.users.delete(user_id)
        else:
            # Anonymize instead
            await self.db.users.update(user_id, {
                "email": f"deleted_{user_id}@anonymized.local",
                "name": "Deleted User",
                "phone": None,
                "is_deleted": True,
                "deleted_at": datetime.utcnow(),
            })

        # 5. Log deletion
        await self.audit_log.record(
            event="data_deletion",
            user_id=user_id,
            deletion_type=deletion_type,
            report=deletion_report
        )

    return deletion_report
```

#### 4. Right to Data Portability (Article 20)

```python
async def export_portable_data(
    self,
    user_id: str,
    format: str = "json"  # "json" or "csv"
) -> bytes:
    """
    Export user data in portable format.
    """
    data = await self.export_user_data(user_id)

    if format == "json":
        return json.dumps(data, indent=2).encode()
    elif format == "csv":
        return self._convert_to_csv(data)

    raise ValueError(f"Unsupported format: {format}")
```

---

## Data Retention Policies

### Retention Schedule

```yaml
# config/retention_policy.yaml
retention_policies:
  # User data
  user_profiles:
    retention: "account_lifetime"
    deletion_trigger: "account_deletion"
    backup_retention: "30_days_after_deletion"

  # Execution data
  execution_logs:
    retention: "90_days"
    archive_after: "30_days"
    deletion_trigger: "automatic"

  execution_outputs:
    retention: "30_days"
    deletion_trigger: "automatic"

  # Agent data
  agent_configs:
    retention: "account_lifetime"
    deletion_trigger: "agent_deletion_or_account_deletion"

  agent_versions:
    retention: "365_days"
    keep_latest: 10
    deletion_trigger: "automatic"

  # Security & Compliance
  audit_logs:
    retention: "7_years"
    deletion_trigger: "manual_with_approval"

  authentication_logs:
    retention: "2_years"
    deletion_trigger: "automatic"

  # Analytics
  usage_metrics:
    retention: "2_years"
    aggregation_after: "90_days"
    deletion_trigger: "automatic"

  # Billing
  invoices:
    retention: "7_years"  # Tax compliance
    deletion_trigger: "manual_with_approval"
```

### Retention Implementation

```python
# app/tasks/data_retention.py
from celery import Celery
from datetime import datetime, timedelta

app = Celery("retention")

@app.task
def enforce_retention_policies():
    """Daily task to enforce data retention policies."""

    policies = load_retention_policies()

    for policy_name, policy in policies.items():
        if policy["deletion_trigger"] == "automatic":
            apply_retention_policy(policy_name, policy)

def apply_retention_policy(name: str, policy: dict):
    """Apply a specific retention policy."""

    retention_days = parse_retention(policy["retention"])
    cutoff_date = datetime.utcnow() - timedelta(days=retention_days)

    if name == "execution_logs":
        # Archive before delete
        if policy.get("archive_after"):
            archive_cutoff = datetime.utcnow() - timedelta(
                days=parse_retention(policy["archive_after"])
            )
            archive_old_executions(archive_cutoff, cutoff_date)

        # Delete expired
        deleted = db.execution_logs.filter(
            created_at__lt=cutoff_date
        ).delete()

        logger.info(f"Deleted {deleted} execution logs older than {cutoff_date}")

    elif name == "agent_versions":
        # Keep latest N versions per agent
        keep_latest = policy.get("keep_latest", 10)

        for agent in db.agents.all():
            versions = db.agent_versions.filter(
                agent_id=agent.id
            ).order_by("-created_at")

            # Delete versions beyond keep_latest and older than retention
            old_versions = versions[keep_latest:].filter(
                created_at__lt=cutoff_date
            )
            old_versions.delete()

# Schedule daily at 2 AM UTC
app.conf.beat_schedule = {
    "enforce-retention": {
        "task": "app.tasks.data_retention.enforce_retention_policies",
        "schedule": crontab(hour=2, minute=0),
    },
}
```

---

## Consent Management

### Consent Types

| Consent Type | Required | Default | Withdrawable |
|--------------|----------|---------|--------------|
| Terms of Service | Yes | - | Account deletion |
| Privacy Policy | Yes | - | Account deletion |
| Marketing emails | No | Off | Yes |
| Analytics cookies | No | Off | Yes |
| Third-party sharing | No | Off | Yes |
| Product updates | No | On | Yes |

### Consent Storage

```python
# app/models/consent.py
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from app.db.base import Base

class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    consent_type = Column(String, nullable=False)
    granted = Column(Boolean, nullable=False)
    granted_at = Column(DateTime, nullable=True)
    withdrawn_at = Column(DateTime, nullable=True)
    ip_address = Column(String)  # For audit
    user_agent = Column(String)  # For audit
    version = Column(String)  # Policy version consented to


class ConsentService:
    async def record_consent(
        self,
        user_id: str,
        consent_type: str,
        granted: bool,
        request: Request
    ) -> ConsentRecord:
        """Record a consent decision."""

        record = ConsentRecord(
            id=generate_id("cons"),
            user_id=user_id,
            consent_type=consent_type,
            granted=granted,
            granted_at=datetime.utcnow() if granted else None,
            withdrawn_at=datetime.utcnow() if not granted else None,
            ip_address=request.client.host,
            user_agent=request.headers.get("User-Agent"),
            version=self._get_policy_version(consent_type),
        )

        await self.db.consent_records.create(record)

        # Trigger downstream actions
        if not granted:
            await self._handle_consent_withdrawal(user_id, consent_type)

        return record

    async def get_user_consents(self, user_id: str) -> Dict[str, bool]:
        """Get current consent status for all types."""
        records = await self.db.consent_records.filter(
            user_id=user_id
        ).order_by("-created_at").all()

        # Get latest consent per type
        consents = {}
        seen = set()
        for record in records:
            if record.consent_type not in seen:
                consents[record.consent_type] = record.granted
                seen.add(record.consent_type)

        return consents
```

---

## Data Processing Agreements

### Sub-Processor List

| Sub-Processor | Purpose | Data Processed | Location |
|---------------|---------|----------------|----------|
| AWS | Infrastructure | All data | US/EU |
| Anthropic | LLM Provider | Agent inputs/outputs | US |
| OpenAI | LLM Provider | Agent inputs/outputs | US |
| Stripe | Payments | Payment info | US/EU |
| SendGrid | Email | Email addresses | US |
| Datadog | Monitoring | Anonymized logs | US/EU |

### DPA Requirements

```markdown
## Data Processing Agreement Template

### 1. Subject Matter
This DPA governs the processing of personal data by [Sub-Processor]
on behalf of Agent Platform.

### 2. Duration
Coterminous with the main service agreement.

### 3. Nature and Purpose
[Specific processing activities]

### 4. Type of Personal Data
- User identifiers
- Contact information
- Usage data
- [Specific to processor]

### 5. Categories of Data Subjects
- Platform users
- End users of agents
- Organization administrators

### 6. Obligations of Processor
- Process only on documented instructions
- Ensure confidentiality
- Implement security measures
- Assist with data subject requests
- Delete/return data on termination

### 7. Security Measures
[Reference to Annex with technical measures]

### 8. Sub-Processing
Prior written authorization required.

### 9. Data Transfers
Standard Contractual Clauses apply for non-EU transfers.
```

---

## Privacy by Design

### Data Minimization

```python
# Only collect what's necessary
class AgentExecutionRequest(BaseModel):
    agent_id: str
    input: str
    # Don't collect: IP, device info, location unless needed

    class Config:
        # Strip unknown fields
        extra = "forbid"


# Anonymize where possible
def log_execution(execution: Execution):
    """Log execution with minimal PII."""
    logger.info(
        "Execution completed",
        extra={
            "execution_id": execution.id,
            "agent_id": execution.agent_id,
            # Hash user_id for analytics
            "user_hash": hash_pii(execution.user_id),
            "duration_ms": execution.duration_ms,
            "success": execution.success,
            # Don't log: input content, output content, IP
        }
    )
```

### Pseudonymization

```python
import hashlib
from cryptography.fernet import Fernet

class DataProtection:
    def __init__(self, encryption_key: bytes):
        self.fernet = Fernet(encryption_key)

    def pseudonymize(self, pii: str) -> str:
        """Create reversible pseudonym."""
        return self.fernet.encrypt(pii.encode()).decode()

    def de_pseudonymize(self, pseudonym: str) -> str:
        """Reverse pseudonymization (authorized use only)."""
        return self.fernet.decrypt(pseudonym.encode()).decode()

    def anonymize(self, pii: str, salt: str = "") -> str:
        """Create irreversible anonymous identifier."""
        return hashlib.sha256(
            f"{pii}{salt}".encode()
        ).hexdigest()[:16]
```

---

## Breach Notification

### Process

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Breach Response Process                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. Detection ──► 2. Assessment ──► 3. Containment                      │
│        │               │                   │                             │
│        ▼               ▼                   ▼                             │
│    Log incident   Determine scope    Stop the breach                    │
│                                                                          │
│  4. Notification (within 72 hours if high risk)                         │
│        │                                                                 │
│        ├──► Supervisory Authority (if required)                         │
│        └──► Affected Data Subjects (if high risk)                       │
│                                                                          │
│  5. Remediation ──► 6. Post-Incident Review                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Breach Assessment

```python
@dataclass
class BreachAssessment:
    breach_id: str
    detected_at: datetime
    description: str
    data_types_affected: List[str]
    number_of_subjects: int
    risk_level: str  # "low", "medium", "high"
    notification_required: bool

    def assess_risk(self) -> str:
        """Determine risk level based on GDPR criteria."""
        high_risk_data = {
            "financial", "health", "biometric",
            "credentials", "government_id"
        }

        if any(dt in high_risk_data for dt in self.data_types_affected):
            return "high"

        if self.number_of_subjects > 1000:
            return "high"

        if self.number_of_subjects > 100:
            return "medium"

        return "low"

    def requires_notification(self) -> bool:
        """Determine if supervisory authority notification required."""
        # Required unless unlikely to result in risk to rights/freedoms
        return self.risk_level in ("medium", "high")

    def requires_subject_notification(self) -> bool:
        """Determine if data subjects must be notified."""
        # Required for high risk to rights/freedoms
        return self.risk_level == "high"
```

---

## CCPA Compliance

### Additional Rights (California)

| Right | Implementation |
|-------|----------------|
| Right to Know | Same as GDPR access |
| Right to Delete | Same as GDPR erasure |
| Right to Opt-Out | Do Not Sell toggle |
| Non-Discrimination | No service degradation |

### Do Not Sell Implementation

```python
class CCPAService:
    async def set_do_not_sell(
        self,
        user_id: str,
        opt_out: bool
    ) -> None:
        """Set Do Not Sell preference."""
        await self.db.users.update(user_id, {
            "ccpa_do_not_sell": opt_out,
            "ccpa_opt_out_date": datetime.utcnow() if opt_out else None,
        })

        if opt_out:
            # Notify third parties to stop sharing
            await self._notify_third_parties(user_id, "opt_out")

    async def get_disclosure_categories(self) -> Dict[str, List[str]]:
        """
        Return categories of personal information collected
        and disclosed (CCPA requirement).
        """
        return {
            "collected": [
                "Identifiers (name, email, user ID)",
                "Commercial information (purchase history)",
                "Internet activity (usage logs)",
                "Professional information (company, role)",
            ],
            "disclosed_for_business_purpose": [
                "Identifiers (to payment processors)",
                "Commercial information (to analytics providers)",
            ],
            "sold": []  # We don't sell personal information
        }
```

---

## International Data Transfers

### Transfer Mechanisms

| From | To | Mechanism |
|------|-----|-----------|
| EU | US | Standard Contractual Clauses (SCCs) |
| EU | UK | UK Addendum to SCCs |
| EU | Other | Case-by-case assessment |

### Transfer Impact Assessment

```markdown
## Transfer Impact Assessment Template

### 1. Identify Transfer
- Data categories: [List]
- Recipient country: [Country]
- Recipient organization: [Name]

### 2. Verify Transfer Tool
- [ ] SCCs signed
- [ ] UK Addendum (if applicable)
- [ ] BCRs (if applicable)

### 3. Assess Third Country Laws
- Government access laws: [Assessment]
- Data protection level: [Assessment]
- Effective legal remedies: [Assessment]

### 4. Supplementary Measures
- [ ] Encryption in transit and at rest
- [ ] Pseudonymization before transfer
- [ ] Contractual restrictions on access
- [ ] Regular compliance audits

### 5. Decision
- [ ] Transfer approved
- [ ] Transfer approved with conditions
- [ ] Transfer not approved
```

---

## Audit & Compliance

### Regular Audits

```yaml
# Compliance audit schedule
audits:
  data_inventory:
    frequency: quarterly
    owner: DPO

  retention_compliance:
    frequency: monthly
    owner: Engineering
    automated: true

  consent_records:
    frequency: quarterly
    owner: Legal

  sub_processor_review:
    frequency: annually
    owner: Legal + Security

  privacy_impact_assessment:
    frequency: per_new_feature
    owner: Product + DPO
```

### Privacy Impact Assessment

```markdown
## Privacy Impact Assessment (PIA) Template

### Project/Feature: [Name]

### 1. Data Collection
- What personal data is collected?
- Is collection necessary for the purpose?
- Can less data achieve the same goal?

### 2. Data Use
- How will the data be processed?
- Who will have access?
- How long will it be retained?

### 3. Data Sharing
- Will data be shared externally?
- What protections are in place?

### 4. Individual Rights
- How can users access their data?
- How can users delete their data?
- How are users informed?

### 5. Security
- What security measures protect the data?
- How are breaches detected and handled?

### 6. Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | Low/Med/High | Low/Med/High | [Measures] |

### 7. Approval
- DPO Review: [ ] Approved / [ ] Rejected
- Date: [Date]
```

---

## Implementation Checklist

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     GDPR Compliance Checklist                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Legal Basis                                                             │
│  [ ] Documented lawful basis for each processing activity               │
│  [ ] Privacy policy updated and accessible                              │
│  [ ] Cookie consent implemented                                         │
│                                                                          │
│  Data Subject Rights                                                     │
│  [ ] Access request process implemented                                 │
│  [ ] Data export functionality                                          │
│  [ ] Deletion/anonymization capability                                  │
│  [ ] Consent management system                                          │
│                                                                          │
│  Technical Measures                                                      │
│  [ ] Encryption at rest and in transit                                  │
│  [ ] Access controls and audit logging                                  │
│  [ ] Data retention automation                                          │
│  [ ] Breach detection and response                                      │
│                                                                          │
│  Organizational Measures                                                 │
│  [ ] DPO appointed (if required)                                        │
│  [ ] Staff training completed                                           │
│  [ ] Sub-processor DPAs signed                                          │
│  [ ] Records of processing maintained                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```
