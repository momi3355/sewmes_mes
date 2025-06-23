const db = require('../../database/mapper.js');
// mapper.js가 sqlList.js를 참조하므로, 서비스 파일에서는 sql 파일을 직접 require할 필요가 없습니다.

const getInOutList = async (searchConditions = {}) => {
  // 나중에 검색 기능을 추가할 것을 대비하여 searchConditions 파라미터
  try {
    // mapper.js의 query 함수에 '쿼리 키'("getInOutList")를 전달하여 실행
    const rows = await db.query("getInOutList");
    return rows;
  } catch (err) {
    console.error("자재 입출고 내역 조회 오류:", err);
    throw err; // 에러를 상위(라우터)로 전달
  }
};

module.exports = {
  getInOutList,
};