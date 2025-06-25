// sqls/matInOut.js

const getInOutList = `
-- ===================================================
<<<<<<< HEAD
-- 1. 입고(IN) 내역 조회 (LOT 포함)
=======
-- 1. 입고(IN) 내역 조회 (변경 없음)
>>>>>>> 1393aee5553b6a6c72285b343f69a233941f2f9d
-- ===================================================
SELECT
    i.material_code,
    m.material_name,
    i.lot, -- ✨ t_material_inbound 테이블에서 LOT 번호를 가져옴
    mc.pass_qty AS qty,
    '자재입고' AS category,
    i.inbound_date AS inout_date,
    '입고' AS in_out
FROM
    t_material_inbound i
JOIN 
    t_matinbound_check mc ON i.inbound_check_code = mc.inbound_check_code
LEFT JOIN 
    t_material m ON i.material_code = m.material_code
WHERE 
    mc.check_date IS NOT NULL

UNION ALL

-- ===================================================
<<<<<<< HEAD
-- 2. 출고(OUT) 내역 조회 (LOT 포함)
-- ===================================================
SELECT
    r.material_code,
    m.material_name,
    r.lot, -- ✨ t_material_release 테이블에서 LOT 번호를 가져옴
    r.release_qty AS qty,
    
    -- 유형(category)은 코드 규칙에 따라 생산/외주로 구분
=======
-- 2. 출고(OUT) 내역 조회 (material_name JOIN 추가)
-- ===================================================
SELECT
    r.material_code,
    m.material_name, -- ✨ t_material 테이블(m)에서 자재명을 가져옴
    c.cp_name AS partner,
    r.release_qty AS qty,
    
>>>>>>> 1393aee5553b6a6c72285b343f69a233941f2f9d
    CASE
      WHEN SUBSTRING(r.work_perf_code, 1, 3) = 'WPC' THEN '생산'
      WHEN SUBSTRING(r.work_inst_code, 1, 2) = 'OO' THEN '외주'
      ELSE '기타'
    END AS category,
    
    ip.work_inst_reg_date AS inout_date,
    '출고' AS in_out
FROM
    t_material_release r
<<<<<<< HEAD
-- 자재명을 가져오기 위해 t_material 테이블을 JOIN
LEFT JOIN
    t_material m ON r.material_code = m.material_code
-- 출고일자를 가져오기 위해 t_inst_perf와 JOIN
LEFT JOIN
=======
-- ✨ 자재명을 가져오기 위해 t_material 테이블을 LEFT JOIN 합니다.
LEFT JOIN
    t_material m ON r.material_code = m.material_code

-- ✨ 원공급처를 찾기 위한 역추적 JOIN 경로
LEFT JOIN
    t_material_inbound mi ON r.lot = mi.lot
LEFT JOIN
    t_matinbound_check mk ON mi.inbound_check_code = mk.inbound_check_code
LEFT JOIN
    t_material_order mo ON mk.material_order_code = mo.material_order_code
LEFT JOIN
    t_company c ON mo.cp_code = c.cp_code
    
-- ✨ 출고일자를 가져오기 위한 JOIN 경로
LEFT JOIN
>>>>>>> 1393aee5553b6a6c72285b343f69a233941f2f9d
    t_inst_perf ip ON r.work_perf_code = ip.work_perf_code
WHERE
    r.release_qty > 0

-- ===================================================
-- 3. 전체 결과를 최신순으로 정렬
-- ===================================================
ORDER BY
    inout_date DESC;
`;

module.exports = {
  getInOutList,
};