// 외주자재출고 조건 검색
const selectOutsouReleaseMaterialByConditions = `
  SELECT
    l.list_code,
    l.outsou_order_code,
    l.hold_id,
    COALESCE(m.material_name, p.prod_name) AS item_name,
    o.reg_date,
    o.dead_date,
    c.cp_name,
    l.release_qty,
    o.release_state
  FROM t_outsou_order_material l
  LEFT JOIN t_material m ON l.material_code = m.material_code
  LEFT JOIN t_product p ON l.material_code = p.prod_code
  LEFT JOIN t_outsou_order o ON o.outsou_order_code = l.outsou_order_code
  LEFT JOIN t_company c ON o.cp_code = c.cp_code
  WHERE 1 = 1
        /**조건절**/
  ORDER BY CAST(SUBSTRING(l.list_code, 4) AS UNSIGNED) DESC`;
// 외주발주 건에 따른 외주자재출고 목록 가져오기
const getReleaseMaterial = `
  SELECT
    l.list_code,
    l.outsou_order_code,
    l.hold_id,
    COALESCE(m.material_name, p.prod_name) AS item_name,
    o.reg_date,
    o.dead_date,
    c.cp_name,
    l.release_qty,
    o.release_state
  FROM t_outsou_order_material l
  LEFT JOIN t_material m ON l.material_code = m.material_code
  LEFT JOIN t_product p ON l.material_code = p.prod_code
  LEFT JOIN t_outsou_order o ON o.outsou_order_code = l.outsou_order_code
  LEFT JOIN t_company c ON o.cp_code = c.cp_code
  WHERE l.outsou_order_code = ? 
  ORDER BY CAST(SUBSTRING(l.list_code, 4) AS UNSIGNED) DESC`;

// 외주발주 출고처리
const callOutsouRelease = `CALL proc_outsou_release(?)`;

// 외주입고 등록 처리
const getNextOutsouInboundCode = `
  CALL createcode_proc('t_outsou_receive', 'outsou_inbound_code', 'OR', @newCode);
  SELECT @newCode AS newCode`;
const insertOutsouReceive = `
  INSERT INTO t_outsou_receive (
    outsou_inbound_code, outsou_order_code, inbound_qty, reg_date, prod_code, cp_code
  ) VALUES (?, ?, ?, ?, ?, ?)`;

module.exports ={
  selectOutsouReleaseMaterialByConditions,
  getReleaseMaterial,
  callOutsouRelease,
  getNextOutsouInboundCode,
  insertOutsouReceive
};