const mariadb = require("../../database/mapper.js"); // 경로 확인!
const { orderListCheck2 } = require('../../database/sqls/orderList');

// 주문 목록 출력 서비스
const findAll = async() =>{
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list =await mariadb.query("orderListCheck2")
                           .catch(err =>console.log(err));
  return list;
 };

 // 주문서 등록 서비스
 const orderAdd = async() =>{
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list =await mariadb.query("orderDetailadd")
                           .catch(err =>console.log(err));
  return list;
 };

 // 제품 목록 출력
 const prodAll = async() =>{
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list =await mariadb.query("productList")
                           .catch(err =>console.log(err));
  return list;
 };

  // modeule.exports에 추가
module.exports ={
  findAll,
  orderAdd,
  prodAll,
 };