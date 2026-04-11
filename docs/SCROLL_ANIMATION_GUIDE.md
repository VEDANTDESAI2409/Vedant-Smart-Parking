# Hero Section Scroll Animation Implementation

## Overview
Added scroll-triggered parking car animation to the hero section. When users scroll into the hero section, a car smoothly drives onto the screen and parks into a designated slot, creating an engaging visual experience.

## What Changed

### 1. **New Hook Created**
**File:** `client/src/hooks/useScrollAnimation.js`

Provides two custom React hooks:

#### `useScrollAnimation(options)`
- Detects when an element enters the viewport using Intersection Observer
- Applies CSS animation classes on scroll trigger
- **Options:**
  - `threshold` (number): Controls when animation triggers (0-1, default 0.2)
  - `animationClass`: CSS class to apply when visible
  - `startClass`: Class applied when entering view
  - `endClass`: Class applied when animation completes

#### `useScrollCarAnimation()`
- More advanced scroll-based car positioning
- Calculates scroll progress and applies smooth transform
- Returns refs for container and car elements

### 2. **Updated Components**
**File:** `client/src/user/pages/Home.jsx`

- Imported `useScrollAnimation` hook
- Applied the hook to the `.hero-scene` element
- Element now animates when scrolled into view with 30% threshold

### 3. **Enhanced CSS Animations**
Updated animation styles in three files:
- `client/src/index.css`
- `admin-dashboard/src/index.css`
- `user-dashboard/src/index.css`

#### New CSS Classes:

**Initial State:**
```css
.hero-scene .hero-park-car,
.hero-scene .hero-zone-card,
.hero-scene .hero-mobile-card,
.hero-scene .hero-strip,
.hero-scene .hero-sync-card {
  opacity: 0;
  transform: translateY(18px);
}
```

**Scroll Animation Trigger:**
```css
.hero-scene.scroll-animation-start {
  /* Initial state when entering viewport */
  position: relative;
  transform: translateY(12px);
  opacity: 0.92;
}

.hero-scene.scroll-animation-end {
  /* Final state - all animations triggered */
  transform: translateY(0);
  opacity: 1;
}
```

**Component-specific animations:**
```css
.hero-scene.scroll-animation-end .hero-zone-card,
.hero-scene.scroll-animation-end .hero-mobile-card {
  animation: heroCardIn 820ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.hero-scene.scroll-animation-end .hero-strip {
  animation: heroStripIn 900ms cubic-bezier(0.18, 0.82, 0.22, 1) 300ms forwards;
}

.hero-scene.scroll-animation-end .hero-park-car {
  animation: parkCar 2.6s cubic-bezier(0.2, 0.82, 0.2, 1) 980ms forwards;
}
```

## Animation Sequence

When user scrolls to hero section:

1. **0ms** - Element starts entering viewport
2. **0-300ms** - Zone card fades and slides in
3. **120-420ms** - Mobile card appears with 120ms delay
4. **300-1200ms** - Parking strip animation with parking lines and slot glow
5. **520-1340ms** - Sync info card appears
6. **980-3580ms** - Car animates from off-screen, drives across, and parks in the slot

## How It Works

### Intersection Observer Flow:
```
User scrolls → Element enters viewport
    ↓
Intersection Observer detects
    ↓
Adds "scroll-animation-end" class
    ↓
CSS animations triggered
    ↓
Car drives and parks smoothly
    ↓
Progress bar sweeps (infinite loop)
```

### Key Features:

**✓ Smooth Scroll Detection**
- Uses Intersection Observer API for performance
- Threshold set to 30% visibility for early trigger
- Supports re-triggering on scroll up/down

**✓ Staggered Animation Timing**
- Each component animates in sequence
- Creates natural, coordinated motion
- Total duration: ~3.6 seconds

**✓ Responsive Design**
- Adapts to all screen sizes
- Mobile-optimized with parkCarMobile keyframes
- Respects prefers-reduced-motion setting

**✓ Performance Optimized**
- CSS-based animations (GPU accelerated)
- Minimal JavaScript overhead
- Passive scroll listeners

## Customization Options

### Adjust Trigger Threshold:
```jsx
const heroSceneRef = useScrollAnimation({
  threshold: 0.5,  // Trigger at 50% visibility instead of 30%
});
```

### Modify Animation Duration:
Edit keyframes in `index.css`:
```css
@keyframes parkCar {
  /* Change 2.6s to your preferred duration */
  /* animation: parkCar 3.2s ... */
}
```

### Change Parking Position:
Update the translate value in parkCar keyframe:
```css
@keyframes parkCar {
  100% {
    opacity: 1;
    transform: translate(262px, -50%);  /* Adjust pixel value */
  }
}
```

## Browser Support

- ✓ Chrome/Edge (88+)
- ✓ Firefox (78+)
- ✓ Safari (14.1+)
- ✓ Respects `prefers-reduced-motion` setting for accessibility

## Accessibility Considerations

- Animations respect `prefers-reduced-motion` media query
- No animations on reduced-motion preference
- Skip content remains accessible
- All animations are non-essential visual enhancements

## Future Enhancements

Potential additions:
1. Multiple car types with different animations
2. Direction-based animation (car from left/right)
3. Sound effects on parking complete
4. Parallax scrolling for depth effect
5. Interactive car selection during scroll
