import { CustomValue, CellValue, Row, ColumnInfo, CellRenderData } from '../types';
import { ListItemOptions } from '../../editor/types';
import { find } from '../../helper/common';

function getCustomValue(
  customValue: CustomValue,
  value: CellValue,
  rowAttrs: Row[],
  column: ColumnInfo
) {
  return typeof customValue === 'function' ? customValue(value, rowAttrs, column) : customValue;
}

export function getTextWithCopyOptionsApplied(
  valueMap: CellRenderData,
  rawData: Row[],
  column: ColumnInfo
) {
  let text = valueMap.value;
  const { copyOptions, editor } = column;
  const editorOptions = editor && editor.options;

  // priority: customValue > useListItemText > useFormattedValue > original Data
  if (copyOptions) {
    if (copyOptions.customValue) {
      text = getCustomValue(copyOptions.customValue, valueMap.value, rawData, column);
    } else if (copyOptions.useListItemText && editorOptions) {
      const { listItems } = (editorOptions as unknown) as ListItemOptions;
      const { value } = valueMap;
      let valueList = [value];
      const result: CellValue[] = [];

      if (typeof value === 'string') {
        valueList = value.split(',');
      }

      valueList.forEach(val => {
        const listItem = find(item => item.value === val, listItems);

        result.push(listItem ? listItem.text : val);
      });

      text = result.join(',');
    } else if (copyOptions.useFormattedValue) {
      text = `${valueMap.formattedValue}`;
    }
  }

  if (typeof text === 'undefined' || text === null) {
    return '';
  }

  return String(text);
}
