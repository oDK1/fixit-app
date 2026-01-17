'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import GameHUD from '@/components/dashboard/GameHUD';
import DailyDirectionCheck from '@/components/routines/DailyDirectionCheck';
import WeeklyReflection from '@/components/routines/WeeklyReflection';
import MonthlyBossFight from '@/components/routines/MonthlyBossFight';
import CharacterSheet from '@/components/dashboard/CharacterSheet';
import MenuModal from '@/components/dashboard/MenuModal';

type View = 'loading' | 'welcome' | 'onboarding' | 'daily-check' | 'dashboard' | 'weekly' | 'monthly' | 'character-sheet';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasCompletedDailyCheck, setHasCompletedDailyCheck] = useState(false);
  const [currentView, setCurrentView] = useState<View>('loading');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    checkAuthAndProgress();
  }, []);

  const checkAuthAndProgress = async () => {
    try {
      console.log('Starting checkAuthAndProgress...');
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

      // Check for existing session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        alert(`Supabase connection error: ${sessionError.message}\n\nPlease check your Supabase credentials in .env.local`);
        setCurrentView('welcome');
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
          setCurrentView('welcome');
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
      setCurrentView('welcome');
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

  if (!userId || currentView === 'welcome') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Engraving Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
          <img
            src="/images/falling-engraving.jpeg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-20 flex flex-col items-center">
          <h1 className="text-6xl font-bold mb-4 text-center tracking-tight">
            Are you falling into the{' '}
            <span className="text-red-500">life you hate</span>
          </h1>
          <h2 className="text-5xl font-bold mb-8 text-center tracking-tight">
            or climbing toward the{' '}
            <span className="text-green-500">life you want</span>?
          </h2>

          <div className="max-w-2xl mb-12">
            <p className="text-xl text-gray-300 mb-4 text-center leading-relaxed">
              Most people quit their goals in 2 weeks because they build on a rotting foundation.
            </p>
            <p className="text-xl text-gray-300 text-center leading-relaxed">
              This protocol helps you dig into your psyche, discover what you truly want, and turn your life into a game you can't stop playing.
            </p>
          </div>

          <button
            onClick={checkAuthAndProgress}
            className="px-12 py-5 bg-white text-black rounded-lg font-bold text-xl hover:bg-gray-200 transition shadow-2xl border-4 border-white"
          >
            BEGIN THE DESCENT
          </button>

          <p className="mt-6 text-sm text-gray-500 uppercase tracking-widest">
            One day to change everything
          </p>
        </div>

        {/* Vignette effect */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-transparent via-black/30 to-black/80" />
      </div>
    );
  }

  if (currentView === 'onboarding') {
    return (
      <OnboardingFlow
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

  if (currentView === 'character-sheet') {
    return (
      <CharacterSheet
        userId={userId!}
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
          onViewCharacterSheet={() => setCurrentView('character-sheet')}
          onWeeklyReflection={() => setCurrentView('weekly')}
          onMonthlyBossFight={() => setCurrentView('monthly')}
        />
      )}
    </>
  );
}
