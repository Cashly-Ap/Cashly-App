# Testing Guide

This guide covers testing strategies and practices for the Lexand application using Vitest as the primary testing framework.

## 🧪 Overview

The Lexand application uses **Vitest** as the testing framework. Vitest is a blazing fast unit test framework powered by Vite, providing instant feedback, native ESM support, and compatibility with Jest's API.

## 📦 Testing Setup

### Test Configuration

Vitest is configured in `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/index.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@app': '/src/app',
      '@env': '/src/environments',
    },
  },
});
```

### Dependencies

The following testing dependencies are included:

```json
{
  "devDependencies": {
    "vitest": "^2.1.8",
    "@vitest/ui": "^2.1.8",
    "@vitest/coverage-v8": "^2.1.8",
    "@analogjs/vite-plugin-angular": "^2.1.2",
    "jsdom": "^25.0.1"
  }
}
```

## 🚀 Running Tests

### Local Testing

```bash
# Run all tests once
bun test

# Run tests in watch mode (re-runs on file changes)
bun test:watch

# Run tests with coverage report
bun test:coverage

# Run tests with UI
bun test --ui

# Run specific test file
bun test customers.component.spec.ts

# Run tests matching a pattern
bun test --grep "should create"
```

### Docker Testing

```bash
# Run tests in Docker container
docker-compose --profile test up

# Run tests and exit
docker-compose --profile test run --rm lexand-app-test

# Run specific test file in Docker
docker-compose --profile test run --rm lexand-app-test bun test customers.spec.ts
```

### CI/CD Testing

```bash
# Run tests in CI mode (optimized for CI environments)
bun test --run --coverage
```

## 📝 Writing Tests

### Component Testing

Example of a component test:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomersComponent } from './customers.component';
import { CustomerService } from './customer.service';
import { of } from 'rxjs';

describe('CustomersComponent', () => {
  let component: CustomersComponent;
  let fixture: ComponentFixture<CustomersComponent>;
  let customerService: CustomerService;

  beforeEach(async () => {
    const customerServiceMock = {
      getCustomers: vi.fn(),
      createCustomer: vi.fn(),
      updateCustomer: vi.fn(),
      deleteCustomer: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CustomersComponent],
      providers: [{ provide: CustomerService, useValue: customerServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomersComponent);
    component = fixture.componentInstance;
    customerService = TestBed.inject(CustomerService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load customers on init', () => {
    const mockCustomers = [
      { id: 1, name: 'Customer 1' },
      { id: 2, name: 'Customer 2' },
    ];
    customerService.getCustomers.mockReturnValue(of(mockCustomers));

    component.ngOnInit();

    expect(customerService.getCustomers).toHaveBeenCalled();
    expect(component.customers).toEqual(mockCustomers);
  });

  it('should create customer', async () => {
    const newCustomer = { name: 'New Customer' };
    const createdCustomer = { id: 3, ...newCustomer };
    customerService.createCustomer.mockReturnValue(of(createdCustomer));

    await component.createCustomer(newCustomer);

    expect(customerService.createCustomer).toHaveBeenCalledWith(newCustomer);
    expect(component.customers).toContain(createdCustomer);
  });
});
```

### Service Testing

Example of a service test:

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CustomerService } from './customer.service';

describe('CustomerService', () => {
  let service: CustomerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CustomerService],
    });

    service = TestBed.inject(CustomerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch customers', () => {
    const mockCustomers = [
      { id: 1, name: 'Customer 1' },
      { id: 2, name: 'Customer 2' },
    ];

    service.getCustomers().subscribe((customers) => {
      expect(customers).toEqual(mockCustomers);
      expect(customers.length).toBe(2);
    });

    const req = httpMock.expectOne('/api/customers');
    expect(req.request.method).toBe('GET');
    req.flush(mockCustomers);
  });

  it('should create customer', () => {
    const newCustomer = { name: 'New Customer' };
    const createdCustomer = { id: 3, ...newCustomer };

    service.createCustomer(newCustomer).subscribe((customer) => {
      expect(customer).toEqual(createdCustomer);
    });

    const req = httpMock.expectOne('/api/customers');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newCustomer);
    req.flush(createdCustomer);
  });

  it('should handle errors', () => {
    service.getCustomers().subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpMock.expectOne('/api/customers');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });
});
```

### Guard Testing

Example of a route guard test:

```typescript
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;

  beforeEach(() => {
    const authServiceMock = {
      isAuthenticated: jest.fn(),
      getUser: jest.fn(),
    };

    const routerMock = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when authenticated', () => {
    authService.isAuthenticated.mockReturnValue(true);

    const result = guard.canActivate();

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and redirect when not authenticated', () => {
    authService.isAuthenticated.mockReturnValue(false);

    const result = guard.canActivate();

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
```

### Pipe Testing

Example of a custom pipe test:

```typescript
import { CurrencyFormatPipe } from './currency-format.pipe';

describe('CurrencyFormatPipe', () => {
  let pipe: CurrencyFormatPipe;

  beforeEach(() => {
    pipe = new CurrencyFormatPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format currency correctly', () => {
    expect(pipe.transform(1234.56)).toBe('$1,234.56');
    expect(pipe.transform(0)).toBe('$0.00');
    expect(pipe.transform(999999.99)).toBe('$999,999.99');
  });

  it('should handle null values', () => {
    expect(pipe.transform(null)).toBe('$0.00');
    expect(pipe.transform(undefined)).toBe('$0.00');
  });

  it('should support different currencies', () => {
    expect(pipe.transform(1234.56, 'EUR')).toBe('€1,234.56');
    expect(pipe.transform(1234.56, 'GBP')).toBe('£1,234.56');
  });
});
```

## 📊 Code Coverage

### Generating Coverage Reports

```bash
# Generate coverage report
bun test:coverage

# View coverage in browser
open coverage/index.html
```

### Coverage Thresholds

Configure minimum coverage thresholds in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
```

### Coverage Reports

Vitest generates several coverage report formats:

- **HTML Report**: `coverage/index.html` (viewable in browser)
- **LCOV**: `coverage/lcov.info` (for CI tools)
- **JSON**: `coverage/coverage-final.json`
- **Text**: Displayed in terminal

## 🎯 Testing Best Practices

### 1. Test Structure

Follow the AAA pattern (Arrange, Act, Assert):

```typescript
it('should do something', () => {
  // Arrange: Set up test data and mocks
  const input = 'test';
  const expected = 'TEST';

  // Act: Execute the code under test
  const result = component.toUpperCase(input);

  // Assert: Verify the results
  expect(result).toBe(expected);
});
```

### 2. Descriptive Test Names

Use clear, descriptive test names:

```typescript
// ❌ Bad
it('test 1', () => { ... });

// ✅ Good
it('should return uppercase string when given lowercase input', () => { ... });
```

### 3. One Assertion Per Test

Keep tests focused with one logical assertion:

```typescript
// ❌ Bad - Testing multiple things
it('should work', () => {
  expect(component.name).toBe('John');
  expect(component.age).toBe(30);
  expect(component.email).toBe('john@example.com');
});

// ✅ Good - Separate tests
it('should set name correctly', () => {
  expect(component.name).toBe('John');
});

it('should set age correctly', () => {
  expect(component.age).toBe(30);
});
```

### 4. Use Mocks and Spies

Mock external dependencies to isolate tests:

```typescript
// Mock service
const mockService = {
  getData: jest.fn().mockReturnValue(of({ data: 'test' })),
};

// Spy on methods
jest.spyOn(service, 'getData').mockReturnValue(of({ data: 'test' }));
```

### 5. Test Edge Cases

Always test edge cases and error conditions:

```typescript
it('should handle empty array', () => { ... });
it('should handle null values', () => { ... });
it('should handle network errors', () => { ... });
```

### 6. Clean Up After Tests

Use `afterEach` to clean up:

```typescript
afterEach(() => {
  jest.clearAllMocks();
  httpMock.verify();
});
```

## 🔧 Vitest Matchers

Common Vitest matchers (compatible with Jest):

```typescript
// Equality
expect(value).toBe(expected);
expect(value).toEqual(expected);
expect(value).not.toBe(unexpected);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3.5);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.3);

// Strings
expect(value).toMatch(/pattern/);
expect(value).toContain('substring');

// Arrays and Iterables
expect(array).toContain(item);
expect(array).toHaveLength(3);

// Objects
expect(object).toHaveProperty('key');
expect(object).toMatchObject({ key: 'value' });

// Exceptions
expect(() => {
  throw new Error('error');
}).toThrow();
expect(() => {
  throw new Error('error');
}).toThrow('error');

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();
```

## 🐛 Debugging Tests

### Running Specific Tests

```bash
# Run single test file
bun test customers.spec.ts

# Run tests matching description
bun test --grep "should create customer"

# Run tests in specific directory
bun test src/app/features/customers
```

### Debug Mode

```bash
# Run with debugging enabled
bun --inspect-brk test

# In VS Code, add launch configuration
{
  "type": "node",
  "request": "launch",
  "name": "Vitest Debug",
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["--run"],
  "console": "integratedTerminal"
}
```

### Verbose Output

```bash
# Run with verbose output
bun test --reporter=verbose

# Show individual test results
bun test --reporter=verbose --coverage=false
```

## 🔄 Continuous Integration

### GitLab CI Configuration

Example `.gitlab-ci.yml` for testing:

```yaml
test:
  stage: test
  image: oven/bun:1.3-alpine
  cache:
    paths:
      - node_modules/
  before_script:
    - bun install
  script:
    - bun test --run --coverage
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
    paths:
      - coverage/
    expire_in: 1 week
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Angular](https://angular.io/guide/testing)
- [Analog Vite Plugin Angular](https://analogjs.org/docs/packages/vite-plugin-angular/overview)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

[← Back to Docker Guide](DOCKER.md) | [Next: Environment Variables →](ENVIRONMENT.md)
