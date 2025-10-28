import { useEffect } from "react";

export function useReveal(options = {}) {
  const { containerRef, deps } = options;
  const containerEl = containerRef?.current ?? null;

  useEffect(() => {
    if (containerRef && !containerEl) return undefined;

    const isBrowser =
      typeof window !== "undefined" && typeof document !== "undefined";

    if (!isBrowser) return undefined;

    const rootNode = containerEl ?? document;

    if (typeof IntersectionObserver === "undefined") {
      const elements = Array.from(rootNode.querySelectorAll(".reveal"));
      elements.forEach((element) => element.classList.add("in"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in");
        });
      },
      { threshold: 0.12 },
    );

    const root = containerEl ?? document;
    const elements = Array.from(rootNode.querySelectorAll(".reveal"));
    elements.forEach((element) => observer.observe(element));

    return () => {
      elements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    };
  }, [containerRef, containerEl, deps]);
}