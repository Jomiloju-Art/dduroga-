import { useEffect, useRef, useState } from 'react';

/**
 * Fades + slides content in as it scrolls into view. Respects reduced motion via CSS.
 *
 * Forwards all extra props to the rendered element (`...rest`). Without this,
 * `<Reveal as={Link} to="...">` silently dropped `to`, so every link rendered
 * without a destination and fell back to the current URL.
 */
export default function Reveal({ children, as: Tag = 'div', delay = 0, className = '', style, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`.trim()}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
