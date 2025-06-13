const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 

const getProductReceiveList = () => {
  return mariadb.query("selectPrdReceive");
}

module.exports = {
  getProductReceiveList
}