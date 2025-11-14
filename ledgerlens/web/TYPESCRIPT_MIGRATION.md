# TypeScript Migration Guide

## Current Status

- TypeScript configuration files are in place (`tsconfig.json`, `tsconfig.node.json`)
- TypeScript compiler is installed
- TypeScript ESLint is **not** installed yet (due to ESLint 9 compatibility)

## Why TypeScript ESLint is Not Installed

ESLint 9 requires TypeScript ESLint v8+, but we're currently using ESLint 9.39.1 which has compatibility issues with TypeScript ESLint v7.

## When Migrating to TypeScript

### Option 1: Upgrade TypeScript ESLint to v8 (Recommended)
```bash
npm install --save-dev @typescript-eslint/eslint-plugin@^8.0.0 @typescript-eslint/parser@^8.0.0
```

TypeScript ESLint v8 supports ESLint 9.

### Option 2: Downgrade ESLint to v8
```bash
npm install --save-dev eslint@^8.56.0
npm install --save-dev @typescript-eslint/eslint-plugin@^7.18.0 @typescript-eslint/parser@^7.18.0
```

This maintains compatibility with TypeScript ESLint v7.

## Migration Steps

1. **Install TypeScript ESLint** (using Option 1 above)
2. **Update ESLint config** to include TypeScript rules
3. **Convert components** from `.jsx` to `.tsx`:
   - `App.jsx` → `App.tsx`
   - `InteractiveChart.jsx` → `InteractiveChart.tsx`
   - `ChartCard.jsx` → `ChartCard.tsx`
   - `KPICard.jsx` → `KPICard.tsx`
   - `DateRangeSelector.jsx` → `DateRangeSelector.tsx`
   - `SearchableTable.jsx` → `SearchableTable.tsx`

4. **Convert hooks** from `.js` to `.ts`:
   - `useCsvData.js` → `useCsvData.ts`
   - `useTheme.js` → `useTheme.ts`
   - `useMediaQuery.js` → `useMediaQuery.ts`

5. **Add type definitions**:
   - Create `types/` directory
   - Define types for data structures
   - Define types for component props
   - Define types for hooks

6. **Fix type errors**:
   - Run `npm run build` to check for errors
   - Fix all TypeScript errors
   - Ensure strict mode is enabled

7. **Update imports**:
   - Update all import statements
   - Remove `.js`/`.jsx` extensions where needed
   - Add type imports where needed

## Type Definitions to Create

### Data Types
```typescript
// types/data.ts
export interface MonthlyData {
  ym: string;
  month_start: string;
  orders: number;
  buyers: number;
  units: number;
  revenue: number;
  revenue_prev?: number;
  revenue_mom_pct?: number;
  gross_profit: number;
  gross_profit_prev?: number;
  gross_profit_mom_pct?: number;
  gross_margin_pct: number;
  aov: number;
  aov_prev?: number;
  aov_mom_pct?: number;
  revenue_domestic: number;
  revenue_export: number;
}

export interface CountryData {
  country: string;
  orders: number;
  buyers: number;
  units: number;
  revenue: number;
  gross_profit: number;
  gross_margin_pct: number;
  aov: number;
  revenue_share: number;
}

export interface CustomerData {
  customer_id: string;
  orders: number;
  units: number;
  revenue: number;
  gross_profit: number;
  avg_order_value: number;
  first_order_date: string;
  last_order_date: string;
  active_days: number;
  revenue_per_active_month: number;
  revenue_rank: number;
}

export interface SkuData {
  sku: string;
  units: number;
  revenue: number;
  gross_profit: number;
  revenue_share: number;
  cum_share: number;
  abc_class: 'A' | 'B' | 'C';
}
```

### Component Prop Types
```typescript
// types/components.ts
export interface ChartColors {
  primary: string;
  secondary: string;
  success: string;
  error: string;
  text: string;
  textSecondary: string;
  white: string;
  border: string;
  background: string;
}

export interface InteractiveChartProps {
  type: 'line' | 'bar' | 'stackedBar' | 'horizontalBar';
  dataUrl?: string;
  data?: any[];
  title?: string;
  description?: string;
  colors?: ChartColors;
  xKey?: string;
  dataKey?: string;
  dataKeys?: Array<{
    key: string;
    name: string;
    color?: string;
    colorMap?: (value: any, entry: any) => string;
  }>;
  formatValue?: (value: any, name?: string) => string;
  height?: number;
  sortKey?: string;
  limit?: number;
  reverse?: boolean;
}
```

## ESLint Configuration for TypeScript

Once TypeScript ESLint is installed, update `eslint.config.js`:

```javascript
import { defineConfig } from 'eslint-define-config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default defineConfig({
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      project: './tsconfig.json',
    },
  },
  plugins: {
    '@typescript-eslint': typescriptEslint,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    // Add more TypeScript-specific rules
  },
});
```

## Testing TypeScript Migration

1. **Run type check**:
   ```bash
   npx tsc --noEmit
   ```

2. **Run linter**:
   ```bash
   npm run lint
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

4. **Build project**:
   ```bash
   npm run build
   ```

## Notes

- TypeScript compiler is already installed and configured
- Type definitions for React are already installed (`@types/react`, `@types/react-dom`)
- TypeScript ESLint can be added later when ready to migrate
- Current JavaScript code will continue to work without TypeScript ESLint

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript ESLint](https://typescript-eslint.io/)

