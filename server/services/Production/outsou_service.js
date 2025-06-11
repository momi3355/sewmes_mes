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

// 외주자재출고 페이지 서비스 =========================================
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
// ==============================================================

// 외주입고 페이지 서비스 =========================================
const findInboundReceiveByConditions = async ({
  regStart, regEnd, inboundStart, inboundEnd,
  cpName, prodName, testState
}) => {
  let baseSql = sqlList.selectOutsouInboundByConditions;
  const whereClauses = [];
  const params = [];

  if (regStart && regEnd) {
    whereClauses.push("AND r.reg_date BETWEEN ? AND ?");
    params.push(regStart, regEnd);
  }

  if (inboundStart && inboundEnd) {
    whereClauses.push("AND r.inbound_date BETWEEN ? AND ?");
    params.push(inboundStart, inboundEnd);
  }

  if (cpName) {
    whereClauses.push("AND r.cp_name LIKE ?");
    params.push(`%${cpName}%`);
  }

  if (prodName) {
    whereClauses.push("AND r.prod_name LIKE ?");
    params.push(`%${prodName}%`);
  }

  if (testState) {
    switch (testState) {
      case 'not_tested':
        whereClauses.push("AND r.pass_qty IS NULL");
        break;
      case 'pass':
        whereClauses.push("AND r.inbound_qty = r.pass_qty");
        break;
      case 'partial_pass':
        whereClauses.push("AND r.inbound_qty > r.pass_qty");
        break;
      case 'fail':
        whereClauses.push(`
          AND r.inbound_qty = (
            SELECT IFNULL(SUM(defect_qty), 0)
            FROM t_outsou_defect_detail d
            WHERE d.outsou_inbound_code = r.outsou_inbound_code
          )
        `);
        break;
    }
  }

  const finalSql = baseSql.replace("/**조건절**/", whereClauses.join("\n"));
  return await mariadb.directQuery(finalSql, params);
};
// ==============================================================

// 외주입고불량내역 페이지 서비스 =========================================
const findInboundDefectByConditions = async ({
  regStart, regEnd, inboundStart, inboundEnd,
  cpName, prodName, inboundCode
}) => {
  let baseSql = sqlList.selectInboundDefectByConditions;
  const whereClauses = [];
  const params = [];
  if (regStart && regEnd) {
    whereClauses.push("AND oi.reg_date BETWEEN ? AND ?");
    params.push(regStart, regEnd);
  }
  if (inboundStart && inboundEnd) {
    whereClauses.push("AND oi.inbound_date BETWEEN ? AND ?");
    params.push(inboundStart, inboundEnd);
  }
  if (cpName) {
    whereClauses.push("AND c.cp_name LIKE ?");
    params.push(`%${cpName}%`);
  }
  if (prodName) {
    whereClauses.push("AND p.prod_name LIKE ?");
    params.push(`%${prodName}%`);
  }
  if (inboundCode) {
    whereClauses.push("AND oi.outsou_inbound_code LIKE ?");
    params.push(`%${inboundCode}%`);
  }

  const finalSql = baseSql.replace("/**조건절**/", whereClauses.join("\n"));
  return await mariadb.directQuery(finalSql, params);
};

module.exports ={
  // 외주발주
  findOutsouOrderByConditions,
  // 외주출고
  findOutsouReleaseMaterialByConditions,
  // 외주입고
  findInboundReceiveByConditions,
  // 외주입고불량
  findInboundDefectByConditions
};