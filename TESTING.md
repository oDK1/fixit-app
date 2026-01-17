# Testing Guide - FixIt App

## How to Test Weekly and Monthly Routines

Since you asked how to test the weekly and monthly routines, here's the complete guide!

### ✅ New Feature: Menu Button

I've added a **floating menu button** (☰) in the top-right corner of the dashboard that lets you access all routines anytime for testing.

---

## Testing Steps

### 1. Complete Onboarding First
- Go to http://localhost:3000
- Click "Start Demo"
- Either:
  - Complete full 22-question onboarding, OR
  - Click "Already did this? Skip to quick setup" and fill out 6 components

### 2. Complete Daily Direction Check
- After onboarding, you'll see the daily check
- Swipe left (hate) or right (vision)
- Add a comment about why
- Submit to reach the dashboard

### 3. Access the Menu
Once you're on the dashboard, you'll see a **purple circular button with three lines (☰)** in the top-right corner.

Click it to open the menu with these options:

```
┌─────────────────────────────┐
│         MENU                │
├─────────────────────────────┤
│ 📋 Character Sheet          │
│    View your 6 components   │
├─────────────────────────────┤
│ 📅 Weekly Reflection        │
│    8-minute review          │
│    (test it now)            │
├─────────────────────────────┤
│ ⚔️ Monthly Boss Fight       │
│    10-minute completion     │
│    (test it now)            │
└─────────────────────────────┘
```

### 4. Test Each Feature

#### A. Character Sheet
- Click "Character Sheet"
- View your 6 components with forcefield animations
- See all your data laid out beautifully
- Click "Close" to return to dashboard

#### B. Weekly Reflection (8 min)
- Click "Weekly Reflection"
- **Step 1**: Review your daily comments, answer "Most alive? Most dead?" and pattern questions
- **Step 2**: See your anti-vision reminder, check if it still resonates
- **Step 3**: Keep/remove daily levers by toggling checkboxes
- **Step 4**: Slide to set project progress percentage
- Click "Complete (+200 XP)" to finish
- Returns to dashboard with XP added

#### C. Monthly Boss Fight (10 min)
- Click "Monthly Boss Fight"
- **Step 1 (Review)**:
  - Mark if you completed the project (Yes/No)
  - Write what you learned
  - If completed: Write what surprised you
- **Step 2 (Result)**:
  - **Victory screen** if completed (confetti + 1000 XP)
  - **Defeat screen** if not (250 XP for trying)
- **Step 3 (New Project)**: Set next month's project
- **Step 4 (Evolution)**: Update vision, check constraints
- Click "Complete" to finish
- New boss fight created, returns to dashboard

---

## What Gets Saved

### Weekly Reflection
- Saves to `weekly_reflections` table
- Updates `daily_levers` (deactivates removed ones)
- Adds +200 XP to user
- Updates boss fight progress percentage

### Monthly Boss Fight
- Updates current boss fight status (defeated/failed)
- Creates new boss fight for next month
- Updates character sheet (vision, year goal, month project)
- Adds +1000 XP (victory) or +250 XP (defeat)

---

## Testing Tips

### Tip 1: You Can Test Multiple Times
- The routines don't check dates yet
- You can run weekly/monthly as many times as you want
- Great for testing the full flow

### Tip 2: Check the Database
Go to your Supabase dashboard to see the data being saved:
- **Tables → weekly_reflections**: See your reflections
- **Tables → boss_fights**: See victory/defeat records
- **Tables → users**: Watch XP increase
- **Tables → daily_levers**: See which levers are active

### Tip 3: Reset If Needed
To start fresh:
1. Go to Supabase dashboard
2. Delete rows from these tables:
   - `character_sheet`
   - `onboarding_responses`
   - `daily_levers`
   - `daily_logs`
   - `boss_fights`
3. Refresh the app → Start over

---

## Expected Flow

```
Start Demo
  ↓
Onboarding (or Quick Setup)
  ↓
Daily Direction Check
  ↓
Dashboard
  ↓
[Menu Button] → Test any routine:
  • Character Sheet (view only)
  • Weekly Reflection (8 min)
  • Monthly Boss Fight (10 min)
  ↓
Back to Dashboard
```

---

## Common Issues

### Issue: Menu button not showing
- Make sure you're on the dashboard
- Look in the top-right corner
- It's a purple circular button

### Issue: "Already completed today's check"
- This is normal! You can only do daily check once per day
- Use the menu to access weekly/monthly instead

### Issue: Can't complete weekly reflection
- Make sure you've completed at least one daily check
- Fill out all required fields in each step

### Issue: Boss fight shows 0% progress
- Normal for new boss fights
- Update progress in weekly reflection (Step 4)

---

## Quick Test Checklist

- [ ] Complete onboarding (full or quick)
- [ ] Complete daily direction check
- [ ] Toggle a daily quest on dashboard (see confetti!)
- [ ] Open menu (click ☰ button)
- [ ] View character sheet
- [ ] Complete weekly reflection
- [ ] Complete monthly boss fight (mark as "defeated")
- [ ] See victory screen with loot and +1000 XP
- [ ] Return to dashboard with updated stats

---

Enjoy testing! 🎮
