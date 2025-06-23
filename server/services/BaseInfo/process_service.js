// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 
// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴

// 공정관리 페이지 서비스 =========================================
const findProcessByConditions = async (code, name, equi) => {
  let baseSql = sqlList.selectProcessByConditions;
  const whereClauses = [];
  const params = [];

  if (code) {
    whereClauses.push("AND process_code LIKE ?");
    params.push(`%${code}%`);
  }
  if (name) {
    whereClauses.push("AND process_name LIKE ?");
    params.push(`%${name}%`);
  }
  if (equi) {
    whereClauses.push("AND equi_type LIKE ?");
    params.push(`%${equi}%`);
  }

  // 조건절 치환
  const finalSql = baseSql.replace("/**조건절**/", whereClauses.join("\n"));

  return await mariadb.directQuery(finalSql, params);
};
const insertProcess = async (processData) => {
  // 프로시저 호출 → 코드 생성
  const result = await mariadb.query("getNextProcessCode");

  console.log(result); // [ [ OkPacket ], [ [ { processCode: 'PM000001' } ] ] ] 형태임
  const processCode = result?.[1]?.[0]?.processCode;

  if (!processCode) throw new Error("공정 코드 생성 실패");

  if (!processCode) throw new Error("공정 코드 생성 실패");
  // INSERT 실행 
  await mariadb.query("processInsert", [
    processCode,
    processData.processName,
    processData.detail,
    processData.equiType,
    processData.needTime,
    processData.processType,
    processData.useYn
  ]);
  return processCode; // 클라이언트에 새 코드 반환
};
const updateProcess = async (processData) => {
  // process_code 기준으로 수정
  await mariadb.query("processUpdate", [
    processData.processName,
    processData.detail,
    processData.equiType,
    processData.needTime,
    processData.processType,
    processData.useYn,
    processData.processCode
  ]);
};
const deleteProcess = async (processCode) => {
  await mariadb.query("processDelete", [processCode]);
}
// ==============================================================

// 공정흐름 페이지 서비스 =========================================
const findProdByConditions = async (cate, name) => {
  let baseSql = sqlList.selectProductByConditions;
  const whereClauses = [];
  const params = [];

  if (cate) {
    whereClauses.push("AND category LIKE ?");
    params.push(`%${cate}%`);
  }
  if (name) {
    whereClauses.push("AND prod_name LIKE ?");
    params.push(`%${name}%`);
  }
  const finalSql = baseSql.replace("/**조건절**/", whereClauses.join("\n"));

  return await mariadb.directQuery(finalSql, params);
}
// prod_code를 기준으로 공정 순서 데이터 가져오기
const getProcessFlowByProdCode = async (prodCode) => {
  const rows = await mariadb.directQuery(sqlList.getProcessFlow, [prodCode]);
return rows;
};
// prod_code 기준으로 공정 순서 저장 및 수정
const saveProcessFlows = async (prodCode, flows) => {
  const conn = await mariadb.getConnection();
  try {
    await conn.beginTransaction();

    // 1. 현재 존재하는 flow 목록 조회
    const existingRows = await conn.query(`
      SELECT flow_code
      FROM t_process_flow
      WHERE prod_code = ?
    `, [prodCode]);

    const existingCodes = new Set(existingRows.map(r => r.flow_code));

    for (const row of flows) {
      if (row.flowCode && existingCodes.has(row.flowCode)) {
        // 기존 flow_code → update
        await conn.query(sqlList.updateProcessFlow, [
          row.processCode,
          row.processSeq,
          row.flowCode
        ]);
      } else {
        // 신규 → insert
        const result = await conn.query(sqlList.getNextFlowCode);
        const code = result[1][0].code; // SELECT 결과는 2번째 배열에 있음
        await conn.query(sqlList.insertProcessFlow, [
          code,
          row.processCode,
          row.processSeq,
          prodCode
        ]);
      }
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
// 공정 순서 삭제하기
const deleteFlowWithAttach = async (flowCode) => {
  const conn = await mariadb.getConnection();
  try {
    await conn.beginTransaction();

    // 첨부 파일 먼저 삭제 (외래키 제약 때문에)
    await conn.query(`
      DELETE FROM t_process_flow_attach WHERE flow_code = ?
    `, [flowCode]);

    // 그 다음 공정 흐름 삭제
    await conn.query(`
      DELETE FROM t_process_flow WHERE flow_code = ?
    `, [flowCode]);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
// 이미지 저장
const saveAttachFile = async ({ flowCode, fileName, originFileName }) => {
  const result = await mariadb.query("getNextAttachCode");
  const attachCode = result[1]?.[0]?.attachCode;
  if (!attachCode) throw new Error("attach_code 생성 실패");
  await mariadb.query("insertAttachFile", [attachCode, flowCode, fileName, originFileName]);
  return attachCode;
};
// 공정 흐름에 저장된 이미지 가져오기
const getAttachFileByFlowCode = async (flowCode) => {
  const result = await mariadb.query("getAttachFile", [flowCode]);
  return result[0]; // 없으면 undefined
};

// 공정 정보 가져오기 모달
const searchProcessByKeyword = async (keyword) => {
  const result = await mariadb.query("selectProcessByKeyword", [keyword]);
  return result;
};


module.exports ={
  // 해당 객체에 등록해야지 외부로 노출
  // 공정관리
  findProcessByConditions,
  insertProcess,
  updateProcess,
  deleteProcess,
  // 공정흐름
  findProdByConditions,
  getProcessFlowByProdCode,
  saveProcessFlows,
  deleteFlowWithAttach,
  saveAttachFile,
  getAttachFileByFlowCode,
  searchProcessByKeyword
};