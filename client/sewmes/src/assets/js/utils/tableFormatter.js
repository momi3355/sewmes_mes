export const typeFormatter = (cell, formatterParams) => {
  const typeArray = formatterParams.typeArray;
  const code = cell.getValue();

  const foundType = typeArray.find((type) => type.detail_code === code);
  return foundType ? foundType.detail_name : code;
};