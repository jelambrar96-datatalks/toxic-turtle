# Game Backend Testing Documentation

## Overview

Comprehensive test suite for the Toxic Turtle game backend, covering all game progression logic, certificate management, and level access control.

## Test Coverage

### Progress Tests
- ✅ `test_get_current_level_no_progress` - Get current level when user has no progress
- ✅ `test_get_current_level_with_progress` - Get current level when user has passed levels
- ✅ `test_pass_level_success` - Successfully pass a level
- ✅ `test_pass_level_duplicate` - Prevent passing same level twice
- ✅ `test_pass_level_requires_previous_levels` - Enforce level progression (cannot skip levels)
- ✅ `test_pass_level_sequential` - Pass multiple levels in order
- ✅ `test_pass_level_invalid_level` - Reject invalid level numbers
- ✅ `test_check_pass_all_levels_false` - Check when not all levels passed
- ✅ `test_check_pass_all_levels_true` - Check when all levels passed

### Certificate Tests
- ✅ `test_register_certificate_success` - Successfully register a certificate
- ✅ `test_register_certificate_duplicate` - Prevent duplicate certificates
- ✅ `test_get_certified_data_empty` - Get certificates when none exist
- ✅ `test_get_certified_data_with_certificates` - Get list of certificates
- ✅ `test_check_if_certified_exist_true` - Check certificate existence (exists)
- ✅ `test_check_if_certified_exist_false` - Check certificate existence (not exists)

### Level Access Control Tests
- ✅ `test_get_level_data_success` - Access level 1 (always available)
- ✅ `test_get_level_data_requires_progression` - Cannot access level 2 without level 1
- ✅ `test_get_level_data_after_progression` - Can access level 2 after passing level 1
- ✅ `test_get_level_data_invalid_level` - Reject invalid level numbers

### Summary Tests
- ✅ `test_user_progress_summary` - Get comprehensive user progress summary

## Running Tests

### Run All Tests
```bash
pytest backend/test/test_game.py -v
```

### Run Specific Test
```bash
pytest backend/test/test_game.py::test_pass_level_success -v
```

### Run Tests with Coverage
```bash
pytest backend/test/test_game.py --cov=src.routes --cov-report=html -v
```

### Using the Test Runner Script
```bash
chmod +x run_tests.sh
./run_tests.sh
```

## Test Setup

### Fixtures (conftest.py)
- `test_engine` - Creates isolated test database
- `test_db_session` - Provides test database session
- `authenticated_user` - Creates test user
- `mock_authenticated_user` - Mocks authenticated user for routes

### Key Test Dependencies
- `pytest` - Test framework
- `pytest-asyncio` - Async test support
- `httpx` - Async HTTP client
- `sqlalchemy` - Database ORM

## Test Database

Tests use an in-memory SQLite database (`sqlite+aiosqlite:///:memory:`) for:
- Fast execution
- Complete isolation between tests
- Automatic cleanup

## Expected Test Results

All 22 tests should pass:
```
test_game.py::test_get_current_level_no_progress PASSED
test_game.py::test_get_current_level_with_progress PASSED
test_game.py::test_pass_level_success PASSED
test_game.py::test_pass_level_duplicate PASSED
test_game.py::test_pass_level_requires_previous_levels PASSED
test_game.py::test_pass_level_sequential PASSED
test_game.py::test_pass_level_invalid_level PASSED
test_game.py::test_check_pass_all_levels_false PASSED
test_game.py::test_check_pass_all_levels_true PASSED
test_game.py::test_register_certificate_success PASSED
test_game.py::test_register_certificate_duplicate PASSED
test_game.py::test_get_certified_data_empty PASSED
test_game.py::test_get_certified_data_with_certificates PASSED
test_game.py::test_check_if_certified_exist_true PASSED
test_game.py::test_check_if_certified_exist_false PASSED
test_game.py::test_get_level_data_success PASSED
test_game.py::test_get_level_data_requires_progression PASSED
test_game.py::test_get_level_data_after_progression PASSED
test_game.py::test_get_level_data_invalid_level PASSED
test_game.py::test_user_progress_summary PASSED

======================== 20 passed in X.XXs ========================
```

## Key Test Scenarios

### 1. Level Progression Enforcement
Tests verify that:
- Users can only play level N if all levels 1 to N-1 are passed
- Attempting to skip levels returns 403 Forbidden
- First level can always be accessed

### 2. Duplicate Prevention
Tests verify that:
- Users cannot pass the same level twice
- Users cannot register the same certificate twice
- Appropriate error codes returned (400 for level, 409 for certificate)

### 3. Data Validation
Tests verify that:
- Invalid level numbers are rejected with 400 Bad Request
- Level data is correctly formatted
- Timestamps are properly recorded

### 4. Access Control
Tests verify that:
- All endpoints require authentication
- Users only see their own data
- Authenticated user dependency is properly enforced

## Troubleshooting

### Import Errors
Ensure you're running from the backend directory:
```bash
cd backend
pytest test/test_game.py -v
```

### Database Errors
Tests use in-memory database, so no external setup needed. If issues persist:
```bash
# Clear any existing test artifacts
rm -f *.db
pytest test/test_game.py -v
```

### Async Test Issues
Ensure `pytest-asyncio` is installed:
```bash
pip install pytest-asyncio
```

## CI/CD Integration

To integrate into CI/CD pipeline:
```yaml
# Example: GitHub Actions
- name: Run game backend tests
  run: |
    cd backend
    pytest test/test_game.py -v --tb=short
```



# Frontend Test Scripts Documentation

## Overview

This document explains all testing scripts and test utilities for the Toxic Turtle frontend application.

## Table of Contents

1. [Test Infrastructure Setup](#test-infrastructure-setup)
2. [Test Files Overview](#test-files-overview)
3. [Running Tests](#running-tests)
4. [Test Utilities](#test-utilities)
5. [Coverage Goals](#coverage-goals)
6. [CI/CD Integration](#cicd-integration)

---

## Test Infrastructure Setup

### Files Created

#### 1. `src/setupTests.js`
**Purpose:** Jest configuration that runs before all tests

**Features:**
- Imports `@testing-library/jest-dom` matchers
- Mocks `localStorage` API
- Mocks `HTMLCanvasElement` and Canvas API
- Mocks Web Audio API for sound effects
- Mocks `window.matchMedia` for responsive design tests
- Mocks `window.scrollTo`
- Suppresses irrelevant console warnings

**Usage:** Automatically loaded by Jest before tests run

#### 2. `src/testUtils.js`
**Purpose:** Shared test utilities and helper functions

**Exported Functions:**
```javascript
// Render with React Router context
renderWithRouter(component, options)

// Mock fetch responses
mockFetch(data, status)

// LocalStorage helpers
setLocalStorage(key, value)
getLocalStorage(key)

// Factory functions for mock data
createMockUser(overrides)
createMockLevel(level, overrides)
createMockProgress(overrides)
createMockCanvasContext()
createMockAPI()

// Async helpers
waitFor(ms)
```

---

## Test Files Overview

### 1. API Tests: `src/__tests__/api.test.js`
**Coverage:** Authentication, game API, and certificate API

**Test Suites:**
- **authAPI.register** - User registration with various scenarios
- **authAPI.login** - Login functionality and error handling
- **Token Management** - Token storage and retrieval
- **gameAPI** - Level data fetching and progress updates
- **certificateAPI** - Certificate operations

**Total Tests:** 15+

**Key Scenarios:**
- Successful registration/login
- Duplicate email handling
- Invalid credentials
- Missing authentication tokens
- Level data fetching
- Progress updates
- Certificate registration and retrieval

### 2. Login Page Tests: `src/__tests__/LoginPage.test.js`
**Coverage:** Login page components and user interactions

**Test Suites:**
- Page rendering and form display
- Button enable/disable logic
- Form submission and validation
- Error handling and messages
- Loading states

**Total Tests:** 7+

**Key Scenarios:**
- Form loads correctly
- Submit button disabled until fields filled
- Successful login with valid credentials
- Error message on invalid credentials
- Error message cleared when user modifies input
- Loading state during submission

### 3. Home Page Tests: `src/__tests__/HomePage.test.js`
**Coverage:** Home page rendering, level grid, and navigation

**Test Suites:**
- Page rendering and header display
- Current level information
- Level grid display
- Trophy button visibility
- Loading and error states
- Logout functionality

**Total Tests:** 10+

**Key Scenarios:**
- Page title displays
- Current level shows correctly
- Level grid renders all levels
- First level unlocked by default
- Trophy button only shows when all levels complete
- Logout button functional
- Error handling with retry

### 4. Game Page Tests: `src/__tests__/GamePage.test.js`
**Coverage:** Game mechanics, canvas, keyboard controls, level progression

**Test Suites:**
- Page rendering and canvas initialization
- Code viewer display
- Keyboard input handling (space, arrows)
- Level completion logic
- Error handling

**Total Tests:** 10+

**Key Scenarios:**
- Canvas renders with correct dimensions
- Code displays with line numbers
- Space key moves turtle forward
- Arrow keys rotate turtle
- Correct input advances cursor
- Incorrect input is rejected
- Level completion shows message
- API errors handled gracefully

### 5. Certificate Page Tests: `src/__tests__/CertificatePage.test.js`
**Coverage:** Certificate generation, display, and repeat visits

**Test Suites:**
- First visit (no certificate) flow
- Repeat visit (certificate exists) flow
- Certificate display and styling
- Error handling
- Navigation

**Total Tests:** 12+

**Key Scenarios:**
- Name input modal shows on first visit
- Input field auto-focused
- Certificate generates on submit
- Certificate auto-downloads on repeat visit
- Purple gradient background displays
- Emojis display correctly
- Error messages show on failure
- Download button present

---

## Running Tests

### Automated Test Runner: `scripts/test.sh`

**Usage:**
```bash
chmod +x scripts/test.sh
./scripts/test.sh [options]
```

**Options:**
```bash
--watch       # Watch mode (reruns on file changes)
--coverage    # Generate coverage report
--ci          # CI mode (no watch, strict checking)
--e2e         # Run end-to-end tests
--lighthouse  # Run Lighthouse audit
--all         # Run all tests including Lighthouse and E2E
```

**Examples:**
```bash
# Run standard tests
./scripts/test.sh

# Run with coverage report
./scripts/test.sh --coverage

# Watch mode for development
./scripts/test.sh --watch

# CI pipeline (strict, with coverage)
./scripts/test.sh --ci

# Full test suite including Lighthouse
./scripts/test.sh --all
```

**Test Pipeline:**
1. Unit & Integration Tests
2. Build Process Test
3. Lighthouse Audit (if requested)
4. E2E Tests (if requested)
5. Security Check (npm audit)

### Manual Testing: `scripts/manual-test.sh`

**Usage:**
```bash
chmod +x scripts/manual-test.sh
./scripts/manual-test.sh
```

**Features:**
- Interactive checklist mode
- 15+ test categories
- 60+ individual test items
- Pass/fail tracking
- Percentage calculation

**Categories:**
1. Authentication Flow (9 tests)
2. Home Page (9 tests)
3. Game Page (12 tests)
4. Certificate Page (8 tests)
5. Responsive Design (7 tests)
6. Error Handling (3 tests)
7. Edge Cases & Performance (6 tests)

**Output:**
- Total tests run
- Pass/fail counts
- Pass percentage
- Recommendations

---

## Test Utilities

### Using `testUtils.js`

#### Example: Render with Router
```javascript
import { renderWithRouter } from '../../testUtils';
import HomePage from '../../pages/HomePage';

test('HomePage renders', () => {
  const { screen } = renderWithRouter(<HomePage />);
  expect(screen.getByText(/Toxic Turtle/)).toBeInTheDocument();
});
```

#### Example: Mock API
```javascript
import { mockFetch } from '../../testUtils';

global.fetch = jest.fn(() => 
  mockFetch({ user: 'John' }, 200)
);
```

#### Example: Create Mock Data
```javascript
import { 
  createMockUser, 
  createMockLevel, 
  createMockProgress 
} from '../../testUtils';

const user = createMockUser({ email: 'custom@example.com' });
const level = createMockLevel(2, { description: 'Custom level' });
const progress = createMockProgress({ all_levels_passed: true });
```

### Mock API Structure

```javascript
{
  authAPI: {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  },
  gameAPI: {
    getCurrentLevel: jest.fn(),
    getLevelData: jest.fn(),
    updateProgress: jest.fn(),
    checkPassAllLevel: jest.fn(),
  },
  certificateAPI: {
    checkIfCertificateExist: jest.fn(),
    getCertificateData: jest.fn(),
    registerCertificate: jest.fn(),
  },
  getAuthToken: jest.fn(),
  setAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
}
```

---

## Coverage Goals

### Target Coverage Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Statements | 80%+ | In Progress |
| Branches | 75%+ | In Progress |
| Functions | 80%+ | In Progress |
| Lines | 80%+ | In Progress |

### Coverage Report

```bash
./scripts/test.sh --coverage
# Report generated in: ./coverage/lcov-report/index.html
```

### Coverage by Component

**Expected Coverage:**
- `api.js` - 95%+ (all API calls tested)
- `pages/` - 80%+ (main flows tested)
- `components/` - 75%+ (UI components tested)
- `setupTests.js` - 100% (no logic to cover)

---

## CI/CD Integration

### GitHub Actions Integration

**In Jenkinsfile/CI Pipeline:**

```groovy
stage('Run Tests - Frontend') {
  steps {
    dir('frontend') {
      sh 'npm install'
      sh 'npm test -- --ci --coverage --watchAll=false'
      sh 'npm run build'
    }
  }
  post {
    always {
      junit 'frontend/test-results.xml'
      publishHTML([
        reportDir: 'frontend/coverage',
        reportFiles: 'index.html',
        reportName: 'Frontend Coverage'
      ])
    }
  }
}
```

### Environment Variables

**For CI Testing:**
```bash
export REACT_APP_API_URL=http://localhost:8000
export CI=true
export COVERAGE=true
```

### Test Artifacts

- **JUnit XML:** `test-results.xml` (for CI dashboards)
- **Coverage Reports:** `coverage/lcov.info` (for coverage tracking)
- **HTML Reports:** `coverage/lcov-report/index.html` (for viewing)
- **Lighthouse Report:** `lighthouse-report.html` (if audit run)

---

## Test Execution Timeline

### Development Phase
```bash
npm test --watch    # Continuous testing during development
```

### Pre-Commit
```bash
npm test --ci       # Verify all tests pass
```

### Pre-Deployment (Local)
```bash
./scripts/test.sh --all  # Full test suite with Lighthouse
```

### CI Pipeline
```bash
npm test -- --ci --coverage  # With coverage reporting
```

---

## Troubleshooting

### Common Issues

**Issue:** Tests timeout
```bash
# Solution: Increase Jest timeout
jest.setTimeout(10000);
```

**Issue:** Canvas tests fail
```bash
# Ensure setupTests.js is loaded
# Check: jest.config.js has setupFilesAfterEnv: ['<rootDir>/src/setupTests.js']
```

**Issue:** localStorage errors
```bash
# Solution: Clear before each test
beforeEach(() => {
  localStorage.clear();
});
```

**Issue:** API mock not working
```bash
// Make sure to mock BEFORE importing component
jest.mock('../../api');
import Component from '../../Component';
```

---

## Best Practices

### Writing New Tests

1. **Use descriptive test names:**
   ```javascript
   it('should validate email format before submission')
   it('should show error message on API failure')
   ```

2. **Test user behavior, not implementation:**
   ```javascript
   // Good
   await user.click(button);
   expect(screen.getByText('Success')).toBeInTheDocument();

   // Bad
   component.setState({ submitted: true });
   ```

3. **Use test utilities:**
   ```javascript
   import { renderWithRouter, createMockUser } from '../../testUtils';
   ```

4. **Mock external dependencies:**
   ```javascript
   jest.mock('../../api');
   api.gameAPI.getLevelData.mockResolvedValueOnce({...});
   ```

### Test Organization

```
src/
  __tests__/
    api.test.js              # API module tests
    LoginPage.test.js        # Page component tests
    HomePage.test.js
    GamePage.test.js
    CertificatePage.test.js
  setupTests.js              # Jest configuration
  testUtils.js               # Shared utilities
```

---

## Maintenance

### Updating Tests

When making changes to components:

1. Update relevant test file
2. Run `npm test --watch` to verify
3. Run `./scripts/test.sh --ci` before commit
4. Check coverage doesn't decrease

### Monitoring

```bash
# Track coverage over time
npm test -- --coverage --json > coverage.json

# Generate historical report
npm test -- --coverage --coverageReporters=text-summary
```

---

## Additional Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)
- [TESTING.md](../TESTING.md) - Manual testing checklist

