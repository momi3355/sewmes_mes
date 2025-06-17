const db = require("../../database/mapper.js");
const sql = require("../../database/sqls/matOrder.js");

// 발주 필요자재 조회
const getMaterialOrderList = async () => {
  let connection;
  try {
    connection = await db.getConnection();

    // ✨ 배열 비구조화 할당(`[ ]`)을 제거하고, 쿼리 결과를 그대로 받습니다.
    const rows = await connection.query(sql.matorderList);
    
    // 이제 'rows'는 전체 데이터가 담긴 배열입니다.
    return rows;

  } catch (err) {
    console.error('발주 목록 조회 서비스 오류:', err);
    throw err;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// '발주 요청서' 저장을 위한 서비스 함수 (기존의 좋은 방식 그대로 유지)
// services/Material/matOrder.js

// '발주 요청서' 저장을 위한 최종 버전
const saveMaterialOrder = async (orderList) => {
  const connection = await db.getConnection(); 
  try {
    await connection.beginTransaction();

    // for...of 루프를 사용하여 각 주문을 순차적으로 처리
    for (const order of orderList) {
      
      // --- 코드 생성을 위한 현재 시간 객체 ---
      const now = new Date();
      const dateString = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
      const timeString = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS

      // --- 1. 발주서 코드 생성 (14자) ---
      const randomSuffix = String(Math.random()).slice(2, 7); // 5자리 난수
      const material_order_code = `ORD${dateString}${randomSuffix}`;

      // --- 2. 입고검수 코드 생성 (15자) ---
      // ✨ 루프 안에서만 사용되므로, 여기서 const로 선언합니다.
      const inbound_check_code = `CHK${dateString}${timeString}`;

      // --- 3. 쿼리 실행 ---
      const orderParams = [
        material_order_code,
        order.material_code,
        order.deadline,
        order.cp_code,
        order.unit_price,
        order.total_price,
        order.order_qty,
      ];
      await connection.query(sql.createMatOrder, orderParams);

      const checkParams = [inbound_check_code, material_order_code];
      await connection.query(sql.createInboundCheckShell, checkParams);
    }

    await connection.commit();
    return { message: '발주 및 검수 대기 생성이 정상적으로 완료되었습니다.' };

  } catch(error) {
    await connection.rollback();
    console.error('발주 저장 서비스에서 오류 발생:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getMaterialOrderList,
  saveMaterialOrder,
};