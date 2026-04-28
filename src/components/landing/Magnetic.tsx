import { ReactNode, useEffect, useRef } from "react";

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export default function Magnetic({ children, strength = 0.35, className = "" }: MagneticProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const settleThreshold = 0.08;

    const animate = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;

      const deltaX = Math.abs(tx - cx);
      const deltaY = Math.abs(ty - cy);
      if (deltaX < settleThreshold && deltaY < settleThreshold) {
        cx = tx;
        cy = ty;
      }

      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;

      if (
        Math.abs(tx - cx) > settleThreshold ||
        Math.abs(ty - cy) > settleThreshold ||
        Math.abs(cx) > settleThreshold ||
        Math.abs(cy) > settleThreshold
      ) {
        raf = requestAnimationFrame(animate);
      } else {
        raf = 0;
      }
    };

    const requestTick = () => {
      if (!raf) {
        raf = requestAnimationFrame(animate);
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      tx = mx * strength;
      ty = my * strength;
      requestTick();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      requestTick();
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={`will-change-transform inline-block ${className}`}>
      {children}
    </div>
  );
}
