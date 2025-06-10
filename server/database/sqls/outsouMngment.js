// 외주발주 건 조건 검색
const selectOutsouOrderByConditions = `
  SELECT
    o.outsou_order_code,
    o.work_process_code,
    p.prod_name,
    o.order_qty,
    o.dead_date,
    o.release_state,
    o.reg_date,
    c.cp_name
  FROM t_outsou_order o
  LEFT JOIN t_product p ON o.prod_code = p.prod_code
  LEFT JOIN t_company c ON o.cp_code = c.cp_code
  WHERE 1 = 1
        /**조건절**/
  ORDER BY o.reg_date DESC`;

module.exports ={
  selectOutsouOrderByConditions
};