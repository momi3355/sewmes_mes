const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 


// 수입검사 완료 자재 조회
const checkedMaterialList = async () => {
    let list = await mariadb.query("checkedMaterialList")
    .catch(err => console.log(err));
    return list;
};

// 수입검사 완료 자재 상세정보
const checkedMaterialDetail = async (inbound_check_code) => {
  if (!inbound_check_code){
    return [];
  }
  try {
  let details = await mariadb.query("checkedMaterialDetail", [inbound_check_code])
  return details;
      } catch (err) {
        console.error('ㅇㅅㅇ');
        return[];
        }
};

module.exports = {
  checkedMaterialList,
  checkedMaterialDetail,
};