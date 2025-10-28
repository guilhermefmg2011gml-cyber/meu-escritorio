import { useEffect } from "react";

export function useReveal(options = {}) {
  const { containerRef, deps } = options;

  useEffect(() => {
    const isBrowser =
      typeof window !== "undefined" && typeof document !== "undefined";

    if (!isBrowser) return undefined;

    if (containerRef && !containerRef.current) return undefined;

    const rootElement = containerRef?.current ?? document;


    if (typeof IntersectionObserver === "undefined") {
      const elements = Array.from(rootElement.querySelectorAll(".reveal"));
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

    const elements = Array.from(rootElement.querySelectorAll(".reveal"));
    elements.forEach((element) => observer.observe(element));

    return () => {
      elements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    };
  }, [containerRef?.current, deps]);
}