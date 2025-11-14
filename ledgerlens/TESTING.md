# Testing Guide

This document describes the testing setup for the LedgerLens project.

## Frontend Testing (React)

### Setup

Tests use Vitest with React Testing Library. Install dependencies:

```bash
cd web
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Component Tests**: `src/components/__tests__/`
- **Hook Tests**: `src/hooks/__tests__/`
- **Utility Tests**: `src/utils/__tests__/`

### Example Test

```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## Backend Testing (Python)

### Setup

Tests use pytest. Install dependencies:

```bash
cd py
pip install -r requirements.txt
```

### Running Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_charts.py

# Run with coverage
pytest --cov=charts --cov-report=html
```

### Test Structure

- **Test Files**: `py/tests/test_*.py`
- **Test Classes**: `Test*`
- **Test Functions**: `test_*`

### Example Test

```python
import pytest
from charts import validate_monthly_data
import pandas as pd

def test_validate_monthly_data():
    df = pd.DataFrame({
        "ym": ["2021-01"],
        "revenue": [1000],
        "gross_profit": [400],
    })
    validate_monthly_data(df)  # Should not raise
```

## Test Coverage Goals

- **Frontend**: Aim for 70%+ coverage of components and hooks
- **Backend**: Aim for 80%+ coverage of validation and data processing functions

## Continuous Integration

Tests should be run:
- Before committing code
- In CI/CD pipeline
- Before deploying to production

