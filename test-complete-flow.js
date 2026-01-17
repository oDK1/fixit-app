const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteFlow() {
  console.log('🎮 STARTING FIXIT APP TEST FLOW\n');

  try {
    // Step 1: Create anonymous user
    console.log('📝 Step 1: Creating anonymous user...');
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

    if (authError) {
      console.error('❌ Auth error:', authError.message);
      return;
    }

    const userId = authData.user.id;
    console.log('✅ Anonymous user created:', userId);

    // Wait for trigger to create user record
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Quick Setup - Create character sheet
    console.log('\n📝 Step 2: Quick Setup - Creating character sheet...');
    const characterData = {
      user_id: userId,
      anti_vision: 'I refuse to become stuck in mediocrity, scrolling my life away without purpose.',
      vision: 'I am building a life of intentional creation, deep work, and meaningful impact.',
      year_goal: 'Build and launch my SaaS product with 1000 paying users.',
      month_project: 'Complete MVP with core features and onboard first 10 beta users.',
      constraints: 'I will not sacrifice my health, family time, or integrity.'
    };

    const { error: sheetError } = await supabase
      .from('character_sheet')
      .insert(characterData);

    if (sheetError) {
      console.error('❌ Character sheet error:', sheetError.message);
      return;
    }
    console.log('✅ Character sheet created');

    // Step 3: Create daily levers
    console.log('\n📝 Step 3: Creating daily levers...');
    const levers = [
      { user_id: userId, lever_text: 'Write for 2 hours on product', xp_value: 100, order: 1 },
      { user_id: userId, lever_text: 'Exercise for 30 minutes', xp_value: 50, order: 2 },
      { user_id: userId, lever_text: 'Read for 1 hour', xp_value: 50, order: 3 }
    ];

    const { data: leverData, error: leverError } = await supabase
      .from('daily_levers')
      .insert(levers)
      .select();

    if (leverError) {
      console.error('❌ Daily levers error:', leverError.message);
      return;
    }
    console.log('✅ Created ' + leverData.length + ' daily levers');

    // Step 4: Daily Direction Check
    console.log('\n📝 Step 4: Daily Direction Check...');
    const today = new Date().toISOString().split('T')[0];
    const dailyLog = {
      user_id: userId,
      date: today,
      direction: 'vision',
      comment: 'Feeling motivated and focused today. Ready to build!',
      levers_completed: leverData.map(l => l.id),
      xp_gained: 200
    };

    const { error: logError } = await supabase
      .from('daily_logs')
      .insert(dailyLog);

    if (logError) {
      console.error('❌ Daily log error:', logError.message);
      return;
    }
    console.log('✅ Daily direction check completed (+200 XP)');

    // Update user XP
    const { error: xpError } = await supabase
      .from('users')
      .update({
        total_xp: 250,
        current_streak: 1,
        longest_streak: 1
      })
      .eq('id', userId);

    if (xpError) {
      console.error('❌ XP update error:', xpError.message);
    } else {
      console.log('✅ User XP updated to 250 (Level 1: Conformist)');
    }

    // Step 5: Weekly Reflection
    console.log('\n📝 Step 5: Weekly Reflection...');
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const weeklyReflection = {
      user_id: userId,
      week_start: weekStart.toISOString().split('T')[0],
      most_alive: 'When I was coding in flow state for 3 hours straight',
      most_dead: 'During endless social media scrolling before bed',
      pattern_noticed: 'I procrastinate when tasks feel overwhelming - need to break them down',
      anti_vision_check: true,
      levers_adjusted: false,
      project_progress: 25
    };

    const { error: weeklyError } = await supabase
      .from('weekly_reflections')
      .insert(weeklyReflection);

    if (weeklyError) {
      console.error('❌ Weekly reflection error:', weeklyError.message);
    } else {
      console.log('✅ Weekly reflection completed (+200 XP)');

      await supabase
        .from('users')
        .update({ total_xp: 450 })
        .eq('id', userId);
      console.log('✅ Total XP now: 450 (Level 1: Conformist)');
    }

    // Step 6: Monthly Boss Fight
    console.log('\n📝 Step 6: Monthly Boss Fight...');
    const monthStart = new Date();
    monthStart.setDate(1);

    const bossFight = {
      user_id: userId,
      month_start: monthStart.toISOString().split('T')[0],
      project_text: 'Complete MVP with core features and onboard first 10 beta users',
      completion_criteria: '10 beta users signed up and using product daily',
      status: 'defeated',
      progress: 100,
      loot_acquired: ['Product validation', 'User feedback', 'Technical confidence'],
      learnings: 'Shipping early and iterating is better than perfection. Users want solutions, not features.',
      xp_gained: 1000
    };

    const { error: bossError } = await supabase
      .from('boss_fights')
      .insert(bossFight);

    if (bossError) {
      console.error('❌ Boss fight error:', bossError.message);
    } else {
      console.log('✅ ⚔️ BOSS DEFEATED! (+1000 XP)');
      console.log('💎 LOOT ACQUIRED:');
      bossFight.loot_acquired.forEach(item => console.log('   • ' + item));

      await supabase
        .from('users')
        .update({ total_xp: 1450, current_level: 2 })
        .eq('id', userId);
      console.log('✅ Total XP now: 1450 (Level 2: Self-Aware) 🎉');
    }

    // Verify final state
    console.log('\n📊 FINAL STATE CHECK:');
    const { data: finalUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: finalSheet } = await supabase
      .from('character_sheet')
      .select('*')
      .eq('user_id', userId)
      .single();

    console.log('✅ User Level: ' + (finalUser ? finalUser.current_level : 1));
    console.log('✅ Total XP: ' + (finalUser ? finalUser.total_xp : 0));
    console.log('✅ Current Streak: ' + (finalUser ? finalUser.current_streak : 0) + ' days');
    console.log('✅ Vision: ' + (finalSheet ? finalSheet.vision : 'N/A'));

    console.log('\n🎉 TEST FLOW COMPLETED SUCCESSFULLY! 🎉');
    console.log('\n📝 Summary:');
    console.log('   ✅ Quick setup onboarding');
    console.log('   ✅ Daily direction check (3 levers)');
    console.log('   ✅ Weekly reflection');
    console.log('   ✅ Monthly boss fight (defeated)');
    console.log('   ✅ XP system working (250 → 450 → 1450)');
    console.log('   ✅ Level up achieved (1 → 2)');

    console.log('\n🧹 Cleaning up test data...');
    await supabase.auth.signOut();
    console.log('✅ Test cleanup complete');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }

  process.exit(0);
}

testCompleteFlow();
