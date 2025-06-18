
const getCompletedCheckList = `
  SELECT
    mc.inbound_check_code,    -- 검사코드
    m.material_name,          -- 자재명
    mc.pass_qty,              -- 합격수량
    mo.deadline AS inbound_date, -- 수입일자
    mc.check_date,            -- 검사일자
 
    CASE 
      WHEN mo.order_qty = mc.pass_qty THEN '합격'
      WHEN mc.pass_qty > 0 THEN '부분합격'
      ELSE '불합격' 
    END AS check_status
  FROM
    t_matinbound_check mc
  JOIN
    t_material_order mo ON mc.material_order_code = mo.material_order_code
  JOIN
    t_material m ON mo.material_code = m.material_code
  WHERE 
    mc.check_date IS NOT NULL
  ORDER BY
    mc.check_date DESC;
`;

const getCheckMaster = `
  SELECT 
    i.inbound_code,      
    m.material_name,
    mo.deadline AS inbound_date,
    mc.pass_qty,
    mc.check_date,
    (mo.order_qty - mc.pass_qty) AS total_defect_qty
  FROM 
    t_matinbound_check mc
  JOIN 
    t_material_order mo ON mc.material_order_code = mo.material_order_code
  JOIN 
    t_material m ON mo.material_code = m.material_code
  -- ✨ 2. t_material_inbound 테이블을 JOIN하여 inbound_code를 가져옵니다.
  LEFT JOIN 
    t_material_inbound i ON mc.inbound_check_code = i.inbound_check_code
  WHERE 
    mc.inbound_check_code = ?
`;

module.exports = {
  getCompletedCheckList,
  getCheckMaster,
};