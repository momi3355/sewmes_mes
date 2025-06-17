
//작업공정생성
const workProcessInsertProced=`
    CALL prdWorkprocesss_proc(?, @msg);
    SELECT @msg AS msg;
`;
//작업공정테이블 삭제
const deleteWorkProcessByworkInstCode=`
DELETE FROM t_work_process 
WHERE work_inst_code=?;
`

//작업지시 수정시 작업공정테이블 수정
const updateWorkProcessByWorkInstCode=`
    UPDATE t_work_process
    SET inst_qty = ?
    WHERE 
    work_inst_code=?
`;

//작업시작시 작업공정테이블에 작업시간 update
const updateStartdate=`      
UPDATE t_work_process
    SET
        equi_code = ?,          
        work_start_date = NOW() 
    WHERE
        work_inst_code = ? AND  
        process_code = ?`;

 const updateWorkInstStateToInProgress = `
    UPDATE t_work_inst
    SET inst_state = ?
    WHERE work_inst_code = ?;
`;
        



//작업공정테이블에서 필요한 쿼리문

const getProcessFlowByWorkInst=`
SELECT
    tp.process_code,
    tpm.process_name,
    tpm.detail,
    tp.process_seq,
    twp.equi_code,               
    twp.inst_qty AS process_input_qty, 
    twp.work_start_date,        
    twp.work_end_date            
FROM
    t_process_flow tp             
JOIN
    t_process_master tpm ON tp.process_code = tpm.process_code
JOIN
    t_work_inst twi ON tp.prod_code = twi.prod_code 
LEFT JOIN
    t_work_process twp ON twi.work_inst_code = twp.work_inst_code
                        AND tp.process_code = twp.process_code
WHERE
    twi.work_inst_code = ?
ORDER BY
    tp.process_seq ASC;
`;
//설비
const getEquipmentByProcess = `
SELECT
    equi_code,
    equi_name,
    equi_status
FROM
    t_equipment 
WHERE
    equi_type = (SELECT equi_type FROM t_process_master  WHERE process_code = ?)
`;

//작업지시상세 조회
const getWorkInstDetails = `
SELECT
    twi.work_inst_code,
    twi.inst_qty,
    twi.inst_state,
    twi.inst_date, 
    twi.prod_code,
    tp.prod_name,
    tp.prod_type,
    tp.category,
    tp.color,
    tp.size,
    vw.item_code,
    vw.need AS required_quantity,
    vw.unit AS material_unit,
    vw.standard AS material_standard,
    vw.material_code,
    vw.material_name,
    vw.material_type, 
    MAX(CASE WHEN vw.material_type = '원자재' THEN th.lot_code ELSE NULL END) AS lot_number,
    SUM(th.hold_qty) AS total_current_hold_qty,


    (SELECT MIN(twp_sub.work_start_date)
     FROM t_work_process twp_sub
     WHERE twp_sub.work_inst_code = twi.work_inst_code) AS overall_work_start_date,

    (SELECT MAX(twp_sub.work_end_date)
     FROM t_work_process twp_sub
     WHERE twp_sub.work_inst_code = twi.work_inst_code) AS overall_work_end_date
FROM
    t_work_inst twi
JOIN
    t_product tp ON twi.prod_code = tp.prod_code
JOIN
    v_winst_details vw ON twi.prod_code = vw.prod_code
LEFT JOIN
    t_hold th ON vw.item_code = th.material_code AND vw.material_type = '원자재' -- vw.material_type이 '원자재'일 때만 t_hold 조인 (선택 사항)
WHERE
    twi.work_inst_code = ? 
GROUP BY
    twi.work_inst_code,
    twi.inst_qty,
    twi.inst_state,
    twi.inst_reg_date,
    twi.prod_code,
    tp.prod_name, tp.prod_type, tp.category, tp.color, tp.size,
    vw.item_code,
    vw.need,
    vw.unit,
    vw.standard,
    vw.material_code,
    vw.material_name,
    vw.material_type -- v_winst_details 뷰에 material_type 컬럼이 있고 GROUP BY에 사용된다면 추가합니다.
ORDER BY
    vw.item_code
`;

module.exports={
    getProcessFlowByWorkInst,
    getEquipmentByProcess,
    workProcessInsertProced,
    deleteWorkProcessByworkInstCode,
    updateWorkProcessByWorkInstCode,
    updateStartdate,
    getWorkInstDetails,
    updateWorkInstStateToInProgress,
}