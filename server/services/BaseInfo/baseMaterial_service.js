const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 

getMaterialList = async (search) => {
  // searchCodeParamForLike = null;
  // if (search && search.material_code) {
  //   searchCodeParamForLike = `%${search.material_code}%`;
  // }

  // searchNameParamForLike = null;
  // if (search && search.material_name) {
  //   searchNameParamForLike = `%${search.material_name}%`;
  // }
  // const params = [
  //   searchCodeParamForLike,
  //   search.material_code,
  //   search.material_type,
  //   search.material_type,
  //   searchNameParamForLike,
  //   search.material_name,
  //   search.use_yn,
  //   search.use_yn,
  // ];
  // console.log(params);
  // { material_code, material_type, material_name, use_yn };

  return mariadb.query("selectBaseMaterialList", params);
};

addMaterial = async (attr) => {
  return mariadb.query("insertBaseMaterial", attr);
};

setMaterial = async (code, attr) => {
  // console.log(attr);
  return mariadb.query("updateBaseMaterial", [attr, code]);
};

module.exports = {
  getMaterialList,
  setMaterial,
  addMaterial
};