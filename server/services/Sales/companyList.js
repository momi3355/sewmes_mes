const mariadb = require("../../database/mapper.js"); // 경로 확인!
const { companyListCheck } = require('../../database/sqls/companyList');

// 조건 없이 전체조회
const findAll = async() =>{
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list =await mariadb.query("companyListCheck")
                           .catch(err =>console.log(err));
  return list;
 };
 // modeule.exports에 추가
module.exports ={
  findAll,
 };