# How to Debug Progress Tracker on GitHub Pages

The progress tracker now includes debugging capabilities. Follow these steps to identify why checkmarks aren't appearing on GitHub Pages.

## Step 1: Deploy the Updated Build

Make sure you've committed and pushed the latest build:

```bash
git add build/
git add supplemental-ui/js/progress-tracker.js
git commit -m "Add progress tracker debugging"
git push origin main
```

Wait for GitHub Pages to rebuild (1-2 minutes).

## Step 2: Open Browser Console on GitHub Pages

1. Go to your GitHub Pages site: https://redhatquickcourses.github.io/maas-kueue-enablement/...
2. Open DevTools (F12 or Right-click → Inspect)
3. Go to the **Console** tab
4. Navigate through a few pages

You should see debug output like:
```
[Progress Tracker] Marked as visited: /maas-kueue-enablement/maas-kueue-enablement/1/index.html
[Progress Tracker] Stored progress: ["/maas-kueue-enablement/maas-kueue-enablement/1/index.html"]
[Progress Tracker] Current URL: /maas-kueue-enablement/maas-kueue-enablement/1/ch5-kueue/s1-kueue-overview-1.html
```

## Step 3: Run Debug Function

In the browser console, run:

```javascript
debugProgressTracker()
```

This will output detailed information about:
- Current page URL
- All stored progress
- Every navigation link and whether it should show a checkmark

Look for:
- **"hasCheckmark: true/false"** - Does the link have the checkmark element?
- **"isVisited: true/false"** - Does the stored URL match this link?
- **"checkmarkVisible"** - Is the checkmark being displayed?

## Step 4: Compare URLs

The debug output will show you exactly what's being compared. Look for mismatches like:

**❌ Mismatch Example:**
```
Stored: "/maas-kueue-enablement/maas-kueue-enablement/1/index.html"
Link:   "/maas-kueue-enablement/1/index.html"
```

**✅ Match Example:**
```
Stored: "/maas-kueue-enablement/maas-kueue-enablement/1/index.html"
Link:   "/maas-kueue-enablement/maas-kueue-enablement/1/index.html"
```

## Step 5: Share Debug Output

If you still don't see checkmarks after deploying, run `debugProgressTracker()` in the console and share the output. Look for these specific things:

1. **Are nav links found?**
   ```
   Total nav links: 15  ← Should be > 0
   ```

2. **Do links have checkmark elements?**
   ```
   hasCheckmark: true  ← Should be true for all links
   ```

3. **Are URLs matching?**
   ```
   isVisited: true  ← Should be true for visited pages
   ```

4. **Are checkmarks visible?**
   ```
   checkmarkVisible: "inline"  ← Should be "inline" for visited pages
   ```

## Common Issues

### Issue 1: Checkmark elements missing
**Symptom:** `hasCheckmark: false` for all links  
**Cause:** The `nav-tree.hbs` template wasn't deployed  
**Fix:** Verify `build/site/` contains the updated HTML with checkmark spans

### Issue 2: URL mismatch
**Symptom:** `isVisited: false` even though you visited the page  
**Cause:** Stored URL format doesn't match link URL format  
**Fix:** Check the debug output to see the exact mismatch

### Issue 3: Browser caching
**Symptom:** Old JavaScript is still running  
**Fix:** Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue 4: localStorage not working
**Symptom:** Stored progress is empty `[]`  
**Fix:** Check if you're in private/incognito mode

## Quick Test Script

Run this in the console to test all functionality:

```javascript
// Clear old progress
clearCourseProgress()

// After page reloads, check storage
console.log('Stored:', localStorage.getItem('antora-course-progress'))

// Navigate to a few pages, then run:
debugProgressTracker()
```

## What Should Happen

After visiting a page, you should see:
1. Console log: `[Progress Tracker] Marked as visited: /path/to/page.html`
2. Console log: `[Progress Tracker] ✓ Showing checkmark for: /path/to/page.html`
3. Green checkmark appears in navigation

If any of these steps fail, the debug output will tell us exactly where the problem is.

---

**Next Steps:**
1. Deploy the updated build to GitHub Pages
2. Hard refresh the page (clear cache)
3. Open console and look for debug output
4. Run `debugProgressTracker()` 
5. Share the console output if still not working
