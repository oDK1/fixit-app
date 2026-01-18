# FixIt - Gamified Life Transformation App

Transform your life in one day with a gamified protocol based on Dan Koe's life change methodology.

**Live Demo**: [fixit-app-sage.vercel.app](https://fixit-app-sage.vercel.app/)

## Features

- **Animated Landing Page**: Dramatic engraving-style intro with floating character
- **22-Question Onboarding**: Deep psychological excavation through 3 parts (Pain, Anti-Vision, Vision, Synthesis)
- **Game-like Dashboard**: Level up, gain XP, complete daily quests with visual HUD
- **Daily Direction Check**: 5-minute routine to stay on track (+50 XP)
- **Weekly Reflections**: 8-minute review to identify patterns (+200 XP)
- **Monthly Boss Fights**: Track project completion and growth (+1000 XP)
- **Character Sheet**: Your 6-component framework (Vision, Anti-Vision, Mission, Boss, Quests, Rules)
- **Quest Editor**: Customize daily levers with individual XP values
- **Confetti Celebrations**: Visual feedback on achievements and level-ups
- **Google OAuth**: Optional sign-in for data persistence across devices

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **UI**: React 19 + Tailwind CSS v4
- **Animations**: Framer Motion + Canvas Confetti
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Deployment**: Vercel

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon key
4. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Migrations

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the migration

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
fixit-app/
├── app/
│   ├── auth/
│   │   ├── callback/route.ts    # OAuth callback handler
│   │   └── auth-error/page.tsx  # Auth error page
│   ├── layout.tsx               # Root layout with metadata
│   └── page.tsx                 # Main routing controller
├── components/
│   ├── auth/
│   │   ├── GoogleSignInButton.tsx
│   │   └── SignOutButton.tsx
│   ├── dashboard/
│   │   ├── GameHUD.tsx          # Main game dashboard
│   │   ├── MenuModal.tsx        # Settings/reset menu
│   │   └── QuestEditor.tsx      # Daily lever editor
│   ├── landing/
│   │   ├── AnimatedLanding.tsx  # Intro animation
│   │   ├── FloatingMan.tsx      # Character animation
│   │   └── EnterButton.tsx      # CTA button
│   ├── onboarding/
│   │   ├── OnboardingFlow.tsx   # 22-question flow
│   │   ├── MainOnboarding.tsx   # Core questions
│   │   ├── AdvancedReflection.tsx
│   │   └── QuickCharacterSheet.tsx
│   ├── routines/
│   │   ├── DailyDirectionCheck.tsx
│   │   ├── WeeklyReflection.tsx
│   │   └── MonthlyBossFight.tsx
│   └── ui/
│       └── XPPopup.tsx          # XP gain notification
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── questions.ts             # Dan's exact 22 questions
│   └── confetti.ts              # Confetti animation helpers
├── types/
│   └── index.ts                 # TypeScript types + XP/level config
└── supabase/
    └── schema.sql               # Database schema
```

## Game Mechanics

### XP System
- Daily lever complete: +25-100 XP (user-defined)
- Daily direction check (vision): +50 XP
- Weekly reflection: +200 XP
- Monthly boss defeated: +1000 XP
- Streak bonuses: 7 days (+500), 30 days (+2000), 90 days (+5000)

### Levels
1. Conformist (0-500 XP)
2. Self-Aware (500-1,500 XP)
3. Architect (1,500-3,500 XP)
4. Builder (3,500-7,500 XP)
5. Strategist (7,500-15,000 XP)
6. Visionary (15,000-30,000 XP)
7. Master (30,000-60,000 XP)
8. Legend (60,000+ XP)

### 6-Component Framework
- **Anti-Vision**: What's at stake (game over condition)
- **Vision**: Win condition
- **1 Year Goal**: Main mission
- **1 Month Project**: Boss fight
- **Daily Levers**: Daily quests
- **Constraints**: Game rules

## Routines

### Daily (5 min)
1. Direction check: Vision or hate? + Why?
2. Complete daily levers (quests)
3. Track streak

### Weekly (8 min)
1. Review: Most alive? Most dead?
2. Anti-vision reminder
3. Adjust daily levers
4. Project progress check

### Monthly (10 min)
1. Boss fight completion review
2. Set new monthly project
3. Vision evolution check
4. Constraint review

## Development Roadmap

### Phase 1: Core Loop ✅
- [x] Animated landing page
- [x] Onboarding flow (22 questions)
- [x] Dashboard/HUD with XP and levels
- [x] Daily direction check
- [x] Character sheet view

### Phase 2: Weekly/Monthly ✅
- [x] Weekly reflection flow
- [x] Monthly boss fight UI
- [x] Progress tracking
- [x] Quest editor

### Phase 3: Gamification ✅
- [x] Confetti animations
- [x] XP popup notifications
- [x] Level up celebrations
- [x] Streak tracking
- [ ] Achievement system
- [ ] Sound effects

### Phase 4: Auth & Polish ✅
- [x] Supabase anonymous auth
- [x] Google OAuth sign-in
- [x] Vercel deployment
- [ ] PWA setup
- [ ] Push notifications
- [ ] Export character sheet

## Contributing

This is a demo/prototype. Feel free to fork and customize for your own use.

## License

MIT

---

**Built with Dan Koe's "Turn Your Life Into A Video Game" methodology.**
