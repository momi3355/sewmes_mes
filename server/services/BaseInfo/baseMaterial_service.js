const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 

const getMaterialList = async ({material_code, material_name, material_type, use_yn}) => {
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

const getMaterialListByCode = async (code) => {
  return mariadb.query("selectBaseMaterialListByCode", code);
};

const addMaterial = async (params) => {
  let newCode = undefined;
  const matPrefix = [
    {
      type: "0l1l",
      prefix: "FAB",
    },
    {
      type: "0l2l",
      prefix: "SUB",
    },
    {
      type: "0l3l",
      prefix: "CON",
    },
  ];

  for (const code of matPrefix) {
    if (code.type == params.material_type) {
      let matCode = await mariadb.query("createCodeProc", [ 't_material', 'material_code', code.prefix ]);
      newCode = matCode[1][0].newCode;
      break;
    }
  }

  if (newCode) {
    params.material_code = newCode;
    return mariadb.query("insertBaseMaterial", params);
  } else {
    throw Error("존재하지 않는 자재유형");
  }
};

const setMaterial = async (code, params) => {
  // console.log(attr);
  return mariadb.query("updateBaseMaterial", [params, code]);
};

module.exports = {
  getMaterialList,
  getMaterialListByCode,
  setMaterial,
  addMaterial
};