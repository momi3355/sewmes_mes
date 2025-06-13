// 각 테이블 별로 실행한 SQL문을 별도 파일로 작성
//각자의 객체에 담음
// const books = require('./sqls/books.js');
// module.exports = {
//   // 펼침연산자(spread operator, ...)을 활용해 객체의 필드를 다른 객체로 쉽게 복사
//   ...books, //enter로 구분
// }

const processFlow =require('./sqls/processFlow.js');
const processMaster = require('./sqls/processMaster.js');
const qualityMaster = require('./sqls/qualityMaster.js');
const equiMaster = require('./sqls/equiMaster.js');
const workInsstSqls=require('./sqls/workInst.js');
const baseMaterial = require('./sqls/baseMaterial.js');
const baseProduct = require('./sqls/baseProduct.js');
const bomMaster = require('./sqls/bomMaster.js');
const orderListSql=require('./sqls/orderList.js');
const companyListSql=require('./sqls/companyList.js');
const prdPlanMngment = require('./sqls/prdPlanMngment.js');
const outsouMngment = require('./sqls/outsouMngment.js');
const outsouRelease = require('./sqls/outsouRelease.js');
const outsouInbound = require('./sqls/outsouInbound.js');
const matorderList=require('./sqls/matOrder.js');
const matcheckList=require('./sqls/matCheck.js');
const loginSql=require('./sqls/login.js');

module.exports = {
  ...processMaster, // 공정관리
  ...qualityMaster,
  ...equiMaster,
  ...baseMaterial,
  ...baseProduct, //기준 제품
  ...bomMaster, //BOM 정보
  ...processFlow, // 공정흐름
  ...prdPlanMngment, // 생산계획
  ...outsouMngment, // 외주발주
  ...outsouRelease, // 외주자재출고
  ...outsouInbound, // 외주입고 및 검수
  ...workInsstSqls, //정민
  ...orderListSql, // 주문서 관리
  ...companyListSql, // 업체 정보
  ...matorderList, // 자재발주
  ...matcheckList, // 자재수입검사
  ...loginSql, // 로그인
}