// sqls/company.js
const getCompanyList = `
  SELECT cp_code, 
         cp_name 
  FROM t_company 
  WHERE cls = '0g2g'`;

module.exports = {
  getCompanyList,
};