// 외주자재출고 조건 검색
const selectOutsouReleaseMaterialByConditions = `
  SELECT
    l.list_code,
    l.outsou_order_code,
    l.hold_id,
    m.material_name,
    o.reg_date,
    o.dead_date,
    c.cp_name,
    l.release_qty,
    o.release_state
  FROM t_outsou_order_material l
  LEFT JOIN t_material m ON l.material_code = m.material_code
  LEFT JOIN t_outsou_order o ON o.outsou_order_code = l.outsou_order_code
  LEFT JOIN t_company c ON o.cp_code = c.cp_code
  WHERE 1 = 1
        /**조건절**/
  ORDER BY o.reg_date DESC`;

module.exports ={
  selectOutsouReleaseMaterialByConditions
};