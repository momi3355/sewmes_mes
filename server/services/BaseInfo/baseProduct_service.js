const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 

const getProductList = async ({prod_code, prod_name, prod_type, category, size, use_yn}) => {
  let baseSql = sqlList.selectBaseProductList;
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

  if (prod_type) {
    whereClauses.push("AND prod_type = ?");
    params.push(`${prod_type}`);
  }

  if (category) {
    whereClauses.push("AND category = ?");
    params.push(`${category}`);
  }

  if (size) {
    whereClauses.push("AND size = ?");
    params.push(`${size}`);
  }

  if (use_yn) {
    whereClauses.push("AND use_yn = ?");
    params.push(`${use_yn}`);
  }

  const finalSql = baseSql.concat(whereClauses.join("\n"));
  return mariadb.directQuery(finalSql, params);
};

const getProductListByCode = async (code) => {
  return mariadb.query("selectBaseProductListByCode", code);
};

const addProduct = async (params) => {
let newCode = undefined;
  const matPrefix = [
    {
      type: "0k1k",
      prefix: "H",
    },
    {
      type: "0k2k",
      prefix: "F",
    },
  ];

  for (const code of matPrefix) {
    if (code.type == params.prod_type) {
      let matCode = await mariadb.query("createCodeProc", [ 't_product', 'prod_code', code.prefix ]);
      newCode = matCode[1][0].newCode;
      break;
    }
  }

  if (newCode) {
    params.prod_code = newCode;
    return mariadb.query("insertBaseProduct", params);
  } else {
    throw Error("존재하지 않는 자재유형");
  }
};

const setProduct = async (code, params) => {
  // console.log(attr);
  return mariadb.query("updateBaseProduct", [params, code]);
};

module.exports = {
  getProductList,
  getProductListByCode,
  setProduct,
  addProduct
};