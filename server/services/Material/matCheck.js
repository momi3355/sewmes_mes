const mariadb = require("../../database/mapper.js");
// const sqlList = require("../../database/sqlList.js"); 


// 발주 필요자재 조회
const getMaterialCheckList = async () => {
    
    let list = await mariadb.query("matcheckList")
    .catch(err => console.log(err));
    return list;
};



module.exports = {
  getMaterialCheckList,
};