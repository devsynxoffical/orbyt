"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

type AnimateInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
};

const directionClass = {
  up: "animate-in-up",
  down: "animate-in-down",
  left: "animate-in-left",
  right: "animate-in-right",
  none: "animate-in-fade",
};

export function AnimateIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${visible ? directionClass[direction] : "opacity-0"} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
