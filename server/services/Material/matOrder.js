const mariadb = require("../../database/mapper.js");
// const sqlList = require("../../database/sqlList.js"); 


// 발주 필요자재 조회
const getMaterialList = async ({material_name, material_code}) => {
    const params = [
        material_name, 
        material_code
    ];
    let list = await mariadb.query("matorderlist", params)
    .catch(err => console.log(err));
    return list;
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