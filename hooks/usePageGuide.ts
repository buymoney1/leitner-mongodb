// hooks/usePageGuide.ts
import { useEffect } from 'react';
import { useGuide } from '../components/Guide/GuideProvider';

interface UsePageGuideProps {
  page: string;
  steps: Array<{
    target: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
  }>;
}

export const usePageGuide = ({ page, steps }: UsePageGuideProps) => {
  const { showGuide, isVisible } = useGuide();

  useEffect(() => {
    const checkAndShowGuide = async () => {
      try {
        const response = await fetch('/api/guide/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ page }),
        });

        const { shouldShowGuide } = await response.json();

        if (shouldShowGuide && steps.length > 0) {
          showGuide({ page, steps });
          
          // علامت‌گذاری که راهنما نمایش داده شد
          await fetch('/api/guide/mark-shown', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ page }),
          });
        }
      } catch (error) {
        console.error('Error checking guide:', error);
      }
    };

    checkAndShowGuide();
  }, [page, steps, showGuide]);

  return { isVisible };
};