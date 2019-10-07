export function getPrevRowIndex(rowIndex: number, heights: number[]) {
  let index = rowIndex;

  while (index > 0) {
    index -= 1;
    if (heights[index]) {
      break;
    }
  }

  return index;
}

export function getNextRowIndex(rowIndex: number, heights: number[]) {
  let index = rowIndex;

  while (index < heights.length - 1) {
    index += 1;
    if (heights[index]) {
      break;
    }
  }

  return index;
}
