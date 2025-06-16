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
const saveMaterialOrder = async (orderList) => {
  const connection = await db.getConnection(); 
  try {
    await connection.beginTransaction();

    const insertPromises = orderList.map(order => {
      const material_order_code = `ORD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.random()).slice(2, 5)}`;
      
      const params = [
        material_order_code,
        order.material_code,
        order.deadline,
        order.company,
        order.unit_price,
        order.total_price,
        order.order_qty,
      ];
      
      return connection.query(sql.createMatOrder, params);
    });

    await Promise.all(insertPromises);
    await connection.commit();
    return { message: '발주 요청이 성공적으로 저장되었습니다.' };

  } catch (error) {
    await connection.rollback();
    console.error('발주 저장 서비스 오류:', error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getMaterialOrderList,
  saveMaterialOrder,
};