'use client';

import { useRef, useEffect } from 'react';

interface FloatingManProps {
  isEntering: boolean;
}

export default function FloatingMan({ isEntering }: FloatingManProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isEntering && videoRef.current) {
      // Play the video when user clicks enter
      videoRef.current.currentTime = 0; // Reset to start
      videoRef.current.play();
    }
  }, [isEntering]);

  return (
    <div className="absolute inset-0 z-0">
      {/* Fullscreen video */}
      <video
        ref={videoRef}
        muted
        playsInline
        className="w-full h-full object-cover"
      >
        <source src="/images/man-to-blackhole.mp4" type="video/mp4" />
        <source src="/images/man-to-blackhole.webm" type="video/webm" />
      </video>
    </div>
  );
}
