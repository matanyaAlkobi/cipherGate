import { useRef, useEffect, useState } from 'react';
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

      const rowWidth = rowRef.current.offsetWidth;

      if (!rowWidth) {
        setVisibleCount(0);
        return;
      }

      let currentLine = 1;
      let currentLineWidth = 0;
      let count = 0;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const chipWidth =
          emptyChipWidth +
          item.value.length * avgCharSize +
          removedChipWidth;

        const hiddenAfterThis = items.length - (count + 1);
        const shouldReserveOverflow = hiddenAfterThis > 0 && currentLine === lines;
        const reservedOverflowWidth = shouldReserveOverflow ? overflowChipWidth : 0;

        const gapBeforeChip = currentLineWidth === 0 ? 0 : gapWidth;
        const nextWidth = currentLineWidth + gapBeforeChip + chipWidth + reservedOverflowWidth;

        // נכנס באותה שורה
        if (nextWidth <= rowWidth) {
          currentLineWidth += gapBeforeChip + chipWidth;
          count++;
          continue;
        }

        // אפשר לעבור לשורה חדשה
        if (currentLine < lines) {
          currentLine++;
          currentLineWidth = chipWidth;
          count++;
          continue;
        }

        // לא נכנס וגם אין עוד שורות
        break;
      }

      setVisibleCount(count);
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