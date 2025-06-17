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
  try {
    await connection.beginTransaction();

    // 1. 메인 검수 테이블 업데이트
    const updateParams = [checkData.qualified_qty, checkData.inbound_check_code];
    await connection.query(sql.updateInboundCheck, updateParams);

    // 2. 상세 내역 저장
    const details = checkData.details;
    const inbound_check_code = checkData.inbound_check_code;

    // ✨ for...in 루프를 사용하여 객체를 순회
    for (const qualityKey in details) {
      const defectQty = details[qualityKey];

      // 불합격 수량이 0보다 큰 경우에만 INSERT
      if (defectQty > 0) {
        
        // ✨ INSERT 쿼리를 여기서 직접 만듭니다. (가장 확실한 방법)
        const insertSql = `INSERT INTO t_matcheck_detail 
                             (mat_check_detail, quality_code, defect_qty, inbound_check_code) 
                           VALUES (?, ?, ?, ?)`;

        const now = new Date();
        // 'YYMMDDHHMMSS' (12자)
        const dateTimeString = now.toISOString().slice(2, 19).replace(/[-T:]/g, '');
        // 최종 코드 (예: "DET240524153045")
        const mat_check_detail_code = `DET${dateTimeString}`; // DET(3) + 12 = 15자
        
        const detailParams = [
          mat_check_detail_code, // ✨ 새로 만든 코드로 교체
          qualityKey,
          defectQty,
          inbound_check_code
        ];

        console.log(detailParams);
        
        // 디버깅 로그
        console.log(`Executing INSERT for ${qualityKey}:`, detailParams);
        
        // ✨ sql 객체를 참조하지 않고, 직접 만든 SQL과 파라미터로 실행
        await connection.query(insertSql, detailParams);
      }
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