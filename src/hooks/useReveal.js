import { useEffect } from "react";

export function useReveal(options = {}) {
  const { containerRef, deps } = options;
  const containerEl = containerRef?.current ?? null;

  useEffect(() => {
    if (containerRef && !containerEl) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in");
        });
      },
      { threshold: 0.12 },
    );

    const root = containerEl ?? document;
    const elements = Array.from(root.querySelectorAll(".reveal"));
    elements.forEach((element) => observer.observe(element));

    return () => {
      elements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    };
  }, [containerRef, containerEl, deps]);
}