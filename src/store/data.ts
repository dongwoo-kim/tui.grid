import {
  Data,
  Row,
  Dictionary,
  Column,
  ColumnInfo,
  ColumnDefaultValues,
  CellRenderData,
  RowKey,
  RowSpanMap,
  ListItem,
  SortState,
  ViewRow,
  Range,
  Filter,
  PageOptions
} from './types';
import { observable, observe, Observable } from '../helper/observable';
import { isRowHeader, isCheckboxColumn } from '../store/helper/column';
import { OptRow, RowSpanAttributeValue } from '../types';
import {
  someProp,
  setDefaultProp,
  isUndefined,
  isBoolean,
  isEmpty,
  isNumber,
  isFunction
} from '../helper/common';
import { createTreeRawData, createTreeCellInfo } from '../helper/tree';
import { createRowSpan } from '../helper/rowSpan';
import { cls } from '../helper/dom';
import { findIndexByRowKey } from '../query/data';
import {
  getRowHeaderValue,
  getValidationCode,
  getFormattedValue,
  getEditable,
  getDisabled,
  generateDataCreationKey,
  getListItems,
  getDataCreationKey
} from './helper/data';

interface DataOption {
  data: OptRow[];
  column: Column;
  pageOptions: PageOptions;
  useClientSort: boolean;
  disabled: boolean;
  id: number;
}

interface RawRowOptions {
  keyColumnName?: string;
  prevRow?: Row;
  lazyObservable?: boolean;
}

function createViewCell(
  row: Row,
  column: ColumnInfo,
  relationMatched = true,
  relationListItems?: ListItem[]
): CellRenderData {
  const { name, formatter, editor, validation } = column;
  let value = isRowHeader(name) ? getRowHeaderValue(row, name) : row[name];

  if (!relationMatched) {
    value = '';
  }

  const formatterProps = { row, column, value };
  const { disabled, checkDisabled, className: classNameAttr } = row._attributes;
  const columnClassName = isUndefined(classNameAttr.column[name]) ? [] : classNameAttr.column[name];
  const classList = [...classNameAttr.row, ...columnClassName];
  const className = (isEmpty(row.rowSpanMap[name])
    ? classList
    : classList.filter(clsName => clsName !== cls('row-hover'))
  ).join(' ');

  return {
    editable: !!editor,
    className,
    disabled: isCheckboxColumn(name) ? checkDisabled : disabled,
    invalidStates: getValidationCode(value, validation),
    formattedValue: getFormattedValue(formatterProps, formatter, value, relationListItems),
    value
  };
}

function createRelationViewCell(
  name: string,
  row: Row,
  columnMap: Dictionary<ColumnInfo>,
  valueMap: Dictionary<CellRenderData>
) {
  const { editable, disabled, value } = valueMap[name];
  const { relationMap = {} } = columnMap[name];

  Object.keys(relationMap).forEach(targetName => {
    const {
      editable: editableCallback,
      disabled: disabledCallback,
      listItems: listItemsCallback
    } = relationMap[targetName];
    const relationCbParams = { value, editable, disabled, row };
    const targetEditable = getEditable(editableCallback, relationCbParams);
    const targetDisabled = getDisabled(disabledCallback, relationCbParams);
    const targetListItems = getListItems(listItemsCallback, relationCbParams) || [];
    const targetValue = row[targetName];
    const targetEditor = columnMap[targetName].editor;
    const targetEditorOptions = targetEditor && targetEditor.options;

    const relationMatched = isFunction(listItemsCallback)
      ? someProp('value', targetValue, targetListItems)
      : true;

    const cellData = createViewCell(row, columnMap[targetName], relationMatched, targetListItems);

    if (!targetEditable) {
      cellData.editable = false;
    }
    if (targetDisabled) {
      cellData.disabled = true;
    }
    // should set the relation list to relationListItemMap for preventing to share relation list in other rows
    if (targetEditorOptions) {
      targetEditorOptions.relationListItemMap = targetEditorOptions.relationListItemMap || {};
      targetEditorOptions.relationListItemMap[row.rowKey] = targetListItems;
    }

    valueMap[targetName] = cellData;
  });
}

function createAttributes(row: OptRow, index: number, lazyObservable: boolean) {
  const defaultAttr = {
    rowNum: index + 1, // @TODO append, remove 할 때 인덱스 변경 처리 필요
    checked: false,
    disabled: false,
    checkDisabled: false,
    className: {
      row: [],
      column: {}
    }
  };

  if (row._attributes) {
    if (isBoolean(row._attributes.disabled) && isUndefined(row._attributes.checkDisabled)) {
      row._attributes.checkDisabled = row._attributes.disabled;
    }

    if (!isUndefined(row._attributes.className)) {
      row._attributes.className = {
        row: [],
        column: {},
        ...row._attributes.className
      };
    }
  }
  const attributes = { ...defaultAttr, ...row._attributes };

  return lazyObservable ? attributes : observable(attributes);
}

function createMainRowSpanMap(rowSpan: RowSpanAttributeValue, rowKey: RowKey) {
  const mainRowSpanMap: RowSpanMap = {};

  if (!rowSpan) {
    return mainRowSpanMap;
  }

  Object.keys(rowSpan).forEach(columnName => {
    const spanCount = rowSpan[columnName];
    mainRowSpanMap[columnName] = createRowSpan(true, rowKey, spanCount, spanCount);
  });
  return mainRowSpanMap;
}

function createSubRowSpan(prevRowSpanMap: RowSpanMap) {
  const subRowSpanMap: RowSpanMap = {};

  Object.keys(prevRowSpanMap).forEach(columnName => {
    const prevRowSpan = prevRowSpanMap[columnName];
    const { mainRowKey, count, spanCount } = prevRowSpan;
    if (spanCount > 1 - count) {
      const subRowCount = count >= 0 ? -1 : count - 1;
      subRowSpanMap[columnName] = createRowSpan(false, mainRowKey, subRowCount, spanCount);
    }
  });
  return subRowSpanMap;
}

function createRowSpanMap(row: OptRow, rowSpan: RowSpanAttributeValue, prevRow?: Row) {
  const rowKey = row.rowKey as RowKey;
  let mainRowSpanMap: RowSpanMap = {};
  let subRowSpanMap: RowSpanMap = {};

  if (!isEmpty(rowSpan)) {
    mainRowSpanMap = createMainRowSpanMap(rowSpan, rowKey);
  }
  if (prevRow) {
    const { rowSpanMap: prevRowSpanMap } = prevRow;
    if (!isEmpty(prevRowSpanMap)) {
      subRowSpanMap = createSubRowSpan(prevRowSpanMap);
    }
  }

  return { ...mainRowSpanMap, ...subRowSpanMap };
}

export function createViewRow(
  row: Row,
  columnMap: Dictionary<ColumnInfo>,
  rawData: Row[],
  treeColumnName?: string,
  treeIcon?: boolean
) {
  const { rowKey, sortKey, rowSpanMap, uniqueKey } = row;
  const initValueMap: Dictionary<CellRenderData | null> = {};

  Object.keys(columnMap).forEach(name => {
    initValueMap[name] = null;
  });

  const valueMap = observable(initValueMap) as Dictionary<CellRenderData>;
  const __unobserveFns__: Function[] = [];

  Object.keys(columnMap).forEach(name => {
    const { related, relationMap } = columnMap[name];

    // add condition expression to prevent to call watch function recursively
    if (!related) {
      __unobserveFns__.push(
        observe(() => {
          valueMap[name] = createViewCell(row, columnMap[name]);
        })
      );
    }

    if (relationMap && Object.keys(relationMap).length) {
      __unobserveFns__.push(
        observe(() => {
          createRelationViewCell(name, row, columnMap, valueMap);
        })
      );
    }
  });

  return {
    rowKey,
    sortKey,
    uniqueKey,
    rowSpanMap,
    valueMap,
    __unobserveFns__,
    ...(treeColumnName && { treeInfo: createTreeCellInfo(rawData, row, treeIcon) })
  };
}

export function createRawRow(
  row: OptRow,
  index: number,
  defaultValues: ColumnDefaultValues,
  options: RawRowOptions = {}
) {
  // this rowSpan variable is attribute option before creating rowSpanDataMap
  let rowSpan: RowSpanAttributeValue;
  const { keyColumnName, prevRow, lazyObservable = false } = options;

  if (row._attributes) {
    rowSpan = row._attributes.rowSpan as RowSpanAttributeValue;
  }
  row.rowKey = keyColumnName ? row[keyColumnName] : index;
  row.sortKey = isNumber(row.sortKey) ? row.sortKey : index;
  row.uniqueKey = `${getDataCreationKey()}-${row.rowKey}`;
  row._attributes = createAttributes(row, index, lazyObservable);
  row._attributes.rowSpan = rowSpan;
  (row as Row).rowSpanMap = createRowSpanMap(row, rowSpan, prevRow);

  defaultValues.forEach(({ name, value }) => {
    setDefaultProp(row, name, value);
  });

  return (lazyObservable ? row : observable(row)) as Row;
}

export function createData(
  data: OptRow[],
  column: Column,
  lazyObservable = false,
  prevRows?: Row[]
) {
  generateDataCreationKey();
  const { defaultValues, allColumnMap, treeColumnName = '', treeIcon = true } = column;
  const keyColumnName = lazyObservable ? column.keyColumnName : 'rowKey';
  let rawData: Row[];

  if (treeColumnName) {
    rawData = createTreeRawData(data, defaultValues, keyColumnName, lazyObservable);
  } else {
    rawData = data.map((row, index, rows) =>
      createRawRow(row, index, defaultValues, {
        keyColumnName,
        prevRow: prevRows ? prevRows[index] : (rows[index - 1] as Row),
        lazyObservable
      })
    );
  }

  const viewData = rawData.map((row: Row) =>
    lazyObservable
      ? ({ rowKey: row.rowKey, sortKey: row.sortKey, uniqueKey: row.uniqueKey } as ViewRow)
      : createViewRow(row, allColumnMap, rawData, treeColumnName, treeIcon)
  );

  return { rawData, viewData };
}

function applyFilterToRawData(rawData: Row[], filters: Filter[] | null) {
  let data = rawData;

  if (filters) {
    data = filters.reduce((acc: Row[], filter: Filter) => {
      const { conditionFn, columnName } = filter;
      return acc.filter(row => conditionFn!(row[columnName]));
    }, rawData);
  }

  return data;
}

export function create({
  data,
  column,
  pageOptions: userPageOptions,
  useClientSort,
  disabled,
  id
}: DataOption): Observable<Data> {
  const { rawData, viewData } = createData(data, column, true);

  const sortState: SortState = {
    useClient: useClientSort,
    columns: [
      {
        columnName: 'sortKey',
        ascending: true
      }
    ]
  };

  const pageOptions: Required<PageOptions> = isEmpty(userPageOptions)
    ? ({} as Required<PageOptions>)
    : {
        useClient: false,
        page: 1,
        perPage: 20,
        ...userPageOptions,
        totalCount: userPageOptions.useClient ? rawData.length : userPageOptions.totalCount!
      };

  return observable({
    disabled,
    rawData,
    viewData,
    sortState,
    pageOptions,
    checkedAllRows: !rawData.some(row => !row._attributes.checked),
    filters: null,

    get filteredRawData(this: Data) {
      return this.filters ? applyFilterToRawData(this.rawData, this.filters) : this.rawData;
    },

    get filteredIndex(this: Data) {
      if (this.filters) {
        return this.filteredRawData.map(row =>
          findIndexByRowKey(this, column, id, row.rowKey, false)
        );
      }
      return null;
    },

    get filteredViewData(this: Data) {
      return this.filters ? this.filteredIndex!.map(index => this.viewData[index]) : this.viewData;
    },

    get pageRowRange() {
      let start = 0;
      let end = rawData.length;

      if (this.pageOptions.useClient) {
        const { page, perPage } = this.pageOptions;
        const pageRowLastIndex = page * perPage;
        start = (page - 1) * perPage;
        end = pageRowLastIndex < end ? pageRowLastIndex : end;
      }

      return [start, end] as Range;
    }
  });
}
