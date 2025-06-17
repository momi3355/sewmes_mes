


const insertPrdPref=`
INSERT INTO t_inst_perf (
                        work_perf_code
                        ,work_inst_code
                        ,work_process_code
                        ,input_qty
                        ,prod_qty
                        ,defect_qty
                        ,pref_note
                        ,defect_type
                        ,work_inst_reg_date
                        ,emp_num)
VALUES(
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        NOW(),
        ?)

`;

`work_process_code
work_inst_code
work_start_date
work_end_date
equi_code
process_code
inst_qty
defect_qty
input_qty
prod_qty
complete
process_seq`

//업데이트 전 
const selectWorkProcess=
`
SELECT work_process_code
       , work_inst_code
       , work_start_date
       ,   work_end_date
       ,   equi_code
       ,   process_code
       ,   inst_qty
       ,   defect_qty
       ,   input_qty
       ,   prod_qty
       ,   complete
       ,  process_seq

FROM t_work_process
WHERE work_inst_code=?
`
//작업공정 업데이트
const updateWorkProcess=`
 UPDATE t_work_process
 SET ? 
 WHERE work_process_code= ?
`;




module.exports={insertPrdPref,selectWorkProcess,updateWorkProcess}