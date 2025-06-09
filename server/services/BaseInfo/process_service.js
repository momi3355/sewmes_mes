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
  // 1. 현재 최대 코드 조회
  const result = await mariadb.query("selectMaxCode").catch(err => console.log(err));
  const maxCode = result[0]?.maxCode || 0;
  const nextCode = `PM${maxCode + 1}`;
  // 2. INSERT 실행 
  await mariadb.query("processInsert", [
    nextCode,
    processData.processName,
    processData.detail,
    processData.equiType,
    processData.needTime,
    processData.processType,
    processData.useYn
  ]);
  return nextCode; // 클라이언트에 새 코드 반환
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

// 공정흐름름 페이지 서비스 =========================================
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

    // 1. 기존 공정 흐름 삭제
    await conn.query(sqlList.deleteProcessFlowsByProdCode, [prodCode]);

    // 2. flow_code 최대값 조회
    const [result] = await conn.query(sqlList.selectMaxFlowCode);
    let maxNum = result.maxFlowNum || 0;

    // 3. flow_code 생성 후 INSERT
    for (const row of flows) {
      maxNum++;
      const newFlowCode = `FC${maxNum}`;
      await conn.query(sqlList.insertProcessFlow, [
        newFlowCode,
        row.processCode,
        row.processSeq,
        prodCode
      ]);
    }

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
  const result = await mariadb.query("selectMaxAttachCode");
  const maxCode = result[0]?.maxCode || 0;
  const nextCode = `PFA${maxCode + 1}`;
  await mariadb.query("insertAttachFile", [nextCode, flowCode, fileName, originFileName]);
  return nextCode;
};
// 공정 흐름에 저장된 이미지 가져오기
const getAttachFileByFlowCode = async (flowCode) => {
  const sql = `
    SELECT file_name, origin_file_name
    FROM t_process_flow_attach
    WHERE flow_code = ?
    ORDER BY attach_code DESC
    LIMIT 1
  `;
  const result = await mariadb.directQuery(sql, [flowCode]);
  return result[0]; // 없으면 undefined
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
  saveAttachFile,
  getAttachFileByFlowCode
};