# Environment Variables

This document describes all environment variables used in the Lexand application for different environments (development, testing, production).

## 📋 Overview

Environment variables allow you to configure the application without hardcoding values. This is essential for:

- Separating configuration from code
- Managing different environments (dev, test, prod)
- Keeping sensitive information secure
- Enabling flexible deployment strategies

## 🔧 Configuration Files

### Local Development

Create a `.env` file in the root directory:

```bash
# .env
NODE_ENV=development
API_URL=http://localhost:8080/api
API_TIMEOUT=30000
ENABLE_LOGGING=true
LOG_LEVEL=debug
```

### Docker Development

Environment variables are set in `docker-compose.yml`:

```yaml
services:
  lexand-app-dev:
    environment:
      - NODE_ENV=development
      - API_URL=http://backend:8080/api
      - API_TIMEOUT=30000
```

### Production

Environment variables should be set in your deployment platform (AWS, Azure, etc.) or CI/CD pipeline.

## 🌍 Environment Variables Reference

### Core Application Settings

#### `NODE_ENV`

**Description**: Defines the environment mode for the application.

**Type**: String

**Required**: Yes

**Default**: `development`

**Possible Values**:

- `development` - Development environment with debugging enabled
- `test` - Testing environment for running tests
- `production` - Production environment with optimizations enabled

**Example**:

```bash
NODE_ENV=production
```

**Docker**:

```yaml
environment:
  - NODE_ENV=production
```

---

#### `PORT`

**Description**: Port number where the application will listen.

**Type**: Number

**Required**: No

**Default**: `4200`

**Example**:

```bash
PORT=4200
```

---

### API Configuration

#### `API_URL`

**Description**: Base URL for the backend API server.

**Type**: String (URL)

**Required**: Yes

**Default**: `http://localhost:8080/api`

**Example**:

```bash
# Development
API_URL=http://localhost:8080/api

# Production
API_URL=https://api.lexand.com/api

# Docker (internal network)
API_URL=http://backend:8080/api
```

---

#### `API_TIMEOUT`

**Description**: HTTP request timeout in milliseconds.

**Type**: Number

**Required**: No

**Default**: `30000` (30 seconds)

**Example**:

```bash
API_TIMEOUT=30000
```

---

#### `API_VERSION`

**Description**: API version to use for requests.

**Type**: String

**Required**: No

**Default**: `v1`

**Example**:

```bash
API_VERSION=v1
```

---

### Authentication & Security

#### `AUTH_TOKEN_KEY`

**Description**: LocalStorage key for storing authentication tokens.

**Type**: String

**Required**: No

**Default**: `lexand_auth_token`

**Example**:

```bash
AUTH_TOKEN_KEY=lexand_auth_token
```

---

#### `AUTH_REFRESH_TOKEN_KEY`

**Description**: LocalStorage key for storing refresh tokens.

**Type**: String

**Required**: No

**Default**: `lexand_refresh_token`

**Example**:

```bash
AUTH_REFRESH_TOKEN_KEY=lexand_refresh_token
```

---

#### `SESSION_TIMEOUT`

**Description**: Session timeout in milliseconds.

**Type**: Number

**Required**: No

**Default**: `3600000` (1 hour)

**Example**:

```bash
SESSION_TIMEOUT=3600000
```

---

#### `ENABLE_SSL`

**Description**: Enable SSL/TLS for API requests.

**Type**: Boolean

**Required**: No

**Default**: `false` in development, `true` in production

**Example**:

```bash
ENABLE_SSL=true
```

---

### Database Configuration (if applicable)

#### `DB_HOST`

**Description**: Database host address.

**Type**: String

**Required**: Yes (if using direct DB connection)

**Example**:

```bash
DB_HOST=localhost
```

---

#### `DB_PORT`

**Description**: Database port number.

**Type**: Number

**Required**: Yes (if using direct DB connection)

**Default**: `3306` (MySQL)

**Example**:

```bash
DB_PORT=3306
```

---

#### `DB_NAME`

**Description**: Database name.

**Type**: String

**Required**: Yes (if using direct DB connection)

**Example**:

```bash
DB_NAME=lexand_db
```

---

#### `DB_USER`

**Description**: Database username.

**Type**: String

**Required**: Yes (if using direct DB connection)

**Example**:

```bash
DB_USER=lexand_user
```

---

#### `DB_PASSWORD`

**Description**: Database password.

**Type**: String

**Required**: Yes (if using direct DB connection)

**Security**: Should never be committed to version control

**Example**:

```bash
DB_PASSWORD=secure_password_here
```

---

### Logging & Monitoring

#### `ENABLE_LOGGING`

**Description**: Enable application logging.

**Type**: Boolean

**Required**: No

**Default**: `true` in development, `false` in production

**Example**:

```bash
ENABLE_LOGGING=true
```

---

#### `LOG_LEVEL`

**Description**: Logging level for application logs.

**Type**: String

**Required**: No

**Default**: `info`

**Possible Values**:

- `error` - Only errors
- `warn` - Warnings and errors
- `info` - Informational messages, warnings, and errors
- `debug` - All messages including debug information

**Example**:

```bash
LOG_LEVEL=debug
```

---

#### `SENTRY_DSN`

**Description**: Sentry DSN for error tracking (if using Sentry).

**Type**: String (URL)

**Required**: No

**Example**:

```bash
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

---

### Feature Flags

#### `ENABLE_ANALYTICS`

**Description**: Enable analytics tracking.

**Type**: Boolean

**Required**: No

**Default**: `false`

**Example**:

```bash
ENABLE_ANALYTICS=true
```

---

#### `ENABLE_DEBUG_MODE`

**Description**: Enable debug mode with additional logging and tools.

**Type**: Boolean

**Required**: No

**Default**: `false` in production, `true` in development

**Example**:

```bash
ENABLE_DEBUG_MODE=true
```

---

#### `ENABLE_MOCK_DATA`

**Description**: Use mock data instead of real API calls (useful for development).

**Type**: Boolean

**Required**: No

**Default**: `false`

**Example**:

```bash
ENABLE_MOCK_DATA=true
```

---

### AWS Configuration (for deployment)

#### `AWS_REGION`

**Description**: AWS region for deployment.

**Type**: String

**Required**: Yes (for AWS deployment)

**Example**:

```bash
AWS_REGION=us-east-1
```

---

#### `AWS_ACCESS_KEY_ID`

**Description**: AWS access key ID.

**Type**: String

**Required**: Yes (for AWS deployment)

**Security**: Should never be committed to version control

**Example**:

```bash
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
```

---

#### `AWS_SECRET_ACCESS_KEY`

**Description**: AWS secret access key.

**Type**: String

**Required**: Yes (for AWS deployment)

**Security**: Should never be committed to version control

**Example**:

```bash
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

---

#### `S3_BUCKET`

**Description**: S3 bucket name for file storage.

**Type**: String

**Required**: No

**Example**:

```bash
S3_BUCKET=lexand-app-files
```

---

## 🔒 Security Best Practices

### 1. Never Commit Secrets

Add `.env` files to `.gitignore`:

```bash
# .gitignore
.env
.env.local
.env.*.local
```

### 2. Use Environment-Specific Files

```bash
.env                  # Default values
.env.local           # Local overrides (gitignored)
.env.development     # Development defaults
.env.test            # Test environment
.env.production      # Production defaults (no secrets!)
```

### 3. Validate Environment Variables

Create a validation function in your application:

```typescript
// src/app/config/env.validator.ts
export function validateEnvironment(): void {
  const required = ["API_URL", "NODE_ENV"];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
```

### 4. Use Secret Management Services

For production, use secure secret management:

- **AWS Secrets Manager**
- **Azure Key Vault**
- **HashiCorp Vault**
- **GitLab CI/CD Variables** (masked)

### 5. Rotate Secrets Regularly

Implement a process to rotate sensitive credentials periodically.

## 📦 Environment File Templates

### Development Template (`.env.example`)

Create this file to share with your team:

```bash
# Application
NODE_ENV=development
PORT=4200

# API Configuration
API_URL=http://localhost:8080/api
API_TIMEOUT=30000
API_VERSION=v1

# Authentication
AUTH_TOKEN_KEY=lexand_auth_token
AUTH_REFRESH_TOKEN_KEY=lexand_refresh_token
SESSION_TIMEOUT=3600000

# Database (if applicable)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=lexand_db
DB_USER=lexand_user
DB_PASSWORD=your_password_here

# Logging
ENABLE_LOGGING=true
LOG_LEVEL=debug

# Feature Flags
ENABLE_DEBUG_MODE=true
ENABLE_MOCK_DATA=false
ENABLE_ANALYTICS=false

# AWS (for deployment)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=lexand-app-files
```

### Production Template

```bash
# Application
NODE_ENV=production
PORT=4200

# API Configuration
API_URL=https://api.lexand.com/api
API_TIMEOUT=30000
API_VERSION=v1

# Authentication
SESSION_TIMEOUT=3600000
ENABLE_SSL=true

# Logging
ENABLE_LOGGING=false
LOG_LEVEL=error

# Monitoring
SENTRY_DSN=your_sentry_dsn_here

# Feature Flags
ENABLE_DEBUG_MODE=false
ENABLE_MOCK_DATA=false
ENABLE_ANALYTICS=true
```

## 🐳 Docker Environment Variables

### Setting Variables in docker-compose.yml

```yaml
services:
  lexand-app-dev:
    environment:
      - NODE_ENV=development
      - API_URL=http://backend:8080/api
      - API_TIMEOUT=30000
      - ENABLE_LOGGING=true
      - LOG_LEVEL=debug
```

### Using .env File with Docker Compose

```yaml
services:
  lexand-app-dev:
    env_file:
      - .env
      - .env.local
```

### Passing Variables at Runtime

```bash
# Single variable
docker run -e NODE_ENV=production lexand-app:prod

# Multiple variables
docker run \
  -e NODE_ENV=production \
  -e API_URL=https://api.lexand.com \
  lexand-app:prod

# From file
docker run --env-file .env lexand-app:prod
```

## 🔍 Accessing Environment Variables

### In Angular Application

Environment variables are typically accessed through Angular's environment files:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: process.env["API_URL"] || "http://localhost:8080/api",
  apiTimeout: parseInt(process.env["API_TIMEOUT"] || "30000"),
  enableLogging: process.env["ENABLE_LOGGING"] === "true",
  logLevel: process.env["LOG_LEVEL"] || "info",
};
```

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: process.env["API_URL"] || "https://api.lexand.com/api",
  apiTimeout: parseInt(process.env["API_TIMEOUT"] || "30000"),
  enableLogging: false,
  logLevel: "error",
};
```

### Using Environment Variables in Services

```typescript
// src/app/services/api.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "@env/environment";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private timeout = environment.apiTimeout;

  constructor(private http: HttpClient) {}

  // Use the environment variables
}
```

## 🧪 Testing with Environment Variables

Set test-specific variables in `Dockerfile.test` or test configuration:

```typescript
// jest.config.js
module.exports = {
  // ...
  setupFiles: ["<rootDir>/setup-test-env.ts"],
};
```

```typescript
// setup-test-env.ts
process.env["NODE_ENV"] = "test";
process.env["API_URL"] = "http://localhost:8080/api";
process.env["ENABLE_LOGGING"] = "false";
```

## 📚 Additional Resources

- [Twelve-Factor App: Config](https://12factor.net/config)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [GitLab CI/CD Variables](https://docs.gitlab.com/ee/ci/variables/)

---

[← Back to Testing](TESTING.md) | [Next: Architecture →](ARCHITECTURE.md)
