# GitHub Actions -> AWS ECR using OIDC (User Service)

## Overview

This document explains how `fitforge-user-service` publishes Docker images to AWS ECR using GitHub Actions + OIDC (OpenID Connect), without long-lived AWS access keys.

We now use:

- OIDC token from GitHub Actions
- IAM role assumption via AWS STS
- Temporary AWS credentials
- Amazon ECR image push

---

## Architecture Flow

GitHub Actions  
-> OIDC token issued by GitHub  
-> AWS STS `AssumeRoleWithWebIdentity`  
-> IAM Role `fitforge-user-service` (temporary creds)  
-> Push image to ECR `user-service`  
-> (Optional) Helm chart update / CD step

---

## Why OIDC

- No static AWS credentials in GitHub secrets
- Short-lived, auto-expiring credentials
- Access controlled by IAM trust policy (`repo` + `branch`)
- Better security and auditability

---

## Scope

OIDC is currently enabled for **user-service** as an initial rollout (PoC) before scaling to all services.

---

## AWS Configuration

### 1) OIDC Provider

- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

### 2) IAM Role

- Role name: `fitforge-user-service`
- Assumed by: GitHub Actions via OIDC

### 3) Trust Policy (Role Trust Relationship)

Use this in **Trust relationships** (not in permissions policy):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::427553887573:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": [
            "repo:fitforge101/fitforge-user-service:ref:refs/heads/feature/ci-user-service",
            "repo:fitforge101/fitforge-user-service:ref:refs/heads/develop",
            "repo:fitforge101/fitforge-user-service:ref:refs/heads/main"
          ]
        }
      }
    }
  ]
}
```

### 4) IAM Permissions Policy (ECR)

Attach to role `fitforge-user-service`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage",
        "ecr:DescribeImages"
      ],
      "Resource": "*"
    }
  ]
}
```

### 5) ECR Repository

- Repository name: `user-service`
- Region: `us-east-1`
- Registry: `427553887573.dkr.ecr.us-east-1.amazonaws.com`

---

## GitHub Actions Changes (`ci-user-service.yml`)

### New Job: `publish-ecr`

Key points implemented:

- Job permission includes:
  - `id-token: write`
  - `contents: read`
- Uses:
  - `aws-actions/configure-aws-credentials@v4`
- Role assumed:
  - `arn:aws:iam::427553887573:role/fitforge-user-service`
- Region:
  - `us-east-1`
- Push target:
  - `427553887573.dkr.ecr.us-east-1.amazonaws.com/user-service:${{ github.sha }}`

### DockerHub Publish

Old DockerHub `publish` job is disabled.

### CD Job

`cd` job is currently commented/disabled during validation.  
When re-enabled, ensure image registry/repository values in charts align with ECR image path.

---

## Validation Checklist

1. Push to allowed branch (e.g. `feature/ci-user-service`)
2. In Actions logs, confirm `Configure AWS Credentials` succeeds
3. Confirm `docker push` step completes successfully
4. Verify in ECR console:
   - Repo: `user-service`
   - Tag present: commit SHA

---

## Common Errors and Fixes

- `Not authorized to perform sts:AssumeRoleWithWebIdentity`
  - Fix role trust relationship (`aud`/`sub` mismatch)
- `name unknown: repository does not exist`
  - Repo missing in selected region or wrong registry URL
- `AccessDeniedException: ecr:DescribeImages`
  - Add `ecr:DescribeImages` in role permissions

---

## Key Learnings

- OIDC replaced static AWS credentials securely
- Trust policy placement matters (Trust Relationship vs Permissions Policy)
- Region consistency is critical (`us-east-1` in your case)
- ECR push and verification require correct IAM actions

---

## Next Improvements

- Re-enable CD after ECR-only validation
- Update Helm chart image repository to ECR (if not already)
- Standardize this pattern across other services with reusable templates
- Restrict trust policy further by environment if needed
