const mariadb = require("../../database/mapper.js"); // 경로 확인!
const sql = require('../../database/sqls/login');

// 외주 가능제품 등록하기
const outProdCompanyinsert = async() =>{
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list =await mariadb.query("outProdCompany")
                           .catch(err =>console.log(err));
  return list;
 };

 // 외주업체만 조회
  const findAll3 = async() =>{
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list = await mariadb.query("outCompany")
  .catch(err => console.log(err));
console.log("쿼리 결과:", list);
return list;
};

const yesOutProdList = async() =>{
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list = await mariadb.query("yesOutProdList")
  .catch(err => console.log(err));
console.log("쿼리 결과:", list);
return list;
};
module.exports = { 
  outProdCompanyinsert,
  findAll3,
  yesOutProdList
};