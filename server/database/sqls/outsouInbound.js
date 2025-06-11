// 외주입고 조건 검색 ========================
const selectOutsouInboundByConditions = `
  SELECT
    r.outsou_inbound_code,
    r.outsou_order_code,
    r.prod_code,
    r.prod_name,
    r.reg_date,
    r.inbound_date,
    r.cp_code,
    r.cp_name,
    r.inbound_qty,
    r.defect_qty,
    r.pass_qty,
    r.emp_num,
    r.emp_name
  FROM v_outsou_receive_summary r
  WHERE 1 = 1
    /**조건절**/
  ORDER BY r.reg_date DESC`;
// =========================================

// 외주입고불량내역 조건 검색 ========================
const selectInboundDefectByConditions = `
  SELECT
    od.defect_history_code,
    oi.outsou_inbound_code,
    p.prod_name,
    oi.reg_date,
    oi.inbound_date,
    c.cp_name,
    od.defect_qty,
    e.emp_name
  FROM t_outsou_defect_detail od
  LEFT JOIN t_outsou_receive oi ON od.outsou_inbound_code = oi.outsou_inbound_code
  LEFT JOIN t_product p ON oi.prod_code = p.prod_code
  LEFT JOIN t_company c ON oi.cp_code = c.cp_code
  LEFT JOIN t_employees e ON oi.emp_num = e.emp_num
  WHERE 1 = 1
    /**조건절**/
  ORDER BY oi.reg_date DESC`;

module.exports ={
  selectOutsouInboundByConditions,
  selectInboundDefectByConditions
};