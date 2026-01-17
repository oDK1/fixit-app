'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import MainOnboarding from '@/components/onboarding/MainOnboarding';
import GameHUD from '@/components/dashboard/GameHUD';
import DailyDirectionCheck from '@/components/routines/DailyDirectionCheck';
import WeeklyReflection from '@/components/routines/WeeklyReflection';
import MonthlyBossFight from '@/components/routines/MonthlyBossFight';
import AdvancedReflection from '@/components/onboarding/AdvancedReflection';
import MenuModal from '@/components/dashboard/MenuModal';
import AnimatedLanding from '@/components/landing/AnimatedLanding';

type View = 'loading' | 'animated-landing' | 'onboarding' | 'daily-check' | 'dashboard' | 'weekly' | 'monthly' | 'advanced-reflection';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasCompletedDailyCheck, setHasCompletedDailyCheck] = useState(false);
  const [currentView, setCurrentView] = useState<View>('loading');
  const [showMenu, setShowMenu] = useState(false);
  const [hasSeenLanding, setHasSeenLanding] = useState(false);

  useEffect(() => {
    checkAuthAndProgress();
  }, []);

  const handleReset = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();

      // Reload the page to start fresh
      window.location.reload();
    } catch (error) {
      console.error('Error during reset:', error);
      // Force reload anyway
      window.location.reload();
    }
  };

  const checkAuthAndProgress = async () => {
    try {
      console.log('Starting checkAuthAndProgress...');
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

      // Check for existing session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        alert(`Supabase connection error: ${sessionError.message}\n\nPlease check your Supabase credentials in .env.local`);
        setCurrentView('animated-landing');
        return;
      }

      let currentUserId: string;

      if (!session) {
        // Create anonymous session for demo
        console.log('Creating anonymous session...');
        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) {
          console.error('Failed to create anonymous session:', error);
          alert(`Failed to start demo session: ${error.message}\n\nPlease check:\n1. Your Supabase credentials in .env.local\n2. Anonymous auth is enabled in Supabase dashboard`);
          setCurrentView('animated-landing');
          return;
        }

        currentUserId = data.user!.id;
        console.log('Anonymous session created:', currentUserId);
      } else {
        currentUserId = session.user.id;
        console.log('Existing session found:', currentUserId);
      }

      setUserId(currentUserId);

      // Check if user has completed onboarding
      const { data: sheetData } = await supabase
        .from('character_sheet')
        .select('*')
        .eq('user_id', currentUserId)
        .single();

      if (!sheetData) {
        // New user - show landing page first
        setCurrentView('animated-landing');
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
        .single();

      if (!logData || !logData.direction) {
        setCurrentView('daily-check');
        return;
      }

      setHasCompletedDailyCheck(true);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error in checkAuthAndProgress:', error);
      alert(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nCheck the browser console for details.`);
      setCurrentView('animated-landing');
    }
  };

  // Render based on current view
  if (currentView === 'loading') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (!userId || currentView === 'animated-landing') {
    return (
      <AnimatedLanding onEnter={() => {
        setHasSeenLanding(true);
        setCurrentView('onboarding');
      }} />
    );
  }

  if (currentView === 'onboarding') {
    return (
      <MainOnboarding
        userId={userId}
        onComplete={() => {
          setHasCompletedOnboarding(true);
          setCurrentView('daily-check');
        }}
      />
    );
  }

  if (currentView === 'daily-check') {
    return (
      <DailyDirectionCheck
        userId={userId}
        onComplete={() => {
          setHasCompletedDailyCheck(true);
          setCurrentView('dashboard');
        }}
      />
    );
  }

  if (currentView === 'weekly') {
    return (
      <WeeklyReflection
        userId={userId!}
        onComplete={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'monthly') {
    return (
      <MonthlyBossFight
        userId={userId!}
        onComplete={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'advanced-reflection') {
    return (
      <AdvancedReflection
        userId={userId!}
        isFullScreen={true}
        onClose={() => setCurrentView('dashboard')}
      />
    );
  }

  return (
    <>
      <div className="relative">
        {/* Menu Button */}
        <button
          onClick={() => setShowMenu(true)}
          className="fixed top-6 right-6 z-40 p-3 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg transition"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <GameHUD userId={userId!} />
      </div>

      {showMenu && (
        <MenuModal
          onClose={() => setShowMenu(false)}
          onAdvancedReflection={() => setCurrentView('advanced-reflection')}
          onWeeklyReflection={() => setCurrentView('weekly')}
          onMonthlyBossFight={() => setCurrentView('monthly')}
          onReset={handleReset}
        />
      )}
    </>
  );
}
