# FixIt - Features Documentation

## ✅ Completed Features

### 1. Onboarding Flow
**File**: `components/onboarding/OnboardingFlow.tsx`

- 22 questions split into 4 sections (Pain, Anti-Vision, Vision, Synthesis)
- Uses Dan Koe's exact wording from the X post
- 30-minute timer with countdown
- Progress bar showing completion percentage
- Auto-saves answers to Supabase
- Creates character sheet upon completion
- Generates initial boss fight and daily levers

**User Flow:**
1. User answers all 22 questions
2. Responses saved to `onboarding_responses` table
3. Character sheet created with 6 components
4. Daily levers parsed from question 21
5. First monthly boss fight created

---

### 2. Game Dashboard (HUD)
**File**: `components/dashboard/GameHUD.tsx`

**Features:**
- Level & XP display with progress bar
- Mission display (1-year goal)
- Boss Fight card with HP bar and countdown
- Daily Quests (levers) with checkboxes
- Streak counter with fire emoji
- Anti-Vision reminder (stakes)
- Confetti animation on quest completion
- Real-time XP updates

**Visual Layout:**
```
┌─────────────────────────────┐
│   LEVEL 3 ARCHITECT         │
│   [████████░░] 834 XP       │
├─────────────────────────────┤
│ 🎯 MISSION                  │
│ [1-year goal text]          │
├─────────────────────────────┤
│ ⚔️ BOSS FIGHT               │
│ [Monthly project]           │
│ [████████░░] 60% HP         │
├─────────────────────────────┤
│ ⚡ TODAY'S QUESTS            │
│ ☐ Lever 1 [+50 XP]          │
│ ☐ Lever 2 [+100 XP]         │
│ 🔥 14 day streak            │
├─────────────────────────────┤
│ ⚠️ STAKES                   │
│ [Anti-vision sentence]      │
└─────────────────────────────┘
```

---

### 3. Character Sheet
**File**: `components/dashboard/CharacterSheet.tsx`

**Features:**
- Full 6-component framework display
- Animated "forcefield" pulse effect
- Color-coded sections:
  - 💀 Anti-Vision (red)
  - ✨ Vision (green)
  - 🎯 Mission (yellow)
  - ⚔️ Boss (orange)
  - ⚡ Quests (blue)
  - 📜 Rules (purple)
- Fullscreen modal overlay
- Read-only view (editing to come)

---

### 4. Daily Direction Check
**File**: `components/routines/DailyDirectionCheck.tsx`

**Time**: 5 minutes

**Flow:**
1. **Swipe Interface**:
   - Left button (hate) → Red
   - Right button (vision) → Green
2. **Comment Prompt**: "Why do you feel this way today?"
3. **XP Reward**: +50 XP for vision-aligned days
4. **Streak Update**: Increments streak counter

**Saves to**: `daily_logs` table

---

### 5. Weekly Reflection
**File**: `components/routines/WeeklyReflection.tsx`

**Time**: 8 minutes

**4-Step Flow:**

**Step 1: Week Review**
- Shows all daily comments from past 7 days
- "When did I feel most alive? Most dead?"
- "What pattern do you notice?"

**Step 2: Anti-Vision Reminder**
- Displays anti-vision sentence
- Checkbox: "Does this still make you feel something?"

**Step 3: Lever Adjustment**
- Shows all active daily levers
- Toggle checkboxes to keep/remove
- Option to add new levers later

**Step 4: Project Progress**
- Slider: 0-100% completion
- Visual progress bar
- Updates boss fight HP

**XP Reward**: +200 XP

**Saves to**: `weekly_reflections` table

---

### 6. Monthly Boss Fight
**File**: `components/routines/MonthlyBossFight.tsx`

**Time**: 10 minutes

**4-Step Flow:**

**Step 1: Review**
- "Did you complete your monthly project?"
- "What did you learn?"
- If completed: "What surprised you about who you became?"

**Step 2: Result Screen**
- **Victory** (if completed):
  ```
  ⚔️ BOSS DEFEATED!
  💎 LOOT ACQUIRED:
  • Skill 1
  • Skill 2
  +1000 XP + Level Up!
  ```
- **Defeat** (if not completed):
  ```
  ⚠️ BOSS REMAINS
  Progress: 45%
  +250 XP (for trying)
  ```

**Step 3: New Project**
- Set next month's project
- Aligned with 1-year goal
- Define completion criteria

**Step 4: Vision Evolution**
- Review and update vision statement
- Constraint violation check
- "Do constraints still serve you?"

**XP Rewards**:
- Boss defeated: +1000 XP
- Boss failed: +250 XP

**Saves to**: `boss_fights` table

---

### 7. Gamification System

**XP System:**
- Daily lever complete: +25-100 XP (user-defined)
- Daily direction check (vision): +50 XP
- Weekly reflection: +200 XP
- Monthly boss defeated: +1000 XP
- Monthly boss failed: +250 XP

**Levels** (`types/index.ts`):
1. Conformist (0-500 XP)
2. Self-Aware (500-1500 XP)
3. Architect (1500-3500 XP)
4. Builder (3500-7500 XP)
5. Strategist (7500-15000 XP)
6. Visionary (15000+ XP)

**Animations** (`lib/confetti.ts`):
- Quest completion: Burst of purple/pink/gold confetti
- Level up: Continuous confetti from both sides (3s)
- Boss defeated: Massive firework confetti (5s)
- 7-day streak: Special milestone confetti

---

## Database Schema

### Tables

**users**
- id, email, current_level, total_xp, current_streak, longest_streak

**onboarding_responses**
- All 22 question responses

**character_sheet**
- anti_vision, vision, year_goal, month_project, constraints

**daily_levers**
- lever_text, xp_value, order, active

**daily_logs**
- date, direction (vision/hate), comment, levers_completed, xp_gained

**weekly_reflections**
- week_start, most_alive, most_dead, pattern_noticed, levers_adjusted, project_progress

**boss_fights**
- month_start, project_text, status (active/defeated/failed), progress, loot_acquired, learnings, xp_gained

**achievements**
- achievement_type, unlocked_at

---

## Routing Logic

**File**: `app/page.tsx`

```
User visits → Check progress
  ↓
No onboarding? → OnboardingFlow
  ↓
No daily check today? → DailyDirectionCheck
  ↓
Dashboard (GameHUD)
```

**Future routing:**
- Weekly reflection: Trigger after 7 days
- Monthly boss fight: Trigger at end of month
- Character sheet: Accessible from dashboard menu

---

## Game Metaphor Mapping

| Component | Game Element | Color | Icon |
|-----------|-------------|-------|------|
| Vision | Win Condition | Green | ✨ |
| Anti-Vision | Game Over / Stakes | Red | 💀 |
| 1 Year Goal | Main Mission | Yellow | 🎯 |
| 1 Month Project | Boss Fight | Orange | ⚔️ |
| Daily Levers | Daily Quests | Blue | ⚡ |
| Constraints | Game Rules | Purple | 📜 |

---

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion, canvas-confetti
- **Database**: Supabase (PostgreSQL)
- **Auth**: Demo mode (Supabase Auth ready)

---

## File Structure

```
fixit-app/
├── app/
│   ├── layout.tsx
│   └── page.tsx (routing logic)
├── components/
│   ├── dashboard/
│   │   ├── GameHUD.tsx
│   │   └── CharacterSheet.tsx
│   ├── onboarding/
│   │   └── OnboardingFlow.tsx
│   ├── routines/
│   │   ├── DailyDirectionCheck.tsx
│   │   ├── WeeklyReflection.tsx
│   │   └── MonthlyBossFight.tsx
│   └── ui/
│       └── XPPopup.tsx
├── lib/
│   ├── supabase.ts
│   ├── questions.ts (Dan's exact questions)
│   └── confetti.ts
├── types/
│   └── index.ts
└── supabase/
    └── schema.sql
```

---

## Next Steps (Optional Enhancements)

### Phase 4: Polish
- [ ] PWA setup for mobile
- [ ] Push notifications (daily/weekly reminders)
- [ ] Real Supabase Auth (replace demo user)
- [ ] Character sheet editing
- [ ] Export/share character sheet
- [ ] Achievement badges
- [ ] Sound effects toggle
- [ ] Data export/import

### Future Features
- [ ] Add new daily levers from dashboard
- [ ] Boss fight difficulty selector
- [ ] Vision timeline (track evolution)
- [ ] Community features (optional sharing)
- [ ] Pattern detection AI (analyze daily comments)
- [ ] Habit streak calendar view

---

## Credits

- **Protocol**: Dan Koe's "How to fix your entire life in 1 day"
- **Framework**: Next.js, Supabase
- **Design**: Custom gamified UI inspired by RPG mechanics
