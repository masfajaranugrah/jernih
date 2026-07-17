"use client";

import { useEffect, useState, useRef, type RefObject } from "react";

export default function ScrollToBottom({
  containerRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const threshold = 200;
      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      setVisible(!atBottom);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, [containerRef]);

  const scroll = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scroll}
      className="absolute bottom-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg border border-gray-200 transition hover:bg-gray-50 hover:shadow-xl hover:-translate-y-0.5"
      aria-label="Gulir ke bawah"
    >
      <span className="material-symbols-outlined text-xl">expand_more</span>
    </button>
  );
}
