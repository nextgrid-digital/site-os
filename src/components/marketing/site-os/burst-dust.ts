import { useState, useRef, type MouseEvent, useCallback } from "react";
import { useReducedMotion } from "motion/react";

export type DustParticle = {
  dx: number;
  dy: number;
  size: number;
  duration: number;
};
export type DustBurst = {
  id: number;
  x: number;
  y: number;
  particles: DustParticle[];
};

const COUNT = 20;

export const useBurstDust = () => {
  const [dust, setDust] = useState<DustBurst[]>([]);
  const dustId = useRef(0);
  const reduce = useReducedMotion();

  const handleBurstDust = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (reduce) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const id = dustId.current++;
      const particles: DustParticle[] = Array.from(
        { length: COUNT },
        (_, i) => {
          const angle = (Math.PI * 2 * i) / COUNT + Math.random() * 0.6;
          const distance = 24 + Math.random() * 40;
          return {
            dx: Math.cos(angle) * distance,
            dy: Math.sin(angle) * distance - 8,
            size: 2 + Math.random() * 3,
            duration: 0.7 + Math.random() * 0.5,
          };
        },
      );
      setDust((d) => [...d, { id, x, y, particles }]);
      setTimeout(() => setDust((d) => d.filter((b) => b.id !== id)), 1400);
    },
    [reduce],
  );

  return { dust, handleBurstDust };
};
