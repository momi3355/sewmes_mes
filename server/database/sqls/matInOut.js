// sqls/matInOut.js

const getInOutList = `
-- ===================================================
-- 1. 입고(IN) 내역 조회 (변경 없음)
-- ===================================================
SELECT
    i.material_code,
    m.material_name,
    i.lot,
    mc.pass_qty AS qty,
    '자재입고' AS category,
    i.inbound_date AS inout_date,
    '입고' AS in_out
FROM
    t_material_inbound i
JOIN t_matinbound_check mc ON i.inbound_check_code = mc.inbound_check_code
LEFT JOIN t_material m ON i.material_code = m.material_code
WHERE mc.check_date IS NOT NULL

UNION ALL

-- ===================================================
-- 2. 출고(OUT) 내역 조회 (최종 완성 버전)
-- ===================================================
SELECT
    r.material_code,
    m.material_name,
    r.lot,
    r.release_qty AS qty,
    
    -- ✨ 서브쿼리에서 가져온 유형 정보를 사용, 없으면 '생산'으로 기본값 처리
    COALESCE(semi_out_info.category, '생산') AS category,
    
    ip.work_inst_reg_date AS inout_date,
    '출고' AS in_out
FROM
    t_material_release r
-- 자재명을 가져오기 위해 t_material을 JOIN
LEFT JOIN
    t_material m ON r.material_code = m.material_code
-- 출고일자를 가져오기 위해 t_inst_perf를 JOIN
LEFT JOIN
    t_inst_perf ip ON r.work_perf_code = ip.work_perf_code
-- ✨ '유형' 정보를 가져오기 위해 서브쿼리를 JOIN
LEFT JOIN
    (
        -- 이 서브쿼리는 '생산(외주)' 유형 정보만 미리 계산해 놓습니다.
        SELECT
            perf_code,
            '생산(외주)' AS category
        FROM
            t_semi_prod_out
        WHERE
            perf_code LIKE 'OSO%'
    ) AS semi_out_info ON r.work_perf_code = semi_out_info.perf_code -- ✨ 이 연결 조건이 가장 중요
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