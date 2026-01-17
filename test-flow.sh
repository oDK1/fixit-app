#!/bin/bash

# FixIt App - Quick Setup Flow Testing Script
# This script helps verify the issues identified in the testing report

echo "============================================================================="
echo "FIXIT APP - QUICK SETUP FLOW TESTING"
echo "============================================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if app is running
echo "1. Checking if app is running..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep -q "200"; then
    echo -e "${GREEN}✓${NC} App is running at http://localhost:3000/"
else
    echo -e "${RED}✗${NC} App is NOT running. Please start with: npm run dev"
    exit 1
fi
echo ""

# Check environment variables
echo "2. Checking environment configuration..."
if [ -f .env.local ]; then
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local && grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo -e "${GREEN}✓${NC} Supabase environment variables found"
    else
        echo -e "${RED}✗${NC} Missing Supabase environment variables"
    fi
else
    echo -e "${RED}✗${NC} .env.local file not found"
fi
echo ""

# Analyze code for issues
echo "3. Analyzing code for known issues..."
echo ""

echo "   Issue A: Checking demo user ID format..."
DEMO_USER_LINE=$(grep "demo-user-123" app/page.tsx)
if [ -n "$DEMO_USER_LINE" ]; then
    echo -e "   ${RED}✗${NC} Found hardcoded demo user: 'demo-user-123'"
    echo "      This is NOT a valid UUID format"
    echo "      Database expects UUID type (e.g., '00000000-0000-0000-0000-000000000001')"
    echo ""
fi

echo "   Issue B: Checking for RLS bypass..."
if grep -q "supabaseAdmin" lib/supabase.ts; then
    echo -e "   ${GREEN}✓${NC} Service role client found (RLS bypass available)"
else
    echo -e "   ${RED}✗${NC} No service role client found"
    echo "      Row Level Security will block demo user inserts"
    echo ""
fi

echo "   Issue C: Checking for anonymous auth..."
if grep -q "signInAnonymously" app/page.tsx; then
    echo -e "   ${GREEN}✓${NC} Anonymous authentication implemented"
else
    echo -e "   ${RED}✗${NC} No anonymous authentication found"
    echo "      Demo user will not satisfy RLS policies"
    echo ""
fi

echo ""
echo "============================================================================="
echo "PREDICTED FAILURE POINT"
echo "============================================================================="
echo ""
echo "Based on code analysis, the app will FAIL at:"
echo ""
echo -e "${RED}Step 4: Saving Character Sheet${NC}"
echo ""
echo "When you click 'Start Your Journey', the save operation will fail with:"
echo ""
echo "  Error saving character sheet: {"
echo "    code: '42501',"
echo "    message: 'new row violates row-level security policy for table \"character_sheet\"'"
echo "  }"
echo ""
echo "OR possibly:"
echo ""
echo "  Error saving character sheet: {"
echo "    code: '22P02',"
echo "    message: 'invalid input syntax for type uuid: \"demo-user-123\"'"
echo "  }"
echo ""
echo "This happens because:"
echo "  1. Demo user 'demo-user-123' is not a valid UUID"
echo "  2. No authenticated session exists (auth.uid() returns NULL)"
echo "  3. RLS policy requires: auth.uid() = user_id"
echo "  4. NULL ≠ 'demo-user-123' → policy violation → insert blocked"
echo ""
echo "============================================================================="
echo "MANUAL TESTING STEPS"
echo "============================================================================="
echo ""
echo "1. Open http://localhost:3000/ in your browser"
echo "2. Open DevTools Console (F12 or Cmd+Option+I)"
echo "3. Click 'Start Demo'"
echo "4. Click 'Already did this? Skip to quick setup'"
echo "5. Fill out all 6 form fields:"
echo "   - Anti-Vision: I refuse to die never having created something meaningful"
echo "   - Vision: I am building toward creative freedom and impact"
echo "   - 1 Year Goal: Launch my own product and make \$100k"
echo "   - 1 Month Project: Complete MVP and get 10 beta users"
echo "   - Daily Levers (3 lines):"
echo "     Write for 30 minutes"
echo "     Exercise for 20 minutes"
echo "     Read 10 pages"
echo "   - Constraints: I will not sacrifice my health and relationships"
echo "6. Click 'Start Your Journey'"
echo "7. Check console for errors"
echo ""
echo "============================================================================="
echo "EXPECTED CONSOLE OUTPUT (CURRENT STATE)"
echo "============================================================================="
echo ""
echo -e "${YELLOW}Console Log:${NC}"
echo "  Saving character sheet for user: demo-user-123"
echo ""
echo -e "${RED}Console Error:${NC}"
echo "  Error saving character sheet: [RLS policy violation or UUID error]"
echo ""
echo -e "${RED}Browser Alert:${NC}"
echo "  Failed to save character sheet: [error message]"
echo ""
echo "============================================================================="
echo "RECOMMENDED FIXES"
echo "============================================================================="
echo ""
echo "See TESTING_REPORT.md for detailed fix instructions."
echo ""
echo "Quick fix summary:"
echo "  1. Implement Supabase anonymous authentication"
echo "  2. Use proper UUID for demo user"
echo "  3. Add service role client for admin operations (if needed)"
echo ""
echo "Priority: Implement anonymous auth (Option C in TESTING_REPORT.md)"
echo ""
echo "============================================================================="
echo ""

# Ask if user wants to open the app
read -p "Open http://localhost:3000/ in default browser? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:3000/
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open http://localhost:3000/
    else
        echo "Please open http://localhost:3000/ manually"
    fi
fi

echo ""
echo "Testing script complete. Follow the manual steps above."
echo ""
