// services/Material/matCheck.js

const db = require('../../database/mapper.js');
const sql = require('../../database/sqls/matCheck.js');

const getMaterialCheckList = async () => {
  return db.query('selectMatinboundList');
};

const getMaterialQualityTest = async () => {
  return db.query("selectMaterialQualityTest");
}

const getMaterialCheckListView = async () => {
  let connection;
  try {
    connection = await db.getConnection();
    
    // ✨ 배열 비구조화 할당(`[ ]`)을 제거하고, 쿼리 결과를 그대로 받습니다.
    // connection.query의 결과가 이미 순수한 데이터 배열이므로, 그대로 사용합니다.
    const rows = await connection.query(sql.materialCheckListView);
    
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

//const startMaterialCheck = async (material_order_code) => {
//  const connection = await db.getConnection();
//  try {
//    const inbound_check_code = `CHK-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
//    const params = [inbound_check_code, material_order_code];
//    await connection.query(sql.createInboundCheckShell, params);
//    // 생성된 코드를 반환
//    return { success: true, inbound_check_code: inbound_check_code };
//  } catch (err) {
//    throw err;
//  } finally {
//    if (connection) connection.release();
//  }
//};

const completeMaterialCheck = async (checkData) => {
  if (!checkData.inboundCheckCode && !checkData.userCode && !checkData.materialCode && !checkData.qualityData && !checkData.passQty) return;
  console.log(checkData);
  try {
    const qualityInfo = JSON.stringify(checkData.qualityData);

    //console.log([
    //  checkData.inboundCheckCode,
    //  qualityInfo,
    //  checkData.userCode,
    //  checkData.materialCode,
    //  checkData.passQty,
    //  0
    //]);
    return db.query("insertInboundDataWithDetails", [
      checkData.inboundCheckCode,
      qualityInfo,
      checkData.userCode,
      checkData.materialCode,
      checkData.passQty,
      0
    ]);
  } catch(error) {
    console.log(error);
  }
};

module.exports = {
  getMaterialCheckList,
  getMaterialQualityTest,
  getMaterialCheckListView,
  completeMaterialCheck,
  //startMaterialCheck,
};