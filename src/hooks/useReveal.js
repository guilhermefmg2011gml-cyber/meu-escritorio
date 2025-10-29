import { useEffect, useMemo } from "react";

export function useReveal(options = {}) {
  const { containerRef, deps } = options;
  const dependencyList = useMemo(() => {
    if (deps == null) return [];
    return Array.isArray(deps) ? deps : [deps];
  }, [deps]);

  useEffect(() => {
    const isBrowser =
      typeof window !== "undefined" && typeof document !== "undefined";

    if (!isBrowser) return undefined;

    const containerElement = containerRef?.current ?? null;

    if (containerRef && !containerElement) return undefined;

    const rootElement = containerElement ?? document;


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
  }, [containerRef, dependencyList]);
}