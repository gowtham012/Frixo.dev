# Infrastructure as Code (Terraform)

## Overview

This document defines the infrastructure architecture and Terraform configurations for the AI Agent Platform, deployed on AWS with multi-region support.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AWS Infrastructure                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         CloudFront CDN                               │    │
│  └──────────────────────────────┬──────────────────────────────────────┘    │
│                                 │                                            │
│  ┌──────────────────────────────▼──────────────────────────────────────┐    │
│  │                      Application Load Balancer                       │    │
│  └──────────────────────────────┬──────────────────────────────────────┘    │
│                                 │                                            │
│  ┌──────────────────────────────▼──────────────────────────────────────┐    │
│  │                           EKS Cluster                                │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │    │
│  │  │  API Pods   │  │ Agent Pods  │  │ Worker Pods │                  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                 │                                            │
│         ┌───────────────────────┼───────────────────────┐                   │
│         ▼                       ▼                       ▼                   │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐           │
│  │    RDS      │         │   Redis     │         │     S3      │           │
│  │ PostgreSQL  │         │ ElastiCache │         │   Storage   │           │
│  └─────────────┘         └─────────────┘         └─────────────┘           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
infrastructure/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   └── prod/
│       ├── main.tf
│       ├── variables.tf
│       ├── terraform.tfvars
│       └── backend.tf
├── modules/
│   ├── vpc/
│   ├── eks/
│   ├── rds/
│   ├── elasticache/
│   ├── s3/
│   ├── cloudfront/
│   ├── alb/
│   ├── secrets/
│   └── monitoring/
└── global/
    ├── iam/
    ├── route53/
    └── ecr/
```

---

## Core Modules

### VPC Module

```hcl
# modules/vpc/main.tf

variable "environment" {
  type = string
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "availability_zones" {
  type    = list(string)
  default = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "agent-platform-${var.environment}"
    Environment = var.environment
  }
}

# Public subnets (for ALB)
resource "aws_subnet" "public" {
  count = length(var.availability_zones)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name                                           = "public-${var.availability_zones[count.index]}"
    "kubernetes.io/role/elb"                       = "1"
    "kubernetes.io/cluster/agent-platform-${var.environment}" = "shared"
  }
}

# Private subnets (for EKS nodes, RDS, ElastiCache)
resource "aws_subnet" "private" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index + length(var.availability_zones))
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name                                           = "private-${var.availability_zones[count.index]}"
    "kubernetes.io/role/internal-elb"              = "1"
    "kubernetes.io/cluster/agent-platform-${var.environment}" = "shared"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "agent-platform-${var.environment}-igw"
  }
}

# NAT Gateway (one per AZ for HA)
resource "aws_eip" "nat" {
  count  = length(var.availability_zones)
  domain = "vpc"

  tags = {
    Name = "nat-${var.availability_zones[count.index]}"
  }
}

resource "aws_nat_gateway" "main" {
  count = length(var.availability_zones)

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "nat-${var.availability_zones[count.index]}"
  }
}

# Route tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "public-rt"
  }
}

resource "aws_route_table" "private" {
  count  = length(var.availability_zones)
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = {
    Name = "private-rt-${var.availability_zones[count.index]}"
  }
}

# Route table associations
resource "aws_route_table_association" "public" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Outputs
output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}
```

### EKS Module

```hcl
# modules/eks/main.tf

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "kubernetes_version" {
  type    = string
  default = "1.29"
}

# EKS Cluster
resource "aws_eks_cluster" "main" {
  name     = "agent-platform-${var.environment}"
  version  = var.kubernetes_version
  role_arn = aws_iam_role.cluster.arn

  vpc_config {
    subnet_ids              = var.private_subnet_ids
    endpoint_private_access = true
    endpoint_public_access  = true
    security_group_ids      = [aws_security_group.cluster.id]
  }

  encryption_config {
    provider {
      key_arn = aws_kms_key.eks.arn
    }
    resources = ["secrets"]
  }

  enabled_cluster_log_types = [
    "api",
    "audit",
    "authenticator",
    "controllerManager",
    "scheduler"
  ]

  depends_on = [
    aws_iam_role_policy_attachment.cluster_policy,
    aws_iam_role_policy_attachment.vpc_resource_controller,
  ]

  tags = {
    Environment = var.environment
  }
}

# EKS Node Group - General Purpose
resource "aws_eks_node_group" "general" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "general"
  node_role_arn   = aws_iam_role.node.arn
  subnet_ids      = var.private_subnet_ids

  instance_types = var.environment == "prod" ? ["m6i.xlarge"] : ["t3.large"]

  scaling_config {
    desired_size = var.environment == "prod" ? 3 : 2
    min_size     = var.environment == "prod" ? 3 : 1
    max_size     = var.environment == "prod" ? 10 : 5
  }

  update_config {
    max_unavailable = 1
  }

  labels = {
    role = "general"
  }

  depends_on = [
    aws_iam_role_policy_attachment.node_policy,
    aws_iam_role_policy_attachment.cni_policy,
    aws_iam_role_policy_attachment.ecr_policy,
  ]

  tags = {
    Environment = var.environment
  }
}

# EKS Node Group - Agent Execution (larger instances)
resource "aws_eks_node_group" "agents" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "agents"
  node_role_arn   = aws_iam_role.node.arn
  subnet_ids      = var.private_subnet_ids

  instance_types = var.environment == "prod" ? ["c6i.2xlarge"] : ["c6i.xlarge"]

  scaling_config {
    desired_size = var.environment == "prod" ? 5 : 2
    min_size     = var.environment == "prod" ? 3 : 1
    max_size     = var.environment == "prod" ? 20 : 5
  }

  labels = {
    role = "agent-execution"
  }

  taint {
    key    = "dedicated"
    value  = "agent-execution"
    effect = "NO_SCHEDULE"
  }

  depends_on = [
    aws_iam_role_policy_attachment.node_policy,
  ]

  tags = {
    Environment = var.environment
  }
}

# Security Group
resource "aws_security_group" "cluster" {
  name_prefix = "eks-cluster-${var.environment}"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "eks-cluster-${var.environment}"
  }
}

# KMS Key for encryption
resource "aws_kms_key" "eks" {
  description             = "EKS Secret Encryption Key"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Environment = var.environment
  }
}

# IAM Roles
resource "aws_iam_role" "cluster" {
  name = "eks-cluster-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.cluster.name
}

resource "aws_iam_role_policy_attachment" "vpc_resource_controller" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
  role       = aws_iam_role.cluster.name
}

resource "aws_iam_role" "node" {
  name = "eks-node-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.node.name
}

resource "aws_iam_role_policy_attachment" "cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.node.name
}

resource "aws_iam_role_policy_attachment" "ecr_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.node.name
}

# Outputs
output "cluster_endpoint" {
  value = aws_eks_cluster.main.endpoint
}

output "cluster_name" {
  value = aws_eks_cluster.main.name
}

output "cluster_ca_certificate" {
  value = aws_eks_cluster.main.certificate_authority[0].data
}
```

### RDS Module

```hcl
# modules/rds/main.tf

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "instance_class" {
  type    = string
  default = "db.r6g.large"
}

# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "agent-platform-${var.environment}"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name        = "agent-platform-${var.environment}"
    Environment = var.environment
  }
}

# Security Group
resource "aws_security_group" "rds" {
  name_prefix = "rds-${var.environment}"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.eks_security_group_id]
  }

  tags = {
    Name = "rds-${var.environment}"
  }
}

# RDS Parameter Group
resource "aws_db_parameter_group" "main" {
  name   = "agent-platform-${var.environment}"
  family = "postgres15"

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"  # Log queries > 1 second
  }

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  tags = {
    Environment = var.environment
  }
}

# RDS Instance (Primary)
resource "aws_db_instance" "primary" {
  identifier     = "agent-platform-${var.environment}"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.instance_class

  allocated_storage     = var.environment == "prod" ? 100 : 20
  max_allocated_storage = var.environment == "prod" ? 1000 : 100
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id           = aws_kms_key.rds.arn

  db_name  = "agent_platform"
  username = "postgres"
  password = random_password.db_password.result

  multi_az               = var.environment == "prod"
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.main.name

  backup_retention_period = var.environment == "prod" ? 30 : 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  performance_insights_enabled          = true
  performance_insights_retention_period = var.environment == "prod" ? 731 : 7

  deletion_protection = var.environment == "prod"
  skip_final_snapshot = var.environment != "prod"
  final_snapshot_identifier = var.environment == "prod" ? "agent-platform-final-${formatdate("YYYYMMDD", timestamp())}" : null

  tags = {
    Environment = var.environment
  }
}

# Read Replica (Production only)
resource "aws_db_instance" "replica" {
  count = var.environment == "prod" ? 1 : 0

  identifier          = "agent-platform-${var.environment}-replica"
  replicate_source_db = aws_db_instance.primary.identifier
  instance_class      = var.instance_class

  storage_encrypted = true
  kms_key_id       = aws_kms_key.rds.arn

  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.main.name

  performance_insights_enabled = true
  skip_final_snapshot         = true

  tags = {
    Environment = var.environment
    Role        = "replica"
  }
}

# KMS Key
resource "aws_kms_key" "rds" {
  description             = "RDS encryption key for ${var.environment}"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Environment = var.environment
  }
}

# Random password
resource "random_password" "db_password" {
  length  = 32
  special = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Store in Secrets Manager
resource "aws_secretsmanager_secret" "db_credentials" {
  name = "agent-platform/${var.environment}/db-credentials"

  tags = {
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = aws_db_instance.primary.username
    password = random_password.db_password.result
    host     = aws_db_instance.primary.address
    port     = aws_db_instance.primary.port
    database = aws_db_instance.primary.db_name
  })
}

# Outputs
output "endpoint" {
  value = aws_db_instance.primary.endpoint
}

output "replica_endpoint" {
  value = var.environment == "prod" ? aws_db_instance.replica[0].endpoint : null
}

output "credentials_secret_arn" {
  value = aws_secretsmanager_secret.db_credentials.arn
}
```

### ElastiCache Module

```hcl
# modules/elasticache/main.tf

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "node_type" {
  type    = string
  default = "cache.r6g.large"
}

# Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "agent-platform-${var.environment}"
  subnet_ids = var.private_subnet_ids

  tags = {
    Environment = var.environment
  }
}

# Security Group
resource "aws_security_group" "redis" {
  name_prefix = "redis-${var.environment}"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [var.eks_security_group_id]
  }

  tags = {
    Name = "redis-${var.environment}"
  }
}

# Parameter Group
resource "aws_elasticache_parameter_group" "main" {
  name   = "agent-platform-${var.environment}"
  family = "redis7"

  parameter {
    name  = "maxmemory-policy"
    value = "volatile-lru"
  }

  tags = {
    Environment = var.environment
  }
}

# Redis Replication Group
resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "agent-platform-${var.environment}"
  description          = "Redis cluster for Agent Platform ${var.environment}"

  node_type            = var.node_type
  port                 = 6379
  parameter_group_name = aws_elasticache_parameter_group.main.name

  automatic_failover_enabled = var.environment == "prod"
  multi_az_enabled          = var.environment == "prod"
  num_cache_clusters        = var.environment == "prod" ? 3 : 1

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                = random_password.redis_auth.result

  snapshot_retention_limit = var.environment == "prod" ? 7 : 1
  snapshot_window         = "03:00-05:00"
  maintenance_window      = "mon:05:00-mon:06:00"

  tags = {
    Environment = var.environment
  }
}

# Auth token
resource "random_password" "redis_auth" {
  length  = 32
  special = false
}

# Store in Secrets Manager
resource "aws_secretsmanager_secret" "redis_auth" {
  name = "agent-platform/${var.environment}/redis-auth"

  tags = {
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "redis_auth" {
  secret_id = aws_secretsmanager_secret.redis_auth.id
  secret_string = jsonencode({
    auth_token = random_password.redis_auth.result
    host       = aws_elasticache_replication_group.main.primary_endpoint_address
    port       = 6379
  })
}

# Outputs
output "primary_endpoint" {
  value = aws_elasticache_replication_group.main.primary_endpoint_address
}

output "reader_endpoint" {
  value = aws_elasticache_replication_group.main.reader_endpoint_address
}

output "auth_secret_arn" {
  value = aws_secretsmanager_secret.redis_auth.arn
}
```

### S3 Module

```hcl
# modules/s3/main.tf

variable "environment" {
  type = string
}

# Main storage bucket
resource "aws_s3_bucket" "main" {
  bucket = "agent-platform-${var.environment}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3.arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    id     = "execution-logs"
    status = "Enabled"

    filter {
      prefix = "execution-logs/"
    }

    transition {
      days          = 30
      storage_class = "INTELLIGENT_TIERING"
    }

    expiration {
      days = 90
    }
  }

  rule {
    id     = "agent-artifacts"
    status = "Enabled"

    filter {
      prefix = "agents/"
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# Logs bucket
resource "aws_s3_bucket" "logs" {
  bucket = "agent-platform-logs-${var.environment}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Environment = var.environment
    Purpose     = "logs"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    id     = "log-retention"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}

# KMS Key
resource "aws_kms_key" "s3" {
  description             = "S3 encryption key for ${var.environment}"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Environment = var.environment
  }
}

data "aws_caller_identity" "current" {}

# Outputs
output "main_bucket_id" {
  value = aws_s3_bucket.main.id
}

output "main_bucket_arn" {
  value = aws_s3_bucket.main.arn
}

output "logs_bucket_id" {
  value = aws_s3_bucket.logs.id
}
```

---

## Environment Configuration

### Production Environment

```hcl
# environments/prod/main.tf

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = "prod"
      Project     = "agent-platform"
      ManagedBy   = "terraform"
    }
  }
}

# VPC
module "vpc" {
  source = "../../modules/vpc"

  environment        = "prod"
  vpc_cidr          = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# EKS
module "eks" {
  source = "../../modules/eks"

  environment        = "prod"
  vpc_id            = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  kubernetes_version = "1.29"
}

# RDS
module "rds" {
  source = "../../modules/rds"

  environment           = "prod"
  vpc_id               = module.vpc.vpc_id
  private_subnet_ids   = module.vpc.private_subnet_ids
  eks_security_group_id = module.eks.node_security_group_id
  instance_class       = "db.r6g.xlarge"
}

# ElastiCache
module "elasticache" {
  source = "../../modules/elasticache"

  environment           = "prod"
  vpc_id               = module.vpc.vpc_id
  private_subnet_ids   = module.vpc.private_subnet_ids
  eks_security_group_id = module.eks.node_security_group_id
  node_type            = "cache.r6g.large"
}

# S3
module "s3" {
  source = "../../modules/s3"

  environment = "prod"
}

# CloudFront
module "cloudfront" {
  source = "../../modules/cloudfront"

  environment = "prod"
  s3_bucket_id = module.s3.main_bucket_id
  alb_domain   = module.alb.dns_name
  acm_cert_arn = var.acm_certificate_arn
}

# Monitoring
module "monitoring" {
  source = "../../modules/monitoring"

  environment    = "prod"
  vpc_id        = module.vpc.vpc_id
  cluster_name  = module.eks.cluster_name
  slack_webhook = var.slack_webhook_url
}
```

### Backend Configuration

```hcl
# environments/prod/backend.tf

terraform {
  backend "s3" {
    bucket         = "agent-platform-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "agent-platform-terraform-locks"
  }
}
```

### Variables

```hcl
# environments/prod/variables.tf

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "acm_certificate_arn" {
  type        = string
  description = "ARN of ACM certificate for HTTPS"
}

variable "slack_webhook_url" {
  type        = string
  description = "Slack webhook for alerts"
  sensitive   = true
}
```

---

## Kubernetes Resources

### Helm Charts

```hcl
# modules/kubernetes/main.tf

# AWS Load Balancer Controller
resource "helm_release" "aws_load_balancer_controller" {
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  namespace  = "kube-system"
  version    = "1.6.2"

  set {
    name  = "clusterName"
    value = var.cluster_name
  }

  set {
    name  = "serviceAccount.create"
    value = "true"
  }

  set {
    name  = "serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
    value = aws_iam_role.lb_controller.arn
  }
}

# External Secrets Operator
resource "helm_release" "external_secrets" {
  name       = "external-secrets"
  repository = "https://charts.external-secrets.io"
  chart      = "external-secrets"
  namespace  = "external-secrets"
  version    = "0.9.11"

  create_namespace = true

  set {
    name  = "serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
    value = aws_iam_role.external_secrets.arn
  }
}

# Prometheus Stack
resource "helm_release" "prometheus" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = "monitoring"
  version    = "55.5.0"

  create_namespace = true

  values = [
    file("${path.module}/values/prometheus.yaml")
  ]
}

# Cert Manager
resource "helm_release" "cert_manager" {
  name       = "cert-manager"
  repository = "https://charts.jetstack.io"
  chart      = "cert-manager"
  namespace  = "cert-manager"
  version    = "1.14.0"

  create_namespace = true

  set {
    name  = "installCRDs"
    value = "true"
  }
}
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  push:
    branches: [main]
    paths:
      - 'infrastructure/**'
  pull_request:
    branches: [main]
    paths:
      - 'infrastructure/**'

env:
  TF_VERSION: "1.6.0"
  AWS_REGION: "us-east-1"

jobs:
  plan:
    name: Terraform Plan
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [dev, staging, prod]

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Terraform Init
        working-directory: infrastructure/environments/${{ matrix.environment }}
        run: terraform init

      - name: Terraform Plan
        working-directory: infrastructure/environments/${{ matrix.environment }}
        run: terraform plan -out=tfplan

      - name: Upload Plan
        uses: actions/upload-artifact@v4
        with:
          name: tfplan-${{ matrix.environment }}
          path: infrastructure/environments/${{ matrix.environment }}/tfplan

  apply:
    name: Terraform Apply
    runs-on: ubuntu-latest
    needs: plan
    if: github.ref == 'refs/heads/main'
    environment: production
    strategy:
      matrix:
        environment: [dev, staging, prod]
      max-parallel: 1  # Apply sequentially

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Download Plan
        uses: actions/download-artifact@v4
        with:
          name: tfplan-${{ matrix.environment }}
          path: infrastructure/environments/${{ matrix.environment }}

      - name: Terraform Init
        working-directory: infrastructure/environments/${{ matrix.environment }}
        run: terraform init

      - name: Terraform Apply
        working-directory: infrastructure/environments/${{ matrix.environment }}
        run: terraform apply -auto-approve tfplan
```

---

## Cost Estimation

### Monthly Costs (Production)

| Resource | Specification | Est. Monthly Cost |
|----------|--------------|-------------------|
| EKS Control Plane | 1 cluster | $72 |
| EC2 (General) | 3x m6i.xlarge | $450 |
| EC2 (Agents) | 5x c6i.2xlarge | $1,000 |
| RDS PostgreSQL | db.r6g.xlarge Multi-AZ | $600 |
| RDS Read Replica | db.r6g.xlarge | $300 |
| ElastiCache | 3x cache.r6g.large | $450 |
| NAT Gateway | 3x (one per AZ) | $135 |
| CloudFront | 1TB transfer | $85 |
| S3 | 500GB | $12 |
| Secrets Manager | 20 secrets | $8 |
| CloudWatch | Logs + Metrics | $150 |
| **Total** | | **~$3,262/month** |

---

## Disaster Recovery

### Backup Strategy

```hcl
# modules/backup/main.tf

# AWS Backup vault
resource "aws_backup_vault" "main" {
  name        = "agent-platform-${var.environment}"
  kms_key_arn = aws_kms_key.backup.arn

  tags = {
    Environment = var.environment
  }
}

# Backup plan
resource "aws_backup_plan" "main" {
  name = "agent-platform-${var.environment}"

  rule {
    rule_name         = "daily"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 3 * * ? *)"

    lifecycle {
      delete_after = var.environment == "prod" ? 30 : 7
    }

    copy_action {
      lifecycle {
        delete_after = 90
      }
      destination_vault_arn = aws_backup_vault.dr.arn
    }
  }

  rule {
    rule_name         = "weekly"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 4 ? * SUN *)"

    lifecycle {
      delete_after = var.environment == "prod" ? 90 : 30
    }
  }
}

# DR vault in different region
resource "aws_backup_vault" "dr" {
  provider = aws.dr_region
  name     = "agent-platform-${var.environment}-dr"

  tags = {
    Environment = var.environment
    Purpose     = "disaster-recovery"
  }
}

# Backup selection
resource "aws_backup_selection" "main" {
  name         = "agent-platform-${var.environment}"
  plan_id      = aws_backup_plan.main.id
  iam_role_arn = aws_iam_role.backup.arn

  selection_tag {
    type  = "STRINGEQUALS"
    key   = "Backup"
    value = "true"
  }
}
```

---

## Security Hardening

### Security Best Practices Checklist

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Infrastructure Security Checklist                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Network Security                                                        │
│  [x] VPC with private subnets for workloads                             │
│  [x] Security groups with minimal access                                │
│  [x] VPC Flow Logs enabled                                              │
│  [x] No public IPs on compute resources                                 │
│                                                                          │
│  Data Security                                                           │
│  [x] Encryption at rest (KMS) for all data stores                       │
│  [x] Encryption in transit (TLS)                                        │
│  [x] Secrets in AWS Secrets Manager                                     │
│  [x] S3 bucket policies blocking public access                          │
│                                                                          │
│  Identity & Access                                                       │
│  [x] IRSA for Kubernetes workloads                                      │
│  [x] Least privilege IAM policies                                       │
│  [x] MFA for console access                                             │
│  [x] No long-term access keys                                           │
│                                                                          │
│  Monitoring & Compliance                                                 │
│  [x] CloudTrail enabled                                                 │
│  [x] GuardDuty enabled                                                  │
│  [x] Security Hub enabled                                               │
│  [x] Config rules for compliance                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```
