'use client';

import { useEffect, useState, type ReactNode } from 'react';

/** Fixed bottom bar: hides while scrolling down, reappears on scroll up or at page end. */
export function AutoHideFooter({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 8;
      if (atBottom || y < lastY) setHidden(false);
      else if (y > lastY && y > 24) setHidden(true);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Reserves space so fixed footer never covers content */}
      <div aria-hidden className="h-14" />
      <footer
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 py-3 backdrop-blur transition-transform duration-300 ${
          hidden ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        {children}
      </footer>
    </>
  );
}
