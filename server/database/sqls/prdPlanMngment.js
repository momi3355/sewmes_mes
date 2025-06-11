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

module.exports ={
  selectProdPlanByConditions
};