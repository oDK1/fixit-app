# FixIt - Gamified Life Transformation App

Transform your life in one day with a gamified protocol based on Dan Koe's life change methodology.

## Features

- **22-Question Onboarding**: Deep psychological excavation through 3 parts
- **Game-like Dashboard**: Level up, gain XP, complete daily quests
- **Daily Direction Check**: 5-minute routine to stay on track
- **Weekly Reflections**: 8-minute review to identify patterns
- **Monthly Boss Fights**: Track project completion and growth
- **Character Sheet**: Your 6-component framework (Vision, Anti-Vision, Mission, Boss, Quests, Rules)

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Animations**: Framer Motion
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
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main routing logic
├── components/
│   ├── dashboard/
│   │   ├── GameHUD.tsx     # Main game dashboard
│   │   └── CharacterSheet.tsx  # 6-component view
│   ├── onboarding/
│   │   └── OnboardingFlow.tsx  # 22-question flow
│   └── routines/
│       └── DailyDirectionCheck.tsx  # Daily check-in
├── lib/
│   ├── supabase.ts         # Supabase client
│   └── questions.ts        # Dan's exact questions
├── types/
│   └── index.ts            # TypeScript types
└── supabase/
    └── schema.sql          # Database schema
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
2. Self-Aware (500-1500 XP)
3. Architect (1500-3500 XP)
4. Builder (3500-7500 XP)
5. Strategist (7500-15000 XP)
6. Visionary (15000+ XP)

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
- [x] Onboarding flow
- [x] Dashboard/HUD
- [x] Daily direction check
- [x] Character sheet

### Phase 2: Weekly/Monthly
- [ ] Weekly reflection flow
- [ ] Monthly boss fight UI
- [ ] Progress tracking
- [ ] Pattern detection

### Phase 3: Gamification
- [ ] Achievement system
- [ ] Confetti animations
- [ ] Sound effects
- [ ] Level up celebrations

### Phase 4: Polish
- [ ] PWA setup
- [ ] Push notifications
- [ ] Supabase Auth
- [ ] Export character sheet
- [ ] Dark mode polish

## Contributing

This is a demo/prototype. Feel free to fork and customize for your own use.

## License

MIT

---

**Note**: This app uses a demo user ID for development. In production, implement proper Supabase authentication.
