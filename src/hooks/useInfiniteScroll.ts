// /src/hooks/useInfiniteScroll
/** IntersectionObserver-based infinite scroll */
import { useEffect, useRef } from "react";

export function useInfiniteScroll(cb: () => void, canLoad: boolean, rootMargin = "600px") {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!canLoad) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && cb()),
      { root: null, rootMargin, threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [cb, canLoad, rootMargin]);
  return ref;
}