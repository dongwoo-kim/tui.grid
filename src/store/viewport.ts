import { Column, Viewport, Dimension, Data, RowCoords, ColumnCoords } from './types';
import { observable, Observable } from '../helper/observable';
import { calculateRange, getCachedRange } from './helper/viewport';

interface ViewportOption {
  data: Data;
  column: Column;
  dimension: Dimension;
  rowCoords: RowCoords;
  columnCoords: ColumnCoords;
  showDummyRows: boolean;
}

export function create({
  data,
  column,
  dimension,
  rowCoords,
  columnCoords,
  showDummyRows
}: ViewportOption): Observable<Viewport> {
  return observable({
    scrollLeft: 0,
    scrollTop: 0,
    scrollPixelScale: 40,

    get maxScrollLeft() {
      const { scrollbarWidth, cellBorderWidth } = dimension;
      const { areaWidth, widths } = columnCoords;
      let totalRWidth = 0;
      widths.R.forEach(width => {
        totalRWidth += width + cellBorderWidth;
      });

      return totalRWidth - areaWidth.R + scrollbarWidth;
    },

    get maxScrollTop() {
      const { bodyHeight, scrollbarWidth } = dimension;
      const { totalRowHeight } = rowCoords;

      return totalRowHeight - bodyHeight + scrollbarWidth;
    },

    // only for right side columns
    get colRange(this: Observable<Viewport>) {
      const range = calculateRange(
        this.scrollLeft,
        columnCoords.areaWidth.R,
        columnCoords.offsets.R,
        data
      );

      return getCachedRange(this.__storage__.colRange, range);
    },

    // only for right side columns
    get columns(this: Viewport) {
      return column.visibleColumnsBySideWithRowHeader.R.slice(...this.colRange);
    },

    get offsetLeft(this: Viewport) {
      return columnCoords.offsets.R[this.colRange[0]];
    },

    get rowRange(this: Observable<Viewport>) {
      const range = calculateRange(
        this.scrollTop,
        dimension.bodyHeight,
        rowCoords.offsets,
        data,
        true
      );

      return getCachedRange(this.__storage__.rowRange, range);
    },

    get rows(this: Viewport) {
      return data.filteredViewData.slice(...this.rowRange);
    },

    get offsetTop(this: Viewport) {
      return rowCoords.offsets[this.rowRange[0] - data.pageRowRange[0]];
    },

    get dummyRowCount() {
      const { rowHeight, bodyHeight, scrollXHeight, cellBorderWidth } = dimension;
      const { totalRowHeight } = rowCoords;
      const adjustedRowHeight = rowHeight + cellBorderWidth;
      const adjustedBodyHeight = bodyHeight - scrollXHeight;

      if (showDummyRows && totalRowHeight < adjustedBodyHeight) {
        return Math.ceil((adjustedBodyHeight - totalRowHeight) / adjustedRowHeight) + 1;
      }

      return 0;
    }
  });
}
