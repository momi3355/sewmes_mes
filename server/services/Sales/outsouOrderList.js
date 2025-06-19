const mariadb = require("../../database/mapper.js"); // 경로 확인!
const sql = require('../../database/sqls/login');

// 업체별 외주가능제품 등록
const outProdCompanyinsert = async(prod_code, cp_code) => {

  // 마지막 outsou_list_code 조회
  const result = await mariadb.query("getNextOrderCode").catch(err => console.log(err));
  
  let newCode = "";
  
  if (result.length === 0) {
    // 첫번째 등록일 경우
    newCode = "OUP001";
  } else {
    // 마지막 코드에서 숫자만 추출 후 +1
    const lastCode = result[0].outsou_list_code;  // 예: 'OUP015'
    const numPart = parseInt(lastCode.substring(3)) + 1;
    newCode = "OUP" + String(numPart).padStart(3, '0');
  }

  // insert 수행
  const insertResult = await mariadb.query("outProdCompany", [newCode, prod_code, cp_code])
                                     .catch(err => console.log(err));
  return insertResult;
};
// 업체별 외주가능업체 삭제
const yesOutProdListDelete = async(outsou_list_code) =>{
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list = await mariadb.query("getNextOrderCode", [outsou_list_code])
  .catch(err => console.log(err));
console.log("쿼리 결과:", list);
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

// 외주업체 외주가능제품
const yesOutProdList = async(cp_code) =>{
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list = await mariadb.query("yesOutProdList", [cp_code])
  .catch(err => console.log(err));
console.log("쿼리 결과:", list);
return list;
};

// 봉제제품 만 출력 (모달) bongJaeProd
const bongJaeProd = async() =>{
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list = await mariadb.query("bongJaeProd")
  .catch(err => console.log(err));
console.log("쿼리 결과:", list);
return list;
};

module.exports = { 
  outProdCompanyinsert,
  findAll3,
  yesOutProdList,
  bongJaeProd,
  yesOutProdListDelete
};