import { useInView } from "framer-motion";
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from "react-i18next";
import { useTheme } from 'next-themes';
import { Volume2, VolumeX } from 'lucide-react';

const EliSphereSoundWaves = ({ audioSrc, onTimeUpdate }) => {
  const { t } = useTranslation("landing");
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { margin: "200px" });
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    let logicalWidth = 300;
    let logicalHeight = 300;
    let sphereRadius = 100;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      logicalWidth = rect.width || 300;
      logicalHeight = rect.height || 300;
      
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = logicalWidth * dpr;
      canvas.height = logicalHeight * dpr;
      canvas.style.width = `${logicalWidth}px`;
      canvas.style.height = `${logicalHeight}px`;
      
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      
      sphereRadius = Math.min(logicalWidth, logicalHeight) * 0.26;
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const numParticles = 400;
    const particles = [];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        theta: Math.random() * 2 * Math.PI,
        phi: Math.acos(Math.random() * 2 - 1),
        speedTheta: (Math.random() - 0.5) * 0.015,
        speedPhi: (Math.random() - 0.5) * 0.015,
        baseSize: Math.random() * 1.5 + 0.5,
        randomFactor: Math.random()
      });
    }
    particlesRef.current = particles;

    let angleX = 0;
    let angleY = 0;

    const render = () => {
      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      angleX += 0.002;
      angleY += 0.003;

      let audioScale = 1; 
      let reactiveMultiplier = 0;
      
      if (analyserRef.current && dataArrayRef.current && !isMuted) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        let sum = 0;
        let peaks = 0;
        const vocalRangeLimit = Math.floor(dataArrayRef.current.length / 3);
        
        for (let i = 0; i < vocalRangeLimit; i++) {
          sum += dataArrayRef.current[i];
          if (dataArrayRef.current[i] > 200) peaks += 1;
        }
        
        const average = sum / vocalRangeLimit;
        const normalizedVol = average / 255;
        
        reactiveMultiplier = Math.pow(normalizedVol, 1.5); 
        audioScale = 1 + (reactiveMultiplier * 0.8) + (peaks * 0.02); 
      } else {
        audioScale = 1 + Math.sin(Date.now() * 0.002) * 0.05;
      }

      const centerX = logicalWidth / 2;
      const centerY = logicalHeight / 2;

      const haloGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        sphereRadius * 0.12,
        centerX,
        centerY,
        sphereRadius * 1.95,
      );

      if (isDark) {
        haloGradient.addColorStop(0, "rgba(4, 255, 141, 0.18)");
        haloGradient.addColorStop(0.42, "rgba(0, 229, 255, 0.10)");
        haloGradient.addColorStop(1, "rgba(4, 255, 141, 0)");
      } else {
        haloGradient.addColorStop(0, "rgba(0, 229, 255, 0.12)");
        haloGradient.addColorStop(0.38, "rgba(4, 255, 141, 0.09)");
        haloGradient.addColorStop(1, "rgba(0, 229, 255, 0)");
      }

      ctx.beginPath();
      ctx.fillStyle = haloGradient;
      ctx.arc(centerX, centerY, sphereRadius * 1.95, 0, Math.PI * 2);
      ctx.fill();

      particlesRef.current.forEach(p => {
        let moveSpeed = !isMuted ? 1 + (reactiveMultiplier * 4) : 0.2;
        p.theta += p.speedTheta * moveSpeed;
        p.phi += p.speedPhi * moveSpeed;

        let currentRadius = sphereRadius + (!isMuted ? reactiveMultiplier * 30 * p.randomFactor : 0);

        let px = currentRadius * Math.sin(p.phi) * Math.cos(p.theta);
        let py = currentRadius * Math.sin(p.phi) * Math.sin(p.theta);
        let pz = currentRadius * Math.cos(p.phi);

        let cosY = Math.cos(angleY), sinY = Math.sin(angleY);
        let cosX = Math.cos(angleX), sinX = Math.sin(angleX);
        let x1 = px * cosY - pz * sinY;
        let z1 = pz * cosY + px * sinY;
        let y2 = py * cosX - z1 * sinX;
        let z2 = z1 * cosX + py * sinX;

        const fov = 300;
        const scaleProject = fov / (fov + z2);
        
        const xProj = (x1 * scaleProject * audioScale) + centerX;
        const yProj = (y2 * scaleProject * audioScale) + centerY;

        const finalSize = p.baseSize * scaleProject * audioScale;
        const depthAlpha = Math.max(0.1, (z2 + currentRadius) / (currentRadius * 2));

        let fillColor;
        let shadowColor;
        let glowIntensity = 0;
        
        if (!isMuted && reactiveMultiplier > 0.05) {
            // Prisma Spectrum: Cyan (180) -> Blue (230) -> Fuchsia (280) -> Orange (380/20)
            const hue = (180 + (p.randomFactor * 200) + (reactiveMultiplier * 30)) % 360;
            
            const actualLightness = isDark ? 64 : 50;
            const visibleAlpha = Math.max(depthAlpha, isDark ? 0.24 : 0.3);
            fillColor = `hsla(${hue}, 100%, ${actualLightness}%, ${visibleAlpha})`;
            shadowColor = `hsla(${hue}, 100%, ${actualLightness}%, 0.95)`;
            glowIntensity = 8 + (reactiveMultiplier * 28);
        } else {
            if (isDark) {
              const idleHue = 176 + (p.randomFactor * 26);
              const idleLightness = 76 - (p.randomFactor * 8);
              const idleAlpha = Math.max(depthAlpha * 0.92, 0.24);
              fillColor = `hsla(${idleHue}, 92%, ${idleLightness}%, ${idleAlpha})`;
              shadowColor = `hsla(${idleHue}, 100%, 72%, 0.72)`;
              glowIntensity = 12;
            } else {
              const idleLightness = 50 - (p.randomFactor * 14);
              const idleAlpha = Math.max(depthAlpha * 0.78, 0.3);
              fillColor = `hsla(0, 0%, ${idleLightness}%, ${idleAlpha})`;
              shadowColor = "hsla(0, 0%, 42%, 0.48)";
              glowIntensity = 5;
            }
        }

        ctx.beginPath();
        ctx.arc(xProj, yProj, finalSize, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.shadowBlur = glowIntensity;
        ctx.shadowColor = shadowColor;
        ctx.fill();
      });

      if (isInView) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    if (isInView) {
      render();
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isMuted, isDark, isInView]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    
    const attemptAutoplay = async () => {
      try {
        audio.muted = true;
        await audio.play();
      } catch (err) {
        // Browser autoplay policies can pause this until the user interacts.
      }
    };
    
    attemptAutoplay();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [audioSrc]);

  const toggleMute = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const nextMuted = !audio.muted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);

    if (audio.paused) {
      audio.play().catch((e) => console.error("Play error on unmute:", e));
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block', 
          width: '100%', 
          height: '100%', 
          outline: 'none' 
        }}
      />

      {audioSrc ? (
        <audio
          ref={audioRef}
          src={audioSrc}
          crossOrigin="anonymous"
          onTimeUpdate={onTimeUpdate}
          autoPlay
          loop
          muted
        />
      ) : null}

      <button 
        onClick={toggleMute}
        className="absolute z-10 bottom-[-10px] right-[-10px] md:bottom-2 md:right-2 flex items-center justify-center w-10 h-10 rounded-full bg-[#04FF8D]/10 text-[#04FF8D] border border-[#04FF8D]/30 backdrop-blur-md transition-all hover:bg-[#04FF8D]/20 hover:scale-105"
        aria-label={isMuted ? t("tour.scene2.sound_on") : t("tour.scene2.sound_off")}
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

    </div>
  );
};

export default EliSphereSoundWaves;
