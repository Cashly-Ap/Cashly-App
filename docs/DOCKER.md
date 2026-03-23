# Docker Development Guide

This guide covers Docker-based development, including the different Dockerfiles and how to use them effectively.

## 📦 Overview

The Lexand application uses Docker for consistent development, testing, and production environments. We provide three different Dockerfiles for different purposes:

- **`Dockerfile`** - Production-optimized build
- **`Dockerfile.dev`** - Development environment with hot reload
- **`Dockerfile.test`** - Testing environment with Jest

## 🏗️ Dockerfile Configurations

### Production Dockerfile (`Dockerfile`)

The production Dockerfile creates an optimized build for deployment.

```dockerfile
# Production build Dockerfile
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Install serve globally to serve static files
RUN npm install -g serve

# Copy source code
COPY . .

# Build the application for production
RUN npm run build

# Expose port 4200
EXPOSE 4200

# Serve the built application on port 4200
CMD ["serve", "-s", "dist/Lexand-App/browser", "-l", "4200", "-n"]
```

**Features:**

- Uses Alpine Linux for minimal image size
- Installs dependencies with `npm ci` for reproducible builds
- Builds the application for production
- Serves static files with the `serve` package
- Optimized for production deployment

**Build and run:**

```bash
# Build the image
docker build -t lexand-app:prod .

# Run the container
docker run -p 4200:4200 lexand-app:prod

# Or use docker-compose
docker-compose --profile prod up
```

### Development Dockerfile (`Dockerfile.dev`)

The development Dockerfile provides a hot-reload development environment.

```dockerfile
# Development Dockerfile
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code
COPY . .

# Expose port 4200 (Angular default dev server port)
EXPOSE 4200

# Start development server
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
```

**Features:**

- Includes all development dependencies
- Runs the Angular development server
- Supports hot module replacement (HMR)
- Volume mounting for live code updates
- Listens on all network interfaces (0.0.0.0)

**Build and run:**

```bash
# Using docker-compose (recommended)
docker-compose --profile dev up

# Or manually
docker build -f Dockerfile.dev -t lexand-app:dev .
docker run -p 4200:4200 -v $(pwd):/app -v /app/node_modules lexand-app:dev
```

### Test Dockerfile (`Dockerfile.test`)

The test Dockerfile is configured for running Jest tests.

```dockerfile
# Dockerfile for Testing Environment with Jest
FROM node:22.13-alpine

# Set working directory
WORKDIR /app

# Install necessary system dependencies
RUN apk add --no-cache git

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Set environment
ENV NODE_ENV=test

# Run tests with Jest
CMD ["npm", "test"]
```

**Features:**

- Includes Git for certain test dependencies
- Installs dependencies with `--legacy-peer-deps` flag
- Sets `NODE_ENV=test` for test-specific behavior
- Runs Jest test suite

**Build and run:**

```bash
# Using docker-compose
docker-compose --profile test up

# Or manually
docker build -f Dockerfile.test -t lexand-app:test .
docker run lexand-app:test
```

## 🐳 Docker Compose

The `docker-compose.yml` file orchestrates all three environments:

```yaml
services:
  # Development service
  lexand-app-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: lexand-app-dev
    ports:
      - "4200:4200"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    profiles:
      - dev
    restart: unless-stopped

  # Production service
  lexand-app-prod:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: lexand-app-prod
    ports:
      - "4200:4200"
    environment:
      - NODE_ENV=production
    profiles:
      - prod
    restart: unless-stopped

  # Test service
  lexand-app-test:
    build:
      context: .
      dockerfile: Dockerfile.test
    container_name: lexand-app-test
    ports:
      - "4200:4200"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=test
    profiles:
      - test
    command: npm test
    restart: unless-stopped
```

### Profile-Based Deployment

Docker Compose uses profiles to separate different environments:

```bash
# Development
docker-compose --profile dev up

# Production
docker-compose --profile prod up

# Testing
docker-compose --profile test up

# Multiple profiles
docker-compose --profile dev --profile test up
```

## 🚀 Common Docker Commands

### Building Images

```bash
# Build development image
docker-compose --profile dev build

# Build production image
docker-compose --profile prod build

# Build all images
docker-compose build

# Force rebuild without cache
docker-compose build --no-cache
```

### Running Containers

```bash
# Start in foreground
docker-compose --profile dev up

# Start in background (detached)
docker-compose --profile dev up -d

# Start and rebuild
docker-compose --profile dev up --build

# View logs
docker-compose logs -f lexand-app-dev
```

### Managing Containers

```bash
# Stop containers
docker-compose --profile dev stop

# Stop and remove containers
docker-compose --profile dev down

# Stop and remove containers with volumes
docker-compose --profile dev down -v

# Restart containers
docker-compose --profile dev restart
```

### Executing Commands in Containers

```bash
# Open shell in running container
docker-compose exec lexand-app-dev sh

# Run npm command
docker-compose exec lexand-app-dev npm install <package>

# View logs
docker-compose logs -f lexand-app-dev
```

## 🔍 Debugging

### Access Container Shell

```bash
# For running container
docker-compose exec lexand-app-dev sh

# For stopped container
docker run -it lexand-app:dev sh
```

### View Container Logs

```bash
# Follow logs
docker-compose logs -f lexand-app-dev

# Last 100 lines
docker-compose logs --tail=100 lexand-app-dev

# Logs for all services
docker-compose logs -f
```

### Inspect Container

```bash
# View container details
docker inspect lexand-app-dev

# View container processes
docker-compose top lexand-app-dev
```

## 🛠️ Development Workflow

### Recommended Development Setup

1. **Start development container**

```bash
docker-compose --profile dev up -d
```

2. **Watch logs**

```bash
docker-compose logs -f lexand-app-dev
```

3. **Make code changes** - Changes will be automatically detected and trigger hot reload

4. **Run tests**

```bash
docker-compose --profile test up
```

5. **Stop containers when done**

```bash
docker-compose --profile dev down
```

### Volume Mounting

The development setup uses volume mounting to enable live code updates:

```yaml
volumes:
  - .:/app # Mount source code
  - /app/node_modules # Preserve node_modules
```

This allows you to edit files on your host machine and see changes reflected immediately in the container.

## 🔧 Optimization Tips

### Reduce Image Size

- Use Alpine-based images (already implemented)
- Use multi-stage builds for production
- Minimize layers by combining RUN commands
- Use `.dockerignore` to exclude unnecessary files

### Improve Build Speed

- Order Dockerfile commands from least to most frequently changing
- Cache node_modules by copying package.json first
- Use `npm ci` instead of `npm install` for faster, reproducible builds

### Example `.dockerignore`

```
node_modules
dist
.git
.gitignore
README.md
docs
.env
.env.local
.vscode
.idea
*.log
coverage
.angular
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 4200
lsof -i :4200

# Kill the process
kill -9 <PID>

# Or change the port in docker-compose.yml
ports:
  - '4300:4200'
```

### Permission Issues

```bash
# Fix permissions
sudo chown -R $USER:$USER .

# Or run with current user
docker-compose run --user $(id -u):$(id -g) lexand-app-dev
```

### Container Won't Start

```bash
# View logs
docker-compose logs lexand-app-dev

# Remove containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

### Slow Performance on macOS/Windows

If you experience slow file system performance:

1. Consider using Docker's volume mounting alternatives
2. Use named volumes for node_modules
3. Enable VirtioFS (macOS) or WSL2 (Windows)

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Angular Docker Best Practices](https://angular.io/guide/deployment#docker)

---

[← Back to Main README](../README.md) | [Next: Testing →](TESTING.md)
