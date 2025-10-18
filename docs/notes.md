# Bug Fix: Rocket Scene Mouse Tracking Issues

## The Problem

The rocket scene had multiple critical issues:
1. **Duplicate rocket scenes appearing** - One unresponsive scene at top, another reactive scene appearing below the down arrow
2. **Mouse tracking not working** - Rocket wouldn't follow cursor movement
3. **Click animations not triggering** - Squash/spin effects on mouse click weren't working

## Root Causes

### Issue 1: CSS `position: relative` Creating Wrong Containing Block
**Location:** `Dashboard.tsx` line 34

The Dashboard `<main>` element had `position: relative`, which created a new containing block for `position: fixed` children. This caused the canvas (which had `position: fixed`) to be positioned relative to the `<main>` element instead of the viewport.

**Result:** The canvas appeared at the scroll position of the Dashboard wrapper (100vh down the page), creating the visual appearance of a "second" rocket scene below the Pipboy section.

```tsx
// Before (BROKEN):
<main className="relative min-h-screen overflow-hidden">

// After (FIXED):
<main className="min-h-screen overflow-hidden">
```

### Issue 2: Pointer Events Blocking
**Location:** `IntroPage.tsx` line 191-194

The Dashboard wrapper div had conditional `pointer-events-none` - it was only applied when hidden. When visible, the wrapper captured mouse events and prevented them from bubbling to the window event listeners that controlled rocket movement.

```tsx
// Before (BROKEN):
className={`transition-all duration-1000 ${
  isFullyDarkened ? "opacity-100" : "opacity-0 pointer-events-none"
}`}

// After (FIXED):
className={`transition-all duration-1000 pointer-events-none ${
  isFullyDarkened ? "opacity-100" : "opacity-0"
}`}
```

Interactive elements (arrow button) were fixed by adding `pointer-events-auto` when visible.

### Issue 3: React StrictMode Cleanup
**Location:** `RocketScene.ts` dispose() method

React StrictMode double-mounting could leave ghost canvases if cleanup timing was off. The dispose method relied on `containerRef.current.innerHTML = ""` which might fail during React's unmount cycle.

**Solution:** Explicitly remove canvas from DOM before disposing:

```typescript
// Added explicit canvas removal
if (this.renderer.domElement.parentNode) {
  this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
}
```

## The Fix

1. **Removed `position: relative`** from Dashboard main element - allows canvas to fix to viewport
2. **Added `pointer-events-none`** to Dashboard wrapper permanently - allows events to reach window listeners
3. **Added `pointer-events-auto`** to interactive children when visible - keeps buttons clickable
4. **Improved canvas cleanup** - explicit DOM removal prevents ghost canvases

## Technical Details

**Event Flow (Working):**
```
Mouse Move → Window Listeners (mousemove) → updateTargets() → Rocket Position Update
                    ↑
                    └─ Events pass through Dashboard wrapper (pointer-events-none)
                       Events pass through Canvas (pointerEvents: "none")
```

**CSS Containing Block Issue:**
- `position: fixed` normally positions relative to viewport
- If an ancestor has `transform`, `perspective`, `filter`, or `position: relative`, it creates a new containing block
- The fixed element then positions relative to that ancestor, not the viewport
