const mariadb = require("../../database/mapper.js");
const { orderListCheck2 } = require('../../database/sqls/orderList');
const sqlList = require("../../database/sqlList.js");

// 주문서 관리(조회) 목록 출력 서비스
const findAll = async () => {
  let list = await mariadb.query("orderListCheck2")
    .catch(err => console.log(err));
  return list;
};
// 주문서 관리(조회)상세 조회 서비스
const findOrderInfo = async (order_code) => {
  let list = await mariadb.query("orderListCheck3", order_code)
    .catch(err => console.log(err));
    console.log("서비스리스트",list)
  return list;
};

// order_detail_code 주문상세코드 자동으로 + 1생성
const getNextOrderDetailCode = async () => {
  const rows = await mariadb.query("getNextOrderDetailCode");
  let nextNumber = 1;

  if (rows.length > 0 && rows[0].order_detail_code) {
    const lastCode = rows[0].order_detail_code;
    const numPart = parseInt(lastCode.replace('OD', ''));
    if (!isNaN(numPart)) {
      nextNumber = numPart + 1;
    }
  }

  return nextNumber; // 여기서는 숫자만 리턴 (나중에 반복문에서 가공)
};

// order_code 주문코드 자동으로 + 1생성
const getNextOrderCode = async () => {
  const rows = await mariadb.query("getNextOrderCode");
  let nextNumber = 1;

  if (rows.length > 0 && rows[0].order_code) {
    const lastCode = rows[0].order_code;
    const numPart = parseInt(lastCode.replace('O', ''));
    console.log("lastCode:", lastCode);
    if (!isNaN(numPart)) {
      nextNumber = numPart + 1;
    }
  }
  return 'O' + nextNumber.toString().padStart(3, '0');
};

// 주문 등록 서비스
const orderAdd = async (orderData) => {
  const conn = await mariadb.getConnection();
  console.log('orderAdd: ', orderData);
  orderData = JSON.parse(JSON.stringify(orderData));

  try {
    await conn.beginTransaction();

    // 주문코드 생성
    let creCode = await mariadb.query("createCodeProc", [ 't_order', 'order_code', 'O' ]);
    const orderCode = creCode[1][0].newCode;
    console.log("생성된 orderCode:", orderCode);

    // 총수량 계산
    let totalQty = 0;
    for (let detail of orderData.orderDetails) {
      totalQty += parseInt(detail.totalqty || 0);
    }

    // 헤더 insert
    await conn.query(sqlList['orderAdd'], [
      orderCode,
      orderData.totalprice,
      '0n1n',
      totalQty
    ]);

    // 상세코드 생성 준비 (반복문 밖에서 1번만 조회)
    let lastDetailNumber = await getNextOrderDetailCode();

    // 상세 insert 반복
    for (let detail of orderData.orderDetails) {
      const orderDetailCode = 'OD' + lastDetailNumber.toString().padStart(6, '0');
      lastDetailNumber += 1;

      await conn.query(sqlList["orderDetailAdd"], [
        orderDetailCode,
        orderCode,
        detail.prodcode,
        detail.standard,
        parseInt(detail.totalqty || 0),
        parseInt(detail.unitprice || 0),
        parseInt(detail.totalprice || 0),
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
const prodAll = async () => {
  let list = await mariadb.query("productList")
    .catch(err => console.log(err));
  return list;
};

// // 주문서 제품 검색 필터
// const filterSearch ={
//     let list = await mariadb.query("productList")
//     .catch(err => console.log(err));
//   return list;
// };
module.exports = {
  findAll,
  orderAdd,
  prodAll,
  findOrderInfo,
};
