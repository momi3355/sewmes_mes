const materialCheckList = `
  SELECT 
    mo.material_order_code,
    mc.inbound_check_code,
    m.material_name,
    mo.order_qty,
    c.cp_name,
    mo.deadline AS inbound_date
  FROM 
    -- ✨ 기준을 't_matinbound_check' 테이블로 잡습니다.
    t_matinbound_check mc
  -- ✨ INNER JOIN을 사용하여, 관련 정보가 반드시 있는 데이터만 가져옵니다.
  JOIN t_material_order mo ON mc.material_order_code = mo.material_order_code
  JOIN t_material m ON mo.material_code = m.material_code
  JOIN t_company c ON mo.cp_code = c.cp_code
  -- ✨ '미완료' 상태, 즉 합격수량이 0인 건만 조회합니다.
  WHERE
    mc.pass_qty = 0
  ORDER BY 
    mc.check_date DESC;
`;

const insertCheckDetail = `
  INSERT INTO t_matcheck_detail (mat_check_detail, quality_code, defect_qty, inbound_check_code)
  VALUES (?, ?, ?, ?);
`;

// ✨ UPDATE 쿼리도 함께 있는 것이 좋습니다.
const updateInboundCheck = `
  UPDATE t_matinbound_check
  SET 
    pass_qty = ?,
    check_date = NOW()
  WHERE 
    inbound_check_code = ? -- ✨ PK인 inbound_check_code로 업데이트하는 것이 더 안전
`;

const createInboundCheckShell = `
  INSERT INTO t_matinbound_check (inbound_check_code, material_order_code, check_date, check_qty, pass_qty, emp_num)
  VALUES (?, ?, NULL, 0, 0, NULL)
`;
 
module.exports = {
  materialCheckList,
  insertCheckDetail,
  updateInboundCheck,
  createInboundCheckShell,
};