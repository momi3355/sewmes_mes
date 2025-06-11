const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 

getMaterialList = async ({material_code, material_name, material_type, use_yn}) => {
  let baseSql = sqlList.selectBaseMaterialList;
  const whereClauses = [];
  const params = [];

  if (material_code) {
    whereClauses.push("AND material_code LIKE ?");
    params.push(`%${material_code}%`);
  }

  if (material_name) {
    whereClauses.push("AND material_name LIKE ?");
    params.push(`%${material_name}%`);
  }

  if (material_type) {
    whereClauses.push("AND material_type = ?");
    params.push(`${material_type}`);
  }

  if (use_yn) {
    whereClauses.push("AND use_yn = ?");
    params.push(`${use_yn}`);
  }

  const finalSql = baseSql.concat(whereClauses.join("\n"));
  return mariadb.directQuery(finalSql, params);
};

addMaterial = async (params) => {
  return mariadb.query("insertBaseMaterial", params);
};

setMaterial = async (code, params) => {
  // console.log(attr);
  return mariadb.query("updateBaseMaterial", [params, code]);
};

module.exports = {
  getMaterialList,
  setMaterial,
  addMaterial
};