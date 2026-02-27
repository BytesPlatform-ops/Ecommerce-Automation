"use client";

import { useEffect, useRef } from "react";

export function CursorEffect() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let curX = 0;
    let curY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      curX += (mouseX - curX) * 0.08;
      curY += (mouseY - curY) * 0.08;
      cursor.style.transform = `translate(${curX - 150}px, ${curY - 150}px)`;
      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMouseMove);
    const raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none z-[999] hidden lg:block"
      style={{
        background: "radial-gradient(circle, rgba(0,255,136,0.12) 0%, rgba(0,255,136,0.04) 40%, transparent 70%)",
        filter: "blur(40px)",
        willChange: "transform",
      }}
    />
  );
}
