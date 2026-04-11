import { useEffect, useRef } from 'react';

/**
 * Hook to trigger animations when element comes into view during scroll
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Intersection threshold (0-1), default 0.2
 * @param {string} options.animationClass - CSS class to apply when visible
 * @returns {React.RefObject} - Ref to attach to element
 */
export const useScrollAnimation = ({ 
  threshold = 0.2, 
  animationClass = 'animate-on-scroll',
  startClass = 'scroll-animation-start',
  endClass = 'scroll-animation-end'
} = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add(animationClass, startClass);
          // Remove the startClass after animation begins to allow re-triggering
          setTimeout(() => {
            element.classList.remove(startClass);
            element.classList.add(endClass);
          }, 50);
          // Optionally unobserve after first trigger
          // observer.unobserve(element);
        } else {
          element.classList.remove(animationClass, endClass);
          element.classList.add(startClass);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [animationClass, startClass, endClass, threshold]);

  return ref;
};

/**
 * Hook for scroll-based car parking animation
 * Animates car position based on scroll progress
 */
export const useScrollCarAnimation = () => {
  const containerRef = useRef(null);
  const carRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const car = carRef.current;

    if (!container || !car) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate scroll progress: 0 to 1 as element enters and scrolls through viewport
      const startOffset = viewportHeight * 0.8; // Start animation when 80% down screen
      const endOffset = -viewportHeight * 0.2; // End when 20% up screen
      
      const progress = Math.max(0, Math.min(1, 
        (startOffset - rect.top) / (startOffset - endOffset)
      ));

      // Apply animation based on progress
      if (progress > 0) {
        car.style.setProperty('--scroll-progress', progress);
        container.classList.add('scroll-car-animating');
      } else {
        container.classList.remove('scroll-car-animating');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial call
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { containerRef, carRef };
};

export default useScrollAnimation;
