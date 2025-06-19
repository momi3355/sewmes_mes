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

const getReleaseList = ({prod_name, cp_name, category, release_date}) => {
  let baseSql = sqlList.selectReleaseList;
  const whereClauses = [];
  const params = [];

  if (prod_name) {
    whereClauses.push("AND prod_name LIKE ?");
    params.push(`%${prod_name}%`);
  }

  if (cp_name) {
    whereClauses.push("AND cp_name LIKE ?");
    params.push(`%${cp_name}%`);
  }

  if (category) {
    whereClauses.push("AND category = ?");
    params.push(`${category}`);
  }

  if (release_date) {
    whereClauses.push("AND release_date <= ?");
    params.push(`${release_date}`);
  }

  const finalSql = baseSql.concat(whereClauses.join("\n"));
  return mariadb.directQuery(finalSql, params);
}

const addReleaseDataWithDetails = async (params) => {
  if (!params.order_detail_code && !params.user_code && !params.lot_info) return;

  try {
    const lotInfo = JSON.stringify(params.lot_info);
    // console.log([
    //   params.order_detail_code,
    //   params.user_code,
    //   lotInfo
    // ]);
    return mariadb.query("insertReleaseDataWithDetails", [
      params.order_detail_code,
      params.user_code,
      lotInfo
    ]);
  } catch(error) {
    console.log(error);
  }
};

module.exports = {
  getProductReceiveList,
  getReleaseLotList,
  getReleaseList,
  addReleaseDataWithDetails
}