const mariadb = require("../../database/mapper.js");
const sql = require("../../database/sqls/matOrder.js");

// 발주 필요자재 조회
const getMaterialList = async () => {
  let connection;
  try {
    connection = await mariadb.getConnection();

    // ✨ 배열 비구조화 할당(`[ ]`)을 제거하고, 쿼리 결과를 그대로 받습니다.
    const rows = await connection.query(sql.materialList);
    
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

const getMaterialOrderList = async () => {
  return mariadb.query("orderList");
}

const getNextOrderCode = async (queryName) => {
  const rows = await mariadb.query(queryName);
  let nextNumber = 1;
  if (rows.length > 0) {
    const lastRows = rows.pop(); //마지막 요소
    if (lastRows.material_order_code) {
      const lastCode = lastRows.material_order_code;
      const numPart = parseInt(lastCode.replace('MO', ''));
      console.log("lastCode:", lastCode, "numPart:", numPart);
      if (!isNaN(numPart)) {
        nextNumber = numPart + 1;
      }
    }
  }

  return nextNumber;
};

// '발주 요청서' 저장을 위한 서비스 함수 (기존의 좋은 방식 그대로 유지)
// services/Material/matOrder.js

// '발주 요청서' 저장을 위한 최종 버전
const saveMaterialOrder = async (orderList) => {
  //console.log(orderList);
  let orderNext = await getNextOrderCode("materialOrderList");
  let checkNext = await getNextOrderCode("selectMatinboundList");
  con = await mariadb.getConnection();
  try {
    await con.beginTransaction();

    for (const order of orderList) {
      const mo_code = `MO${orderNext.toString().padStart(3, '0')}`;
      const mc_code = `MC${checkNext.toString().padStart(3, '0')}`;

      const orderParams = [
        mo_code,
        order.material_code,
        order.deadline,
        order.cp_code,
        order.unit_price,
        order.total_price,
        order.order_qty,
      ];

      const checkParams = [
        mc_code,
        mo_code,
        order.order_qty, //check_qty
      ];

      await Promise.all([
        con.query(sql.createMatOrder, orderParams),
        con.query(sql.createInboundCheckShell, checkParams)
      ]).catch(err => {
        throw err;
      });
      orderNext++;
      checkNext++;
    }
    await con.commit();
    return { success: true };
  } catch(error) {
    await con.rollback();
    console.error('발주 저장 서비스에서 오류 발생:', error);
    throw error;
  } finally {
    if (con) con.release();
  }
};

module.exports = {
  getMaterialList,
  getMaterialOrderList,
  saveMaterialOrder,
};