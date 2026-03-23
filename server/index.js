import { useEffect, useRef, useState } from 'react';
import type { Option } from 'types/constants';

interface UseChipsOverflowOptions {
  items: Option[] | undefined;
  emptyChipWidth: number;
  avgCharSize: number;
  gapWidth: number;
  overflowChipWidth: number;
  removedChipWidth?: number;
  lines?: number;
}

export function useChipsOverflow({
  items,
  emptyChipWidth,
  avgCharSize,
  gapWidth,
  overflowChipWidth,
  lines = 1,
  removedChipWidth = 0,
}: UseChipsOverflowOptions) {
  const [visibleCount, setVisibleCount] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateVisibleChips = () => {
      if (!rowRef.current || !items || items.length === 0) {
        setVisibleCount(0);
        return;
      }

      const containerWidth = rowRef.current.offsetWidth;

      if (!containerWidth) {
        setVisibleCount(0);
        return;
      }

      let currentLine = 1;
      let currentLineWidth = 0;
      let count = 0;

      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const textLength = item.value?.length ?? item.label?.length ?? 0;

        const chipWidth =
          emptyChipWidth +
          textLength * avgCharSize +
          removedChipWidth;

        const extraGap = currentLineWidth === 0 ? 0 : gapWidth;
        const neededWidth = currentLineWidth + extraGap + chipWidth;

        if (neededWidth <= containerWidth) {
          currentLineWidth = neededWidth;
          count += 1;
          continue;
        }

        currentLine += 1;

        if (currentLine > lines) {
          break;
        }

        currentLineWidth = chipWidth;
        count += 1;
      }

      // אם יש overflow, נשאיר מקום ל +N
      if (count < items.length) {
        while (count > 0) {
          const lastVisible = items[count - 1];
          const textLength =
            lastVisible.value?.length ?? lastVisible.label?.length ?? 0;

          const lastChipWidth =
            emptyChipWidth +
            textLength * avgCharSize +
            removedChipWidth;

          const neededForOverflow =
            currentLineWidth + gapWidth + overflowChipWidth;

          if (neededForOverflow <= containerWidth) {
            break;
          }

          currentLineWidth -= lastChipWidth;
          if (count > 1) {
            currentLineWidth -= gapWidth;
          }
          count -= 1;
        }
      }

      setVisibleCount(Math.max(0, count));
    };

    const timeoutId = setTimeout(calculateVisibleChips, 0);
    window.addEventListener('resize', calculateVisibleChips);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateVisibleChips);
    };
  }, [
    items,
    emptyChipWidth,
    avgCharSize,
    gapWidth,
    overflowChipWidth,
    lines,
    removedChipWidth,
  ]);

  return { visibleCount, rowRef };
}