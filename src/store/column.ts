import {
  Column,
  ColumnInfo,
  Dictionary,
  ClipboardCopyOptions,
  ComplexColumnInfo,
  HeaderAlignInfo
} from './types';
import {
  OptColumn,
  OptColumnOptions,
  OptRowHeader,
  OptTree,
  AlignType,
  VAlignType,
  ColumnsAlignInfo
} from '../types';
import { observable } from '../helper/observable';
import {
  createMapFromArray,
  includes,
  omit,
  isString,
  isUndefined,
  isNumber
} from '../helper/common';
import { DefaultRenderer } from '../renderer/default';
import { RowHeaderInputRenderer } from '../renderer/rowHeaderInput';
import {
  getEditorOptions,
  getRendererOptions,
  getFilterOptions,
  getHeaderAlignInfo,
  getRelationMap,
  getTreeInfo,
  getRelationColumns,
  isRowNumColumn
} from './helper/column';
import { defMinWidth, ROW_HEADERS_MAP, DEF_ROW_HEADER_INPUT } from '../helper/constant';

interface ColumnOptions {
  columns: OptColumn[];
  columnOptions: OptColumnOptions;
  rowHeaders: OptRowHeader[];
  copyOptions: ClipboardCopyOptions;
  keyColumnName?: string;
  treeColumnOptions: OptTree;
  complexColumns: ComplexColumnInfo[];
  align: AlignType;
  valign: VAlignType;
  columnsAlign: ColumnsAlignInfo[];
}

// eslint-disable-next-line max-params
export function createColumn(
  column: OptColumn,
  columnOptions: OptColumnOptions,
  relationColumns: string[],
  gridCopyOptions: ClipboardCopyOptions,
  treeColumnOptions: OptTree,
  alignInfo: HeaderAlignInfo
): ColumnInfo {
  const {
    name,
    header,
    width,
    minWidth,
    align,
    hidden,
    resizable,
    editor,
    renderer,
    relations,
    sortable,
    sortingType,
    copyOptions,
    validation,
    formatter,
    onBeforeChange,
    onAfterChange,
    whiteSpace,
    ellipsis,
    valign,
    defaultValue,
    escapeHTML,
    ignored,
    filter
  } = column;

  const editorOptions = getEditorOptions(editor);
  const rendererOptions = getRendererOptions(renderer);
  const filterOptions = filter ? getFilterOptions(filter) : null;

  const { headerAlign, headerVAlign } = getHeaderAlignInfo(name, alignInfo);

  return observable({
    name,
    escapeHTML,
    header: header || name,
    hidden: Boolean(hidden),
    resizable: isUndefined(resizable) ? Boolean(columnOptions.resizable) : Boolean(resizable),
    align: align || 'left',
    fixedWidth: typeof width === 'number',
    copyOptions: { ...gridCopyOptions, ...copyOptions },
    baseWidth: (width === 'auto' ? 0 : width) || 0,
    minWidth: minWidth || columnOptions.minWidth || defMinWidth.COLUMN, // @TODO meta tag 체크 여부
    relationMap: getRelationMap(relations || []),
    related: includes(relationColumns, name),
    sortable,
    sortingType: sortingType || 'asc',
    validation: validation ? { ...validation } : {},
    renderer: rendererOptions,
    formatter,
    onBeforeChange,
    onAfterChange,
    whiteSpace,
    ellipsis,
    valign,
    defaultValue,
    ignored,
    ...(!!editorOptions && { editor: editorOptions }),
    ...getTreeInfo(treeColumnOptions, name),
    headerAlign,
    headerVAlign,
    filter: filterOptions
  });
}

function createRowHeader(data: OptRowHeader, alignInfo: HeaderAlignInfo): ColumnInfo {
  const rowHeader: OptColumn = isString(data)
    ? { name: ROW_HEADERS_MAP[data] }
    : { name: ROW_HEADERS_MAP[data.type], ...omit(data, 'type') };
  const { name, header, align, valign, renderer, width, minWidth } = rowHeader;
  const baseMinWith = isNumber(minWidth) ? minWidth : defMinWidth.ROW_HEADER;
  const baseWidth = (width === 'auto' ? baseMinWith : width) || baseMinWith;
  const rowNumColumn = isRowNumColumn(name);

  const defaultHeader = rowNumColumn ? 'No. ' : DEF_ROW_HEADER_INPUT;
  const rendererOptions = renderer || {
    type: rowNumColumn ? DefaultRenderer : RowHeaderInputRenderer
  };
  const { headerAlign, headerVAlign } = getHeaderAlignInfo(name, alignInfo);

  return observable({
    name,
    header: header || defaultHeader,
    hidden: false,
    resizable: false,
    align: align || 'center',
    valign: valign || 'middle',
    renderer: getRendererOptions(rendererOptions),
    fixedWidth: true,
    baseWidth,
    escapeHTML: false,
    minWidth: baseMinWith,
    headerAlign,
    headerVAlign
  });
}

function createComplexHeaderColumns(column: ComplexColumnInfo, alignInfo: HeaderAlignInfo) {
  const { header, name, childNames, sortable, sortingType } = column;
  const { headerAlign, headerVAlign } = getHeaderAlignInfo(name, alignInfo);

  return observable({
    header,
    name,
    childNames,
    sortable,
    sortingType,
    headerAlign,
    headerVAlign
  });
}

export function create({
  columns,
  columnOptions,
  rowHeaders,
  copyOptions,
  keyColumnName,
  treeColumnOptions,
  complexColumns,
  align,
  valign,
  columnsAlign
}: ColumnOptions): Column {
  const relationColumns = columns.reduce((acc: string[], { relations }) => {
    acc = acc.concat(getRelationColumns(relations || []));
    return acc.filter((columnName, idx) => acc.indexOf(columnName) === idx);
  }, []);

  const headerAlignInfo = { columnsAlign, align, valign };

  const rowHeaderInfos = rowHeaders.map(rowHeader => createRowHeader(rowHeader, headerAlignInfo));

  const columnInfos = columns.map(column =>
    createColumn(
      column,
      columnOptions,
      relationColumns,
      copyOptions,
      treeColumnOptions,
      headerAlignInfo
    )
  );
  const allColumns = rowHeaderInfos.concat(columnInfos);

  const {
    name: treeColumnName,
    useIcon: treeIcon = true,
    useCascadingCheckbox: treeCascadingCheckbox = true
  } = treeColumnOptions;

  const complexHeaderColumns = complexColumns.map(column =>
    createComplexHeaderColumns(column, headerAlignInfo)
  );

  return observable({
    keyColumnName,
    allColumns,
    complexHeaderColumns,
    headerAlignInfo,
    frozenCount: columnOptions.frozenCount || 0,

    dataForColumnCreation: {
      copyOptions,
      columnOptions,
      treeColumnOptions,
      relationColumns,
      rowHeaders: rowHeaderInfos
    },

    get allColumnMap() {
      return createMapFromArray(this.allColumns, 'name') as Dictionary<ColumnInfo>;
    },

    get rowHeaderCount() {
      return rowHeaderInfos.length;
    },

    get visibleColumns() {
      return this.allColumns.slice(this.rowHeaderCount).filter(({ hidden }) => !hidden);
    },

    get visibleColumnsWithRowHeader() {
      return this.allColumns.filter(({ hidden }) => !hidden);
    },

    get visibleColumnsBySide() {
      return {
        L: this.visibleColumns.slice(0, this.frozenCount),
        R: this.visibleColumns.slice(this.frozenCount)
      };
    },

    get visibleColumnsBySideWithRowHeader() {
      const frozenLastIndex = this.rowHeaderCount + this.frozenCount;

      return {
        L: this.visibleColumnsWithRowHeader.slice(0, frozenLastIndex),
        R: this.visibleColumnsWithRowHeader.slice(frozenLastIndex)
      };
    },

    get defaultValues() {
      return this.allColumns
        .filter(({ defaultValue }) => Boolean(defaultValue))
        .map(({ name, defaultValue }) => ({ name, value: defaultValue }));
    },

    get visibleFrozenCount(this: Column) {
      return this.visibleColumnsBySideWithRowHeader.L.length;
    },

    get validationColumns() {
      return this.allColumns.filter(({ validation }) => !!validation);
    },

    get ignoredColumns() {
      return this.allColumns.filter(({ ignored }) => ignored).map(({ name }) => name);
    },

    ...(treeColumnName && { treeColumnName, treeIcon, treeCascadingCheckbox })
  });
}
