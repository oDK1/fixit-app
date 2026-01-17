import confetti from 'canvas-confetti';

export const celebrateQuestComplete = () => {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.6 },
    colors: ['#a855f7', '#ec4899', '#f59e0b'],
  });
};

export const celebrateLevelUp = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#a855f7', '#ec4899', '#f59e0b'],
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#a855f7', '#ec4899', '#f59e0b'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

export const celebrateBossDefeated = () => {
  const duration = 5000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: NodeJS.Timeout = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#ff0000', '#ff8800', '#ffff00'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#ff0000', '#ff8800', '#ffff00'],
    });
  }, 250);
};

export const celebrateStreak = (days: number) => {
  if (days % 7 === 0) {
    // Weekly milestone
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b6b', '#ffd700', '#ff8c00'],
    });
  }
};
