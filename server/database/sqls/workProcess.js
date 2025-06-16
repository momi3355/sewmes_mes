
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


//작업공정테이블에서 필요한 쿼리문

const getProcessFlowByWorkInst=`
SELECT
            tp.process_code,
            tpm.process_name,
            tpm.detail,
            tp.process_seq
        FROM
            t_process_flow tp
        JOIN
            t_process_master tpm ON tp.process_code = tpm.process_code
        JOIN
            t_work_inst twi ON tp.prod_code = twi.prod_code
        WHERE
            twi.work_inst_code = ?
        ORDER BY
            tp.process_seq ASC;
`;
//설비
const getEquipmentByProcess = `
SELECT
    te.equi_code,
    te.equi_name,
    te.equi_status
FROM
    t_equipment te
WHERE
    te.equi_type = (SELECT tpm.equi_type FROM t_process_master tpm WHERE tpm.process_code = ?)
`;

//작업지시상세 조회


module.exports={
    getProcessFlowByWorkInst,
    getEquipmentByProcess,
    workProcessInsertProced,
    deleteWorkProcessByworkInstCode,
    updateWorkProcessByWorkInstCode,
}