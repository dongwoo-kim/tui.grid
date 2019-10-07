import {
  Row,
  ListItem,
  Dictionary,
  CellValue,
  FormatterProps,
  Formatter,
  Validation,
  ValidationType
} from '../types';
import { isCheckboxColumn, isRowNumColumn } from '../../store/helper/column';
import {
  isUndefined,
  isNumber,
  encodeHTMLEntity,
  isFunction,
  isBlank,
  isString,
  convertToNumber
} from '../../helper/common';
import { listItemText } from '../../formatter/listItemText';

let dataCreationKey = '';

export function generateDataCreationKey() {
  dataCreationKey = `@dataKey${Date.now()}`;
  return dataCreationKey;
}

export function getDataCreationKey() {
  return dataCreationKey;
}

export function getCellDisplayValue(value: CellValue) {
  if (typeof value === 'undefined' || value === null) {
    return '';
  }
  return String(value);
}

export function getFormattedValue(
  props: FormatterProps,
  formatter?: Formatter,
  defaultValue?: CellValue,
  relationListItems?: ListItem[]
) {
  let value: CellValue;

  if (formatter === 'listItemText') {
    value = listItemText(props, relationListItems);
  } else if (typeof formatter === 'function') {
    value = formatter(props);
  } else if (typeof formatter === 'string') {
    value = formatter;
  } else {
    value = defaultValue;
  }

  const strValue = getCellDisplayValue(value);

  if (strValue && props.column.escapeHTML) {
    return encodeHTMLEntity(strValue);
  }
  return strValue;
}

export function getRelationCbResult(fn: any, relationParams: Dictionary<any>) {
  const result = isFunction(fn) ? fn(relationParams) : null;
  return isUndefined(result) ? null : result;
}

export function getEditable(fn: any, relationParams: Dictionary<any>): boolean {
  const result = getRelationCbResult(fn, relationParams);
  return result === null ? true : result;
}

export function getDisabled(fn: any, relationParams: Dictionary<any>): boolean {
  const result = getRelationCbResult(fn, relationParams);
  return result === null ? false : result;
}

export function getListItems(fn: any, relationParams: Dictionary<any>): ListItem[] | null {
  return getRelationCbResult(fn, relationParams);
}

export function getRowHeaderValue(row: Row, columnName: string) {
  if (isRowNumColumn(columnName)) {
    return row._attributes.rowNum;
  }
  if (isCheckboxColumn(columnName)) {
    return row._attributes.checked;
  }
  return '';
}

export function getValidationCode(value: CellValue, validation?: Validation): ValidationType[] {
  const invalidStates: ValidationType[] = [];

  if (!validation) {
    return invalidStates;
  }

  const { required, dataType, min, max, regExp, validatorFn } = validation;

  if (required && isBlank(value)) {
    invalidStates.push('REQUIRED');
  }

  if (validatorFn && !validatorFn(value)) {
    invalidStates.push('VALIDATOR_FN');
  }

  if (dataType === 'string' && !isString(value)) {
    invalidStates.push('TYPE_STRING');
  }

  if (regExp && isString(value) && !regExp.test(value)) {
    invalidStates.push('REGEXP');
  }

  const numberValue = convertToNumber(value);

  if (dataType === 'number' && !isNumber(numberValue)) {
    invalidStates.push('TYPE_NUMBER');
  }

  if (min && isNumber(numberValue) && numberValue < min) {
    invalidStates.push('MIN');
  }

  if (max && isNumber(numberValue) && numberValue > max) {
    invalidStates.push('MAX');
  }

  return invalidStates;
}
