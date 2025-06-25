// 생산계획 조건 검색
const selectProdPlanByConditions = `
  SELECT
    pp.prod_plan_code,
    pp.order_detail_code,
    o.order_code,
    pp.prod_code,
    p.prod_name,
    pp.start_date,
    pp.end_date,
    o.total_qty,
    pp.prod_qty,
    pp.emp_num,
    e.emp_name,
    pp.complete
  FROM t_prod_plan pp
  LEFT JOIN t_order_detail o ON pp.order_detail_code = o.order_detail_code
  LEFT JOIN t_product p ON pp.prod_code = p.prod_code
  LEFT JOIN t_employees e ON pp.emp_num = e.emp_num
  WHERE 1 = 1
        /**조건절**/
  ORDER BY pp.start_date DESC`;

// 주문제품목록 모달 리스트
const selectOrderProdList =`
  SELECT 
    od.order_detail_code,
    od.prod_code,
    od.order_code,
    p.prod_name,
    od.total_qty,
    od.dead_date
  FROM t_order_detail od
  LEFT JOIN t_product p ON od.prod_code = p.prod_code
  WHERE od.order_detail_state = '0n1n'
        /**조건절**/
  ORDER BY od.order_date DESC`;
// 생산계획 저장 SQL문 집합
const getNextProdPlanCode = `
  CALL createcode_proc('t_prod_plan', 'prod_plan_code', 'PP', @code);
  SELECT @code AS newCode`;
const insertProdPlan = `
  INSERT INTO t_prod_plan (
    prod_plan_code, order_detail_code, prod_code,
    prod_qty, start_date, end_date, reg_date, complete, emp_num
  ) VALUES (?, ?, ?, ?, ?, ?, NOW(), '1a2a', ?)`;
const updateProdPlan = `
  UPDATE t_prod_plan SET
    prod_code = ?, prod_qty = ?, start_date = ?, end_date = ?, emp_num = ?
  WHERE prod_plan_code = ?`;
const updateOrderDetailState = `
  UPDATE t_order_detail 
  SET order_detail_state = '0n2n' 
  WHERE order_detail_code = ?`;

const selectProductByKeyword  = `
  SELECT
    prod_code AS prodCode,
    prod_name AS prodName
  FROM t_product
  WHERE prod_name LIKE CONCAT('%', ?, '%')
  LIMIT 10`;

const deleteProdPlanByProdPlanCode = `
    DELETE FROM t_prod_plan
    WHERE prod_plan_code = ?`;  

module.exports ={
  selectProdPlanByConditions,
  selectOrderProdList,
  getNextProdPlanCode,
  insertProdPlan,
  updateProdPlan,
  updateOrderDetailState,
  selectProductByKeyword,
  deleteProdPlanByProdPlanCode
};