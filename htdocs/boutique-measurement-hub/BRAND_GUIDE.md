# Brand Image Integration Guide

This guide explains how to add your brand images to the Boutique Measurement Hub application.

## Image Requirements

### Logo Images
- **Format**: PNG, SVG, or JPG
- **Recommended size**: 200x60px for horizontal logos, 60x60px for square logos
- **Background**: Transparent PNG preferred
- **Color variants**: 
  - Default (colored)
  - White (for dark backgrounds)
  - Dark (for light backgrounds)

### Favicon
- **Format**: ICO, PNG, or SVG
- **Size**: 32x32px, 16x16px
- **Background**: Transparent or solid color

## File Structure

Place your brand images in the following structure:

```
public/
├── images/
│   ├── logo.png              # Default logo
│   ├── logo-white.png        # White version for dark backgrounds
│   ├── logo-dark.png         # Dark version for light backgrounds
│   ├── logo.svg              # SVG version (scalable)
│   ├── favicon.ico           # Favicon
│   ├── favicon.png           # PNG favicon
│   └── favicon.svg           # SVG favicon
├── icons/                    # PWA icons (optional)
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── screenshots/              # PWA screenshots (optional)
    ├── dashboard.png
    └── customer.png
```

## How to Add Your Images

### Step 1: Prepare Your Images
1. Create your logo in the required formats and sizes
2. Ensure they have transparent backgrounds (for PNG/SVG)
3. Test them on both light and dark backgrounds

### Step 2: Add Images to the Project
1. Copy your logo files to the `public/images/` directory
2. Name them according to the structure above
3. If you have different variants, create separate files for each

### Step 3: Update the Logo Component
Once you've added your images, you can use them by setting the `useImage` prop:

```tsx
// In your components
<Logo size="lg" variant="dark" useImage={true} />
```

### Step 4: Update HTML Meta Tags
Update the favicon references in `index.html`:

```html
<link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
<link rel="icon" type="image/png" href="/images/favicon.png" />
```

### Step 5: Update PWA Manifest
Update the `manifest.json` file with your actual icon paths:

```json
{
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## Current Implementation

The application currently uses a placeholder SVG logo. To use your actual brand images:

1. **Replace the SVG content** in `components/Logo.tsx` with your actual logo SVG path
2. **Add image files** to the `public/images/` directory
3. **Set `useImage={true}`** when using the Logo component

## Example Usage

```tsx
// Default logo (SVG)
<Logo size="lg" variant="default" />

// Using image file
<Logo size="lg" variant="dark" useImage={true} />

// Logo without text
<Logo size="md" showText={false} />

// White logo for dark backgrounds
<Logo size="xl" variant="white" useImage={true} />
```

## Best Practices

1. **Optimize images** for web use (compress PNGs, optimize SVGs)
2. **Use SVG when possible** for logos (scalable, smaller file size)
3. **Test on different backgrounds** to ensure visibility
4. **Maintain consistent branding** across all image variants
5. **Follow accessibility guidelines** (proper alt text, sufficient contrast)

## Troubleshooting

### Images not loading
- Check file paths are correct
- Ensure files are in the `public/` directory
- Verify file permissions

### Poor quality on high-DPI displays
- Use SVG format for logos
- Provide 2x resolution PNGs for raster images
- Test on different screen densities

### PWA icons not showing
- Ensure all required icon sizes are provided
- Check manifest.json paths are correct
- Clear browser cache and reinstall PWA

## Support

If you need help integrating your brand images, please:
1. Check this guide first
2. Ensure your images meet the requirements
3. Test the integration locally
4. Contact the development team if issues persist 