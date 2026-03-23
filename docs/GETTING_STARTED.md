# Getting Started

This guide will help you set up and run the Lexand application on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v22 or higher ([Download](https://nodejs.org/))
- **Bun** v1.3 or higher ([Download](https://bun.sh/))
- **Docker** and **Docker Compose** (optional, but recommended for development)
- **Git** for version control

### Verify Installation

```bash
node --version  # Should be v22 or higher
bun --version   # Should be v1.3 or higher
docker --version
docker-compose --version
```

## 🚀 Installation

### Option 1: Docker Development (Recommended)

This is the recommended approach as it provides a consistent development environment.

1. **Clone the repository**

```bash
git clone https://gitlab.com/projects-clients/lexand/lexand-app.git
cd lexand-app
```

2. **Start the development environment**

```bash
docker-compose --profile dev up
```

3. **Access the application**

Open your browser and navigate to `http://localhost:4200/`

The application will automatically reload when you make changes to the source files.

### Option 2: Local Development

If you prefer to run the application directly on your machine:

1. **Clone the repository**

```bash
git clone https://gitlab.com/projects-clients/lexand/lexand-app.git
cd lexand-app
```

2. **Install dependencies**

```bash
bun install
```

3. **Set up environment variables**

Create a `.env` file in the root directory (see [Environment Variables](ENVIRONMENT.md) for details):

```bash
cp .env.example .env
```

4. **Start the development server**

```bash
bun start
```

5. **Access the application**

Open your browser and navigate to `http://localhost:4200/`

## 🏗️ Project Structure

```
lexand-app/
├── src/
│   ├── app/
│   │   ├── components/          # Shared components
│   │   ├── guards/              # Route guards
│   │   ├── interceptors/        # HTTP interceptors
│   │   ├── services/            # Shared services
│   │   ├── directives/          # Custom directives
│   │   ├── pipes/               # Custom pipes
│   │   └── features/            # Feature modules
│   │       ├── customers/
│   │       ├── users/
│   │       ├── orders/
│   │       ├── invoices/
│   │       ├── products/
│   │       └── warehouses/
│   ├── main.ts
│   ├── styles.css
│   └── index.html
├── docs/                        # Documentation
├── public/                      # Static assets
├── Dockerfile                   # Production Docker image
├── Dockerfile.dev              # Development Docker image
├── Dockerfile.test             # Testing Docker image
├── docker-compose.yml          # Docker Compose configuration
├── angular.json                # Angular configuration
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

## 🛠️ Available Scripts

### Development

```bash
bun start                    # Start development server
bun run watch               # Build with watch mode
```

### Building

```bash
bun run build               # Build for production
```

### Testing

```bash
bun test                    # Run tests with Vitest
bun test:watch              # Run tests in watch mode
bun test:coverage           # Run tests with coverage
```

### Server-Side Rendering

```bash
bun run build:ssr           # Build SSR version
bun run serve:ssr:Lexand   # Serve SSR application
```

## 🔧 IDE Setup

### Visual Studio Code (Recommended)

Install the following extensions for the best development experience:

- **Angular Language Service** - Angular IntelliSense
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Docker** - Docker file support
- **GitLens** - Git supercharged

### Recommended VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## 🐛 Troubleshooting

### Port Already in Use

If port 4200 is already in use:

```bash
# Kill the process using port 4200
lsof -i :4200
kill -9 <PID>

# Or use a different port
bun x ng serve --port 4300
```

### Dependency Issues

If you encounter dependency issues:

```bash
# Remove node_modules and lock file
rm -rf node_modules bun.lockb

# Reinstall dependencies
bun install
```

### Docker Issues

If Docker containers fail to start:

```bash
# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild and start
docker-compose --profile dev up --build
```

## 📚 Next Steps

- Read about [Docker Development](DOCKER.md) for container-based development
- Learn about [Testing](TESTING.md) strategies
- Configure [Environment Variables](ENVIRONMENT.md)
- Understand the [Architecture](ARCHITECTURE.md)
- Set up [Deployment](DEPLOYMENT.md) pipelines

## 🆘 Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review the detailed documentation in the `docs/` folder
3. Contact the project maintainers

---

[← Back to Main README](../README.md)
