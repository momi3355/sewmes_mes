const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 

const addBomDataWithDetails = async (params) => {
  if (!params.prod_code && !params.user_code && !params.bom_info) return;

  try {
    const bomInfo = JSON.stringify(params.bom_info);
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
  addBomDataWithDetails,
}