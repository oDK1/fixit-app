# FixIt App - User Flow Test Cases

## Prerequisites
- Dev server running at http://localhost:3000
- Supabase configured with valid credentials
- Browser with JavaScript enabled

---

## Test Suite 1: New User Onboarding

### TC1.1: First Visit - Landing Page
**Steps:**
1. Open http://localhost:3000 in a fresh browser/incognito
2. Verify animated landing page displays

**Expected:**
- Dramatic engraving-style background visible
- "Enter" button or similar CTA visible
- Page loads without errors

### TC1.2: Anonymous Authentication
**Steps:**
1. Click the Enter/Start button
2. Wait for authentication

**Expected:**
- Anonymous user created automatically
- Redirected to onboarding flow
- No login form required

### TC1.3: Onboarding Questions Flow
**Steps:**
1. Complete the 22-question onboarding
2. Answer each question with test text
3. Navigate through all sections (Pain, Anti-Vision, Vision, Synthesis)

**Expected:**
- Questions display one at a time
- Progress indicator shows current step
- Can navigate back and forward
- All 22 questions accessible

### TC1.4: Character Sheet Generation
**Steps:**
1. Complete all onboarding questions
2. Submit final answers

**Expected:**
- Character sheet created with 6 components:
  - Anti-Vision (from Q17)
  - Vision (from Q18)
  - 1-Year Goal (from Q19)
  - Monthly Project (from Q20)
  - Daily Levers (from Q21)
  - Constraints (from Q22)
- Redirected to daily check or dashboard

---

## Test Suite 2: Daily Direction Check

### TC2.1: Daily Check - Vision Direction
**Steps:**
1. On daily check screen, click "ASCENT" (vision/right)
2. Enter comment: "Test vision comment"
3. Click "Complete Check"

**Expected:**
- +50 XP awarded
- Streak incremented
- Redirected to dashboard
- Confetti animation plays

### TC2.2: Daily Check - Hate Direction
**Steps:**
1. On daily check screen, click "DESCENT" (hate/left)
2. Enter comment: "Test hate comment"
3. Click "Complete Check"

**Expected:**
- No XP awarded (0 XP)
- Redirected to dashboard
- No confetti

### TC2.3: Daily Check - Back Navigation
**Steps:**
1. Select a direction (vision or hate)
2. Click "Back" button
3. Select opposite direction

**Expected:**
- Can change direction before submitting
- Previous selection not persisted until submit

---

## Test Suite 3: Game HUD Dashboard

### TC3.1: Dashboard Display
**Steps:**
1. Navigate to dashboard after completing daily check
2. Verify all sections visible

**Expected:**
- Level & XP bar at top
- Anti-Vision section (red border)
- Vision section (green border)
- Mission/1-Year Goal (yellow border)
- Boss/Monthly Project with HP bar (orange border)
- Daily Quests with checkboxes (blue border)
- Rules/Constraints (purple border)
- Streak counter visible

### TC3.2: Edit Character Sheet Field
**Steps:**
1. Hover over any section (e.g., Vision)
2. Click "Edit" button
3. Modify the text
4. Click "Save"

**Expected:**
- Edit button appears on hover
- Text area opens with current value
- Save persists changes
- Cancel discards changes
- Escape key cancels editing

### TC3.3: Toggle Daily Quest (Lever)
**Steps:**
1. Click on an incomplete quest in "TODAY'S QUESTS"
2. Verify checkbox fills
3. Click again to uncomplete

**Expected:**
- Quest toggles completed/incomplete
- XP added/removed accordingly
- Confetti on completion
- Strikethrough text when completed
- XP value shown (+25 XP, etc.)

### TC3.4: Edit Quests
**Steps:**
1. Click "Edit Quests" button
2. Modify a quest description
3. Change XP value
4. Add new quest with "+ Add Quest"
5. Delete a quest with "✕" button
6. Click "Save Quests"

**Expected:**
- Quest editor UI displays
- Can modify existing quests
- Can add new quests (default 25 XP)
- Can delete quests
- Changes persist after save
- Cancel discards changes

---

## Test Suite 4: Weekly Reflection

### TC4.1: Weekly Reflection Flow
**Steps:**
1. Navigate to weekly reflection (from menu or route)
2. Complete Step 1: Week Review
   - View daily reflections from past week
   - Enter "Most alive/dead" response
3. Complete Step 2: Project Progress
   - Adjust progress slider
   - Enter blocking progress text
4. Click "Complete (+200 XP)"

**Expected:**
- Timer displays countdown
- Daily logs from past 7 days shown
- Progress slider updates boss fight progress
- +200 XP awarded on completion
- Redirected to dashboard

### TC4.2: Weekly Reflection - Timer
**Steps:**
1. Open weekly reflection
2. Observe timer countdown

**Expected:**
- Timer starts at 5:00
- Counts down every second
- Format: M:SS

---

## Test Suite 5: Monthly Boss Fight

### TC5.1: Boss Fight - Completed Project
**Steps:**
1. Navigate to monthly boss fight
2. Select "Yes, Completed"
3. Enter learnings: "Test learnings"
4. Review and update vision/anti-vision if needed
5. Enter new monthly project
6. Complete the flow

**Expected:**
- +1000 XP awarded (Boss Defeated)
- Old boss marked as "defeated"
- New boss fight created
- Character sheet updated with new project
- Vision/anti-vision updated if changed

### TC5.2: Boss Fight - Failed Project
**Steps:**
1. Navigate to monthly boss fight
2. Select "No, Not Yet"
3. Enter reason for not completing
4. Review direction
5. Enter new monthly project
6. Complete the flow

**Expected:**
- +250 XP awarded (attempt bonus)
- Old boss marked as "failed"
- New boss fight created
- Weekly reflections displayed showing blockers

### TC5.3: Boss Fight - Timer
**Steps:**
1. Open monthly boss fight
2. Observe timer

**Expected:**
- Timer starts at 10:00
- Counts down properly

---

## Test Suite 6: XP & Level System

### TC6.1: XP Accumulation
**Steps:**
1. Note current XP
2. Complete a daily quest (+25 XP)
3. Verify XP increased

**Expected:**
- XP bar updates
- Total XP shown correctly
- Progress bar width increases

### TC6.2: Level Up
**Steps:**
1. Accumulate enough XP to level up
2. Observe level change

**Expected:**
- Level number increases
- Level title changes (Conformist → Self-Aware → etc.)
- XP bar resets for new level

---

## Test Suite 7: Error Handling

### TC7.1: Network Error Recovery
**Steps:**
1. Disconnect network
2. Try to save a field
3. Reconnect network
4. Retry save

**Expected:**
- Error message shown
- No data corruption
- Can retry after reconnection

### TC7.2: Empty Input Validation
**Steps:**
1. Try to submit daily check without comment
2. Try to save empty quest

**Expected:**
- Submit button disabled
- Appropriate validation feedback

---

## Test Suite 8: Navigation & State

### TC8.1: Escape Key Handling
**Steps:**
1. Start editing a field
2. Press Escape key

**Expected:**
- Edit mode cancelled
- Original value restored

### TC8.2: Page Refresh Persistence
**Steps:**
1. Complete some actions (quests, XP)
2. Refresh the page
3. Verify state persisted

**Expected:**
- All data reloads correctly
- XP, level, streak preserved
- Completed quests still marked

---

## Quick Smoke Test Checklist

- [ ] Landing page loads
- [ ] Can start new user flow
- [ ] Daily check works (both directions)
- [ ] Dashboard displays all sections
- [ ] Can edit character sheet fields
- [ ] Can toggle quests
- [ ] Can edit quests
- [ ] XP updates correctly
- [ ] Timer works in weekly/monthly flows
- [ ] No console errors
