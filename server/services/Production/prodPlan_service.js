const mariadb = require("../../database/mapper.js");
const sqlList = require("../../database/sqlList.js"); 

// 생산계획관리 페이지 서비스 =========================================
const findProdPlanByConditions = async ({
  prodCode, prodName, orderCode, complete, startDateStart,
  startDateEnd, endDateStart, endDateEnd
}) => {
  let baseSql = sqlList.selectProdPlanByConditions;
  const whereClauses = [];
  const params = [];

  if (prodCode) {
    whereClauses.push("AND pp.prod_code LIKE ?");
    params.push(`%${prodCode}%`);
  }

  if (prodName) {
    whereClauses.push("AND p.prod_name LIKE ?");
    params.push(`%${prodName}%`);
  }

  if (orderCode) {
    whereClauses.push("AND o.order_code LIKE ?");
    params.push(`%${orderCode}%`);
  }

  if (complete) {
    whereClauses.push("AND pp.complete = ?");
    params.push(complete);
  }

  if (startDateStart && startDateEnd) {
    whereClauses.push("AND pp.start_date BETWEEN ? AND ?");
    params.push(startDateStart, startDateEnd);
  }

  if (endDateStart && endDateEnd) {
    whereClauses.push("AND pp.end_date BETWEEN ? AND ?");
    params.push(endDateStart, endDateEnd);
  }

  const finalSql = baseSql.replace("/**조건절**/", whereClauses.join("\n"));
  console.log(finalSql);
  return await mariadb.directQuery(finalSql, params);
};


// 주문제품목록 모달 서비스 =========================================
const findOrderProdList = async ({
  order_state
}) => {
  let baseSql = sqlList.selectOrderProdList;
  const whereClauses = [];
  const params = [];

  if (order_state) {
    whereClauses.push("AND od.order_state = ?");
    params.push(order_state);
  }

  const finalSql = baseSql.replace("/**조건절**/", whereClauses.join("\n"));
  console.log(finalSql);
  return await mariadb.directQuery(finalSql, params);
};
// 생산계획 저장
const saveProdPlans = async (plans) => {
  const conn = await mariadb.getConnection();
  try {
    await conn.beginTransaction();

    for (const plan of plans) {
      const {
        prodPlanCode, orderDetailCode, prodCode,
        prodQty, startDate, endDate, empNum
      } = plan;

      if (!prodCode || !prodQty || !startDate || !endDate) continue;

      if (!prodPlanCode) {
        // 신규 코드 생성
        const result = await conn.query(sqlList.getNextProdPlanCode);
        const newCode = result[1]?.[0]?.newCode;
        if (!newCode) throw new Error("생산계획 코드 생성 실패");

        await conn.query(sqlList.insertProdPlan, [
          newCode, orderDetailCode, prodCode, prodQty, startDate, endDate, empNum
        ]);

        // 주문상세 상태 업데이트
        if (orderDetailCode) {
          await conn.query(sqlList.updateOrderDetailState, [orderDetailCode]);
        }
      } else {
        // 기존 수정
        await conn.query(sqlList.updateProdPlan, [
          prodCode, prodQty, startDate, endDate, empNum, prodPlanCode
        ]);
      }
    }

    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
// 제품 정보 가져오기 모달
const searchProductByKeyword = async (keyword) => {
  const result = await mariadb.query("selectProductByKeyword", [keyword]);
  return result;
};

const deleteProdPlan = async (plans) => {
  try {
    for(const plan of plans){
      const { prodPlanCode } = plan;
      await mariadb.query("deleteProdPlanByProdPlanCode", [prodPlanCode]);
    }
  } catch (err) {
    console.log(err);
  }
}


module.exports ={
  findProdPlanByConditions,
  findOrderProdList,
  saveProdPlans,
  searchProductByKeyword,
  deleteProdPlan
};