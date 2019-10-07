import { findIndex, arrayEqual } from '../../helper/common';
import { Data, Range } from '../types';
import { isRowSpanEnabled, getMaxRowSpanCount } from '../../helper/rowSpan';

function findIndexByPosition(offsets: number[], position: number) {
  const rowOffset = findIndex(offset => offset > position, offsets);

  return rowOffset === -1 ? offsets.length - 1 : rowOffset - 1;
}

export function calculateRange(
  scrollPos: number,
  totalSize: number,
  offsets: number[],
  data: Data,
  rowCalculation?: boolean
): Range {
  // safari uses negative scroll position for bouncing effect
  scrollPos = Math.max(scrollPos, 0);

  let start = findIndexByPosition(offsets, scrollPos);
  let end = findIndexByPosition(offsets, scrollPos + totalSize) + 1;
  const { rawData, sortState, pageOptions, pageRowRange } = data;

  if (rowCalculation && pageOptions.useClient) {
    [start, end] = pageRowRange;
  }

  if (rawData.length && rowCalculation && isRowSpanEnabled(sortState)) {
    const maxRowSpanCount = getMaxRowSpanCount(start, rawData);
    const topRowSpanIndex = start - maxRowSpanCount;

    return [topRowSpanIndex >= 0 ? topRowSpanIndex : 0, end];
  }

  return [start, end];
}

export function getCachedRange(cachedRange: Range, newRange: Range) {
  if (cachedRange && arrayEqual(cachedRange, newRange)) {
    return cachedRange;
  }
  return newRange;
}
