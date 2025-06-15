



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



module.exports={
    getProcessFlowByWorkInst,
    getEquipmentByProcess,
}