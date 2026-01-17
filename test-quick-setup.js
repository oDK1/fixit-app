/**
 * Manual Testing Script for FixIt App Quick Setup
 *
 * This script provides step-by-step instructions to manually test the Quick Setup flow.
 * Since we can't automate browser testing, follow these instructions:
 */

console.log(`
=============================================================================
FIXIT APP - QUICK SETUP TESTING GUIDE
=============================================================================

PREREQUISITE:
- Ensure the app is running at http://localhost:3000/

TESTING STEPS:
-----------------------------------------------------------------------------

1. OPEN THE APP
   - Navigate to: http://localhost:3000/
   - Expected: You should see "Welcome to FixIt" page with "Start Demo" button

2. START DEMO
   - Click the "Start Demo" button
   - Expected: App loads onboarding flow

3. SKIP TO QUICK SETUP
   - Look for the skip button: "Already did this? Skip to quick setup"
   - Click it
   - Expected: Quick Character Sheet form appears with 6 sections

4. FILL OUT THE FORM WITH TEST DATA:

   Anti-Vision (Stakes):
   "I refuse to die never having created something meaningful"

   Vision (Win Condition):
   "I am building toward creative freedom and impact"

   1 Year Goal (Mission):
   "Launch my own product and make $100k"

   1 Month Project (Boss):
   "Complete MVP and get 10 beta users"

   Daily Levers (Quests) - Enter each on a new line:
   Write for 30 minutes
   Exercise for 20 minutes
   Read 10 pages

   Constraints (Rules):
   "I will not sacrifice my health and relationships"

5. OPEN BROWSER CONSOLE
   - Press F12 (Windows/Linux) or Cmd+Option+I (Mac)
   - Go to Console tab
   - Keep it open to monitor logs

6. SUBMIT THE FORM
   - Click "Start Your Journey" button
   - Expected console logs:
     * "Saving character sheet for user: demo-user-123"
     * "Character sheet saved: [data]"
     * "Daily levers saved: 3"
     * "Boss fight created"
     * "Quick setup completed successfully"

   - Watch for any ERROR messages in red

7. AFTER SUBMISSION
   - Expected: App should navigate to Daily Direction Check
   - If error occurs, note the exact error message

8. OPEN CHARACTER SHEET
   - Complete the daily check (if it loads)
   - Click the menu button (☰) in top right
   - Click "View Character Sheet"
   - Expected: Character sheet modal opens showing all your data

9. VERIFY DATA IN CHARACTER SHEET
   - Check if all 6 sections display correctly:
     ✓ Anti-Vision (red border)
     ✓ Vision (green border)
     ✓ Mission (yellow border)
     ✓ Boss (orange border)
     ✓ Quests with 3 levers (blue border)
     ✓ Rules (purple border)

=============================================================================
COMMON ISSUES TO CHECK:
=============================================================================

1. SUPABASE CONNECTION ERROR
   - Console shows: "Failed to save character sheet"
   - Reason: Supabase credentials missing or invalid
   - Check: .env.local file has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

2. CHARACTER SHEET NOT LOADING
   - Console shows: "No character sheet found"
   - Possible reasons:
     a) Data didn't save (check console during save)
     b) User ID mismatch
     c) Database query error

3. DAILY LEVERS NOT SHOWING
   - Character sheet loads but Quests section is empty
   - Reason: Daily levers insert failed
   - Check console for "Error saving levers"

4. NAVIGATION DOESN'T HAPPEN
   - After clicking "Start Your Journey", nothing happens
   - Check if button is disabled (grayed out)
   - Verify all form fields are filled

=============================================================================
DIRECT DATABASE CHECK (if available):
=============================================================================

If you have access to Supabase dashboard, check these tables:

1. character_sheet table:
   - Should have 1 row with user_id = 'demo-user-123'
   - All fields should match your input

2. daily_levers table:
   - Should have 3 rows with user_id = 'demo-user-123'
   - active = true, order = 0, 1, 2

3. boss_fights table:
   - Should have 1 row with user_id = 'demo-user-123'
   - status = 'active', progress = 0

=============================================================================
`);

// Check if app is running
const http = require('http');

const req = http.get('http://localhost:3000', (res) => {
  if (res.statusCode === 200) {
    console.log('✓ App is running at http://localhost:3000/');
    console.log('\nYou can now proceed with manual testing.\n');
  } else {
    console.log(`✗ App returned status code: ${res.statusCode}`);
  }
}).on('error', (err) => {
  console.log('✗ App is NOT running at http://localhost:3000/');
  console.log('  Please start the app with: npm run dev\n');
});
