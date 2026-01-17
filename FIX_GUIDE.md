# Quick Fix Guide - FixIt App Authentication Issue

## Problem
The app fails when saving the character sheet during quick setup due to Row Level Security (RLS) policy violations.

## Solution
Implement Supabase anonymous authentication for demo mode.

---

## File to Change: `/app/page.tsx`

### Current Code (BROKEN)

```typescript
const checkAuthAndProgress = async () => {
  // For now, create a demo user
  // In production, you'd use Supabase Auth
  const demoUserId = 'demo-user-123';  // ❌ NOT a valid UUID, no auth session
  setUserId(demoUserId);

  // Check if user has completed onboarding
  const { data: sheetData } = await supabase
    .from('character_sheet')
    .select('*')
    .eq('user_id', demoUserId)
    .single();

  if (!sheetData) {
    setCurrentView('onboarding');
    return;
  }

  setHasCompletedOnboarding(true);

  // Check if user has completed today's direction check
  const today = new Date().toISOString().split('T')[0];
  const { data: logData } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', demoUserId)
    .eq('date', today)
    .single();

  if (!logData || !logData.direction) {
    setCurrentView('daily-check');
    return;
  }

  setHasCompletedDailyCheck(true);
  setCurrentView('dashboard');
};
```

### Fixed Code (WORKING)

```typescript
const checkAuthAndProgress = async () => {
  // Get or create authenticated session
  const { data: { session } } = await supabase.auth.getSession();

  let currentUserId: string;

  if (!session) {
    // Create anonymous session for demo
    console.log('No session found, creating anonymous session...');
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.error('Failed to create demo session:', error);
      setCurrentView('welcome');
      return;
    }

    // ✓ Anonymous user has real UUID and auth.uid() works
    currentUserId = data.user!.id;
    console.log('Anonymous session created for user:', currentUserId);
  } else {
    currentUserId = session.user.id;
    console.log('Existing session found for user:', currentUserId);
  }

  setUserId(currentUserId);

  // Check if user has completed onboarding
  const { data: sheetData } = await supabase
    .from('character_sheet')
    .select('*')
    .eq('user_id', currentUserId)
    .maybeSingle(); // Use maybeSingle instead of single to avoid error on no results

  if (!sheetData) {
    setCurrentView('onboarding');
    return;
  }

  setHasCompletedOnboarding(true);

  // Check if user has completed today's direction check
  const today = new Date().toISOString().split('T')[0];
  const { data: logData } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', currentUserId)
    .eq('date', today)
    .maybeSingle(); // Use maybeSingle instead of single

  if (!logData || !logData.direction) {
    setCurrentView('daily-check');
    return;
  }

  setHasCompletedDailyCheck(true);
  setCurrentView('dashboard');
};
```

---

## Changes Made

### 1. Get Existing Session
```typescript
const { data: { session } } = await supabase.auth.getSession();
```
**Why:** Check if user already has an authenticated session

### 2. Create Anonymous Session if Needed
```typescript
if (!session) {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error('Failed to create demo session:', error);
    setCurrentView('welcome');
    return;
  }
  currentUserId = data.user!.id;
}
```
**Why:** Anonymous auth creates a real authenticated user with:
- Real UUID (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
- Valid `auth.uid()` value
- Auto-created user record in public.users table (via trigger)
- RLS policies satisfied

### 3. Use User ID from Session
```typescript
currentUserId = session.user.id;
```
**Why:** If session exists, use its user ID instead of hardcoded value

### 4. Changed `.single()` to `.maybeSingle()`
```typescript
// Before:
.single();

// After:
.maybeSingle();
```
**Why:**
- `.single()` throws error if no rows found
- `.maybeSingle()` returns null if no rows found (cleaner error handling)

---

## How It Works

### Before (Broken)
```
User clicks "Start Demo"
  ↓
App sets userId = 'demo-user-123'
  ↓
No auth session exists (auth.uid() = NULL)
  ↓
User fills quick setup form
  ↓
App tries to insert character sheet
  ↓
RLS policy checks: auth.uid() = user_id
  ↓
NULL = 'demo-user-123' → FALSE
  ↓
Insert BLOCKED ❌
  ↓
Error: "new row violates row-level security policy"
```

### After (Fixed)
```
User clicks "Start Demo"
  ↓
App calls checkAuthAndProgress()
  ↓
No session found
  ↓
App calls supabase.auth.signInAnonymously()
  ↓
Supabase creates anonymous user with UUID
  ↓
Trigger auto-creates record in public.users table
  ↓
App sets userId = real UUID (e.g., 'a1b2c3d4...')
  ↓
Auth session exists (auth.uid() = UUID)
  ↓
User fills quick setup form
  ↓
App tries to insert character sheet
  ↓
RLS policy checks: auth.uid() = user_id
  ↓
UUID = UUID → TRUE ✓
  ↓
Insert ALLOWED ✓
  ↓
Success: Character sheet saved!
```

---

## Testing the Fix

### Before Testing
1. Ensure app is running: `npm run dev`
2. Open browser DevTools console

### Test Steps
1. Navigate to http://localhost:3000/
2. Check console for: `"No session found, creating anonymous session..."`
3. Check console for: `"Anonymous session created for user: [UUID]"`
4. Click "Start Demo"
5. Click "Already did this? Skip to quick setup"
6. Fill all 6 form fields:
   - Anti-Vision: "I refuse to die never having created something meaningful"
   - Vision: "I am building toward creative freedom and impact"
   - 1 Year Goal: "Launch my own product and make $100k"
   - 1 Month Project: "Complete MVP and get 10 beta users"
   - Daily Levers (3 lines):
     ```
     Write for 30 minutes
     Exercise for 20 minutes
     Read 10 pages
     ```
   - Constraints: "I will not sacrifice my health and relationships"
7. Click "Start Your Journey"

### Expected Console Output (Success)
```
Saving character sheet for user: a1b2c3d4-e5f6-7890-abcd-ef1234567890
Character sheet saved: {
  id: "...",
  user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  anti_vision: "I refuse to die never having created something meaningful",
  vision: "I am building toward creative freedom and impact",
  year_goal: "Launch my own product and make $100k",
  month_project: "Complete MVP and get 10 beta users",
  constraints: "I will not sacrifice my health and relationships"
}
Daily levers saved: 3
Boss fight created
Quick setup completed successfully
```

### Expected Behavior
- ✓ No error alert appears
- ✓ App navigates to Daily Direction Check
- ✓ Console shows all success messages
- ✓ Can complete daily check
- ✓ Can view character sheet from menu
- ✓ All 6 components display correctly

---

## Optional: Better Error Handling

### File: `/components/onboarding/QuickCharacterSheet.tsx`

Update error handling (lines 45-49):

```typescript
// Current:
if (sheetError) {
  console.error('Error saving character sheet:', sheetError);
  alert('Failed to save character sheet: ' + sheetError.message);
  return;
}

// Improved:
if (sheetError) {
  console.error('Error saving character sheet:', sheetError);

  let errorMessage = 'Failed to save character sheet. ';

  if (sheetError.code === '42501') {
    errorMessage += 'Authentication error. Please refresh the page and try again.';
  } else if (sheetError.code === '23503') {
    errorMessage += 'User setup error. Please contact support.';
  } else if (sheetError.code === '22P02') {
    errorMessage += 'Invalid user ID format. Please contact support.';
  } else {
    errorMessage += sheetError.message;
  }

  alert(errorMessage);
  return;
}
```

---

## Verification

After implementing the fix, verify in Supabase Dashboard:

### SQL Editor Query
```sql
-- Check anonymous user was created
SELECT id, email, created_at
FROM auth.users
WHERE is_anonymous = true
ORDER BY created_at DESC
LIMIT 1;

-- Check character sheet exists
SELECT *
FROM public.character_sheet
ORDER BY updated_at DESC
LIMIT 1;

-- Check daily levers
SELECT lever_text, xp_value, "order"
FROM public.daily_levers
WHERE user_id = (
  SELECT user_id
  FROM public.character_sheet
  ORDER BY updated_at DESC
  LIMIT 1
)
ORDER BY "order";

-- Check boss fight
SELECT project_text, status, progress
FROM public.boss_fights
WHERE user_id = (
  SELECT user_id
  FROM public.character_sheet
  ORDER BY updated_at DESC
  LIMIT 1
)
ORDER BY created_at DESC
LIMIT 1;
```

Expected results:
- 1 anonymous user with UUID
- 1 character sheet with all 6 fields filled
- 3 daily levers (Write, Exercise, Read)
- 1 active boss fight

---

## Why This Is The Right Solution

### ✓ Minimal Code Changes
Only 10-15 lines of code changed in one file

### ✓ No Database Changes Needed
RLS policies remain secure and unchanged

### ✓ No Dependencies Added
Uses built-in Supabase authentication

### ✓ Production Ready
Anonymous auth is a standard Supabase feature designed for this use case

### ✓ Maintains Security
RLS policies still protect user data

### ✓ Easy to Extend
Can add real authentication later without breaking demo mode

---

## Alternative Solutions (Not Recommended)

### ❌ Option 1: Disable RLS
```sql
ALTER TABLE public.character_sheet DISABLE ROW LEVEL SECURITY;
```
**Why not:** Removes all security, allows any user to read/write any data

### ❌ Option 2: Service Role Key
```typescript
export const supabaseAdmin = createClient(url, serviceRoleKey);
```
**Why not:** Service role bypasses all RLS, dangerous if exposed to client

### ❌ Option 3: Use Valid UUID Without Auth
```typescript
const demoUserId = '00000000-0000-0000-0000-000000000001';
```
**Why not:** Still fails RLS check because auth.uid() is NULL

---

## Summary

**Problem:** Demo mode doesn't use authentication, causing RLS policy violations

**Solution:** Use Supabase anonymous authentication to create real auth sessions

**Impact:** Enables all app functionality while maintaining security

**Effort:** 15-30 minutes, 10-15 lines of code

**Files Changed:** 1 file (`app/page.tsx`)

**Testing:** Manual testing in browser with console open

**Verification:** SQL queries in Supabase Dashboard
