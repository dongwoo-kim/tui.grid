import {
  Column,
  ColumnCoords,
  Data,
  Dimension,
  Range,
  RowCoords,
  Selection,
  SelectionRange,
  SelectionType,
  SelectionUnit
} from './types';
import { Observable, observable } from '../helper/observable';
import { isEmpty } from '../helper/common';
import {
  getOwnSideColumnRange,
  getVerticalStyles,
  getHorizontalStyles,
  getSortedRange
} from './helper/selection';

interface SelectionOption {
  selectionUnit: SelectionUnit;
  columnCoords: ColumnCoords;
  column: Column;
  dimension: Dimension;
  rowCoords: RowCoords;
  data: Data;
}

export function create({
  selectionUnit,
  rowCoords,
  columnCoords,
  column: columnInfo,
  dimension,
  data
}: SelectionOption): Observable<Selection> {
  return observable({
    inputRange: null,
    unit: selectionUnit,
    type: 'cell' as SelectionType,
    intervalIdForAutoScroll: null,

    get range(this: Selection) {
      if (!this.inputRange) {
        return null;
      }

      const { widths: columnWidths } = columnCoords;
      const row = getSortedRange(this.inputRange.row);
      let column = getSortedRange(this.inputRange.column);

      if (this.unit === 'row') {
        const endColumnIndex = columnWidths.L.length + columnWidths.R.length - 1;
        column = [0, endColumnIndex];
      }

      return { row, column };
    },

    get rangeBySide(this: Selection) {
      if (!this.range) {
        return null;
      }
      const { visibleFrozenCount } = columnInfo;
      const { column, row } = this.range;

      return {
        L: { row, column: getOwnSideColumnRange(column, 'L', visibleFrozenCount) },
        R: { row, column: getOwnSideColumnRange(column, 'R', visibleFrozenCount) }
      };
    },

    get rangeAreaInfo(this: Selection) {
      if (!this.rangeBySide) {
        return null;
      }

      const { cellBorderWidth } = dimension;
      const { offsets: rowOffsets, heights: rowHeights } = rowCoords;
      const { widths: columnWidths } = columnCoords;
      const { L: leftRange, R: rightRange } = this.rangeBySide;

      let leftSideStyles = null;
      let rightSideStyles = null;

      if (leftRange.column) {
        leftSideStyles = {
          ...getVerticalStyles(leftRange.row, rowOffsets, rowHeights),
          ...getHorizontalStyles(leftRange.column, columnWidths, 'L', cellBorderWidth)
        };
      }

      if (rightRange.column) {
        rightSideStyles = {
          ...getVerticalStyles(rightRange.row, rowOffsets, rowHeights),
          ...getHorizontalStyles(rightRange.column, columnWidths, 'R', cellBorderWidth)
        };
      }

      return {
        L: leftSideStyles,
        R: rightSideStyles
      };
    },

    get rangeWithRowHeader(this: Selection) {
      if (!this.range) {
        return null;
      }
      const { rowHeaderCount } = columnInfo;
      const {
        range: { row, column }
      } = this;

      const columnStartIndex = Math.max(column[0] - rowHeaderCount, 0);
      const columnEndIndex = Math.max(column[1] - rowHeaderCount, 0);

      return {
        row,
        column: [columnStartIndex, columnEndIndex] as Range
      };
    },

    get originalRange(this: Selection): SelectionRange | null {
      if (!this.range) {
        return null;
      }
      const { pageOptions } = data;
      const { row, column } = this.range;

      if (!isEmpty(pageOptions)) {
        const { perPage, page } = pageOptions;
        const prevPageRowCount = perPage * (page - 1);
        return {
          row: [row[0] + prevPageRowCount, row[1] + prevPageRowCount],
          column
        };
      }

      return this.range;
    }
  });
}
