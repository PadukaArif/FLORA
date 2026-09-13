import { useState, useEffect } from 'react';

export function useScrollSpy(sectionIds: string[], offset: number = 140): string {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] || '');

  useEffect(() => {
    const handleScroll = () => {
      // If scrolled near the top of the page, activate the first section
      if (window.scrollY < 80 && sectionIds.length > 0) {
        setActiveId(sectionIds[0]);
        return;
      }

      // If scrolled to the bottom of the page, activate the last section
      const isBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;
      if (isBottom && sectionIds.length > 0) {
        setActiveId(sectionIds[sectionIds.length - 1]);
        return;
      }

      let currentSection = sectionIds[0] || '';

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= offset) {
            currentSection = id;
          }
        }
      }

      setActiveId(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sectionIds, offset]);

  return activeId;
}
