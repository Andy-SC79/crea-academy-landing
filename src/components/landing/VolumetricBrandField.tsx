import { useEffect, useRef } from "react";

export type VolumetricShape = "nebula" | "galaxy" | "supernova" | "pulsar" | "cluster" | "void";
type Shape = VolumetricShape;

interface VolumetricBrandFieldProps {
  shape?: Shape;
  density?: number;
  palette?: [string, string, string];
  cycle?: boolean;
  showLogo?: boolean;
  className?: string;
  onShapeChange?: (shape: Shape) => void;
  theme?: string;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  phase: number;
  depthOffset: number;
  speedVariance: number;
}

interface ScreenState {
  screenX: number;
  screenY: number;
  perspective: number;
  renderedSize: number;
  separationRadius: number;
}

interface RenderTokens {
  bodyFill: [string, string, string];
  tailColor: (fillColor: string) => string;
  tailOpacityStops: [number, number, number, number];
  trailBlendMode: GlobalCompositeOperation;
  backgroundFade: string | null;
  bodyBlendMode: GlobalCompositeOperation;
  ringStrokeOpacityHex: string;
  sparkleAlphaBase: number;
  sparkleAlphaSwing: number;
}

const CYCLE_ORDER: VolumetricShape[] = ["nebula", "galaxy", "supernova", "pulsar", "cluster", "void"];
const DEFAULT_PALETTE: [string, string, string] = ["#04FF8D", "#00E5FF", "#9D00FF"];
const LIGHT_MODE_PRISM_TARGETS = ["#005A43", "#0A56B8", "#4B2BDF"] as const;
const LIGHT_MODE_WEIGHTS = [0.5, 0.46, 0.4] as const;
const DARK_TRAIL_HALO = "#F4FCFF";
const LIGHT_TRAIL_INK = "#0B1424";

const MOTION = {
  fieldOfView: 4.0,
  bodyScale: 1.16,
  bodyThickness: 0.58,
  stretchPerSpeed: 126,
  minSeparationEm: 1,
  separationRadiusMultiplier: 2.55,
  separationStrength: 0.0022,
  maxSeparationForce: 1.75,
  cursorInfluenceRadius: 0.25,
  cursorPushStrength: 0.02,
  cursorSinkStrength: -0.05,
  velocityLerp: 0.05,
  damping: 0.98,
  targetFlowSpeed: 0.015,
  targetDepthSpeed: 0.01,
  boundX: 2.5,
  boundY: 2.5,
  tailLengthSizeMultiplier: 5.1,
  tailLengthSpeedMultiplier: 5.4,
  tailMinLengthMultiplier: 2.5,
  tailMaxLengthMultiplier: 13.8,
  tailNearOffsetMultiplier: 0.34,
  tailNearWidthMultiplier: 0.62,
  tailFarWidthMultiplier: 0.1,
  alphaCeiling: 0.76,
  alphaGain: 0.98,
} as const;

const LOGO_SPARKLES = [
  { x: 0.78, y: -0.55, size: 0.11, phase: 0 },
  { x: 0.95, y: -0.35, size: 0.07, phase: 1.5 },
  { x: 0.88, y: -0.15, size: 0.05, phase: 3 },
];

function clampByte(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hexToRgb(hex: string) {
  const normalized = hex.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) => clampByte(channel).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function mixHexColors(colorA: string, colorB: string, weight: number) {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  if (!a || !b) return colorA;

  const mixChannel = (source: number, target: number) => source * (1 - weight) + target * weight;

  return rgbToHex(
    mixChannel(a.r, b.r),
    mixChannel(a.g, b.g),
    mixChannel(a.b, b.b),
  );
}

function rgbaFromHex(hex: string, alpha: number) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function getRenderPalette(basePalette: [string, string, string], isDark: boolean): [string, string, string] {
  if (isDark) return basePalette;

  return basePalette.map((color, index) =>
    mixHexColors(color, LIGHT_MODE_PRISM_TARGETS[index], LIGHT_MODE_WEIGHTS[index]),
  ) as [string, string, string];
}

function getRenderTokens(basePalette: [string, string, string], isDark: boolean): RenderTokens {
  const bodyPalette = getRenderPalette(basePalette, isDark);

  if (isDark) {
    return {
      bodyFill: bodyPalette,
      tailColor: (fillColor) => mixHexColors(fillColor, DARK_TRAIL_HALO, 0.24),
      tailOpacityStops: [0, 0.04, 0.14, 0.4],
      trailBlendMode: "lighter",
      backgroundFade: "rgba(5, 7, 12, 0.14)",
      bodyBlendMode: "lighter",
      ringStrokeOpacityHex: "18",
      sparkleAlphaBase: 0.55,
      sparkleAlphaSwing: 0.2,
    };
  }

  return {
    bodyFill: bodyPalette,
    tailColor: (fillColor) => mixHexColors(fillColor, LIGHT_TRAIL_INK, 0.82),
    tailOpacityStops: [0, 0.03, 0.08, 0.24],
    trailBlendMode: "multiply",
    backgroundFade: null,
    bodyBlendMode: "source-over",
    ringStrokeOpacityHex: "20",
    sparkleAlphaBase: 0.6,
    sparkleAlphaSwing: 0.1,
  };
}

export default function VolumetricBrandField({
  shape = "nebula",
  density = 1,
  palette = DEFAULT_PALETTE,
  cycle = true,
  showLogo = true,
  className = "",
  onShapeChange,
  theme,
}: VolumetricBrandFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shapeRef = useRef<Shape>(shape);
  const paletteRef = useRef<[string, string, string]>(palette);
  const themeRef = useRef<string | undefined>(theme);

  useEffect(() => {
    shapeRef.current = shape;
  }, [shape]);

  useEffect(() => {
    paletteRef.current = palette;
  }, [palette]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rootFontPx = 16;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      canvas.width = bounds.width * dpr;
      canvas.height = bounds.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rootFontPx = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const particleCount = Math.floor(650 * density);
    const particles: Particle[] = [];

    for (let index = 0; index < particleCount; index++) {
      particles.push({
        x: (Math.random() - 0.5) * 4.0,
        y: (Math.random() - 0.5) * 4.0,
        z: (Math.random() - 0.5) * 2.0,
        vx: 0,
        vy: 0,
        vz: 0,
        size: 0.8 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        depthOffset: Math.random() * Math.PI * 2,
        speedVariance: 0.8 + Math.random() * 0.4,
      });
    }

    let cycleIndex = Math.max(0, CYCLE_ORDER.indexOf(shapeRef.current));
    let cycleTimer: number | null = null;
    if (cycle) {
      cycleTimer = window.setInterval(() => {
        cycleIndex = (cycleIndex + 1) % CYCLE_ORDER.length;
        shapeRef.current = CYCLE_ORDER[cycleIndex];
        onShapeChange?.(CYCLE_ORDER[cycleIndex]);
      }, 8000);
    }

    const mouse = { x: 0, y: 0, inside: false };
    const onMove = (event: MouseEvent) => {
      const bounds = canvas.getBoundingClientRect();
      mouse.x = event.clientX - bounds.left;
      mouse.y = event.clientY - bounds.top;
      mouse.inside = true;
    };
    const onLeave = () => {
      mouse.inside = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const drawStar = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string,
      alpha: number,
      rotation: number,
    ) => {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.fillStyle = color;
      context.globalAlpha = alpha;
      context.beginPath();
      const longArm = size;
      const shortArm = size * 0.22;
      context.moveTo(0, -longArm);
      context.quadraticCurveTo(shortArm, -shortArm, longArm, 0);
      context.quadraticCurveTo(shortArm, shortArm, 0, longArm);
      context.quadraticCurveTo(-shortArm, shortArm, -longArm, 0);
      context.quadraticCurveTo(-shortArm, -shortArm, 0, -longArm);
      context.closePath();
      context.fill();
      context.restore();
    };

    let animationFrame = 0;
    let t = 0;

    const loop = () => {
      t += 1;

      const bounds = canvas.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width, height) * 0.42;
      const isDark = themeRef.current === "dark";
      const renderTokens = getRenderTokens(paletteRef.current || DEFAULT_PALETTE, isDark);
      const baseSeparationPx = rootFontPx * MOTION.minSeparationEm;
      const gridCellSize = Math.max(baseSeparationPx * 1.4, 20);

      ctx.globalCompositeOperation = "source-over";
      if (renderTokens.backgroundFade) {
        ctx.fillStyle = renderTokens.backgroundFade;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      const screenStates: ScreenState[] = new Array(particles.length);
      const spatialGrid = new Map<string, number[]>();

      for (let index = 0; index < particles.length; index++) {
        const particle = particles[index];
        const zDistance = 4.5 - particle.z;
        const perspective = MOTION.fieldOfView / Math.max(0.1, zDistance);
        const screenX = centerX + particle.x * perspective * scale;
        const screenY = centerY + particle.y * perspective * scale;
        const renderedSize = Math.max(0.1, particle.size * perspective * MOTION.bodyScale);
        const separationRadius = Math.max(
          baseSeparationPx,
          renderedSize * MOTION.separationRadiusMultiplier,
        );

        screenStates[index] = {
          screenX,
          screenY,
          perspective,
          renderedSize,
          separationRadius,
        };

        const cellX = Math.floor(screenX / gridCellSize);
        const cellY = Math.floor(screenY / gridCellSize);
        const cellKey = `${cellX}:${cellY}`;
        const bucket = spatialGrid.get(cellKey);

        if (bucket) {
          bucket.push(index);
        } else {
          spatialGrid.set(cellKey, [index]);
        }
      }

      const windTime = t * 0.0005;

      for (let index = 0; index < particles.length; index++) {
        const particle = particles[index];
        const screenState = screenStates[index];

        const flowAngle = Math.sin(particle.x * 0.5 + windTime) * 0.8
          + Math.cos(particle.y * 0.5 - windTime * 0.8) * 0.8
          + Math.sin(particle.z * 0.8 + windTime * 1.5) * 0.4;
        const flowZ = Math.sin(particle.x * 0.8 + particle.y * 0.8 + windTime * 2) * 1.5;

        const targetVx = Math.cos(flowAngle) * MOTION.targetFlowSpeed * particle.speedVariance;
        const targetVy = Math.sin(flowAngle) * MOTION.targetFlowSpeed * particle.speedVariance;
        const targetVz = (flowZ - particle.z) * MOTION.targetDepthSpeed;

        let pushX = 0;
        let pushY = 0;
        let pushZ = 0;

        const { screenX, screenY, perspective: prePerspective } = screenState;
        if (mouse.inside) {
          const dxScreen = screenX - mouse.x;
          const dyScreen = screenY - mouse.y;
          const distScreen = Math.hypot(dxScreen, dyScreen);
          const maxDistScreen = Math.min(width, height) * MOTION.cursorInfluenceRadius;

          if (distScreen < maxDistScreen && distScreen > 1) {
            const force = Math.pow(1 - distScreen / maxDistScreen, 2);
            pushX = (dxScreen / distScreen) * force * MOTION.cursorPushStrength;
            pushY = (dyScreen / distScreen) * force * MOTION.cursorPushStrength;
            pushZ = force * MOTION.cursorSinkStrength;
          }
        }

        let separationX = 0;
        let separationY = 0;
        const cellX = Math.floor(screenX / gridCellSize);
        const cellY = Math.floor(screenY / gridCellSize);

        for (let offsetY = -1; offsetY <= 1; offsetY++) {
          for (let offsetX = -1; offsetX <= 1; offsetX++) {
            const neighborBucket = spatialGrid.get(`${cellX + offsetX}:${cellY + offsetY}`);
            if (!neighborBucket) continue;

            for (const neighborIndex of neighborBucket) {
              if (neighborIndex === index) continue;

              const neighbor = screenStates[neighborIndex];
              const dx = screenX - neighbor.screenX;
              const dy = screenY - neighbor.screenY;
              const distSq = dx * dx + dy * dy;
              const desiredGap = Math.max(
                baseSeparationPx,
                (screenState.separationRadius + neighbor.separationRadius) * 0.5,
              );

              if (distSq <= 0.0001 || distSq >= desiredGap * desiredGap) continue;

              const dist = Math.sqrt(distSq);
              const force = Math.pow(1 - dist / desiredGap, 2);
              separationX += (dx / dist) * force;
              separationY += (dy / dist) * force;
            }
          }
        }

        const separationMagnitude = Math.hypot(separationX, separationY);
        if (separationMagnitude > 0) {
          const cappedMagnitude = clampNumber(separationMagnitude, 0, MOTION.maxSeparationForce);
          const separationStrength = MOTION.separationStrength / Math.max(0.9, prePerspective);
          pushX += (separationX / separationMagnitude) * cappedMagnitude * separationStrength;
          pushY += (separationY / separationMagnitude) * cappedMagnitude * separationStrength;
        }

        particle.vx += (targetVx + pushX - particle.vx) * MOTION.velocityLerp;
        particle.vy += (targetVy + pushY - particle.vy) * MOTION.velocityLerp;
        particle.vz += (targetVz + pushZ - particle.vz) * MOTION.velocityLerp;

        particle.vx *= MOTION.damping;
        particle.vy *= MOTION.damping;
        particle.vz *= MOTION.damping;

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;

        if (particle.x > MOTION.boundX) particle.x = -MOTION.boundX;
        if (particle.x < -MOTION.boundX) particle.x = MOTION.boundX;
        if (particle.y > MOTION.boundY) particle.y = -MOTION.boundY;
        if (particle.y < -MOTION.boundY) particle.y = MOTION.boundY;

        const zDistance = 4.5 - particle.z;
        const perspective = MOTION.fieldOfView / Math.max(0.1, zDistance);
        const px = centerX + particle.x * perspective * scale;
        const py = centerY + particle.y * perspective * scale;
        const projectedSize = Math.max(0.1, particle.size * perspective * MOTION.bodyScale);

        const distFromCenter = Math.max(Math.abs(particle.x) / 2.0, Math.abs(particle.y) / 2.0);
        const edgeFade = Math.max(0, 1 - Math.pow(distFromCenter, 2));
        const depthAlpha = Math.max(0.01, Math.min(0.8, (particle.z + 1.5) / 3.0));
        const finalAlpha = Math.min(
          MOTION.alphaCeiling,
          depthAlpha * edgeFade * MOTION.alphaGain,
        );

        if (finalAlpha < 0.01) continue;

        const colorIndex = Math.floor(Math.abs(particle.z * 1.5 + particle.phase) % 3);
        const fillColor = renderTokens.bodyFill[colorIndex];
        const heading = Math.atan2(particle.vy, particle.vx);
        const speed = Math.hypot(particle.vx, particle.vy);
        const normalizedSpeed = Math.max(speed, 0.0008);
        const directionX = particle.vx / normalizedSpeed;
        const directionY = particle.vy / normalizedSpeed;
        const perpendicularX = -directionY;
        const perpendicularY = directionX;
        const stretch = 1 + speed * MOTION.stretchPerSpeed;

        const tailLength = clampNumber(
          projectedSize * MOTION.tailLengthSizeMultiplier + speed * scale * MOTION.tailLengthSpeedMultiplier,
          projectedSize * MOTION.tailMinLengthMultiplier,
          projectedSize * MOTION.tailMaxLengthMultiplier,
        );
        const tailNearOffset = projectedSize * MOTION.tailNearOffsetMultiplier;
        const tailNearX = px - directionX * tailNearOffset;
        const tailNearY = py - directionY * tailNearOffset;
        const tailFarX = px - directionX * (tailLength + tailNearOffset);
        const tailFarY = py - directionY * (tailLength + tailNearOffset);
        const tailNearHalfWidth = Math.max(projectedSize * MOTION.tailNearWidthMultiplier, 0.7);
        const tailFarHalfWidth = Math.max(projectedSize * MOTION.tailFarWidthMultiplier, 0.18);
        const tailGradient = ctx.createLinearGradient(tailFarX, tailFarY, tailNearX, tailNearY);
        const tailColor = renderTokens.tailColor(fillColor);
        const [stopA, stopB, stopC, stopD] = renderTokens.tailOpacityStops;

        tailGradient.addColorStop(0, rgbaFromHex(tailColor, 0));
        tailGradient.addColorStop(0.24, rgbaFromHex(tailColor, finalAlpha * stopA));
        tailGradient.addColorStop(0.56, rgbaFromHex(tailColor, finalAlpha * stopB));
        tailGradient.addColorStop(0.82, rgbaFromHex(tailColor, finalAlpha * stopC));
        tailGradient.addColorStop(1, rgbaFromHex(tailColor, finalAlpha * stopD));

        const tailMidX = (tailNearX + tailFarX) * 0.5;
        const tailMidY = (tailNearY + tailFarY) * 0.5;

        ctx.globalCompositeOperation = renderTokens.trailBlendMode;
        ctx.fillStyle = tailGradient;
        ctx.beginPath();
        ctx.moveTo(
          tailFarX + perpendicularX * tailFarHalfWidth,
          tailFarY + perpendicularY * tailFarHalfWidth,
        );
        ctx.quadraticCurveTo(
          tailMidX + perpendicularX * tailFarHalfWidth * 0.4,
          tailMidY + perpendicularY * tailNearHalfWidth * 0.24,
          tailNearX + perpendicularX * tailNearHalfWidth,
          tailNearY + perpendicularY * tailNearHalfWidth,
        );
        ctx.lineTo(
          tailNearX - perpendicularX * tailNearHalfWidth,
          tailNearY - perpendicularY * tailNearHalfWidth,
        );
        ctx.quadraticCurveTo(
          tailMidX - perpendicularX * tailNearHalfWidth * 0.24,
          tailMidY - perpendicularY * tailFarHalfWidth * 0.4,
          tailFarX - perpendicularX * tailFarHalfWidth,
          tailFarY - perpendicularY * tailFarHalfWidth,
        );
        ctx.closePath();
        ctx.fill();

        ctx.globalCompositeOperation = renderTokens.bodyBlendMode;
        ctx.fillStyle = fillColor;
        ctx.globalAlpha = finalAlpha;
        ctx.beginPath();
        ctx.ellipse(
          px,
          py,
          projectedSize * stretch,
          projectedSize * MOTION.bodyThickness,
          heading,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (showLogo) {
        ctx.save();
        ctx.translate(centerX, centerY);
        const breath = 1 + Math.sin(t * 0.02) * 0.015;
        const radius = scale * breath;
        const ringColor = renderTokens.bodyFill[0];

        ctx.strokeStyle = ringColor + renderTokens.ringStrokeOpacityHex;
        ctx.lineWidth = scale * 0.22;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.78, (40 * Math.PI) / 180, (320 * Math.PI) / 180);
        ctx.stroke();

        for (const sparkle of LOGO_SPARKLES) {
          const drift = Math.sin(t * 0.02 + sparkle.phase) * 0.03;
          const sparkleX = sparkle.x * scale + drift * scale;
          const sparkleY = sparkle.y * scale - drift * scale;
          drawStar(
            ctx,
            sparkleX,
            sparkleY,
            sparkle.size * scale,
            renderTokens.bodyFill[1],
            renderTokens.sparkleAlphaBase + Math.sin(t * 0.03 + sparkle.phase) * renderTokens.sparkleAlphaSwing,
            t * 0.01 + sparkle.phase,
          );
        }

        ctx.restore();
      }

      animationFrame = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      if (cycleTimer != null) window.clearInterval(cycleTimer);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [density, cycle, showLogo, onShapeChange]);

  return <canvas ref={canvasRef} className={`pointer-events-none mix-blend-normal dark:mix-blend-screen ${className}`} />;
}

export type { Shape as BrandShape };
