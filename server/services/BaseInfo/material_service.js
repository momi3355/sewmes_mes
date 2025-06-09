const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 

getMaterialList = async () => {
  mariadb.query("selectMaterialList", null);
};

module.exports = {
  getMaterialList
};