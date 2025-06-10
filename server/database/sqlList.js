// 각 테이블 별로 실행한 SQL문을 별도 파일로 작성
//각자의 객체에 담음
// const books = require('./sqls/books.js');
// module.exports = {
//   // 펼침연산자(spread operator, ...)을 활용해 객체의 필드를 다른 객체로 쉽게 복사
//   ...books, //enter로 구분
// }

const processFlow =require('./sqls/processFlow.js');
const processMaster =require('./sqls/processMaster.js');
const qualityMaster = require('./sqls/qualityMaster.js');
const equiMaster = require('./sqls/equiMaster.js');
const workInsstSqls=require('./sqls/workInst.js');
const material = require('./sqls/material.js');
const orderListSql=require('./sqls/orderList.js');
const companyListSql=require('./sqls/companyList.js');
const loginSql=require('./sqls/login.js');

module.exports = {
  ...processMaster,
  ...qualityMaster,
  ...equiMaster,
  ...processFlow,
  ...material,
  ...workInsstSqls, //정민
  ...orderListSql, // 주문서 관리
  ...companyListSql, // 업체 정보
  ...loginSql, // 로그인
}