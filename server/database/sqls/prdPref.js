

//인서트 된값을 input_qty 셀렉해서 들고온 
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

//반제품 입고전 
//반제품 입고 
const inSemiPrdForProcess=`
 INSERT INTO t_semi_prod_in (
                                semi_inbound_code
                                ,inbound_date
                                ,inbound_qty
                                ,perf_type
                                ,perf_code
                                ,prod_code
                        )
VALUES(
        ?
        ,NOW()
        ,?
        ,'0y1y'
        ,?
        ,?
)
`


//외주발주테이블 입고
const inOunSoInboundForProcess=
`
INSERT INTO t_outsou_order(
                                outsou_order_code
                                ,work_process_code
                                ,prod_code
                                ,order_qty
                                ,release_state
                                ,reg_date
                                 ,cp_code
                           )
VALUES(
                                ?
                                ,?
                                ,?
                                ,?
                                ,'0o1o'
                                ,NOW()
                                ,NULL



)
`
// // --- 새로운 쿼리: `v_bom_codes` 뷰를 사용하여 완제품 코드로부터 봉제/재단 반제품 코드 조회 ---
    // `details.prod_code`로 가져옴 
 const getSemiProdCodesFromBomView= `
        SELECT
            bongban_code,
            jaeban_code
        FROM v_bom_codes
        WHERE wan_code = ?;
    `;
    
const getMaterialHoldForRelease=`


`
module.exports={
        inOunSoInboundForProcess,
        getSemiProdCodesFromBomView,
        insertPrdPref,
        selectWorkProcess,
        updateWorkProcess,
        inSemiPrdForProcess,
        getMaterialHoldForRelease
}