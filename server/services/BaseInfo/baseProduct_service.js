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
  return mariadb.query("insertBaseProduct", params);
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