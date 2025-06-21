const db = require('../../database/mapper.js');
const sql = require('../../database/sqls/matHold.js');

const getHoldList = async () => {
  try {
    const rows = await db.query("getHoldList");
    return rows;
  } catch (err) {
    console.error("예약 자재 목록 조회 오류:", err);
    throw err;
  }
};

const deleteHoldMat = async () => {
  // holdIds는 ['H001', 'H002', ...] 형태의 배열
  try {
    // [holdIds] 와 같이 배열로 한번 더 감싸서 전달해야 IN (?) 구문이 올바르게 작동함
    const result = await db.query("deleteHoldData", []);
    return result;
  } catch (err) {
    console.error("예약 자재 삭제 오류:", err);
    throw err;
  }
};

module.exports = {
  getHoldList,
  deleteHoldMat,
};