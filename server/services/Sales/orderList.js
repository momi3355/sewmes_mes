const mariadb = require("../../database/mapper.js"); // 경로 확인!
const { orderListCheck2 } = require('../../database/sqls/orderList');
const sqlList = require("../../database/sqlList.js");

// 주문 목록 출력 서비스
const findAll = async() =>{
  // 변수 mariadb에 등록된 query 함수를 통해 서비스에서 필요한 SQL문을 실행하도록 요청
  // -> 비동기작업이므로 await/async를 활용해서 동기식으로 동작하도록 진행
  let list =await mariadb.query("orderListCheck2")
                           .catch(err =>console.log(err));
  return list;
 };

// 주문상세코드 생성기
const getNextOrderCode = async () => {
  const rows = await mariadb.query("getNextOrderDetailCode");
  let nextNumber = 1;
  if (rows.length > 0) {
    const lastCode = rows[0].order_detail_code;
    const numPart = parseInt(lastCode.replace('od', ''));
    nextNumber = numPart + 1;
  }
  return 'od' + nextNumber.toString().padStart(3, '0');
};
// 주문코드 생성기
const getNextOrderCode2 = async () => {
  const rows = await mariadb.query("getNextOrderCode");
  let nextNumber = 1;
  if (rows.length > 0) {
    const lastCode = rows[0].order_code;
    const numPart = parseInt(lastCode.replace('o', ''));
    nextNumber = numPart + 1;
  }
  return 'o' + nextNumber.toString().padStart(3, '0');
};

//등록
const orderAdd = async (orderData) => {
  const conn = await mariadb.getConnection();
  console.log('orderAdd: ', orderData);
  orderData = JSON.parse(JSON.stringify(orderData));
  try {
    await conn.beginTransaction();

    let orderdetailCode = null;
    const orderCode = await getNextOrderCode2();
console.log(orderCode);
    // 총수량과 총금액 계산 (헤더 insert 준비)
    let totalQty = 0;

    for (let detail of orderData.orderDetails) {
  totalQty += parseInt(detail.qty || 0);
}

    // 헤더 insert (for문 밖에서 딱 한번만)
    await conn.query(sqlList['orderAdd'], [  // 헤더코드 (ex: oord001)
      orderCode,        // 주문코드 (ord001)
      orderData.totalprice,       // 총금액
      '0n1n',              // 상태값
      totalQty          // 총수량
    ]).catch(err => console.log(err));

    // 상세 insert 반복
    for (let i = 0; i < orderData.orderDetails.length; i++) {
      const detail = orderData.orderDetails[i];
      orderdetailCode = await getNextOrderCode();
      await conn.query(sqlList["orderDetailAdd"], [
                                      orderdetailCode,
                                      orderCode,
                                      detail.prodcode,
                                      detail.standard,
                                      parseInt(detail.qty || 0),
                                      parseInt(detail.unitprice || 0),
                                      parseInt(detail.totalprice || 0),  // 상세별 totalprice를 넣어야 함!
                                      orderData.emp_num,
                                      orderData.note,
                                      orderData.orderDate,
                                      orderData.deadDate,
                                      orderData.cp_code,
                                      parseInt(detail.selprice || 0)
                                    ]); 
    }

    await conn.commit();
    return { success: true };

  } catch (err) {
    console.log(err);
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
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