'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { logger, ErrorMessages } from '@/lib/logger';
import MainOnboarding from '@/components/onboarding/MainOnboarding';
import GameHUD from '@/components/dashboard/GameHUD';
import DailyDirectionCheck from '@/components/routines/DailyDirectionCheck';
import WeeklyReflection from '@/components/routines/WeeklyReflection';
import MonthlyBossFight from '@/components/routines/MonthlyBossFight';
import AdvancedReflection from '@/components/onboarding/AdvancedReflection';
import MenuModal from '@/components/dashboard/MenuModal';
import AnimatedLanding from '@/components/landing/AnimatedLanding';

type View = 'loading' | 'animated-landing' | 'animated-landing-autoplay' | 'onboarding' | 'daily-check' | 'dashboard' | 'weekly' | 'monthly' | 'advanced-reflection';

// Wrapper component to handle Suspense for useSearchParams
export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [userId, setUserId] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasCompletedDailyCheck, setHasCompletedDailyCheck] = useState(false);
  const [currentView, setCurrentView] = useState<View>('loading');
  const [showMenu, setShowMenu] = useState(false);
  const [hasSeenLanding, setHasSeenLanding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    checkAuthAndProgress();
  }, []);

  const handleReset = async () => {
    try {
      // Sign out from Supabase
      const supabase = createClient();
      await supabase.auth.signOut();

      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();

      // Reload the page to start fresh
      window.location.reload();
    } catch (error) {
      logger.error('Error during reset:', error);
      // Force reload anyway
      window.location.reload();
    }
  };

  const checkAuthAndProgress = async () => {
    try {
      const supabase = createClient();
      logger.log('Starting checkAuthAndProgress...');

      // Check for existing session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        logger.error('Session error:', sessionError);
        setErrorMessage(ErrorMessages.AUTH_SESSION);
        setCurrentView('animated-landing');
        return;
      }

      let currentUserId: string;

      if (!session) {
        // No session - show landing page for Google sign-in or demo
        setCurrentView('animated-landing');
        return;
      } else {
        currentUserId = session.user.id;
        logger.log('Session found');
      }

      setUserId(currentUserId);

      // Check if this is a welcome redirect from Google OAuth
      const isWelcome = searchParams.get('welcome') === 'true';

      // Check if user has completed onboarding
      const { data: sheetData } = await supabase
        .from('character_sheet')
        .select('*')
        .eq('user_id', currentUserId)
        .single();

      if (!sheetData) {
        // User is authenticated but hasn't completed onboarding
        if (isWelcome) {
          // Show the intro video for Google auth users, then go to onboarding
          // Clean up the URL
          router.replace('/', { scroll: false });
          setCurrentView('animated-landing-autoplay');
        } else {
          setCurrentView('onboarding');
        }
        return;
      }

      setHasCompletedOnboarding(true);

      // Clean up welcome parameter for returning users
      if (isWelcome) {
        router.replace('/', { scroll: false });
      }

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
      logger.error('Error in checkAuthAndProgress:', error);
      setErrorMessage(ErrorMessages.GENERIC);
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

  const handleDemoEnter = async () => {
    try {
      const supabase = createClient();
      setHasSeenLanding(true);
      setErrorMessage(null);

      // Create anonymous session for demo mode
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        logger.error('Failed to create anonymous session:', error);
        setErrorMessage(ErrorMessages.AUTH_SIGNIN);
        return;
      }

      setUserId(data.user!.id);
      setCurrentView('onboarding');
    } catch (error) {
      logger.error('Error starting demo:', error);
      setErrorMessage(ErrorMessages.AUTH_SIGNIN);
    }
  };

  if (currentView === 'animated-landing') {
    return <AnimatedLanding onEnter={handleDemoEnter} errorMessage={errorMessage} />;
  }

  if (currentView === 'animated-landing-autoplay') {
    // For Google auth users - show landing with video auto-playing
    return (
      <AnimatedLanding
        onEnter={() => setCurrentView('onboarding')}
        autoPlay={true}
      />
    );
  }

  if (!userId) {
    return <AnimatedLanding onEnter={handleDemoEnter} errorMessage={errorMessage} />;
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
