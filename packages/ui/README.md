# @digital-platform/ui

Shared UI components and styles for the Digital Platform.

## Components

This package exports the following React components:

- `ProductCard` - Card component for displaying product information
- `Layout` - Basic layout wrapper with header and footer
- `ImprovedLayout` - Enhanced layout with user menu and product dropdown
- `ProductSelector` - Standalone product selector component
- `ProductDropdown` - Dropdown menu for switching between products

## Global Styles

This package includes a centralized `globals.css` file that provides:

### Features
- Tailwind CSS base styles
- Custom CSS variables for colors, spacing, shadows, etc.
- Dark mode support
- Custom utility classes
- Form styles
- Animation utilities
- Product-specific color schemes
- Loading states
- Print styles

### Usage

Import the global styles in your app's root file (`_app.tsx` or `layout.tsx`):

```typescript
// In your _app.tsx or layout.tsx
import '@digital-platform/ui/src/styles/globals.css';
```

### Custom Utilities Available

The global CSS provides several custom utility classes:

```css
/* Text gradient */
.text-gradient

/* Glass morphism effect */
.glass
.glass-dark

/* Card hover effect */
.card-hover

/* Button styles */
.btn-primary
.btn-secondary

/* Layout helpers */
.section-padding
.container-custom

/* Loading states */
.skeleton
.skeleton-text
.skeleton-button

/* Form elements */
.form-input
.form-label
.form-error
```

### CSS Variables

Access design tokens through CSS variables:

```css
/* Colors */
var(--color-primary-500)
var(--color-secondary-500)

/* Spacing */
var(--spacing-md)
var(--spacing-lg)

/* Shadows */
var(--shadow-md)
var(--shadow-lg)

/* Border radius */
var(--radius-lg)
var(--radius-xl)

/* Z-index */
var(--z-modal)
var(--z-dropdown)
```

### Product-Specific Classes

Each product has its own color scheme:

```css
.product-platform
.product-benchmark
.product-csrd
.product-support
```

## Development

```bash
# Build the package
npm run build

# Development mode with watch
npm run dev

# Lint the code
npm run lint
```

## Adding New Styles

To add new global styles:

1. Edit `src/styles/globals.css`
2. Run `npm run build` in the UI package
3. All products will automatically use the updated styles

## Best Practices

1. **Use CSS Variables**: Prefer CSS variables over hard-coded values for consistency
2. **Utility Classes**: Create reusable utility classes in the `@layer utilities` section
3. **Dark Mode**: Always consider dark mode when adding new styles
4. **Performance**: Keep the global CSS lean - component-specific styles should stay in components
5. **Documentation**: Document any new utilities or variables you add