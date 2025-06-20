const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 

const getBomItemList = async ({item_code, item_name, item_type, use_yn}) => {
  let baseSql = sqlList.selectBomItemList;
  const whereClauses = [];
  const params = [];

  if (item_code) {
    whereClauses.push("AND item_code LIKE ?");
    params.push(`%${item_code}%`);
  }

  if (item_name) {
    whereClauses.push("AND item_name LIKE ?");
    params.push(`%${item_name}%`);
  }

  if (item_type) {
    item_type = item_type === "0w1w" ? "0l" : "0k";
    whereClauses.push("AND item_type LIKE ?");
    params.push(`${item_type}%`);
  }

  if (use_yn) {
    whereClauses.push("AND use_yn = ?");
    params.push(`${use_yn}`);
  }

  const finalSql = baseSql.concat(whereClauses.join("\n"));
  return mariadb.directQuery(finalSql, params);
};

const getBomDetailList = async ({item_code}) => {
  return mariadb.query("selectBomDetailList", [
    item_code,
    item_code
  ]);
};

const upsertBomDetail = async (params) => {
  if (!params.bomCode && !params.bomInfo) return;

  try {
    const bomInfo = JSON.stringify(params.bomInfo);
    // console.log([
    //   params.bomCode,
    //   bomInfo
    // ]);
    return mariadb.query("upsertBomDetails", [
      params.bomCode,
      bomInfo
    ]);
  } catch(error) {
    console.log(error);
  }
};

const addBomDataWithDetails = async (params) => {
  if (!params.prod_code && !params.user_code && !params.bom_info) return;

  try {
    const bomInfo = JSON.stringify(params.bom_info);
    // console.log([
    //   params.prod_code,
    //   params.user_code,
    //   bomInfo
    // ]);
    return mariadb.query("insertBomDataWithDetails", [
      params.prod_code,
      params.user_code,
      bomInfo
    ]);
  } catch(error) {
    console.log(error);
  }
};

module.exports = {
  getBomItemList,
  getBomDetailList,
  upsertBomDetail,
  addBomDataWithDetails,
}