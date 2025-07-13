# Theme System Troubleshooting Guide

## Quick Diagnostic Checklist

When components don't respond to theme changes, check these items in order:

### 1. Tailwind Configuration

```javascript
// tailwind.config.js - Must have these exact settings
export default {
  darkMode: ["class"], // REQUIRED for class-based theme switching
  theme: {
    extend: {
      colors: {
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // ... other color tokens
      },
    },
  },
};
```

### 2. CSS Variables Definition

```css
/* app/globals.css - Must be in @layer base */
@layer base {
  :root {
    --card: 0 0% 100%; /* Light mode */
    --card-foreground: 222.2 84% 4.9%;
  }

  .dark {
    --card: 222.2 84% 4.9%; /* Dark mode */
    --card-foreground: 210 40% 98%;
  }
}
```

### 3. Component Class Usage

```typescript
// Components should use Tailwind classes that reference CSS variables
className = "bg-card text-card-foreground"; // ✅ Correct
className = "bg-white text-black"; // ❌ Wrong - hardcoded colors
```

## Common Error Patterns

### Error 1: Partial Theme Response

**Symptom**: Some components change theme, others don't
**Cause**: Missing CSS variables for specific components
**Fix**: Add all required CSS variables to globals.css

### Error 2: No Theme Response

**Symptom**: Theme toggle doesn't affect any components
**Cause**: Missing `darkMode: ["class"]` in Tailwind config
**Fix**: Add darkMode configuration to tailwind.config.js

### Error 3: Hardcoded Colors

**Symptom**: Components remain same color regardless of theme
**Cause**: Using hardcoded Tailwind colors instead of theme variables
**Fix**: Replace hardcoded colors with theme-aware classes

### Error 4: Incorrect CSS Variable Format

**Symptom**: CSS variables not recognized by Tailwind
**Cause**: Wrong HSL format in CSS variables
**Fix**: Use format `--card: 0 0% 100%;` not `--card: hsl(0, 0%, 100%);`

## Step-by-Step Debugging Process

### Step 1: Verify Tailwind Configuration

```bash
# Check if darkMode is configured
grep -n "darkMode" tailwind.config.js

# Should return: darkMode: ["class"]
```

### Step 2: Check CSS Variables

```bash
# Verify CSS variables exist
grep -n "\-\-card:" app/globals.css

# Should show both :root and .dark definitions
```

### Step 3: Inspect Component Classes

```bash
# Find components using hardcoded colors
grep -r "bg-white\|bg-gray-\|text-black\|text-white" app/
```

### Step 4: Test Theme Toggle

```javascript
// Browser console test
document.documentElement.classList.toggle("dark");
// Should visually change component backgrounds
```

## Component-Specific Fixes

### Card Components

```typescript
// Before (broken)
<div className="bg-white text-black border-gray-200">

// After (working)
<div className="bg-card text-card-foreground border-border">
```

### Button Components

```typescript
// Before (broken)
<button className="bg-blue-500 text-white">

// After (working)
<button className="bg-primary text-primary-foreground">
```

### Input Components

```typescript
// Before (broken)
<input className="bg-white border-gray-300 text-black">

// After (working)
<input className="bg-background border-input text-foreground">
```

## Required CSS Variables Reference

### Complete Minimal Set

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
  }
}
```

## Testing Procedures

### Manual Testing

1. Toggle theme using theme switcher
2. Verify all card backgrounds change color
3. Check text remains readable in both themes
4. Test all interactive elements (buttons, inputs, etc.)

### Automated Testing

```javascript
// Jest test example
describe("Theme System", () => {
  it("should apply dark mode classes", () => {
    document.documentElement.classList.add("dark");
    const card = document.querySelector(".bg-card");
    const computedStyle = getComputedStyle(card);
    expect(computedStyle.backgroundColor).toBe("hsl(222.2, 84%, 4.9%)");
  });
});
```

## Prevention Strategies

### 1. Theme-First Development

- Set up complete theme system before building components
- Use theme-aware classes from the start
- Never use hardcoded colors in components

### 2. Component Guidelines

- Always use CSS variables for colors
- Test theme switching during component development
- Document theme requirements for custom components

### 3. Code Review Checklist

- [ ] All color classes use theme variables
- [ ] CSS variables defined for both light and dark modes
- [ ] Tailwind config includes all required color tokens
- [ ] Theme toggle tested and working

## Recovery Procedures

### If Theme System Breaks

1. Check recent changes to tailwind.config.js
2. Verify CSS variables are still defined
3. Look for components using hardcoded colors
4. Test theme toggle functionality
5. Check browser console for CSS errors

### Emergency Reset

```bash
# Restore working theme configuration
git checkout HEAD -- tailwind.config.js app/globals.css
```

## Advanced Debugging

### Browser DevTools

1. Open Elements panel
2. Check if `dark` class is present on `<html>` element
3. Inspect CSS variables in Computed styles
4. Verify component classes resolve to correct colors

### CSS Variable Inspection

```javascript
// Browser console
const style = getComputedStyle(document.documentElement);
console.log("Card color:", style.getPropertyValue("--card"));
```

## Documentation Requirements

### For Each Theme Issue

1. Document the specific symptoms
2. Record the root cause
3. Detail the exact fix applied
4. Add prevention measures
5. Update this troubleshooting guide

### For New Components

1. List required CSS variables
2. Provide theme-aware class examples
3. Include testing procedures
4. Document any special considerations

## Contact and Escalation

If theme issues persist after following this guide:

1. Document all attempted fixes
2. Provide screenshots of the issue
3. Include browser console errors
4. Check if similar issues are documented in project history
5. Consider architectural review of theme implementation

## Maintenance Schedule

### Weekly

- Test theme switching across all pages
- Check for new hardcoded colors in recent commits
- Verify CSS variables are complete

### Monthly

- Review theme system documentation
- Update troubleshooting guide with new patterns
- Check for theme-related issues in user feedback

### Per Release

- Full theme system regression testing
- Documentation review and updates
- Performance impact assessment
