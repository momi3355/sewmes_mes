
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
const updateProcessStartDate=
`      
UPDATE t_work_process
    SET
        equi_code = ?,          
        work_start_date = NOW() 
    WHERE
        work_inst_code = ? AND  
        process_code = ?
`;

//작업시작 후 상태 생산 중으로 변경
const updateWorkInstStateToInProgress = `
    UPDATE t_work_inst
    SET inst_state = ?
    WHERE work_inst_code = ?;

`;
        
//작업종료 후 작업공정종료시간에 update
const updateEndWorkTime=`
UPDATE t_work_process
SET
    work_end_date = NOW()           
WHERE
    work_inst_code = ? AND        
    process_code = ?; 
`


//작업공정테이블에서 필요한 쿼리문

const getProcessFlowByWorkInst=`
SELECT
    twp.work_process_code,
    twp.work_inst_code,
    twp.process_code,
    tpm.process_name, 
    twp.process_seq,
    twp.inst_qty,
    twp.prod_qty
FROM
    t_work_process twp    
JOIN
    t_process_master tpm    
    ON twp.process_code = tpm.process_code 
WHERE
    twp.work_inst_code = ?
ORDER BY
    twp.process_seq ASC;
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
let getWorkInstDetailInfo = `
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

//제품코드에 대한 필요 자재
const needMaterialPrdCode =`
SELECT material_code
        ,need 
FROM v_winst_details
WHERE prod_code= ?
AND material_code = ?
`;
//화면에서 필요한 자재들 표시, 
const displayMaterials=
`SELECT th.hold_id
		,th.work_inst_code
        ,th.material_code
        ,tm.material_name
        ,wd.prod_type
        ,th.lot_code
        ,tm.unit
        ,tm.standard
        ,tm.color
        ,wd.need
FROM t_hold th
LEFT JOIN t_material tm ON th.material_code = tm.material_code
join v_winst_details wd on tm.material_code = wd.material_code
WHERE work_inst_code= ?
`;


module.exports={
    getProcessFlowByWorkInst,
    getEquipmentByProcess,
    workProcessInsertProced,
    deleteWorkProcessByworkInstCode,
    updateWorkProcessByWorkInstCode,
    updateProcessStartDate,
    getWorkInstDetailInfo,
    updateWorkInstStateToInProgress,
    updateEndWorkTime,
    needMaterialPrdCode,
    displayMaterials
}