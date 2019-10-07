import { Side, Range, SelectionRange } from '../types';
import { isNull } from '../../helper/common';

type ColumnWidths = { [key in Side]: number[] };

export function getOwnSideColumnRange(
  columnRange: Range,
  side: Side,
  visibleFrozenCount: number
): Range | null {
  const [start, end] = columnRange.map(columnIdx => columnIdx);

  if (side === 'L' && start < visibleFrozenCount) {
    return [start, Math.min(end, visibleFrozenCount - 1)];
  }

  if (side === 'R' && end >= visibleFrozenCount) {
    return [Math.max(start, visibleFrozenCount) - visibleFrozenCount, end - visibleFrozenCount];
  }

  return null;
}

export function getVerticalStyles(rowRange: Range, rowOffsets: number[], rowHeights: number[]) {
  const top = rowOffsets[rowRange[0]];
  const bottom = rowOffsets[rowRange[1]] + rowHeights[rowRange[1]];

  return { top, height: bottom - top };
}

export function getHorizontalStyles(
  columnRange: Range | null,
  columnWidths: ColumnWidths,
  side: Side,
  cellBorderWidth: number
) {
  let left = 0;
  let width = 0;
  if (!columnRange) {
    return { left, width };
  }

  const widths = columnWidths[side];
  const startIndex = columnRange[0];
  const endIndex = Math.min(columnRange[1], widths.length - 1);

  for (let i = 0; i <= endIndex; i += 1) {
    if (i < startIndex) {
      left += widths[i] + cellBorderWidth;
    } else {
      width += widths[i] + cellBorderWidth;
    }
  }

  width -= cellBorderWidth;

  return { left, width };
}

export function getSortedRange(range: Range): Range {
  return range[0] > range[1] ? [range[1], range[0]] : range;
}

export function isSameInputRange(inp1: SelectionRange | null, inp2: SelectionRange | null) {
  if (isNull(inp1) || isNull(inp2)) {
    return inp1 === inp2;
  }

  return (
    inp1.column[0] === inp2.column[0] &&
    inp1.column[1] === inp2.column[1] &&
    inp1.row[0] === inp2.row[0] &&
    inp1.row[1] === inp2.row[1]
  );
}
