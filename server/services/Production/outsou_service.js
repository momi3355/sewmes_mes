const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 

// 외주발주 페이지 서비스 =========================================
// 조건에 따른 외주발주 건 조회, 외주자재출고 페이지에서도 사용용
const findOutsouOrderByConditions = async ({ 
  outsouOrderCode, prodName, cpName, releaseState, regStartDate,
  regEndDate, deadStartDate, deadEndDate
}) => {
  let baseSql = sqlList.selectOutsouOrderByConditions;
  const whereClauses = [];
  const params = [];

  if (outsouOrderCode) {
    whereClauses.push("AND o.outsou_order_code LIKE ?");
    params.push(`%${outsouOrderCode}%`);
  }

  if (prodName) {
    whereClauses.push("AND p.prod_name LIKE ?");
    params.push(`%${prodName}%`);
  }

  if (cpName) {
    whereClauses.push("AND c.cp_name LIKE ?");
    params.push(`%${cpName}%`);
  }

  if (releaseState) {
    whereClauses.push("AND o.release_state = ?");
    params.push(releaseState);
  }

  if (regStartDate && regEndDate) {
    whereClauses.push("AND o.reg_date BETWEEN ? AND ?");
    params.push(regStartDate, regEndDate);
  }

  if (deadStartDate && deadEndDate) {
    whereClauses.push("AND o.dead_date BETWEEN ? AND ?");
    params.push(deadStartDate, deadEndDate);
  }

  const finalSql = baseSql.replace("/**조건절**/", whereClauses.join("\n"));

  return await mariadb.directQuery(finalSql, params);
};
// 납기일자 미등록 건 수 조회
const findOutsouOrderNullDeadCount = async () => {
  const sql = sqlList.selectOutsouOrderNullDeadCount;
  return await mariadb.directQuery(sql);
};

// ==============================================================

// 외주발주 모달 서비스 =========================================
const findOutsouOrderNotDeadList = async () => {
  const sql = sqlList.selectOutsouOrderNotDeadList;
  return await mariadb.directQuery(sql);
};

const updateOutsouDeadDate = async (updates) => {
  for (const row of updates) {
    const { outsouOrderCode, deadDate } = row;

    // 납기일자 업데이트
    await mariadb.query("updateOutsouDeadDate", [deadDate, outsouOrderCode]);
  
    // 출고자재 등록 프로시저 실행
    await mariadb.query("callRegOutsouMaterial", [outsouOrderCode]);
  }
};

// ==============================================================

// 외주자재출고 관리 페이지 서비스 =========================================
// outsou_order_code를 기준으로 외주자재출고 목록록 가져오기
const getReleaseMaterialByOutsouOrderCode = async (outsouOrderCode) => {
  const rows = await mariadb.directQuery(sqlList.getReleaseMaterial, [outsouOrderCode]);
return rows;
};
// 외주발주 출고처리
const callOutsouRelease = async (updates) => {
  // 배열이 아닌 단일 객체일 경우 배열로 감쌈
  const updateList = Array.isArray(updates) ? updates : [updates];

  for (const row of updateList) {
    const { outsouOrderCode } = row;
    await mariadb.query("callOutsouRelease", [outsouOrderCode]);
  }
};
// ==============================================================

// 외주자재출고 조회 페이지 서비스 =========================================
const findOutsouReleaseMaterialByConditions = async ({
  outsouOrderCode, materialName, cpName, releaseState, regStartDate,
  regEndDate, deadStartDate, deadEndDate
}) => {
  let baseSql = sqlList.selectOutsouReleaseMaterialByConditions;
  const whereClauses = [];
  const params = [];

  if (outsouOrderCode) {
    whereClauses.push("AND o.outsou_order_code LIKE ?");
    params.push(`%${outsouOrderCode}%`);
  }

  if (materialName) {
    whereClauses.push("AND p.prod_name LIKE ?");
    params.push(`%${materialName}%`);
  }

  if (cpName) {
    whereClauses.push("AND c.cp_name LIKE ?");
    params.push(`%${cpName}%`);
  }

  if (releaseState) {
    whereClauses.push("AND o.release_state = ?");
    params.push(releaseState);
  }

  if (regStartDate && regEndDate) {
    whereClauses.push("AND o.reg_date BETWEEN ? AND ?");
    params.push(regStartDate, regEndDate);
  }

  if (deadStartDate && deadEndDate) {
    whereClauses.push("AND o.dead_date BETWEEN ? AND ?");
    params.push(deadStartDate, deadEndDate);
  }

  const finalSql = baseSql.replace("/**조건절**/", whereClauses.join("\n"));
  console.log(finalSql);
  return await mariadb.directQuery(finalSql, params);
};
// ==============================================================

// 외주입고 페이지 서비스 =========================================
const findInboundReceiveByConditions = async ({
  regStart, regEnd, inboundStart, inboundEnd,
  cpName, prodName, testState
}) => {
  let baseSql = sqlList.selectOutsouInboundByConditions;
  const whereClauses = [];
  const params = [];

  if (regStart && regEnd) {
    whereClauses.push("AND r.reg_date BETWEEN ? AND ?");
    params.push(regStart, regEnd);
  }

  if (inboundStart && inboundEnd) {
    whereClauses.push("AND r.inbound_date BETWEEN ? AND ?");
    params.push(inboundStart, inboundEnd);
  }

  if (cpName) {
    whereClauses.push("AND r.cp_name LIKE ?");
    params.push(`%${cpName}%`);
  }

  if (prodName) {
    whereClauses.push("AND r.prod_name LIKE ?");
    params.push(`%${prodName}%`);
  }

  if (testState) {
    switch (testState) {
      case 'not_tested':
        whereClauses.push("AND r.pass_qty IS NULL");
        break;
      case 'pass':
        whereClauses.push("AND r.inbound_qty = r.pass_qty");
        break;
      case 'partial_pass':
        whereClauses.push("AND r.inbound_qty > r.pass_qty");
        break;
      case 'fail':
        whereClauses.push(`
          AND r.inbound_qty = (
            SELECT IFNULL(SUM(defect_qty), 0)
            FROM t_outsou_defect_detail d
            WHERE d.outsou_inbound_code = r.outsou_inbound_code
          )
        `);
        break;
    }
  }

  const finalSql = baseSql.replace("/**조건절**/", whereClauses.join("\n"));
  return await mariadb.directQuery(finalSql, params);
};
// 반제품 품질 검사 정보 가져오기
const getSemiProductQualityTest = async () => {
  try {
    const rows = await mariadb.query("getSemiProductQualityTest", []);
    return rows;
  } catch (err) {
    console.error('품질검사 항목 조회 실패:', err);
    throw err;
  }
};
// 반제품 품질 기존 검사이력 가져오기
const getDefectDetailByInboundCode = async (inboundCode) => {
  const sql = sqlList.getSemiProductQualityTestHistory;
  return await mariadb.directQuery(sql, [inboundCode]);
};

// ==============================================================

// 외주입고불량내역 페이지 서비스 =========================================
const findInboundDefectByConditions = async ({
  regStart, regEnd, inboundStart, inboundEnd,
  cpName, prodName, inboundCode
}) => {
  let baseSql = sqlList.selectInboundDefectByConditions;
  const whereClauses = [];
  const params = [];
  if (regStart && regEnd) {
    whereClauses.push("AND oi.reg_date BETWEEN ? AND ?");
    params.push(regStart, regEnd);
  }
  if (inboundStart && inboundEnd) {
    whereClauses.push("AND oi.inbound_date BETWEEN ? AND ?");
    params.push(inboundStart, inboundEnd);
  }
  if (cpName) {
    whereClauses.push("AND c.cp_name LIKE ?");
    params.push(`%${cpName}%`);
  }
  if (prodName) {
    whereClauses.push("AND p.prod_name LIKE ?");
    params.push(`%${prodName}%`);
  }
  if (inboundCode) {
    whereClauses.push("AND oi.outsou_inbound_code LIKE ?");
    params.push(`%${inboundCode}%`);
  }

  const finalSql = baseSql.replace("/**조건절**/", whereClauses.join("\n"));
  return await mariadb.directQuery(finalSql, params);
};
// 외주입고 검사 완료 시 저장 기능
const callSaveOutsouInboundInspection = async ({ outsouInboundCode, userCode, passQty, defectList }) => {
  const jsonParam = JSON.stringify(defectList); // [{ quality_code, defect_qty }, ...]
  return await mariadb.query("callSaveOutsouInboundInspection", [
    outsouInboundCode,
    userCode,
    passQty,
    jsonParam
  ]);
};

module.exports ={
  // 외주발주
  findOutsouOrderByConditions,
  findOutsouOrderNullDeadCount,
  callOutsouRelease,
  // 외주발주 모달
  findOutsouOrderNotDeadList,
  updateOutsouDeadDate,
  // 외주출고
  findOutsouReleaseMaterialByConditions, // 외주자재출고 조회 페이지지
  getReleaseMaterialByOutsouOrderCode,
  // 외주입고
  findInboundReceiveByConditions,
  getSemiProductQualityTest,
  getDefectDetailByInboundCode,
  // 외주입고불량
  findInboundDefectByConditions,
  callSaveOutsouInboundInspection
};