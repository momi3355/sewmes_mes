// sqls/matInOut.js

const getInOutList = `
-- ===================================================
-- 1. 입고(IN) 내역 조회 
-- ===================================================
SELECT
    i.material_code,
    m.material_name,
    c.cp_name AS partner,
    mc.pass_qty AS qty,
    '자재입고' AS category,
    i.inbound_date AS inout_date,
    '입고' AS in_out
FROM
    t_material_inbound i
JOIN t_matinbound_check mc ON i.inbound_check_code = mc.inbound_check_code
JOIN t_material_order mo ON mc.material_order_code = mo.material_order_code
LEFT JOIN t_company c ON mo.cp_code = c.cp_code
LEFT JOIN t_material m ON i.material_code = m.material_code
WHERE mc.check_date IS NOT NULL

UNION ALL

-- ===================================================
-- 2. 출고(OUT) 내역 조회 (t_material_release 기준)
-- ===================================================
SELECT
    r.material_code,
    m.material_name, -- ✨ t_material 테이블(m)에서 자재명을 가져옴
    CASE
      WHEN r.work_inst_code LIKE 'WI%' THEN p.process_name 
      WHEN r.work_inst_code LIKE 'OU%' THEN c.cp_name
      ELSE '알 수 없음'
    END AS partner,
    r.release_qty AS qty,
    CASE
      WHEN r.work_inst_code LIKE 'WI%' THEN '생산'
      WHEN r.work_inst_code LIKE 'OU%' THEN '외주'
      ELSE '기타'
    END AS category,
    -- release_date가 없다고 가정하고, work_inst_code를 통해 날짜를 찾습니다.
    COALESCE(wi.inst_date, oo.reg_date) AS inout_date,
    '출고' AS in_out
FROM
    t_material_release r
-- ✨ 자재명을 가져오기 위해 t_material 테이블을 JOIN합니다.
LEFT JOIN
    t_material m ON r.material_code = m.material_code
-- 생산 출고일 경우
LEFT JOIN
    t_work_inst wi ON r.work_inst_code = wi.work_inst_code
LEFT JOIN
    t_work_process wp ON wi.work_inst_code = wp.work_inst_code
LEFT JOIN
    t_process_master p ON wp.process_code = p.process_code
-- 외주 출고일 경우
LEFT JOIN
    t_outsou_order oo ON r.work_inst_code = oo.outsou_order_code
LEFT JOIN
    t_company c ON oo.cp_code = c.cp_code

-- ===================================================
-- 3. 전체 결과를 최신순으로 정렬
-- ===================================================
ORDER BY
    inout_date DESC;
`;

module.exports = {
  getInOutList,
};