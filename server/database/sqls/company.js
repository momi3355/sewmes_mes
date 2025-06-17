// sqls/company.js
const getCompanyList = `SELECT cp_code, cp_name FROM t_company WHERE use_yn = '0b1b'`;

module.exports = {
  getCompanyList,
};