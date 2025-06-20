const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 

const findLotListByConditions = async ({
  releaseCode, lotCode, prodName
}) => {
  let baseSql = sqlList.searchLotHistory;
  const whereClauses = [];
  const params = [];

  if (releaseCode) {
    whereClauses.push("AND pr.release_code = ?");
    params.push(`%${releaseCode}%`);
  }

  if (lotCode) {
    whereClauses.push("AND h.lot_code = ?");
    params.push(`%${lotCode}%`);
  }

  if (prodName) {
    whereClauses.push("AND m.material_name LIKE ?");
    params.push(`%${prodName}%`);
  }

  const finalSql = baseSql.replace("/**조건절**/", whereClauses.join("\n"));
  console.log(finalSql);
  return await mariadb.directQuery(finalSql, params);
};



module.exports ={
  findLotListByConditions
};