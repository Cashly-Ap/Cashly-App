# Deployment Guide

This guide covers the deployment process for the Lexand application, including CI/CD pipelines, AWS deployment, and best practices.

## 🚀 Overview

The Lexand application uses a modern CI/CD pipeline for automated deployment to AWS. The deployment process includes:

- **Version Control**: GitLab
- **CI/CD**: GitLab Pipeline
- **Cloud Platform**: AWS (Amazon Web Services)
- **Containerization**: Docker
- **Infrastructure**: AWS ECS, ECR, S3, CloudFront

## 🏗️ Deployment Architecture

```
Developer Push
    ↓
GitLab Repository
    ↓
GitLab CI/CD Pipeline
    ↓
    ├─→ Build Stage (Docker Image)
    ├─→ Test Stage (Jest Tests)
    ├─→ Security Scan
    └─→ Deploy Stage
         ↓
    AWS ECR (Container Registry)
         ↓
    AWS ECS (Container Orchestration)
         ↓
    Application Load Balancer
         ↓
    End Users
```

## 📋 Prerequisites

Before deploying, ensure you have:

1. **AWS Account** with appropriate permissions
2. **GitLab Account** with CI/CD access
3. **AWS CLI** installed and configured
4. **Docker** installed locally for testing
5. **Environment Variables** configured

## 🔧 GitLab CI/CD Pipeline

### Pipeline Configuration

Create `.gitlab-ci.yml` in the root directory:

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - security
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  AWS_DEFAULT_REGION: us-east-1
  ECR_REPOSITORY: lexand-app
  ECS_CLUSTER: lexand-cluster
  ECS_SERVICE: lexand-service

# Build Stage
build:
  stage: build
  image: docker:24-alpine
  services:
    - docker:24-dind
  before_script:
    - apk add --no-cache aws-cli
    - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
  script:
    - docker build -t $ECR_REPOSITORY:$CI_COMMIT_SHA .
    - docker tag $ECR_REPOSITORY:$CI_COMMIT_SHA $ECR_REGISTRY/$ECR_REPOSITORY:latest
    - docker tag $ECR_REPOSITORY:$CI_COMMIT_SHA $ECR_REGISTRY/$ECR_REPOSITORY:$CI_COMMIT_SHA
    - docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
    - docker push $ECR_REGISTRY/$ECR_REPOSITORY:$CI_COMMIT_SHA
  only:
    - main
    - develop

# Test Stage
test:
  stage: test
  image: node:22-alpine
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  before_script:
    - npm ci
  script:
    - npm run test:ci
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
    paths:
      - coverage/
    expire_in: 1 week
  only:
    - main
    - develop
    - merge_requests

# Security Scan Stage
security_scan:
  stage: security
  image: docker:24-alpine
  services:
    - docker:24-dind
  before_script:
    - apk add --no-cache curl
    - curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
  script:
    - docker build -t $ECR_REPOSITORY:$CI_COMMIT_SHA .
    - trivy image --exit-code 0 --severity HIGH,CRITICAL $ECR_REPOSITORY:$CI_COMMIT_SHA
  allow_failure: true
  only:
    - main
    - develop

# Deploy to Development
deploy_dev:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache aws-cli
  script:
    - aws ecs update-service --cluster $ECS_CLUSTER-dev --service $ECS_SERVICE-dev --force-new-deployment
  environment:
    name: development
    url: https://dev.lexand.com
  only:
    - develop

# Deploy to Production
deploy_prod:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache aws-cli
  script:
    - aws ecs update-service --cluster $ECS_CLUSTER-prod --service $ECS_SERVICE-prod --force-new-deployment
  environment:
    name: production
    url: https://lexand.com
  when: manual
  only:
    - main
```

### Pipeline Stages

#### 1. Build Stage

- Builds Docker image
- Tags with commit SHA and 'latest'
- Pushes to AWS ECR

#### 2. Test Stage

- Runs Jest tests
- Generates coverage reports
- Fails pipeline if tests fail

#### 3. Security Scan Stage

- Scans Docker image for vulnerabilities
- Uses Trivy for security scanning
- Reports HIGH and CRITICAL vulnerabilities

#### 4. Deploy Stage

- Updates ECS service with new image
- Automatic deployment to development
- Manual approval for production

## ☁️ AWS Infrastructure Setup

### 1. AWS ECR (Elastic Container Registry)

Store Docker images in ECR:

```bash
# Create ECR repository
aws ecr create-repository \
  --repository-name lexand-app \
  --region us-east-1

# Get registry URL
aws ecr describe-repositories \
  --repository-names lexand-app \
  --query 'repositories[0].repositoryUri' \
  --output text
```

### 2. AWS ECS (Elastic Container Service)

#### Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster \
  --cluster-name lexand-cluster \
  --region us-east-1
```

#### Task Definition

Create `task-definition.json`:

```json
{
  "family": "lexand-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "lexand-app",
      "image": "YOUR_ECR_REGISTRY/lexand-app:latest",
      "portMappings": [
        {
          "containerPort": 4200,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "API_URL",
          "value": "https://api.lexand.com/api"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/lexand-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register task definition:

```bash
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json
```

#### Create ECS Service

```bash
aws ecs create-service \
  --cluster lexand-cluster \
  --service-name lexand-service \
  --task-definition lexand-app:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-yyyyy],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:xxxxx:targetgroup/lexand-tg/xxxxx,containerName=lexand-app,containerPort=4200"
```

### 3. Application Load Balancer

#### Create Target Group

```bash
aws elbv2 create-target-group \
  --name lexand-tg \
  --protocol HTTP \
  --port 4200 \
  --vpc-id vpc-xxxxx \
  --target-type ip \
  --health-check-path /
```

#### Create Load Balancer

```bash
aws elbv2 create-load-balancer \
  --name lexand-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx
```

#### Create Listener

```bash
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:xxxxx:loadbalancer/app/lexand-alb/xxxxx \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:xxxxx:targetgroup/lexand-tg/xxxxx
```

### 4. CloudFront (CDN)

For static assets and improved performance:

```bash
aws cloudfront create-distribution \
  --origin-domain-name lexand-alb-xxxxx.us-east-1.elb.amazonaws.com \
  --default-root-object index.html
```

### 5. S3 for Static Assets (Optional)

If serving static assets separately:

```bash
# Create S3 bucket
aws s3 mb s3://lexand-app-assets

# Configure bucket for static website hosting
aws s3 website s3://lexand-app-assets \
  --index-document index.html \
  --error-document error.html

# Upload assets
aws s3 sync ./dist/Lexand-App/browser/assets s3://lexand-app-assets/assets --acl public-read
```

## 🔐 GitLab CI/CD Variables

Configure these variables in GitLab (Settings > CI/CD > Variables):

### Required Variables

| Variable                | Description                  | Masked | Protected |
| ----------------------- | ---------------------------- | ------ | --------- |
| `AWS_ACCESS_KEY_ID`     | AWS access key               | Yes    | Yes       |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key               | Yes    | Yes       |
| `AWS_DEFAULT_REGION`    | AWS region (e.g., us-east-1) | No     | No        |
| `ECR_REGISTRY`          | ECR registry URL             | No     | No        |
| `ECR_REPOSITORY`        | ECR repository name          | No     | No        |
| `ECS_CLUSTER`           | ECS cluster name             | No     | No        |
| `ECS_SERVICE`           | ECS service name             | No     | No        |

### Optional Variables

| Variable           | Description                   |
| ------------------ | ----------------------------- |
| `SENTRY_DSN`       | Sentry error tracking DSN     |
| `API_URL`          | Backend API URL               |
| `ENABLE_ANALYTICS` | Enable analytics (true/false) |

## 🔄 Deployment Workflow

### Development Deployment

1. Create feature branch from `develop`
2. Make changes and commit
3. Create merge request to `develop`
4. Pipeline runs tests automatically
5. After approval and merge, automatic deployment to dev environment

### Production Deployment

1. Create merge request from `develop` to `main`
2. Code review and approval
3. Merge to `main` branch
4. Pipeline builds and tests
5. Manual approval required for production deployment
6. Deploy to production

### Rollback Strategy

If issues are detected after deployment:

```bash
# Rollback to previous task definition
aws ecs update-service \
  --cluster lexand-cluster \
  --service lexand-service \
  --task-definition lexand-app:PREVIOUS_VERSION
```

## 📊 Monitoring and Logging

### CloudWatch Logs

View application logs:

```bash
# View logs
aws logs tail /ecs/lexand-app --follow

# Filter logs
aws logs filter-log-events \
  --log-group-name /ecs/lexand-app \
  --filter-pattern "ERROR"
```

### CloudWatch Metrics

Monitor:

- CPU utilization
- Memory utilization
- Request count
- Response time
- Error rate

### Alerts

Set up CloudWatch alarms:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name lexand-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

## 🔧 Troubleshooting

### Pipeline Failures

**Build Fails**:

```bash
# Check Docker build logs in GitLab CI
# Verify Dockerfile syntax
# Check for missing dependencies
```

**Test Fails**:

```bash
# Run tests locally
npm test

# Check coverage reports
npm run test:coverage
```

**Deployment Fails**:

```bash
# Check ECS service events
aws ecs describe-services \
  --cluster lexand-cluster \
  --services lexand-service

# Check task failures
aws ecs describe-tasks \
  --cluster lexand-cluster \
  --tasks TASK_ID
```

### Container Issues

**Container Won't Start**:

```bash
# View container logs
aws logs tail /ecs/lexand-app --follow

# Check task definition
aws ecs describe-task-definition \
  --task-definition lexand-app
```

**Health Check Failures**:

```bash
# Test health endpoint locally
curl http://localhost:4200/

# Check target group health
aws elbv2 describe-target-health \
  --target-group-arn TARGET_GROUP_ARN
```

## 🌐 Domain and SSL Setup

### Route 53 (DNS)

```bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name lexand.com \
  --caller-reference $(date +%s)

# Create record set pointing to ALB
aws route53 change-resource-record-sets \
  --hosted-zone-id ZONE_ID \
  --change-batch file://record-set.json
```

### SSL Certificate (ACM)

```bash
# Request certificate
aws acm request-certificate \
  --domain-name lexand.com \
  --subject-alternative-names www.lexand.com \
  --validation-method DNS

# Add to load balancer listener
aws elbv2 create-listener \
  --load-balancer-arn LOAD_BALANCER_ARN \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=CERTIFICATE_ARN \
  --default-actions Type=forward,TargetGroupArn=TARGET_GROUP_ARN
```

## 📋 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Database migrations ready (if applicable)
- [ ] Monitoring and alerts set up
- [ ] SSL certificate configured
- [ ] DNS records configured
- [ ] Rollback plan documented
- [ ] Team notified of deployment
- [ ] Backup created (if applicable)

## 🎯 Best Practices

1. **Always test locally first** before pushing
2. **Use semantic versioning** for releases
3. **Tag releases** in Git for easy rollback
4. **Monitor deployments** closely for first 30 minutes
5. **Keep environments in sync** (dev, staging, prod)
6. **Document all infrastructure changes**
7. **Use Infrastructure as Code** (CloudFormation/Terraform)
8. **Implement blue-green deployments** for zero downtime
9. **Automate rollbacks** when possible
10. **Regular security updates** for dependencies

## 📚 Additional Resources

- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

---

[← Back to Architecture](ARCHITECTURE.md) | [Back to Main README](../README.md)
