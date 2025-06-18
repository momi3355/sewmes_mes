const db = require("../../database/mapper.js");
// const sqlList = require("../../database/sqlList.js"); 
const sql = require("../../database/sqls/matCheckView.js");


// 수입검사 완료 자재 조회
const checkedMaterialList = async () => {
  try{
    const rows = await db.query("getCompletedCheckList");
    return rows;
  } catch (err) {
    console.error("검사 완료 자재 조회 오류", err);
    throw err;
  }
};

// 수입검사 완료 자재 상세정보
const getCheckDetailInfo = async (inbound_check_code) => {
  try{
    const [rows] = await db.query("getCheckMaster", [inbound_check_code]);
    return rows[0] || null;
  } catch(err) {
    console.error("상세 정보 조회 오류", err);
    throw err;
  }
};
// const checkedMaterialDetail = async (inbound_check_code) => {
//   if (!inbound_check_code){
//     return [];
//   }
//   try {
//   let details = await mariadb.query("checkedMaterialDetail", [inbound_check_code])
//   return details;
//       } catch (err) {
//         console.error('검사 오류');
//         return[];
//         }
// };

module.exports = {
  checkedMaterialList,
  getCheckDetailInfo,
  // checkedMaterialDetail,
};