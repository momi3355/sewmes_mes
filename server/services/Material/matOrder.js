const mariadb = require("../../database/mapper.js");
// const sqlList = require("../../database/sqlList.js"); 


// 발주 필요자재 조회
const getMaterialList = async () => {
    
    let list = await mariadb.query("matorderList")
    .catch(err => console.log(err));
    return list;
};



module.exports = {
  getMaterialList,
};