const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 

// 완제품 입고 검수 페이지 서비스 =========================================
const findProdInboundTestByConditions = async ({
  regStart, regEnd, checkStart, checkEnd, prodName, testState
}) => {
  let baseSql = sqlList.selectProdInboundTestByConditions;
  const whereClauses = [];
  const params = [];

  if (regStart && regEnd) {
    whereClauses.push("AND ip.work_inst_reg_date BETWEEN ? AND ?");
    params.push(regStart, regEnd);
  }

  if (checkStart && checkEnd) {
    whereClauses.push("AND pc.check_date ? AND ?");
    params.push(checkStart, checkEnd);
  }

  if (prodName) {
    whereClauses.push("AND p.prod_name LIKE ?");
    params.push(`%${prodName}%`);
  }

  if (testState) {
    switch (testState) {
      case 'not_tested':
        whereClauses.push("AND pc.pass_qty IS NULL");
        break;
      case 'pass':
        whereClauses.push("AND pc.pass_qty > 0");
        break;
    }
  }

  const finalSql = baseSql.replace("/**조건절**/", whereClauses.join("\n"));
  return await mariadb.directQuery(finalSql, params);
};

// 완제품 품질 검사 정보 가져오기
const getProductQualityTest = async () => {
  try {
    const rows = await mariadb.query("getProductQualityTest", []);
    return rows;
  } catch (err) {
    console.error('품질검사 항목 조회 실패:', err);
    throw err;
  }
};

// 완제품 입고 검사 완료 시 저장 기능
const saveInboundInspection = async (workPerfCode, userCode, passQty, defectList) => {

  const jsonParam = JSON.stringify(defectList);
  return await mariadb.query("callSaveProdInboundInspection", [
    workPerfCode,
    userCode,
    passQty,
    jsonParam
  ]);
};

// work_perf_code를 기준으로 입고 검사 내역 가져오기
const getTestHistoryByOutsouOrderCode = async (inboundCheckCode) => {
  const rows = await mariadb.directQuery(sqlList.getTestHistory, [inboundCheckCode]);
return rows;
};

module.exports ={
    findProdInboundTestByConditions,
    getProductQualityTest,
    saveInboundInspection,
    getTestHistoryByOutsouOrderCode
};