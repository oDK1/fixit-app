# FixIt App - Quick Setup Failure Analysis

## Executive Summary

The FixIt app **FAILS** at the character sheet save step during quick setup. The root cause is a **Row Level Security (RLS) policy violation** in Supabase due to using a demo user without proper authentication.

## Failure Point

**Step:** Clicking "Start Your Journey" button after filling the quick setup form
**Component:** `/components/onboarding/QuickCharacterSheet.tsx` (line 32)
**Error:** Database insert blocked by RLS policy

## Flow Diagram

```
User Journey:
┌─────────────────────┐
│  1. Open App        │  ✓ Works
│  localhost:3000     │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  2. Click           │  ✓ Works
│  "Start Demo"       │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  3. Click Skip to   │  ✓ Works
│  Quick Setup        │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  4. Fill Form with  │  ✓ Works
│  6 Components       │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  5. Click "Start    │  ✗ FAILS HERE
│  Your Journey"      │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Error: RLS Policy  │  Error shown
│  Violation          │  in console
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Alert: Failed to   │  Alert shown
│  save character     │  to user
│  sheet              │
└─────────────────────┘
```

## Technical Details

### The Problem Chain

1. **App sets demo user ID:**
   ```typescript
   // In app/page.tsx line 29
   const demoUserId = 'demo-user-123';
   ```

2. **User fills quick setup form and clicks submit**

3. **App attempts to insert character sheet:**
   ```typescript
   // In QuickCharacterSheet.tsx lines 32-43
   const { data: sheetData, error: sheetError } = await supabase
     .from('character_sheet')
     .insert({
       user_id: userId, // 'demo-user-123'
       anti_vision: antiVision,
       vision,
       year_goal: yearGoal,
       month_project: monthProject,
       constraints,
     })
     .select()
     .single();
   ```

4. **Supabase checks RLS policy:**
   ```sql
   -- In schema.sql
   CREATE POLICY "Users can insert own sheet" ON public.character_sheet
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

5. **Policy evaluation:**
   ```
   auth.uid() = NULL (no authenticated session)
   user_id = 'demo-user-123'

   Check: NULL = 'demo-user-123' → FALSE
   Result: INSERT BLOCKED
   ```

6. **Error returned to client:**
   ```javascript
   {
     code: '42501',
     message: 'new row violates row-level security policy for table "character_sheet"',
     details: null,
     hint: null
   }
   ```

7. **Console logs:**
   ```
   Saving character sheet for user: demo-user-123
   Error saving character sheet: [error object]
   ```

8. **Alert shown to user:**
   ```
   Failed to save character sheet: new row violates row-level security policy for table "character_sheet"
   ```

## Console Output

### Expected Logs (if it worked):
```
✓ Saving character sheet for user: demo-user-123
✓ Character sheet saved: {id: "...", user_id: "demo-user-123", ...}
✓ Daily levers saved: 3
✓ Boss fight created
✓ Quick setup completed successfully
```

### Actual Logs (current state):
```
⚠ Saving character sheet for user: demo-user-123
✗ Error saving character sheet: {
    code: "42501",
    message: "new row violates row-level security policy for table \"character_sheet\"",
    details: null,
    hint: null
  }
```

## Visual Breakdown

### What the User Sees:

1. **Quick Setup Form** (Working)
   - 6 colored sections (red, green, yellow, orange, blue, purple)
   - All form fields accept input
   - "Start Your Journey" button becomes enabled when all fields filled

2. **Click Submit** (Working)
   - Button shows "Saving..." text
   - Button becomes disabled

3. **Error Alert** (Failure Point)
   - Browser alert appears:
   - "Failed to save character sheet: new row violates row-level security policy for table "character_sheet""

4. **Console Error** (Visible in DevTools)
   - Red error message with full error object
   - Stack trace showing the failure in QuickCharacterSheet component

### What SHOULD Happen:

1. Form saves successfully
2. App navigates to Daily Direction Check
3. User can complete daily check
4. User can view Character Sheet from menu
5. All 6 components display with saved data

### What ACTUALLY Happens:

1. Form fails to save
2. Error alert appears
3. User stays on Quick Setup form
4. Cannot proceed to dashboard
5. Character sheet remains empty

## Related Issues

### Issue 1: Invalid UUID Format
The demo user ID 'demo-user-123' is not a valid UUID format. Database expects:
```
Valid:   '00000000-0000-0000-0000-000000000001'
Invalid: 'demo-user-123'
```

### Issue 2: Missing User Record
Even if RLS was bypassed, the foreign key constraint requires a user record:
```sql
user_id UUID REFERENCES public.users(id)
```

The demo user doesn't exist in the users table, so insert would fail with:
```
Error: insert or update on table "character_sheet" violates foreign key constraint
```

### Issue 3: Same Problem for Daily Levers
After character sheet, the code tries to save daily levers. This will also fail:
```typescript
const { error: leversError } = await supabase
  .from('daily_levers')
  .insert(levers);
```

RLS policy blocks this too:
```sql
CREATE POLICY "Users can insert own levers" ON public.daily_levers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Issue 4: Same Problem for Boss Fight
Finally, the boss fight insert will also fail:
```typescript
const { error: bossError } = await supabase
  .from('boss_fights')
  .insert({
    user_id: userId,
    month_start: new Date().toISOString().split('T')[0],
    project_text: monthProject,
    status: 'active',
    progress: 0,
  });
```

## The Root Cause

The app was designed with authentication in mind (RLS policies), but the demo mode doesn't use real authentication. This creates a mismatch:

```
Design:      User logs in → auth.uid() exists → RLS allows operations
Demo Mode:   No login → auth.uid() is NULL → RLS blocks operations
```

## The Solution

Implement Supabase anonymous authentication for demo mode:

```typescript
// In app/page.tsx
const checkAuthAndProgress = async () => {
  // Get or create authenticated session
  const { data: { session } } = await supabase.auth.getSession();

  let currentUserId: string;

  if (!session) {
    // Create anonymous session for demo
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error('Failed to create demo session:', error);
      setCurrentView('welcome');
      return;
    }
    currentUserId = data.user!.id; // This is a real UUID
  } else {
    currentUserId = session.user.id;
  }

  setUserId(currentUserId);

  // Now auth.uid() exists and RLS policies will work
  // ...rest of code
}
```

This solves ALL the issues:
- ✓ auth.uid() returns a valid UUID (not NULL)
- ✓ RLS policies are satisfied (auth.uid() = user_id)
- ✓ User record gets auto-created via trigger in schema
- ✓ All inserts succeed
- ✓ All selects work when viewing character sheet

## Files That Need Changes

1. `/app/page.tsx` - Add anonymous auth
2. `/components/onboarding/QuickCharacterSheet.tsx` - Better error handling (optional)
3. `/components/dashboard/CharacterSheet.tsx` - No changes needed (will work after #1)

## Testing After Fix

1. Open http://localhost:3000/
2. Click "Start Demo" (this will create anonymous session)
3. Click skip to quick setup
4. Fill form
5. Click "Start Your Journey"
6. Should see success logs and navigate to daily check
7. Complete daily check
8. Open menu and view character sheet
9. All data should be displayed correctly

## Verification Queries

After successful save, these queries should return data:

```sql
-- Check user was created (via anonymous auth + trigger)
SELECT * FROM auth.users WHERE email LIKE '%@%'; -- Anonymous users have generated emails

-- Check character sheet
SELECT * FROM public.character_sheet LIMIT 1;

-- Check daily levers
SELECT * FROM public.daily_levers ORDER BY "order";

-- Check boss fight
SELECT * FROM public.boss_fights WHERE status = 'active';
```

## Priority: CRITICAL

This is a blocking issue that prevents the core functionality of the app. Users cannot:
- Complete quick setup
- Save their character sheet
- Access the main dashboard
- Use any features of the app

**Estimated fix time:** 15-30 minutes
**Complexity:** Low (add 5-10 lines of code)
**Impact:** High (enables entire app functionality)
