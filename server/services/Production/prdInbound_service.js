const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 

// 완제품 입고 검수 페이지 서비스 =========================================
const findProdInboundTestByConditions = async ({
  regStart, regEnd, checkStart, checkEnd, prodName, testState
}) => {
  let baseSql = sqlList.selectProdInboundTestByConditions;
  const whereClauses = [];
  const params = [];

  if (regStart && regEnd) {
    whereClauses.push("AND ip.work_inst_reg_date BETWEEN ? AND ?");
    params.push(regStart, regEnd);
  }

  if (checkStart && checkEnd) {
    whereClauses.push("AND pc.check_date ? AND ?");
    params.push(checkStart, checkEnd);
  }

  if (prodName) {
    whereClauses.push("AND p.prod_name LIKE ?");
    params.push(`%${prodName}%`);
  }

  if (testState) {
    switch (testState) {
      case 'not_tested':
        whereClauses.push("AND pc.pass_qty IS NULL");
        break;
      case 'pass':
        whereClauses.push("AND pc.pass_qty > 0");
        break;
    }
  }

  const finalSql = baseSql.replace("/**조건절**/", whereClauses.join("\n"));
  return await mariadb.directQuery(finalSql, params);
};

module.exports ={
    findProdInboundTestByConditions
};