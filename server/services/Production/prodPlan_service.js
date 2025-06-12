const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 

// 생산계획관리 페이지 서비스 =========================================
const findProdPlanByConditions = async ({
  prodCode, prodName, orderCode, complete, startDateStart,
  startDateEnd, endDateStart, endDateEnd
}) => {
  let baseSql = sqlList.selectProdPlanByConditions;
  const whereClauses = [];
  const params = [];

  if (prodCode) {
    whereClauses.push("AND pp.prod_code LIKE ?");
    params.push(`%${prodCode}%`);
  }

  if (prodName) {
    whereClauses.push("AND p.prod_name LIKE ?");
    params.push(`%${prodName}%`);
  }

  if (orderCode) {
    whereClauses.push("AND o.order_code LIKE ?");
    params.push(`%${orderCode}%`);
  }

  if (complete) {
    whereClauses.push("AND pp.complete = ?");
    params.push(complete);
  }

  if (startDateStart && startDateEnd) {
    whereClauses.push("AND pp.start_date BETWEEN ? AND ?");
    params.push(startDateStart, startDateEnd);
  }

  if (endDateStart && endDateEnd) {
    whereClauses.push("AND pp.end_date BETWEEN ? AND ?");
    params.push(endDateStart, endDateEnd);
  }

  const finalSql = baseSql.replace("/**조건절**/", whereClauses.join("\n"));
  console.log(finalSql);
  return await mariadb.directQuery(finalSql, params);
};


// 주문제품목록 모달 서비스 =========================================
const findOrderProdList = async ({
  state
}) => {
  let baseSql = sqlList.selectOrderProdList;
  const whereClauses = [];
  const params = [];

  if (state) {
    whereClauses.push("AND od.state = ?");
    params.push(state);
  }

  const finalSql = baseSql.replace("/**조건절**/", whereClauses.join("\n"));
  console.log(finalSql);
  return await mariadb.directQuery(finalSql, params);
};



module.exports ={
  findProdPlanByConditions,
  findOrderProdList
};