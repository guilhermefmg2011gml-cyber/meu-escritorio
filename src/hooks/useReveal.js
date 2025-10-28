import { useEffect } from "react";

export function useReveal(options = {}) {
  const { containerRef, deps } = options;
  const dependencyList = Array.isArray(deps) ? deps : [];

  useEffect(() => {
    const isBrowser =
      typeof window !== "undefined" && typeof document !== "undefined";

    if (!isBrowser) return undefined;

    const container = containerRef?.current;

    if (containerRef && !container) return undefined;

    const rootElement = container ?? document;


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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, ...dependencyList]);
}