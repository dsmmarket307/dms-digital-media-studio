"use client";
import { useEffect, useRef, useState } from "react";

export default function ParallaxImage({ src, alt, className, style, speed = 0.15 }: { src: string; alt?: string; className?: string; style?: React.CSSProperties; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let ticking = false;
    function update() {
      if (!ref.current) { ticking = false; return; }
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const centerOffset = (rect.top + rect.height / 2) - windowHeight / 2;
      setOffset(centerOffset * -speed);
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ overflow: "hidden", position: "relative", ...style }}>
      <img
        src={src}
        alt={alt ?? ""}
        style={{
          width: "100%",
          height: "130%",
          objectFit: "cover",
          position: "absolute",
          top: "-15%",
          left: 0,
          transform: `translateY(${offset}px)`,
          willChange: "transform",
        }}
      />
    </div>
  );
}