# FixIt App - Manual Testing Script
## Generated: 2026-01-14

This document provides step-by-step manual testing instructions since automated testing with Puppeteer could not be installed due to disk space constraints.

---

## Prerequisites
- Browser: Chrome or Firefox with DevTools open
- URL: http://localhost:3000/
- Clear all browser storage before each major flow test

---

## Flow 1: Full Onboarding (22 Questions)

### Steps:
1. Open browser DevTools (F12) and navigate to Console tab
2. Navigate to http://localhost:3000/
3. Clear browser storage:
   - Application tab > Storage > Clear site data
   - Or run in console: `localStorage.clear(); sessionStorage.clear();`
4. Refresh the page
5. Click "Start Demo" button
6. **MONITOR CONSOLE** for these expected logs:
   ```
   Creating anonymous session...
   Anonymous session created: [UUID]
   ```
7. Complete all 22 onboarding questions with realistic data
8. For each question, verify:
   - Answer saves without errors
   - Progress bar updates
   - Navigation works (Previous/Next buttons)
9. On final question, click "Complete"
10. **MONITOR CONSOLE** for:
    ```
    Character sheet saved
    Daily levers saved: [number]
    Boss fight created
    ```

### Expected Console Errors to Watch For:
- ❌ RLS policy violations (code 42501)
- ❌ "Failed to create anonymous session"
- ❌ "Error saving answer"
- ❌ "Error saving character sheet"
- ❌ Database insert failures
- ❌ Missing environment variables

### Network Tab Checks:
- Check for failed POST requests to Supabase
- Verify 200/201 status codes on database operations
- Look for authentication errors (401/403)

---

## Flow 2: Quick Setup (Skip Option)

### Steps:
1. Clear browser storage again
2. Refresh page at http://localhost:3000/
3. Click "Start Demo"
4. **WAIT** for anonymous session creation (check console)
5. Click "Already did this? Skip to quick setup"
6. Fill out all 6 components:
   - **Anti-Vision:** "I refuse to die never having built something meaningful"
   - **Vision:** "I am building toward creative freedom and impact"
   - **1 Year Goal:** "Launch successful product making $100k revenue"
   - **1 Month Project:** "Ship MVP and get 10 beta users"
   - **Daily Levers (one per line):**
     ```
     Write for 30 minutes
     Exercise for 20 minutes
     Read 10 pages
     ```
   - **Constraints:** "I will not sacrifice health or relationships"
7. Click "Start Your Journey"
8. **MONITOR CONSOLE** for:
   ```
   Saving character sheet for user: [UUID]
   Character sheet saved: [object]
   Daily levers saved: 3
   Boss fight created
   Quick setup completed successfully
   ```

### Critical Errors to Watch For:
- ❌ RLS policy violations during insert
- ❌ "Failed to save character sheet"
- ❌ "Error saving levers"
- ❌ "Error creating boss fight"
- ❌ Does NOT proceed to daily check

### Verify in Network Tab:
- character_sheet insert succeeds
- daily_levers insert succeeds (3 rows)
- boss_fights insert succeeds
- All return 201 Created

---

## Flow 3: Daily Direction Check

### Steps:
1. After completing Flow 2, you should see the swipe direction check
2. Verify UI displays:
   - "Am I moving toward the life I hate or the life I want?"
   - Two large buttons: HATE (left) and VISION (right)
3. Click "VISION →" button
4. Verify it transitions to comment screen
5. Enter meaningful comment: "Feeling motivated because I completed my first quest"
6. Click "Complete Check"
7. **MONITOR CONSOLE** for database operations

### Expected Behavior:
- ✅ XP gained: +50 for VISION choice
- ✅ Streak incremented by 1
- ✅ Redirects to dashboard
- ✅ No console errors

### Test HATE Path (Optional):
1. If testing again, choose "HATE ←" instead
2. Should give 0 XP
3. Should NOT increment streak
4. Should still save comment and proceed

---

## Flow 4: Dashboard & Quest Completion

### Steps:
1. After daily check, verify dashboard loads with:
   - Level and XP bar
   - Mission (1-year goal)
   - Boss Fight (monthly project with HP bar)
   - Today's Quests (3 daily levers)
   - Streak counter
   - Stakes (anti-vision)
2. Click checkbox next to first quest
3. **VERIFY:**
   - ✅ Confetti animation plays
   - ✅ Quest marked complete with checkmark
   - ✅ XP increases by +50
   - ✅ Console shows database save

### Test Each Quest:
- Toggle each lever on/off
- Verify XP increases/decreases correctly
- Check for database errors in console

### Console Errors to Watch For:
- ❌ "Error loading data"
- ❌ Failed to update daily_logs
- ❌ Failed to update users table (XP)
- ❌ Missing user or character sheet data

---

## Flow 5: Character Sheet View

### Steps:
1. From dashboard, click menu button (☰) in top-right
2. Click "Character Sheet" from menu
3. Verify modal/page displays all 6 components:
   - Anti-Vision (red border)
   - Vision (green border)
   - Mission (yellow border)
   - Boss (orange border)
   - Quests (blue border)
   - Rules (purple border)
4. Verify forcefield animations play (if implemented)
5. Check for loading errors
6. Click "Close" or back button
7. Verify returns to dashboard cleanly

### Errors to Watch For:
- ❌ Character sheet data not loading
- ❌ Missing fields
- ❌ Animations broken
- ❌ Cannot close modal

---

## Flow 6: Weekly Reflection

### Steps:
1. Open menu (☰) and click "Weekly Reflection"
2. Verify 4-step progress indicator at top
3. **Step 1: Review**
   - Shows past 7 days of daily reflections
   - Fill "Most alive/dead" text area
   - Fill "Pattern noticed" text area
   - Click "Next"
4. **Step 2: Anti-Vision**
   - Displays anti-vision text
   - Check the "Does this still make you feel something?" checkbox
   - Click "Next"
5. **Step 3: Lever Adjustment**
   - Shows all active daily levers with checkboxes
   - Uncheck one lever (testing deactivation)
   - Click "Next"
6. **Step 4: Project Progress**
   - Shows current monthly project
   - Drag slider to 25%
   - Click "Complete (+200 XP)"
7. **MONITOR CONSOLE** for:
   ```
   Weekly reflection saved
   Lever deactivated (if unchecked)
   User XP updated: +200
   ```

### Errors to Watch For:
- ❌ Weekly reflections failed to save
- ❌ Levers not deactivating
- ❌ XP not awarded
- ❌ Does not return to dashboard

---

## Flow 7: Monthly Boss Fight

### Path A: Victory (Project Completed)

#### Steps:
1. Open menu > Click "Monthly Boss Fight"
2. **Step 1: Review**
   - Displays current project text
   - Click "✓ Yes, Completed"
   - Fill "What did you learn": "I learned how to ship quickly"
   - Fill "What surprised you": "I was surprised by how much I could do in a month"
   - Click "Next"
3. **Step 2: Result**
   - Should display "BOSS DEFEATED!" with confetti
   - Shows loot acquired
   - Shows "+1000 XP"
   - Click "Next"
4. **Step 3: New Project**
   - Enter next month's project: "Get 100 users and $1000 MRR"
   - Click "Next"
5. **Step 4: Evolution**
   - Update vision (or keep same)
   - Answer constraints questions
   - Click "Complete"
6. **MONITOR CONSOLE:**
   ```
   Boss fight updated: defeated
   New boss fight created
   Character sheet updated
   User XP updated: +1000
   ```

### Path B: Defeat (Project Not Completed)

#### Steps (Alternative to Path A):
1. In Step 1, click "✗ No, Not Yet" instead
2. Fill learnings
3. Result screen shows "BOSS REMAINS"
4. Shows "+250 XP" (consolation prize)
5. Continue through remaining steps
6. Should still create new boss fight

### Critical Errors:
- ❌ Boss fight status not updating
- ❌ New boss fight not created
- ❌ Character sheet not updated
- ❌ XP not awarded (1000 or 250)
- ❌ Does not return to dashboard

---

## Cross-Flow Tests

### Test: Menu Navigation
1. From dashboard, open menu multiple times
2. Navigate to different views
3. Verify menu closes properly
4. Verify no navigation errors

### Test: Data Persistence
1. Complete some quests
2. Refresh page
3. Verify data persists:
   - Quests still marked complete
   - XP unchanged
   - Streak maintained

### Test: Repeated Weekly Reflection
1. Try opening weekly reflection twice in same week
2. Should either:
   - Prevent duplicate submission
   - Or allow but not break data

---

## Database Tables to Verify (via Supabase Dashboard)

After testing, check these tables for data:

1. **auth.users** - Anonymous user created
2. **users** - User record with XP and streak
3. **character_sheet** - 6 components saved
4. **daily_levers** - 3 levers created, active=true
5. **daily_logs** - Today's log with direction, comment, completed levers
6. **boss_fights** - Active boss fight with progress
7. **weekly_reflections** - Weekly reflection saved
8. **onboarding_responses** - (if full onboarding) 22 responses

---

## Common Issues & Solutions

### Issue: "No space left on device"
- **Solution:** Free up disk space, then restart development server

### Issue: RLS Policy Violation (42501)
- **Solution:** Check Supabase RLS policies allow anonymous users
- Verify policies on all tables

### Issue: Environment Variables Missing
- **Solution:** Ensure `.env.local` has:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
  ```

### Issue: Anonymous Auth Not Working
- **Solution:** Enable anonymous auth in Supabase dashboard:
  - Authentication > Providers > Anonymous

### Issue: Confetti Not Playing
- **Solution:** Check browser console for canvas-confetti errors
- Verify confetti.ts implementation

---

## Expected Console Logs Summary

### Clean Run (No Errors):
```
Creating anonymous session...
Anonymous session created: [UUID]
Saving character sheet for user: [UUID]
Character sheet saved: {...}
Daily levers saved: 3
Boss fight created
Quick setup completed successfully
```

### Failed Run (With Errors):
```
❌ Error saving character sheet: {message: "..."}
❌ Failed to create boss fight
❌ RLS policy violation
```

---

## Test Completion Checklist

- [ ] Flow 1: Full Onboarding - 22 questions completed
- [ ] Flow 2: Quick Setup - All 6 components saved
- [ ] Flow 3: Daily Direction Check - Both paths tested
- [ ] Flow 4: Dashboard Quests - All levers toggled
- [ ] Flow 5: Character Sheet - View opened/closed
- [ ] Flow 6: Weekly Reflection - All 4 steps completed
- [ ] Flow 7: Boss Fight Victory - +1000 XP awarded
- [ ] Flow 7: Boss Fight Defeat - +250 XP awarded
- [ ] Menu navigation working
- [ ] Data persists across refresh
- [ ] No console errors
- [ ] All database tables populated

---

## Notes
- This script assumes localhost:3000 is running
- Requires Supabase backend to be configured
- Anonymous authentication must be enabled
- RLS policies must allow anonymous users
