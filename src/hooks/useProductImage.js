import { useEffect, useRef, useState } from 'react';
import { renderProductImage } from '../three/studio';

// Renders a procedural product "photo" once it is near the viewport.
export function useProductImage(product, colorway, { view = 'angle', width = 900, height = 560, eager = false } = {}) {
  const [src, setSrc] = useState(null);
  const ref = useRef(null);
  const [visible, setVisible] = useState(eager);

  useEffect(() => {
    if (eager || visible) return;
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return setVisible(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [eager, visible]);

  useEffect(() => {
    if (!visible) return;
    let live = true;
    renderProductImage(product, colorway, { view, width, height })
      .then((u) => live && setSrc(u))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [visible, product, colorway, view, width, height]);

  return [src, ref];
}

export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.matches('.reveal') ? [el] : [...el.querySelectorAll('.reveal')];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('is-in'), io.unobserve(e.target))),
      { rootMargin: '0px 0px -10% 0px' },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  });
  return ref;
}
