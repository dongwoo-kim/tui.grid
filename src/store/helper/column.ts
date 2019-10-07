import {
  Dictionary,
  CellEditorOptions,
  ColumnFilterOption,
  CellRendererOptions,
  Relations,
  HeaderAlignInfo,
  Column,
  ComplexColumnInfo
} from '../types';
import { editorMap } from '../../editor/manager';
import { OptCellEditor, FilterOptionType, FilterOpt, OptCellRenderer, OptTree } from '../../types';
import { DefaultRenderer } from '../../renderer/default';
import { findProp, isFunction, isString, isObject, some } from '../../helper/common';

export function getBuiltInEditorOptions(editorType: string, options?: Dictionary<any>) {
  const editInfo = editorMap[editorType];

  return {
    type: editInfo[0],
    options: {
      ...editInfo[1],
      ...options
    }
  };
}

export function getEditorOptions(editor?: OptCellEditor): CellEditorOptions | null {
  if (isFunction(editor)) {
    return { type: editor };
  }
  if (isString(editor)) {
    return getBuiltInEditorOptions(editor);
  }
  if (isObject(editor)) {
    return isString(editor.type)
      ? getBuiltInEditorOptions(editor.type, editor.options)
      : (editor as CellEditorOptions);
  }
  return null;
}

export function getFilterOptions(filter: FilterOptionType | FilterOpt): ColumnFilterOption {
  const defaultOption = {
    type: isObject(filter) ? filter.type : filter!,
    showApplyBtn: false,
    showClearBtn: false
  };

  if (isString(filter)) {
    if (filter === 'select') {
      return {
        ...defaultOption,
        operator: 'OR'
      };
    }
  }

  if (isObject(filter)) {
    return {
      ...defaultOption,
      ...filter
    };
  }

  return defaultOption;
}

export function getRendererOptions(renderer?: OptCellRenderer): CellRendererOptions {
  if (isObject(renderer) && !isFunction(renderer) && isFunction(renderer.type)) {
    return renderer as CellRendererOptions;
  }
  return { type: DefaultRenderer };
}

export function getTreeInfo(treeColumnOptions: OptTree, name: string) {
  if (treeColumnOptions && treeColumnOptions.name === name) {
    const { useIcon = true } = treeColumnOptions;

    return { tree: { useIcon } };
  }

  return null;
}

export function getRelationMap(relations: Relations[]) {
  const relationMap: Dictionary<Relations> = {};
  relations.forEach(relation => {
    const { editable, disabled, listItems, targetNames = [] } = relation;
    targetNames.forEach(targetName => {
      relationMap[targetName] = {
        editable,
        disabled,
        listItems
      };
    });
  });

  return relationMap;
}

export function getRelationColumns(relations: Relations[]) {
  const relationColumns: string[] = [];
  relations.forEach(relation => {
    const { targetNames = [] } = relation;
    targetNames.forEach(targetName => {
      relationColumns.push(targetName);
    });
  });

  return relationColumns;
}

export function getHeaderAlignInfo(name: string, alignInfo: HeaderAlignInfo) {
  const { columnsAlign, align: defaultAlign, valign: defaultVAlign } = alignInfo;
  const columnOption = findProp('name', name, columnsAlign);
  const headerAlign = columnOption && columnOption.align ? columnOption.align : defaultAlign;
  const headerVAlign = columnOption && columnOption.valign ? columnOption.valign : defaultVAlign;

  return {
    headerAlign,
    headerVAlign
  };
}

export function isRowHeader(columnName: string) {
  return ['_number', '_checked'].indexOf(columnName) > -1;
}

export function isRowNumColumn(columnName: string) {
  return columnName === '_number';
}

export function isCheckboxColumn(columnName: string) {
  return columnName === '_checked';
}

export function isParentColumnHeader(complexHeaderColumns: ComplexColumnInfo[], name: string) {
  return !!complexHeaderColumns.length && some(item => item.name === name, complexHeaderColumns);
}

export function isHiddenColumn(column: Column, columnName: string) {
  return column.allColumnMap[columnName].hidden;
}
