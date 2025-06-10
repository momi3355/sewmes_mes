const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 

// 외주발주 페이지 서비스 =========================================
const findOutsouOrderByConditions = async ({
  outsouOrderCode, prodName, cpName, releaseState, regStartDate,
  regEndDate, deadStartDate, deadEndDate
}) => {
  let baseSql = sqlList.selectOutsouOrderByConditions;
  const whereClauses = [];
  const params = [];

  if (outsouOrderCode) {
    whereClauses.push("AND o.outsou_order_code LIKE ?");
    params.push(`%${outsouOrderCode}%`);
  }

  if (prodName) {
    whereClauses.push("AND p.prod_name LIKE ?");
    params.push(`%${prodName}%`);
  }

  if (cpName) {
    whereClauses.push("AND c.cp_name LIKE ?");
    params.push(`%${cpName}%`);
  }

  if (releaseState) {
    whereClauses.push("AND o.release_state = ?");
    params.push(releaseState);
  }

  if (regStartDate && regEndDate) {
    whereClauses.push("AND o.reg_date BETWEEN ? AND ?");
    params.push(regStartDate, regEndDate);
  }

  if (deadStartDate && deadEndDate) {
    whereClauses.push("AND o.dead_date BETWEEN ? AND ?");
    params.push(deadStartDate, deadEndDate);
  }

  const finalSql = baseSql.replace("/**조건절**/", whereClauses.join("\n"));

  return await mariadb.directQuery(finalSql, params);
};
// ==============================================================
const findOutsouReleaseMaterialByConditions = async ({
  outsouOrderCode, materialName, cpName, releaseState, regStartDate,
  regEndDate, deadStartDate, deadEndDate
}) => {
  let baseSql = sqlList.selectOutsouReleaseMaterialByConditions;
  const whereClauses = [];
  const params = [];

  if (outsouOrderCode) {
    whereClauses.push("AND o.outsou_order_code LIKE ?");
    params.push(`%${outsouOrderCode}%`);
  }

  if (materialName) {
    whereClauses.push("AND p.prod_name LIKE ?");
    params.push(`%${materialName}%`);
  }

  if (cpName) {
    whereClauses.push("AND c.cp_name LIKE ?");
    params.push(`%${cpName}%`);
  }

  if (releaseState) {
    whereClauses.push("AND o.release_state = ?");
    params.push(releaseState);
  }

  if (regStartDate && regEndDate) {
    whereClauses.push("AND o.reg_date BETWEEN ? AND ?");
    params.push(regStartDate, regEndDate);
  }

  if (deadStartDate && deadEndDate) {
    whereClauses.push("AND o.dead_date BETWEEN ? AND ?");
    params.push(deadStartDate, deadEndDate);
  }

  const finalSql = baseSql.replace("/**조건절**/", whereClauses.join("\n"));
  console.log(finalSql);
  return await mariadb.directQuery(finalSql, params);
};
// 외주자재출고 페이지 서비스 =========================================
module.exports ={
  findOutsouOrderByConditions,
  findOutsouReleaseMaterialByConditions
};