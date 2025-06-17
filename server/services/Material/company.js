// ✨ 1. DB 연결 모듈과, 쿼리 키를 매핑하는 sql 맵퍼를 불러옵니다.
const db = require('../../database/mapper.js');
// ✨ 2. sqls 폴더에 있는 쿼리 파일은 여기서는 직접 require하지 않습니다.
// (mapper.js가 내부적으로 처리할 것이기 때문)

const getCompanyList = async () => {
  try {
    // ✨ 3. db.query에 SQL 구문 대신, 쿼리의 '키 이름'을 문자열로 전달합니다.
    const result = await db.query("getCompanyList");
    // db.query의 반환값이 바로 데이터 배열이라고 가정
    return result;
  } catch (err) { 
    console.error('공급처 목록 조회 서비스 오류:', err);
    throw err; 
  }
};

module.exports = { getCompanyList };