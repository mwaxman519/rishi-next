# Cannabis Booking Management - Design System

## Visual Identity & Brand Guidelines

### Cannabis Industry Color Psychology

The design system embraces the professional evolution of the cannabis industry while maintaining trust, compliance, and sophistication.

```typescript
interface CannabisColorSystem {
  // Primary Brand Colors - Professional Cannabis Green Palette
  primary: {
    50: "#f0fdf4"; // Lightest green for backgrounds
    100: "#dcfce7"; // Light green for hover states
    200: "#bbf7d0"; // Soft green for secondary elements
    300: "#86efac"; // Medium light green
    400: "#4ade80"; // Main green for accents
    500: "#22c55e"; // Primary brand green
    600: "#16a34a"; // Darker green for text
    700: "#15803d"; // Dark green for headings
    800: "#166534"; // Very dark green
    900: "#14532d"; // Deepest green for high contrast
  };

  // Secondary Earth Tones - Natural Cannabis Palette
  secondary: {
    50: "#fefce8"; // Light amber
    100: "#fef3c7"; // Soft gold
    200: "#fde68a"; // Light golden
    300: "#fcd34d"; // Medium golden
    400: "#f59e0b"; // Golden amber
    500: "#d97706"; // Deep amber
    600: "#b45309"; // Bronze
    700: "#92400e"; // Dark bronze
    800: "#78350f"; // Deep brown
    900: "#451a03"; // Darkest brown
  };

  // Cannabis Product Category Colors
  cannabisProducts: {
    flower: "#8b5cf6"; // Purple for flower products
    edibles: "#f59e0b"; // Orange for edibles
    concentrates: "#eab308"; // Yellow for concentrates
    topicals: "#06b6d4"; // Cyan for topicals
    beverages: "#3b82f6"; // Blue for beverages
    accessories: "#6b7280"; // Gray for accessories
  };

  // Compliance Status Colors
  compliance: {
    approved: "#10b981"; // Green for approved
    pending: "#f59e0b"; // Amber for pending
    rejected: "#ef4444"; // Red for rejected
    expired: "#6b7280"; // Gray for expired
    warning: "#f97316"; // Orange for warnings
  };

  // Booking Status Colors
  bookingStatus: {
    requested: "#3b82f6"; // Blue
    underReview: "#8b5cf6"; // Purple
    pendingApproval: "#f59e0b"; // Amber
    approved: "#10b981"; // Green
    staffAssignment: "#06b6d4"; // Cyan
    confirmed: "#22c55e"; // Primary green
    inProgress: "#84cc16"; // Lime
    completed: "#059669"; // Emerald
    finalized: "#047857"; // Dark emerald
    cancelled: "#dc2626"; // Red
    onHold: "#6b7280"; // Gray
  };
}
```

### Typography System

```typescript
interface CannabisTypographySystem {
  // Font Families
  fontFamily: {
    primary: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "sans-serif",
    ];

    secondary: ["JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"];

    display: ["Cal Sans", "Inter", "system-ui", "sans-serif"];
  };

  // Font Sizes - Optimized for cannabis industry readability
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }]; // 12px - Small labels
    sm: ["0.875rem", { lineHeight: "1.25rem" }]; // 14px - Body text
    base: ["1rem", { lineHeight: "1.5rem" }]; // 16px - Default text
    lg: ["1.125rem", { lineHeight: "1.75rem" }]; // 18px - Large text
    xl: ["1.25rem", { lineHeight: "1.75rem" }]; // 20px - Subheadings
    "2xl": ["1.5rem", { lineHeight: "2rem" }]; // 24px - Headings
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }]; // 30px - Large headings
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }]; // 36px - Display text
    "5xl": ["3rem", { lineHeight: "1" }]; // 48px - Hero text
    "6xl": ["3.75rem", { lineHeight: "1" }]; // 60px - Large display
  };

  // Font Weights
  fontWeight: {
    thin: 100;
    extralight: 200;
    light: 300;
    normal: 400;
    medium: 500;
    semibold: 600;
    bold: 700;
    extrabold: 800;
    black: 900;
  };

  // Letter Spacing
  letterSpacing: {
    tighter: "-0.05em";
    tight: "-0.025em";
    normal: "0em";
    wide: "0.025em";
    wider: "0.05em";
    widest: "0.1em";
  };
}
```

### Component Design Tokens

#### Booking Status Components

```typescript
interface BookingStatusDesign {
  // Status Badge Component
  statusBadge: {
    base: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-200";

    variants: {
      requested: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
      underReview: "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800";
      pendingApproval: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800";
      approved: "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
      staffAssignment: "bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800";
      confirmed: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800";
      inProgress: "bg-lime-50 text-lime-700 border border-lime-200 dark:bg-lime-900/20 dark:text-lime-300 dark:border-lime-800 animate-pulse-subtle";
      completed: "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800";
      finalized: "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700";
      cancelled: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      onHold: "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
    };

    animations: {
      inProgress: "animate-pulse-subtle";
      pending: "animate-fade-in-out";
      updated: "animate-highlight-flash";
    };
  };

  // Status Timeline Component
  statusTimeline: {
    container: "relative";
    step: {
      base: "relative flex items-start group";
      completed: "text-green-600 dark:text-green-400";
      current: "text-blue-600 dark:text-blue-400";
      upcoming: "text-gray-400 dark:text-gray-600";
    };

    connector: {
      base: "absolute left-4 top-4 -bottom-6 w-0.5";
      completed: "bg-green-500";
      upcoming: "bg-gray-300 dark:bg-gray-700";
    };

    icon: {
      base: "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2";
      completed: "bg-green-500 border-green-500 text-white";
      current: "bg-blue-500 border-blue-500 text-white animate-pulse-ring";
      upcoming: "bg-white border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600";
    };
  };
}
```

#### Cannabis Product Components

```typescript
interface CannabisProductDesign {
  // Product Category Badge
  productBadge: {
    base: "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium";

    variants: {
      flower: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300";
      edibles: "bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300";
      concentrates: "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300";
      topicals: "bg-cyan-100 text-cyan-800 border border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300";
      beverages: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300";
      accessories: "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-900/30 dark:text-gray-300";
    };
  };

  // THC/CBD Level Indicators
  potencyIndicator: {
    container: "flex items-center space-x-2";

    thcLevel: {
      low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    };

    cbdLevel: {
      none: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      medium: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
      high: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    };
  };

  // Compliance Status Indicator
  complianceIndicator: {
    approved: "flex items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md";
    pending: "flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md";
    rejected: "flex items-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md";
    expired: "flex items-center text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 px-2 py-1 rounded-md";
  };
}
```

### Dark Mode Implementation

#### Theme Switching Infrastructure

```typescript
interface DarkModeDesign {
  // CSS Custom Properties for Theme Variables
  lightTheme: {
    "--background": "0 0% 100%"; // Pure white
    "--foreground": "224 71.4% 4.1%"; // Dark blue-gray
    "--card": "0 0% 100%"; // White cards
    "--card-foreground": "224 71.4% 4.1%"; // Dark text on cards
    "--popover": "0 0% 100%"; // White popovers
    "--popover-foreground": "224 71.4% 4.1%"; // Dark text in popovers
    "--primary": "142.1 76.2% 36.3%"; // Cannabis green
    "--primary-foreground": "355.7 100% 97.3%"; // White text on primary
    "--secondary": "220 14.3% 95.9%"; // Light gray
    "--secondary-foreground": "220.9 39.3% 11%"; // Dark text on secondary
    "--muted": "220 14.3% 95.9%"; // Muted background
    "--muted-foreground": "220 8.9% 46.1%"; // Muted text
    "--accent": "220 14.3% 95.9%"; // Accent background
    "--accent-foreground": "220.9 39.3% 11%"; // Accent text
    "--destructive": "0 84.2% 60.2%"; // Red for destructive actions
    "--destructive-foreground": "210 20% 98%"; // White text on destructive
    "--border": "220 13% 91%"; // Border color
    "--input": "220 13% 91%"; // Input background
    "--ring": "142.1 76.2% 36.3%"; // Focus ring color
    "--radius": "0.5rem"; // Border radius

    // Cannabis-specific light mode colors
    "--cannabis-primary": "142.1 76.2% 36.3%"; // Primary green
    "--cannabis-secondary": "45 93.4% 47.5%"; // Golden amber
    "--cannabis-accent": "262.1 83.3% 57.8%"; // Purple
    "--compliance-success": "142.1 70.6% 45.3%"; // Success green
    "--compliance-warning": "32.2 94.6% 43.7%"; // Warning orange
    "--compliance-error": "0 84.2% 60.2%"; // Error red
  };

  darkTheme: {
    "--background": "224 71.4% 4.1%"; // Dark blue-gray
    "--foreground": "210 20% 98%"; // Off-white
    "--card": "224 71.4% 4.1%"; // Dark cards
    "--card-foreground": "210 20% 98%"; // Light text on cards
    "--popover": "224 71.4% 4.1%"; // Dark popovers
    "--popover-foreground": "210 20% 98%"; // Light text in popovers
    "--primary": "142.1 70.6% 45.3%"; // Slightly darker cannabis green
    "--primary-foreground": "144.9 80.4% 10%"; // Dark text on primary
    "--secondary": "215 27.9% 16.9%"; // Dark gray
    "--secondary-foreground": "210 20% 98%"; // Light text on secondary
    "--muted": "215 27.9% 16.9%"; // Muted dark background
    "--muted-foreground": "217.9 10.6% 64.9%"; // Muted light text
    "--accent": "215 27.9% 16.9%"; // Accent dark background
    "--accent-foreground": "210 20% 98%"; // Light accent text
    "--destructive": "0 62.8% 30.6%"; // Dark red
    "--destructive-foreground": "210 20% 98%"; // Light text on destructive
    "--border": "215 27.9% 16.9%"; // Dark border
    "--input": "215 27.9% 16.9%"; // Dark input background
    "--ring": "142.4 71.8% 29.2%"; // Darker focus ring
    "--radius": "0.5rem"; // Border radius

    // Cannabis-specific dark mode colors
    "--cannabis-primary": "142.4 71.8% 29.2%"; // Darker green
    "--cannabis-secondary": "45 93.4% 47.5%"; // Golden amber (same)
    "--cannabis-accent": "262.1 83.3% 57.8%"; // Purple (same)
    "--compliance-success": "142.1 70.6% 45.3%"; // Success green
    "--compliance-warning": "32.2 94.6% 43.7%"; // Warning orange
    "--compliance-error": "0 84.2% 60.2%"; // Error red
  };

  // Smooth transition for theme switching
  themeTransition: {
    properties: [
      "background-color",
      "border-color",
      "color",
      "fill",
      "stroke",
      "box-shadow",
    ];
    duration: "200ms";
    timing: "cubic-bezier(0.4, 0, 0.2, 1)";
  };
}
```

#### Component Dark Mode Variants

```typescript
interface ComponentDarkModeVariants {
  // Booking Card Dark Mode
  bookingCard: {
    light: "bg-white border-gray-200 shadow-sm hover:shadow-md";
    dark: "bg-gray-900 border-gray-800 shadow-sm hover:shadow-lg hover:shadow-green-500/10";
  };

  // Status Badge Dark Mode
  statusBadgeDark: {
    requested: "dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    inProgress: "dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
    completed: "dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
  };

  // Cannabis Product Badge Dark Mode
  cannabisProductDark: {
    flower: "dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
    edibles: "dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
    concentrates: "dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";
  };

  // Navigation Dark Mode
  navigationDark: {
    sidebar: "dark:bg-gray-950 dark:border-gray-800";
    navItem: "dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800";
    activeNavItem: "dark:bg-green-900/20 dark:text-green-300 dark:border-l-green-400";
  };
}
```

### Animation & Interaction Design

#### Micro-interactions

```css
/* Subtle pulse animation for active bookings */
@keyframes pulse-subtle {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Highlight flash for status updates */
@keyframes highlight-flash {
  0% {
    background-color: theme("colors.green.100");
  }
  50% {
    background-color: theme("colors.green.200");
  }
  100% {
    background-color: theme("colors.green.100");
  }
}

/* Ring pulse for current timeline step */
@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 theme("colors.blue.400");
  }
  70% {
    box-shadow: 0 0 0 4px theme("colors.blue.400 / 0");
  }
  100% {
    box-shadow: 0 0 0 0 theme("colors.blue.400 / 0");
  }
}

/* Slide in animation for notifications */
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Fade in out for pending states */
@keyframes fade-in-out {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

/* Utility classes */
.animate-pulse-subtle {
  animation: pulse-subtle 2s infinite;
}

.animate-highlight-flash {
  animation: highlight-flash 0.6s ease-in-out;
}

.animate-pulse-ring {
  animation: pulse-ring 2s infinite;
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}

.animate-fade-in-out {
  animation: fade-in-out 2s infinite;
}
```

#### Hover Effects & Transitions

```css
/* Booking card hover effects */
.booking-card {
  @apply transition-all duration-200 ease-in-out;
  @apply hover:shadow-md hover:-translate-y-0.5;
  @apply dark:hover:shadow-lg dark:hover:shadow-green-500/10;
}

/* Button hover effects */
.btn-primary {
  @apply bg-green-600 hover:bg-green-700 text-white;
  @apply transition-colors duration-200;
  @apply hover:shadow-lg hover:shadow-green-500/25;
  @apply active:scale-95 transform;
}

/* Status badge hover effects */
.status-badge {
  @apply transition-all duration-150;
  @apply hover:scale-105 hover:shadow-sm;
}

/* Cannabis product badge glow effect */
.cannabis-badge {
  @apply transition-all duration-200;
  @apply hover:shadow-md hover:shadow-current/25;
}

/* Navigation item hover effects */
.nav-item {
  @apply transition-all duration-150;
  @apply hover:bg-gray-100 dark:hover:bg-gray-800;
  @apply hover:translate-x-1;
}
```

### Responsive Design Breakpoints

#### Cannabis Industry Optimized Breakpoints

```typescript
interface ResponsiveBreakpoints {
  // Mobile-first approach optimized for cannabis industry workflows
  breakpoints: {
    xs: "0px"; // Mobile portrait
    sm: "640px"; // Mobile landscape
    md: "768px"; // Tablet portrait
    lg: "1024px"; // Tablet landscape / Small desktop
    xl: "1280px"; // Desktop
    "2xl": "1536px"; // Large desktop
  };

  // Component responsive behavior
  bookingCardLayout: {
    xs: { columns: 1; spacing: "tight"; cardSize: "compact" };
    sm: { columns: 1; spacing: "normal"; cardSize: "normal" };
    md: { columns: 2; spacing: "normal"; cardSize: "normal" };
    lg: { columns: 3; spacing: "comfortable"; cardSize: "detailed" };
    xl: { columns: 4; spacing: "comfortable"; cardSize: "detailed" };
    "2xl": { columns: 5; spacing: "luxurious"; cardSize: "detailed" };
  };

  // Typography scaling
  typographyScale: {
    xs: { base: "14px"; heading: "18px"; display: "24px" };
    sm: { base: "14px"; heading: "20px"; display: "28px" };
    md: { base: "16px"; heading: "24px"; display: "32px" };
    lg: { base: "16px"; heading: "28px"; display: "36px" };
    xl: { base: "18px"; heading: "32px"; display: "48px" };
    "2xl": { base: "18px"; heading: "36px"; display: "60px" };
  };
}
```

### Accessibility Standards

#### Cannabis Industry Accessibility Guidelines

```typescript
interface AccessibilityStandards {
  // WCAG 2.1 AA Compliance
  colorContrast: {
    normalText: "4.5:1"; // Minimum contrast ratio
    largeText: "3:1"; // Large text minimum
    interactiveElements: "3:1"; // UI components
    nonTextElements: "3:1"; // Icons, charts, etc.
  };

  // Focus management
  focusManagement: {
    focusRing: "visible and high contrast";
    tabOrder: "logical and predictable";
    skipLinks: "implemented for main content";
    modalFocus: "trapped and restored";
  };

  // Cannabis-specific accessibility
  cannabisAccessibility: {
    ageVerificationAlerts: "screen reader accessible";
    complianceMessages: "high contrast and clear";
    productInformation: "detailed alt text for images";
    statusUpdates: "live region announcements";
  };

  // Screen reader optimization
  screenReaderOptimization: {
    ariaLabels: "descriptive and context-aware";
    roleDefinitions: "semantic and accurate";
    stateAnnouncements: "timely and relevant";
    structuralMarkup: "proper heading hierarchy";
  };
}
```

### Performance Optimization

#### Cannabis Industry Performance Standards

```typescript
interface PerformanceStandards {
  // Core Web Vitals for Cannabis Booking Platform
  coreWebVitals: {
    largestContentfulPaint: "< 2.5s"; // Main content loads quickly
    firstInputDelay: "< 100ms"; // Interactive quickly
    cumulativeLayoutShift: "< 0.1"; // Stable layout
    firstContentfulPaint: "< 1.8s"; // Content appears quickly
    timeToInteractive: "< 3.5s"; // Fully interactive
  };

  // Cannabis-specific performance requirements
  cannabisPerformance: {
    bookingListLoad: "< 1.5s"; // Booking list renders
    statusUpdateLatency: "< 200ms"; // Status changes appear
    complianceCheckTime: "< 500ms"; // Compliance validation
    imageUploadProcessing: "< 2s"; // Photo processing
    realTimeUpdateLatency: "< 100ms"; // Live updates
  };

  // Bundle optimization
  bundleOptimization: {
    initialBundleSize: "< 200KB gzipped";
    routeBasedSplitting: "enabled";
    componentLazyLoading: "implemented";
    imageOptimization: "WebP with fallbacks";
    fontLoading: "optimized with font-display";
  };
}
```

This comprehensive design system provides the foundation for building pixel-perfect, fluid, and intuitive cannabis booking management interfaces that maintain professional standards while embracing the evolving cannabis industry aesthetic.
