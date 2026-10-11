import '@testing-library/jest-dom';

// Polyfill window.matchMedia
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  // Polyfill scrollTo
  window.scrollTo = () => {};

  // Polyfill Element.prototype.animate for WAAPI / Framer Motion
  if (typeof Element !== 'undefined' && !Element.prototype.animate) {
    Element.prototype.animate = () => ({
      finished: Promise.resolve(),
      cancel: () => {},
      finish: () => {},
      pause: () => {},
      play: () => {},
      reverse: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      currentTime: 0,
      playbackRate: 1,
      playState: 'running',
    } as any);
  }
}

