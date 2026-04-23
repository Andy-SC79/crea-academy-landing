import { useCallback, useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  depth: number;
  phase: number;
  clusterUx: number;
  clusterUy: number;
}

interface ParticleFieldProps {
  circleFormationProgress?: number;
  enableAudioReactivity?: boolean;
  circleCenterYRatio?: number;
  circleRadiusRatio?: number;
}

type AudioLinkState = {
  context: AudioContext | null;
  analyser: AnalyserNode | null;
  frequencyData: Uint8Array | null;
  mediaSources: WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>;
};

const COLORS = ["#04FF8D", "#00E5FF", "#0066FF", "#9D00FF", "#FF00FF", "#04FF8D"];
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const DENSITY = 5_500;
const MAX_PARTICLES = 500;
const REPEL_RADIUS = 170;
const REPEL_FORCE = 9;
const SPRING = 0.012;
const FRICTION = 0.94;
const DRIFT_AMP = 0.35;
const DRIFT_SPEED = 0.0004;
const LINK_DIST = 120;
const LINK_ALPHA = 0.12;
const GRID_CELL = LINK_DIST;
const FORMED_CIRCLE_COLOR = "#c86dff";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const smoothstep = (value: number): number => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

const collectMediaElementsDeep = (root: Element | ShadowRoot): HTMLMediaElement[] => {
  const stack: Array<Element | ShadowRoot> = [root];
  const mediaElements: HTMLMediaElement[] = [];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    if (current instanceof Element && (current as HTMLElement).shadowRoot) {
      stack.push((current as HTMLElement).shadowRoot as ShadowRoot);
    }

    const children = Array.from(current.children);
    for (const child of children) {
      if (child instanceof HTMLAudioElement || child instanceof HTMLVideoElement) {
        mediaElements.push(child);
      }
      if ((child as HTMLElement).shadowRoot) {
        stack.push((child as HTMLElement).shadowRoot as ShadowRoot);
      }
      stack.push(child);
    }
  }

  return mediaElements;
};

const ensureAnalyserNode = (state: AudioLinkState): AnalyserNode | null => {
  if (typeof window === "undefined") return null;

  const AudioContextCtor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextCtor) return null;

  if (!state.context) {
    state.context = new AudioContextCtor();
  }

  if (state.context.state === "suspended") {
    void state.context.resume().catch(() => {});
  }

  if (!state.analyser) {
    const analyser = state.context.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.85;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -14;
    analyser.connect(state.context.destination);
    state.analyser = analyser;
    state.frequencyData = new Uint8Array(analyser.frequencyBinCount);
  }

  return state.analyser;
};

const connectMediaElement = (media: HTMLMediaElement, state: AudioLinkState): boolean => {
  const analyser = ensureAnalyserNode(state);
  const context = state.context;
  if (!analyser || !context) return false;
  if (state.mediaSources.has(media)) return true;

  try {
    const source = context.createMediaElementSource(media);
    source.connect(analyser);
    state.mediaSources.set(media, source);
    return true;
  } catch {
    return false;
  }
};

const ParticleField = ({
  circleFormationProgress = 0,
  enableAudioReactivity = false,
  circleCenterYRatio = 0.43,
  circleRadiusRatio = 0.19,
}: ParticleFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef(0);
  const formationProgressRef = useRef(clamp(circleFormationProgress, 0, 1));
  const circleConfigRef = useRef({ x: 0, y: 0, radius: 0 });
  const gridRef = useRef<Map<string, number[]>>(new Map());
  const audioEnergyRef = useRef(0);
  const mediaElementsRef = useRef<HTMLMediaElement[]>([]);
  const audioStateRef = useRef<AudioLinkState>({
    context: null,
    analyser: null,
    frequencyData: null,
    mediaSources: new WeakMap(),
  });

  useEffect(() => {
    formationProgressRef.current = clamp(circleFormationProgress, 0, 1);
  }, [circleFormationProgress]);

  useEffect(() => {
    if (!enableAudioReactivity) {
      audioEnergyRef.current = 0;
      mediaElementsRef.current = [];
      return;
    }
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const syncAudioSources = () => {
      const hosts = Array.from(document.querySelectorAll("elevenlabs-convai"));
      const mediaElementsCollected: HTMLMediaElement[] = [];
      for (const host of hosts) {
        const mediaElements = collectMediaElementsDeep(host);
        for (const media of mediaElements) {
          mediaElementsCollected.push(media);
          connectMediaElement(media, audioStateRef.current);
        }
      }
      mediaElementsRef.current = mediaElementsCollected;
    };

    const unlockAudioContext = () => {
      const context = audioStateRef.current.context;
      if (context?.state === "suspended") {
        void context.resume().catch(() => {});
      }
    };

    syncAudioSources();
    const intervalId = window.setInterval(syncAudioSources, 1000);
    window.addEventListener("pointerdown", unlockAudioContext, { passive: true });
    window.addEventListener("keydown", unlockAudioContext);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("pointerdown", unlockAudioContext);
      window.removeEventListener("keydown", unlockAudioContext);
    };
  }, [enableAudioReactivity]);

  useEffect(
    () => () => {
      const context = audioStateRef.current.context;
      if (context) {
        void context.close().catch(() => {});
      }
      audioStateRef.current = {
        context: null,
        analyser: null,
        frequencyData: null,
        mediaSources: new WeakMap(),
      };
    },
    [],
  );

  const cellKey = (cx: number, cy: number) => `${cx},${cy}`;

  const buildGrid = useCallback((particles: Particle[]) => {
    const grid = gridRef.current;
    grid.clear();
    for (let i = 0; i < particles.length; i++) {
      const cx = Math.floor(particles[i].x / GRID_CELL);
      const cy = Math.floor(particles[i].y / GRID_CELL);
      const key = cellKey(cx, cy);
      const arr = grid.get(key);
      if (arr) arr.push(i);
      else grid.set(key, [i]);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const updateCircleConfig = (w: number, h: number) => {
      const radiusBase = Math.min(w, h) * circleRadiusRatio;
      circleConfigRef.current = {
        x: w * 0.5,
        y: h * circleCenterYRatio,
        radius: clamp(radiusBase, 105, 215),
      };
    };

    const initParticles = (w: number, h: number) => {
      const count = Math.min(Math.floor((w * h) / DENSITY), MAX_PARTICLES);
      particlesRef.current = Array.from({ length: count }, (_, index) => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const depth = Math.random();
        const radiusNorm = Math.sqrt((index + 0.5) / count);
        const theta = index * GOLDEN_ANGLE;

        return {
          x,
          y,
          baseX: x,
          baseY: y,
          vx: 0,
          vy: 0,
          size: (Math.random() * 3.5 + 1.5) * (0.5 + depth * 0.5),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          alpha: 0.45 + depth * 0.4,
          depth,
          phase: Math.random() * Math.PI * 2,
          clusterUx: Math.cos(theta) * radiusNorm,
          clusterUy: Math.sin(theta) * radiusNorm,
        };
      });
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      updateCircleConfig(w, h);
      initParticles(w, h);
    };

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchEnd = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    let lastTs = 0;

    const animate = (ts: number) => {
      const dt = Math.min((ts - lastTs) / 16.667, 3);
      lastTs = ts;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const particles = particlesRef.current;
      const formation = smoothstep(formationProgressRef.current);
      const driftFactor = formation >= 0.96 ? 0 : 1 - formation;
      const repelFactor = formation >= 0.65 ? 0 : 1 - formation / 0.65;
      const connectionFactor = formation >= 0.8 ? 0 : 1 - formation / 0.8;
      let audioEnergy = 0;
      const hasPlayingMedia = mediaElementsRef.current.some((media) => {
        return !media.paused && !media.ended && media.readyState >= 2;
      });

      if (enableAudioReactivity) {
        const analyser = audioStateRef.current.analyser;
        const bins = audioStateRef.current.frequencyData;
        if (analyser && bins) {
          analyser.getByteFrequencyData(bins);
          let sum = 0;
          for (let i = 0; i < bins.length; i++) {
            sum += bins[i] / 255;
          }
          const avg = sum / Math.max(1, bins.length);
          let targetEnergy = clamp((avg - 0.03) * 3.1, 0, 1);
          if (targetEnergy < 0.018 && hasPlayingMedia) {
            targetEnergy = 0.1 + Math.sin(ts * 0.011) * 0.028;
          }
          audioEnergyRef.current += (targetEnergy - audioEnergyRef.current) * 0.18;
        } else if (hasPlayingMedia) {
          const targetEnergy = 0.11 + Math.sin(ts * 0.011) * 0.03;
          audioEnergyRef.current += (targetEnergy - audioEnergyRef.current) * 0.12;
        } else {
          audioEnergyRef.current *= 0.94;
        }
        audioEnergy = audioEnergyRef.current;
      }
      const speechEnergy = audioEnergy > 0.008 ? audioEnergy : 0;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (repelFactor > 0.02) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const distSq = dx * dx + dy * dy;
          const repelSq = REPEL_RADIUS * REPEL_RADIUS;

          if (distSq < repelSq && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const t = 1 - dist / REPEL_RADIUS;
            const str = t * t * REPEL_FORCE * repelFactor * (0.6 + p.depth * 0.4);
            p.vx -= (dx / dist) * str * dt;
            p.vy -= (dy / dist) * str * dt;
          }
        }

        const circlePulse = 1 + speechEnergy * formation * 0.26;
        const audioJitter = speechEnergy * formation * (5.2 + p.depth * 2.8);
        const waveT = ts * 0.012 + p.phase * 1.7;
        const circleTargetX = circleConfigRef.current.x
          + p.clusterUx * circleConfigRef.current.radius * circlePulse
          + Math.cos(waveT) * audioJitter;
        const circleTargetY = circleConfigRef.current.y
          + p.clusterUy * circleConfigRef.current.radius * circlePulse
          + Math.sin(waveT * 0.85) * audioJitter;
        const targetX = p.baseX * (1 - formation) + circleTargetX * formation;
        const targetY = p.baseY * (1 - formation) + circleTargetY * formation;
        const springGain = 1 + formation * 2.2;

        p.vx += (targetX - p.x) * SPRING * springGain * dt;
        p.vy += (targetY - p.y) * SPRING * springGain * dt;

        if (driftFactor > 0.02) {
          const driftT = ts * DRIFT_SPEED;
          const driftSc = DRIFT_AMP * driftFactor * (0.5 + p.depth * 0.5);
          p.vx += Math.sin(driftT + p.phase) * driftSc * 0.3 * dt;
          p.vy += Math.cos(driftT * 0.7 + p.phase * 1.3) * driftSc * dt;
        }

        const fric = Math.pow(FRICTION, dt);
        p.vx *= fric;
        p.vy *= fric;

        if (formation >= 0.98 && speechEnergy < 0.01) {
          p.vx *= 0.45;
          p.vy *= 0.45;
          p.x += (targetX - p.x) * 0.35;
          p.y += (targetY - p.y) * 0.35;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.x < -20) p.vx += 0.5 * dt;
        if (p.x > w + 20) p.vx -= 0.5 * dt;
        if (p.y < -20) p.vy += 0.5 * dt;
        if (p.y > h + 20) p.vy -= 0.5 * dt;
      }

      buildGrid(particles);

      if (connectionFactor > 0.03) {
        ctx.lineWidth = 0.5;
        const grid = gridRef.current;
        const visited = new Set<string>();

        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          const cx = Math.floor(a.x / GRID_CELL);
          const cy = Math.floor(a.y / GRID_CELL);

          for (let ox = 0; ox <= 1; ox++) {
            for (let oy = (ox === 0 ? 0 : -1); oy <= 1; oy++) {
              const key = cellKey(cx + ox, cy + oy);
              const cell = grid.get(key);
              if (!cell) continue;

              for (const j of cell) {
                if (j <= i) continue;
                const pairKey = `${i}-${j}`;
                if (visited.has(pairKey)) continue;
                visited.add(pairKey);

                const b = particles[j];
                const lx = a.x - b.x;
                const ly = a.y - b.y;
                const ld = lx * lx + ly * ly;
                if (ld > LINK_DIST * LINK_DIST) continue;

                const alpha = LINK_ALPHA * connectionFactor * (1 - Math.sqrt(ld) / LINK_DIST);
                ctx.strokeStyle = `rgba(4,255,141,${alpha.toFixed(3)})`;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
              }
            }
          }
        }
      }

      if (formation >= 0.85) {
        const sizeBoost = 1 + speechEnergy * 0.32;
        ctx.fillStyle = FORMED_CIRCLE_COLOR;
        ctx.shadowColor = FORMED_CIRCLE_COLOR;
        for (const p of particles) {
          const radius = (1.05 + p.depth * 0.2) * sizeBoost;
          ctx.globalAlpha = Math.min(0.96, 0.78 + p.depth * 0.14 + speechEnergy * 0.08);
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        const byColor = new Map<string, Particle[]>();
        for (const p of particles) {
          const arr = byColor.get(p.color);
          if (arr) arr.push(p);
          else byColor.set(p.color, [p]);
        }

        const alphaBoost = 1 + formation * 0.2 + speechEnergy * formation * 0.35;
        for (const [color, group] of byColor) {
          ctx.fillStyle = color;
          ctx.shadowColor = color;

          for (const p of group) {
            const sizeBoost = 1 + speechEnergy * formation * 0.22;
            ctx.globalAlpha = Math.min(1, p.alpha * 0.8 * alphaBoost);
            ctx.shadowBlur = p.size > 1.8 ? p.size * 4 * sizeBoost : 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * sizeBoost, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [buildGrid, circleCenterYRatio, circleRadiusRatio, enableAudioReactivity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-auto z-0"
      aria-hidden="true"
    />
  );
};

export default ParticleField;
