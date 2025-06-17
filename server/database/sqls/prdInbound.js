// 완제품 입고 검사 리스트 가져오기
const selectProdInboundTestByConditions = `
    SELECT 
        ip.work_perf_code,
        ip.work_inst_code,
        ip.work_process_code,
        ip.prod_qty,
        ip.work_inst_reg_date,
        wi.prod_code,
        p.prod_name,
        pc.inbound_check_code,
        pc.check_date,
        pc.check_qty,
        pc.pass_qty,
        pc.emp_num,
        e.emp_name,
        d.defect_qty_sum
    FROM t_inst_perf ip
    JOIN (
        SELECT wp.work_process_code
        FROM t_work_process wp
        JOIN (
            SELECT work_inst_code, MAX(process_seq) AS max_seq
            FROM t_work_process
            GROUP BY work_inst_code
        ) max_group
        ON wp.work_inst_code = max_group.work_inst_code
        AND wp.process_seq = max_group.max_seq
    ) latest_process
    ON ip.work_process_code = latest_process.work_process_code
    LEFT JOIN t_product_check pc
    ON ip.work_perf_code = pc.work_perf_code
    LEFT JOIN (
        SELECT inbound_check_code, SUM(defect_qty) AS defect_qty_sum
        FROM t_prodcheck_detail
        GROUP BY inbound_check_code
    ) d
    ON pc.inbound_check_code = d.inbound_check_code
    LEFT JOIN t_work_inst wi
    ON ip.work_inst_code = wi.work_inst_code
    LEFT JOIN t_product p
    ON wi.prod_code = p.prod_code
    LEFT JOIN t_employees e
    ON pc.emp_num = e.emp_num
    WHERE 1 = 1
        /**조건절**/
    ORDER BY CAST(SUBSTRING(ip.work_perf_code, 3) AS UNSIGNED) DESC`;

// 완제품검사 모달 품질 검사 리스트 불러오기
const getProductQualityTest = `
  SELECT quality_code, test_name, test_method
  FROM t_quality
  WHERE test_target = '1b4b' AND use_yn = '0b1b'`;

// 완제품 입고 프로시저 불러오기
const callSaveProdInboundInspection =`
    CALL proc_save_inbound_inspection(?, ?, ?, ?)`;

const getTestHistory = `
    SELECT 
    pd.quality_code,
    pd.defect_qty,
    q.test_name,
    q.test_method
    FROM t_prodcheck_detail pd
    LEFT JOIN t_quality q ON pd.quality_code = q.quality_code
    WHERE pd.inbound_check_code = ? `;

module.exports ={
    selectProdInboundTestByConditions,
    getProductQualityTest,
    callSaveProdInboundInspection,
    getTestHistory
};