"use client";

import { useEffect, useRef, useState } from "react";

/** Entrada suave por IntersectionObserver — sem lib, e obediente a reduced-motion. */
export default function Reveal({
  children,
  atraso = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  atraso?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement>(null);
  const [dentro, setDentro] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // se a página já foi rolada para além do elemento (âncora, F5 no meio,
    // rolagem rápida), mostra na hora em vez de deixar invisível para sempre
    if (el.getBoundingClientRect().bottom < 0) {
      setDentro(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setDentro(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error ref polimórfico
      ref={ref}
      data-in={dentro}
      style={{ transitionDelay: `${atraso}ms` }}
      className={`reveal ${className}`}
    >
      {children}
    </Tag>
  );
}
