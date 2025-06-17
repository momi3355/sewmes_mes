// services/Material/matCheck.js

const db = require('../../database/mapper.js');
const sql = require('../../database/sqls/matCheck.js');

const getMaterialCheckList = async () => {
  let connection;
  try {
    connection = await db.getConnection();
    
    // ✨ 배열 비구조화 할당(`[ ]`)을 제거하고, 쿼리 결과를 그대로 받습니다.
    // connection.query의 결과가 이미 순수한 데이터 배열이므로, 그대로 사용합니다.
    const rows = await connection.query(sql.materialCheckList);
    
    // 이제 'rows'는 전체 데이터가 담긴 배열입니다.
    return rows;

  } catch (err) {
    console.error('수입검사 대기 목록 조회 서비스 오류:', err);
    throw err;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const startMaterialCheck = async (material_order_code) => {
  const connection = await db.getConnection();
  try {
    const inbound_check_code = `CHK-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const params = [inbound_check_code, material_order_code];
    await connection.query(sql.createInboundCheckShell, params);
    // 생성된 코드를 반환
    return { success: true, inbound_check_code: inbound_check_code };
  } catch (err) {
    throw err;
  } finally {
    if (connection) connection.release();
  }
};

const completeMaterialCheck = async (checkData) => {
  const connection = await db.getConnection();
  try{
    await connection.beginTransaction();
    console.log(checkData);
    const updateParams = [checkData.qualified_qty, checkData.inbound_check_code];
    await connection.query(sql.updateInboundCheck, updateParams);

    if(!checkData.inbound_check_code){
      throw new Error("inbound_check_code가 전달되지 않았습니다.");
    }
    

     const detailDataToInsert = Object.entries(checkData.details)
      .filter(([key, value]) => value > 0) // 불합격 수량이 0보다 큰 항목만
      .map(([key, value]) => [
        `DET-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // 고유 상세 코드
        key, // 품질 코드 (예: 'width')
        value, // 불합격 수량
        checkData.inbound_check_code, // 검사 코드
      ]);

    // 3. INSERT할 데이터가 있을 경우에만 쿼리 실행
    if (detailDataToInsert.length > 0) {
      console.log("--- DETAIL INSERT 실행 직전 ---");
      console.log("SQL: ", sql.insertCheckDetail);
      console.log("PARAMS: ", JSON.stringify([detailDataToInsert], null, 2));
      
      await connection.query(sql.insertCheckDetail, [detailDataToInsert]);
    }
    
    await connection.commit();
    return { success: true, message: '검사 결과가 저장되었습니다.' };
  } catch (error) {
    await connection.rollback();
    console.error('검사 완료 처리 서비스 오류:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getMaterialCheckList,
  completeMaterialCheck,
  startMaterialCheck,
};