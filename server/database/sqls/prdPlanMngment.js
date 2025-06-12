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
    o.qty,
    pp.prod_qty,
    pp.emp_num,
    pp.complete
  FROM t_prod_plan pp
  LEFT JOIN t_order_detail o ON pp.order_detail_code = o.order_detail_code
  LEFT JOIN t_product p ON pp.prod_code = p.prod_code
  WHERE 1 = 1
        /**조건절**/
  ORDER BY pp.start_date DESC`;

// 주문제품목록 모달 리스트
const selectOrderProdList =`
  SELECT 
    od.order_detail_code,
    od.prod_code,
    p.prod_name,
    od.qty,
    od.dead_date
  FROM t_order_detail od
  LEFT JOIN t_product p ON od.prod_code = p.prod_code
  WHERE 1 = 1
        /**조건절**/
  ORDER BY od.order_date DESC`;


module.exports ={
  selectProdPlanByConditions,
  selectOrderProdList
};