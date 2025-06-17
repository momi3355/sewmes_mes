// sqls/matCheck.js (LEFT JOIN 버전으로 복귀)

const materialCheckList = `
  SELECT 
    mo.material_order_code,
    m.material_name, -- 만약 material_code가 없으면 이 값은 NULL이 됨
    mo.order_qty,
    c.cp_name,       -- 만약 cp_code가 없으면 이 값은 NULL이 됨
    mo.deadline AS inbound_date
  FROM 
    t_material_order mo
  -- ✨ INNER JOIN을 다시 LEFT JOIN으로 변경하여 데이터 누락을 방지합니다.
  LEFT JOIN 
    t_material m ON mo.material_code = m.material_code
  LEFT JOIN
    t_company c ON mo.cp_code = c.cp_code
  -- 검수 완료되지 않은 건만 필터링
  LEFT JOIN 
    t_matinbound_check mc ON mo.material_order_code = mc.material_order_code
  WHERE 
    mc.inbound_check_code IS NULL
  ORDER BY 
    mo.material_order_date DESC;
`;

module.exports = {
  materialCheckList,
};