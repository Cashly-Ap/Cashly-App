# Parsun

**Parsun** is a comprehensive invoicing and business management system designed to streamline operations for businesses. It provides a cloud-based database solution where sales representatives can connect and create orders, manage inventory, track customers, and handle financial transactions.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://gitlab.com/projects-clients/parsun/parsun-app.git
cd parsun-app

# Development with Docker (recommended)
docker-compose --profile dev up

# Or local installation
bun install
bun start
```

The application will be available at `http://localhost:4200/`

## 📚 Documentation

### Getting Started
- **[Getting Started](docs/GETTING_STARTED.md)** - Installation and initial setup
- **[Docker Development](docs/DOCKER.md)** - Container setup and development
- **[Testing](docs/TESTING.md)** - Running tests with Vitest
- **[Environment Variables](docs/ENVIRONMENT.md)** - Environment configuration
- **[Architecture](docs/ARCHITECTURE.md)** - Project structure and modules

### AI Agents
Parsun uses specialized AI agents to maintain code quality, security, and documentation:

- **[🤖 Agents Overview](docs/agents/README.md)** - Integration guide for all agents
- **[🏗️ Angular Architecture](docs/agents/master-angular-architecture.md)** - Module development with TDD, SOLID, DRY, DDD
- **[📝 Master Documentation](docs/agents/master-documentation.md)** - Technical documentation specialist
- **[🔒 Master Security](docs/agents/master-security.md)** - Security auditing and compliance
- **[⚡ Master Optimization](docs/agents/master-optimization.md)** - Performance and code quality

### Module Documentation
- **[📚 Modules Index](docs/modules/README.md)** - All modules with status overview
- **[🔐 Authentication](docs/modules/auth.md)** - User authentication and authorization
- **[📊 Dashboard](docs/modules/dashboard.md)** - Dashboard and analytics
- **[👥 Customers](docs/modules/customers.md)** - Customer management with contacts
- **[📦 Products](docs/modules/products.md)** - Product catalog (simple/composite types)
- **[📍 Warehouses](docs/modules/warehouses.md)** - Warehouse and stock operations
- **[💰 Differentials](docs/modules/differentials.md)** - Price percentage adjustments

## ✨ Key Features

### System Modules

- **👥 Customer Management** - Customer database with order and invoice history
- **👤 User Management** - Authentication and role-based access control
- **📋 Order Management** - Order and quote handling convertible to invoices
- **🧾 Invoice Management** - Billing and payment tracking
- **🏷️ Product Management** - Inventory control with categories and stock
- **🏭 Warehouse Management** - Multi-warehouse stock control with transfers

## 🛠 Technology Stack

### Frontend

- **Framework**: Angular 21 (Standalone components)
- **UI Library**: PrimeNG 21
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS
- **State Management**: Signals + RxJS
- **Testing**: Vitest
- **Architecture**: Single Page Application (SPA)

### Backend

- **Language**: Java
- **Framework**: Spring
- **Database**: MySQL

### DevOps

- **CI/CD**: GitLab Pipeline
- **Cloud**: AWS
- **Containers**: Docker


---

Built with ❤️ using Angular 21 and PrimeNG 21
