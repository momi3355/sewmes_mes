const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 

getMaterialList = async (search = null) => {
  mariadb.query("selectMaterialList", search);
};

addMaterial = async (code, attr) => {
  mariadb.query("insertMaterial", [code, attr]);
};

setMaterial = async (code, attr) => {
  mariadb.query("UpdateMaterial", [code, attr]);
};

module.exports = {
  getMaterialList,
  setMaterial,
  addMaterial
};