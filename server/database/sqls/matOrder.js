// 자재 발주 필요한 목록 조회
const matorderList = `
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


module.exports = {
  matorderList,
  createMatOrder,
}