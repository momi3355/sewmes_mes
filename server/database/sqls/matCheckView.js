// sqls/matCheckView.js (새 파일)
const getCompletedList = `
  SELECT
    mc.inbound_check_code,    -- 검사코드
    m.material_name,          -- 자재명
    mc.pass_qty,              -- 합격수량
    mo.deadline AS inbound_date, -- 수입일자
    mc.check_date,            -- 검사일자
    -- 합격/불합격 여부를 동적으로 판단
    CASE 
      WHEN mo.order_qty = mc.pass_qty THEN '합격'
      ELSE '부분합격' 
    END AS check_status
  FROM
    t_matinbound_check mc
  JOIN
    t_material_order mo ON mc.material_order_code = mo.material_order_code
  JOIN
    t_material m ON mo.material_code = m.material_code
  -- 검사가 완료된 건만 (pass_qty가 0이 아니거나, check_date가 NULL이 아닌 건)
  WHERE mc.check_date IS NOT NULL 
  ORDER BY
    mc.check_date DESC;
`;
module.exports = { getCompletedList };