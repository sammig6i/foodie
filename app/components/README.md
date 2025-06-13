# Components Organization

This directory contains all React components organized by purpose and functionality.

## Structure

```
components/
├── ui/                     # Base UI components (buttons, inputs, etc.)
├── layout/                 # Layout-related components
├── features/               # Feature-specific components
│   ├── products/          # Product management components
│   ├── data-tables/       # Data table components
│   └── charts/            # Chart and dashboard components
├── public/                # Public-facing components
├── common/                # Common utility components
└── index.ts               # Main export file
```

## Usage

### Import from specific categories:

```typescript
// Layout components
import { AppSidebar, SiteHeader } from '@/components/layout'

// Product components
import { ProductForm, AddProductDialog } from '@/components/features/products'

// UI components
import { Button, Input } from '@/components/ui/button'

// Common components
import { ThemeProvider, ModeToggle } from '@/components/common'
```

### Import from main index (recommended):

```typescript
import { AppSidebar, ProductForm, Button, ThemeProvider } from '@/components'
```

## Categories

### UI Components (`/ui`)

Base design system components that are reusable across the application:

- Buttons, inputs, forms
- Cards, badges, avatars
- Tables, sheets, dialogs
- Navigation elements

### Layout Components (`/layout`)

Components that define the application structure:

- `AppSidebar` - Main application sidebar
- `SiteHeader` - Application header
- `NavMain`, `NavUser`, `NavSecondary`, `NavDocuments` - Navigation components

### Feature Components (`/features`)

Components grouped by business functionality:

#### Products (`/features/products`)

- `ProductForm` - Form for creating/editing products
- `AddProductDialog` - Dialog for adding new products
- `EditProductSheet` - Sheet for editing existing products
- `ImageUpload` - Component for uploading product images

#### Data Tables (`/features/data-tables`)

- `DataTable` - Generic data table component
- `MenuDataTable` - Specialized table for menu management

#### Charts (`/features/charts`)

- `ChartAreaInteractive` - Interactive area chart
- `SectionCards` - Dashboard metric cards

### Public Components (`/public`)

Components used in the public-facing parts of the application:

- `MenuItemCard` - Product display card
- `CategorySidebar` - Category navigation
- `Navbar` - Public navigation bar

### Common Components (`/common`)

Utility components used throughout the application:

- `ThemeProvider` - Theme context provider
- `ModeToggle` - Dark/light mode toggle
- `DefaultCatchBoundary` - Error boundary component
- `NotFound` - 404 page component

## Guidelines

1. **Keep components focused**: Each component should have a single responsibility
2. **Use proper imports**: Import from the main index file when possible
3. **Follow naming conventions**: Use PascalCase for component names
4. **Add to index files**: When adding new components, update the appropriate index.ts file
5. **Document complex components**: Add JSDoc comments for complex props or behavior
