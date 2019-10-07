export const ROW_HEADERS_MAP = {
  rowNum: '_number',
  checkbox: '_checked'
};

export const defMinWidth = {
  ROW_HEADER: 40,
  COLUMN: 50
};

export const DEF_ROW_HEADER_INPUT = '<input type="checkbox" name="_checked" />';

export const CUSTOM_LF_SUBCHAR = '___tui_grid_lf___';
export const CUSTOM_CR_SUBCHAR = '___tui_grid_cr___';
export const CUSTOM_LF_REGEXP = new RegExp(CUSTOM_LF_SUBCHAR, 'g');
export const CUSTOM_CR_REGEXP = new RegExp(CUSTOM_CR_SUBCHAR, 'g');
export const LF = '\n';
export const CR = '\r';
