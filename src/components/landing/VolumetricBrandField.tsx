import { useEffect, useRef } from "react";

export type VolumetricShape = "nebula" | "galaxy" | "supernova" | "pulsar" | "cluster" | "void";
type Shape = VolumetricShape;

interface Point { x: number; y: number; }

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

const CYCLE_ORDER: VolumetricShape[] = ["nebula", "galaxy", "supernova", "pulsar", "cluster", "void"];


function pts_nebula(n: number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    // Wide horizontal spread, narrow vertical
    const rx = (Math.random() + Math.random()) * 1.5 - 1.5; 
    const ry = (Math.random() - 0.5) * 0.4;
    // Rotate slightly
    const angle = 0.2;
    const x = rx * Math.cos(angle) - ry * Math.sin(angle);
    const y = rx * Math.sin(angle) + ry * Math.cos(angle);
    out.push({ x: x * 1.8, y: y * 1.8 });
  }
  return out;
}

function pts_galaxy(n: number): Point[] {
  const out: Point[] = [];
  const arms = 2;
  for (let i = 0; i < n; i++) {
    const arm = i % arms;
    const t = Math.random();
    const r = t * 1.8;
    const a = r * 3 + (arm * Math.PI); // spiral twist
    const spread = (1 - t) * 0.3 * (Math.random() - 0.5); // looser at edges
    out.push({
      x: Math.cos(a) * r + spread,
      y: Math.sin(a) * r * 0.6 + spread
    });
  }
  return out;
}

function pts_supernova(n: number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const ring = Math.random() > 0.6 ? 1.6 : 0.8; // two main shells
    const r = ring + (Math.random() - 0.5) * 0.5;
    out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.8 });
  }
  return out;
}

function pts_pulsar(n: number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < n; i++) {
    const isBeam = Math.random() > 0.5;
    if (isBeam) {
      // vertical beams
      const y = (Math.random() - 0.5) * 3.5;
      const x = (Math.random() - 0.5) * 0.2;
      out.push({ x, y });
    } else {
      // horizontal disk
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 1.5;
      out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.1 });
    }
  }
  return out;
}

function pts_cluster(n: number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < n; i++) {
    // 3 distinct nodes
    const node = Math.floor(Math.random() * 3);
    let cx = 0, cy = 0;
    if (node === 0) { cx = -1.2; cy = -0.5; }
    if (node === 1) { cx = 1.0; cy = 0.8; }
    if (node === 2) { cx = 0.5; cy = -1.0; }
    
    const r = Math.random() * 0.8;
    const a = Math.random() * Math.PI * 2;
    out.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return out;
}

function pts_void(n: number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    // Massive empty center, stars only on the distant edges
    const r = 2.0 + Math.random() * 1.0;
    out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  return out;
}

const SHAPE_FNS: Record<VolumetricShape, (n: number) => Point[]> = {
  nebula: pts_nebula,
  galaxy: pts_galaxy,
  supernova: pts_supernova,
  pulsar: pts_pulsar,
  cluster: pts_cluster,
  void: pts_void,
};

const LOGO_SPARKLES = [
  { x: 0.78, y: -0.55, size: 0.11, phase: 0 },
  { x: 0.95, y: -0.35, size: 0.07, phase: 1.5 },
  { x: 0.88, y: -0.15, size: 0.05, phase: 3 },
];

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  phase: number; 
  depthOffset: number; // Random depth layer
  speedVariance: number; // Slight speed differences to avoid uniform marching
}

export default function VolumetricBrandField({
  shape = "C",
  density = 1,
  palette = ["#04FF8D", "#00E5FF", "#9D00FF"],
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

  useEffect(() => { shapeRef.current = shape; }, [shape]);
  useEffect(() => { paletteRef.current = palette; }, [palette]);
  useEffect(() => { themeRef.current = theme; }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Cardumen Orgánico (Flow Field Boids) - Menos partículas, más volumen visual
    const N = Math.floor(650 * density); // Optimizamos bajando la cantidad para móviles
    const particles: Particle[] = [];
    
    for (let i = 0; i < N; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 4.0, // Spread across width
        y: (Math.random() - 0.5) * 4.0, // Spread across height
        z: (Math.random() - 0.5) * 2.0, // Deep volumetric spread
        vx: 0, vy: 0, vz: 0,
        size: 0.8 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        depthOffset: Math.random() * Math.PI * 2,
        speedVariance: 0.8 + Math.random() * 0.4,
      });
    }


    let current = shapeRef.current;
    let cycleIdx = Math.max(0, CYCLE_ORDER.indexOf(current));
    let cycleTimer: number | null = null;
    if (cycle) {
      cycleTimer = window.setInterval(() => {
        cycleIdx = (cycleIdx + 1) % CYCLE_ORDER.length;
        shapeRef.current = CYCLE_ORDER[cycleIdx];
        onShapeChange?.(CYCLE_ORDER[cycleIdx]);
      }, 8000);
    }

    const mouse = { x: 0, y: 0, inside: false };
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      // Guardar posiciones reales en pixeles
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.inside = true;
    };
    const onLeave = () => { mouse.inside = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const drawStar = (
      ctx: CanvasRenderingContext2D,
      x: number, y: number, size: number,
      color: string, alpha: number, rot: number,
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      const L = size;
      const s = size * 0.22;
      ctx.moveTo(0, -L);
      ctx.quadraticCurveTo(s, -s, L, 0);
      ctx.quadraticCurveTo(s, s, 0, L);
      ctx.quadraticCurveTo(-s, s, -L, 0);
      ctx.quadraticCurveTo(-s, -s, 0, -L);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    let raf = 0;
    let t = 0;
    const loop = () => {
      t += 1;

      const r = canvas.getBoundingClientRect();
      const w = r.width, h = r.height;
      const cx = w / 2, cy = h / 2;
      const scale = Math.min(w, h) * 0.42;

      // DOM-safe theme check via React props to avoid Layout Thrashing
      const isDark = themeRef.current === "dark";
      
      // 1. FADE OUT OLD FRAMES
      ctx.globalCompositeOperation = "source-over";
      if (isDark) {
          ctx.fillStyle = "rgba(5, 7, 12, 0.14)";
          ctx.fillRect(0, 0, w, h);
      } else {
          // En modo claro, para evitar 'Z-fighting' de transparencias blancas sobre blanco,
          // es más seguro limpiar el lienzo completamente o usar un fill muy sólido.
          // Usaremos clearRect para un renderizado cristalino.
          ctx.clearRect(0, 0, w, h);
      }

      const [cA, cB, cC] = paletteRef.current || ["#04FF8D", "#00E5FF", "#9D00FF"];
      
      // 2. DRAW NEW PARTICLES
      ctx.globalCompositeOperation = isDark ? "lighter" : "source-over";

                  // Flow Field "River" Algorithm (Cardumen Orgánico)
      const windTime = t * 0.0005; // Tiempo lento global
      
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // 1. Calcular el Campo Vectorial (La Corriente del Río)
        // Usamos funciones trigonométricas compuestas para generar olas complejas
        const flowAngle = Math.sin(p.x * 0.5 + windTime) * 0.8 
                        + Math.cos(p.y * 0.5 - windTime * 0.8) * 0.8
                        + Math.sin(p.z * 0.8 + windTime * 1.5) * 0.4;
                        
        const flowZ = Math.sin(p.x * 0.8 + p.y * 0.8 + windTime * 2) * 1.5; // Sube y baja (z)
        
        // Fuerza de la corriente (velocidad ideal)
        const targetVx = Math.cos(flowAngle) * 0.015 * p.speedVariance;
        const targetVy = Math.sin(flowAngle) * 0.015 * p.speedVariance;
        const targetVz = (flowZ - p.z) * 0.01; // Intenta navegar hacia la altura de la ola

        // 2. Interacción del Cursor (El Depredador / Reactividad)
        let pushX = 0, pushY = 0, pushZ = 0;
        
        // Transformar posición 3D a pantalla para evaluar choque con el mouse
        const preFov = 4.0;
        const preZDist = 4.5 - p.z;
        const prePersp = preFov / Math.max(0.1, preZDist);
        const screenX = cx + p.x * prePersp * scale;
        const screenY = cy + p.y * prePersp * scale;

        if (mouse.inside) {
          const dxScreen = screenX - mouse.x;
          const dyScreen = screenY - mouse.y;
          const distScreen = Math.hypot(dxScreen, dyScreen);
          
          const maxDistScreen = Math.min(w, h) * 0.25; // Radio de susto
          
          if (distScreen < maxDistScreen && distScreen > 1) {
            const force = Math.pow(1 - distScreen / maxDistScreen, 2);
            // El pez huye direccionalmente y se hunde
            pushX = (dxScreen / distScreen) * force * 0.02; 
            pushY = (dyScreen / distScreen) * force * 0.02;
            pushZ = force * -0.05; 
          }
        }

        // 3. Aceleración Suave (Lerp de velocidades)
        p.vx += (targetVx + pushX - p.vx) * 0.05;
        p.vy += (targetVy + pushY - p.vy) * 0.05;
        p.vz += (targetVz + pushZ - p.vz) * 0.05;

        // Fricción Acuática
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vz *= 0.98;
        
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // 4. Mundo Infinito (Teletransportación suave en los bordes)
        const boundX = 2.5;
        const boundY = 2.5;
        
        if (p.x > boundX) p.x = -boundX;
        if (p.x < -boundX) p.x = boundX;
        if (p.y > boundY) p.y = -boundY;
        if (p.y < -boundY) p.y = boundY;

        // 3D Perspective Projection
        const fov = 4.0; 
        const zDistance = 4.5 - p.z; 
        const perspective = fov / Math.max(0.1, zDistance);
        
        const px = cx + p.x * perspective * scale;
        const py = cy + p.y * perspective * scale;
        const projectedSize = Math.max(0.1, p.size * perspective);
        
        // 5. Opacidad con Fundido (Mueren en los bordes)
        // La opacidad depende de la profundidad (Z) y de qué tan cerca estén del centro (X, Y)
        const distFromCenter = Math.max(Math.abs(p.x) / 2.0, Math.abs(p.y) / 2.0); // 0 en el centro, 1 en el borde
        const edgeFade = Math.max(0, 1 - Math.pow(distFromCenter, 2)); // Cae rápido hacia los bordes
        
        const depthAlpha = Math.max(0.01, Math.min(0.8, (p.z + 1.5) / 3.0));
        const finalAlpha = depthAlpha * edgeFade * 0.95;

        if (finalAlpha < 0.01) continue; // Culling: Si es invisible, ni la dibujes (Optimización Masiva)

        // Asignación de paleta dinámica según Z (Los altos son colores brillantes, los bajos son el primer color oscurecido)
        const colorIndex = Math.floor(Math.abs(p.z * 1.5 + p.phase) % 3);
        const col = [cA, cB, cC][colorIndex];

        // 6. Escamas Ovaladas Direccionales
        // Calculamos hacia dónde mira el "pez" basado en su vector de velocidad
        const heading = Math.atan2(p.vy, p.vx);
        const speed = Math.hypot(p.vx, p.vy);
        
        // Se estira más si va más rápido, dando ilusión de motion blur
        const stretch = 1.0 + speed * 150.0; 
        
        ctx.fillStyle = col;
        ctx.globalAlpha = finalAlpha;
        
        ctx.beginPath();
        // Usamos elipse para el óvalo (x, y, radiusX, radiusY, rotation, startAngle, endAngle)
        ctx.ellipse(px, py, projectedSize * stretch, projectedSize * 0.6, heading, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";



      if (showLogo) {
        ctx.save();
        ctx.translate(cx, cy);
        const breath = 1 + Math.sin(t * 0.02) * 0.015;
        const R = scale * breath;

        ctx.strokeStyle = cA + "18";
        ctx.lineWidth = scale * 0.22;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(0, 0, R * 0.78, (40 * Math.PI) / 180, (320 * Math.PI) / 180);
        ctx.stroke();

        for (let i = 0; i < LOGO_SPARKLES.length; i++) {
          const sp = LOGO_SPARKLES[i];
          const drift = Math.sin(t * 0.02 + sp.phase) * 0.03;
          const px = sp.x * scale + drift * scale;
          const py = sp.y * scale - drift * scale;
          drawStar(
            ctx, px, py, sp.size * scale,
            cB,
            0.55 + Math.sin(t * 0.03 + sp.phase) * 0.2,
            t * 0.01 + sp.phase,
          );
        }
        ctx.restore();
      }

      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (cycleTimer != null) window.clearInterval(cycleTimer);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [density, cycle, showLogo, onShapeChange]);

  return <canvas ref={canvasRef} className={`pointer-events-none mix-blend-normal dark:mix-blend-screen ${className}`} />;
}

export type { Shape as BrandShape };
