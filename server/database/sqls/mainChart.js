
/*
한달 동안의 생산계획 / 작업지시
작업지시의 공정들
작업지시의 생산량 / 불량량
VIEW CREATE 원문
SELECT
    pp.reg_date,                     -- 생산계획 등록일
    pp.prod_qty AS plan_qty,        -- 계획 생산수량
    pp.start_date AS plan_start,    -- 계획 시작일
    pp.complete AS plan_complete,   -- 생산계획 완료 여부
    wi.inst_reg_date,                   -- 작업지시 날짜
    wi.inst_state,                  -- 작업지시 상태
    wp.work_process_code,           -- 작업 공정 코드
    wp.process_code,                -- 공정 코드
    wp.defect_qty,                  -- 불량 수량
    wp.prod_qty AS process_qty,     -- 공정 생산수량
    wp.complete AS process_complete -- 공정 완료 여부

FROM t_prod_plan pp
RIGHT JOIN t_work_inst wi ON pp.prod_plan_code = wi.prod_plan_code
JOIN t_work_process wp ON wp.work_inst_code = wi.work_inst_code
WHERE wi.inst_reg_date BETWEEN DATE_FORMAT(NOW(), '%Y-%m-01') AND LAST_DAY(NOW());
*/
const selectProcessChartUse = `
SELECT reg_date
       , plan_qty
       , plan_start
       , plan_complete
       , inst_reg_date
       , inst_state
       , work_process_code
       , process_code
       , defect_qty
       , process_qty
       , process_complete
FROM   v_process_chart
`;

// 작업지시별 공정 완료율
const selectCompleteWorkInstToProcess = `
SELECT work_inst_code,
       COUNT(*) AS total_processes,
       SUM(CASE WHEN complete = '1a1a' THEN 1 ELSE 0 END) AS completed_processes
FROM t_work_process
GROUP BY work_inst_code;
`;

// 날짜별 생산량 흐름
const selectDateHowManyProd = `
SELECT work_date,
       daily_prod_qty
FROM v_workInstProcessComplete
`;

module.exports = {
  selectProcessChartUse, 
  selectCompleteWorkInstToProcess, 
  selectDateHowManyProd,
};