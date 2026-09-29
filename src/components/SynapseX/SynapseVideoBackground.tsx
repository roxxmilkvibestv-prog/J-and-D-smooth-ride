import React, { useEffect, useRef, useState } from 'react';

// The Google Labs Flow shared video URL requested by user
export const GOOGLE_FLOW_VIDEO_URL = "https://labs.google/fx/tools/flow/shared/video/4b18f983-77af-48b1-8590-66f99c054ba2";

export const SYNAPSE_VIDEOS = {
  hero: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_083515_290e5a10-0b95-41af-a5e2-32b6389baa4d.mp4",
  second: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_092455_089c54f8-3b03-4966-9df1-e9746063d0ef.mp4",
  metrics: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095810_ecea3dd2-fc5e-4e41-8696-4219290b6589.mp4",
  tech: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095750_32a52ce0-2005-45c9-9093-41f03fde9530.mp4",
  footer: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_080203_fd7f4f85-3a86-4837-8192-85e7bfe68e75.mp4",
};

interface SynapseVideoProps {
  type: 'hero' | 'second' | 'metrics' | 'tech' | 'footer';
  className?: string;
  isScrubbed?: boolean;
}

export const SynapseVideoBackground: React.FC<SynapseVideoProps> = ({
  type,
  className = '',
  isScrubbed = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const targetTimeRef = useRef<number>(0);
  const lastMouseXRef = useRef<number | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const directMp4Url = SYNAPSE_VIDEOS[type];

  // Mouse scrubbing logic for Hero - Optimized with requestAnimationFrame
  useEffect(() => {
    if (!isScrubbed) return;

    const video = videoRef.current;
    if (!video) return;

    video.pause();

    let rafId: number | null = null;
    let isSeekingLocal = false;

    const handleSeeked = () => {
      isSeekingLocal = false;
      setIsSeeking(false);
    };

    video.addEventListener('seeked', handleSeeked);

    const scheduleSeek = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!isSeekingLocal && video && video.readyState >= 2) {
          const delta = Math.abs(video.currentTime - targetTimeRef.current);
          if (delta > 0.04) {
            isSeekingLocal = true;
            setIsSeeking(true);
            video.currentTime = targetTimeRef.current;
          }
        }
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (lastMouseXRef.current === null) {
        lastMouseXRef.current = e.clientX;
        return;
      }

      const deltaX = e.clientX - lastMouseXRef.current;
      lastMouseXRef.current = e.clientX;

      const duration = video.duration || 8;
      // Smooth subtle sensitivity
      const step = (deltaX / window.innerWidth) * duration * 0.4;
      let newTime = targetTimeRef.current + step;

      if (newTime < 0) newTime = 0;
      if (newTime > duration) newTime = duration;

      targetTimeRef.current = newTime;
      scheduleSeek();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      video.removeEventListener('seeked', handleSeeked);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isScrubbed]);

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none transform-gpu ${className}`}>
      {/* Primary Google Labs Flow video embed integration */}
      <iframe
        src={GOOGLE_FLOW_VIDEO_URL}
        title={`Google Flow Video ${type}`}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover scale-110 opacity-30 pointer-events-none mix-blend-screen"
        allow="autoplay; encrypted-media"
      />

      {/* CloudFront Direct Video for scrubbing & reliable HTML5 video stream */}
      <video
        ref={videoRef}
        src={directMp4Url}
        autoPlay={!isScrubbed}
        loop={!isScrubbed}
        muted
        playsInline
        preload="auto"
        onLoadedData={() => setVideoLoaded(true)}
        className="absolute inset-0 w-full h-full object-cover opacity-85 transition-opacity duration-1000"
      />

      {/* Subtle scanline overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
};
