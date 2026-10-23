import { useRef, useState, type ReactNode } from 'react';

interface Tilt3DProps {
  children: ReactNode;
  className?: string;
  /** 최대 기울기(도). 기본 9도 — 과하면 멀미가 납니다. */
  max?: number;
  /** 커서 위치를 따라가는 광택 하이라이트 */
  glare?: boolean;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * 포인터를 따라 Z축으로 기울어지는 3D 카드 래퍼.
 *
 * 터치 기기에서는 동작하지 않고(hover 불가), 모션 민감 설정이 켜져 있으면
 * 기울임 없이 정적으로 렌더링합니다.
 */
export default function Tilt3D({ children, className = '', max = 9, glare = true }: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, on: false });

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setStyle({
      transform: `perspective(1000px) rotateY(${(px - 0.5) * max * 2}deg) rotateX(${(0.5 - py) * max * 2}deg) translateZ(14px)`,
    });
    setGlarePos({ x: px * 100, y: py * 100, on: true });
  };

  const reset = () => {
    setStyle({ transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)' });
    setGlarePos(p => ({ ...p, on: false }));
  };

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className={`relative transition-transform duration-500 ease-smooth will-change-transform ${className}`}
      style={{ transformStyle: 'preserve-3d', ...style }}
    >
      {children}
      {glare && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: glarePos.on ? 1 : 0,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,.32), transparent 55%)`,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
