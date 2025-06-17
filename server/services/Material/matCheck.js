// services/Material/matCheck.js

const db = require('../../database/mapper.js');
const sql = require('../../database/sqls/matCheck.js');

const getMaterialCheckList = async () => {
  let connection;
  try {
    connection = await db.getConnection();
    
    // ✨ 배열 비구조화 할당(`[ ]`)을 제거하고, 쿼리 결과를 그대로 받습니다.
    // connection.query의 결과가 이미 순수한 데이터 배열이므로, 그대로 사용합니다.
    const rows = await connection.query(sql.materialCheckList);
    
    // 이제 'rows'는 전체 데이터가 담긴 배열입니다.
    return rows;

  } catch (err) {
    console.error('수입검사 대기 목록 조회 서비스 오류:', err);
    throw err;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  getMaterialCheckList,
};