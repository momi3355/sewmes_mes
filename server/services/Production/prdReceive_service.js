const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 

const getProductReceiveList = ({prod_code, prod_name, dead_date}) => {
  let baseSql = sqlList.selectPrdReceive;
  const whereClauses = [];
  const params = [];

  if (prod_code) {
    whereClauses.push("AND prod_code LIKE ?");
    params.push(`%${prod_code}%`);
  }

  if (prod_name) {
    whereClauses.push("AND prod_name LIKE ?");
    params.push(`%${prod_name}%`);
  }

  if (dead_date) {
    whereClauses.push("AND dead_date <= ?");
    params.push(`${dead_date}`);
  }

  const finalSql = baseSql.concat(whereClauses.join("\n"));
  return mariadb.directQuery(finalSql, params);
}

const getReleaseLotList = (code) => {
  return mariadb.query("selectReleaseLotList", code);
}

module.exports = {
  getProductReceiveList,
  getReleaseLotList
}