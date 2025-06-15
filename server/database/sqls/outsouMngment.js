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
  WHERE o.dead_date IS NOT NULL
        /**조건절**/
  ORDER BY o.reg_date DESC`;

// 납기일자 미등록 외주발주 건 수 조회
const selectOutsouOrderNullDeadCount = `
  SELECT COUNT(*) FROM t_outsou_order WHERE dead_date IS NULL`;

// 외주발주 납기 미등록 검색
const selectOutsouOrderNotDeadList =`
  SELECT
    o.outsou_order_code,
    o.work_process_code,
    o.prod_code,
    p.prod_name,
    o.order_qty,
    o.dead_date,
    o.release_state,
    o.reg_date,
    c.cp_name
  FROM t_outsou_order o
  LEFT JOIN t_product p ON o.prod_code = p.prod_code
  LEFT JOIN t_company c ON o.cp_code = c.cp_code
  WHERE o.dead_date IS NULL
  ORDER BY o.reg_date DESC`; 

// 납기일자 등록
const updateOutsouDeadDate = `
  UPDATE t_outsou_order
  SET dead_date = ?
  WHERE outsou_order_code = ?`;
// 출고자재 등록 프로시저 호출
const callRegOutsouMaterial = `CALL auto_reg_outsou_material(?)`;


module.exports ={
  selectOutsouOrderByConditions,
  selectOutsouOrderNullDeadCount,
  selectOutsouOrderNotDeadList,
  updateOutsouDeadDate,
  callRegOutsouMaterial
};