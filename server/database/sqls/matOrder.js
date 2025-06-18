// 자재 발주 필요한 목록 조회
const materialList = `
  SELECT
    material_code,
    material_name,
    material_type,
    unit,
    unit_price,
    color,
    safe_stock,
    current_stock  -- 뷰에서 별칭으로 만든 'current_stock'을 사용
  FROM
    v_material_order
`;

const materialOrderList = `
SELECT material_order_code
      ,material_code
      ,material_order_date
      ,deadline
      ,cp_code
      ,unit_price
      ,total_price
      ,order_qty
FROM t_material_order
ORDER BY material_order_code`;

const createMatOrder = `
  INSERT INTO t_material_order
    (material_order_code, 
     material_code, 
     material_order_date, 
     deadline, 
     cp_code, 
     unit_price, 
     total_price, 
     order_qty)
  VALUES
    (?, ?, NOW(), ?, ?, ?, ?, ?)
`;

const createInboundCheckShell = `
  INSERT INTO t_matinbound_check (inbound_check_code, material_order_code, check_qty, pass_qty, inbound_date)
  VALUES (?, ?, ?, 0, NOW())
`;

module.exports = {
  materialList,
  materialOrderList,
  createMatOrder,
  createInboundCheckShell,
}