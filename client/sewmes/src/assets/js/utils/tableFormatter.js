import moment from "moment";

export const typeFormatter = (cell, formatterParams) => {
  const typeArray = formatterParams.typeArray;
  const code = cell.getValue();

  const foundType = typeArray.value.find((type) => type.detail_code === code);
  return foundType ? foundType.detail_name : code;
};

export const dateFormatter = (cell, formatterParams) => {
  let dateformat = formatterParams.dateformat;
  if (!dateformat) dateformat = "YYYY-MM-DD"; //default

  const dead_code = cell.getValue();
  return moment(dead_code).format(dateformat);
}