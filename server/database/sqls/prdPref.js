

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
        ,?
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
//자재출고,홀드 업데이트 전 작업지시별 홀드조회

 const getWorkInstMaterials= `
        SELECT 
            material_code,
            hold_qty,
            lot_code,
            hold_id,       
            use_yn,
            work_inst_code
        FROM t_hold 
        WHERE work_inst_code = ?
        AND   use_yn = '0b1b'
`;




//자재출고
const materialReleaseForProcess =`
INSERT INTO t_material_release(work_inst_code
                                ,release_qty
                                ,process_code
                                ,material_code
                                ,lot
                                ,work_perf_code
                                ,hold_id)
VALUES(
                                ?
                                ,?
                                ,?
                                ,?
                                ,?
                                ,?
                                ,?)                               
`
//자재홀드 없데이트
const updateMaterialHold=
`
UPDATE t_hold
SET ?
WHERE hold_id=?`;

//마지막공정 반제품출고
const insertSemiProdOut = `
INSERT INTO t_semi_prod_out(semi_release_code
                                ,release_date
                                ,release_qty
                                ,perf_type
                                ,perf_code
                                ,prod_code
                                ,lot)

VALUES(                          ?
                                ,?
                                ,?
                                ,?
                                ,?
                                ,?
                                ,?
)
`;

const updateMaterialHoldUseYn =
`UPDATE t_hold
SET use_yn = ?     
WHERE hold_id = ?`;  

const updateWorkInstStatus =`
UPDATE t_work_inst
SET ?              
WHERE work_inst_code = ?;
`;

const getWorkInstDetailsForCompletion =`
SELECT
    work_inst_code, 
    inst_qty,       
    inst_state,    
    prod_plan_code 
FROM t_work_inst
WHERE work_inst_code = ?;
`;

const getProdPlanByWorkInst =`
SELECT
    prod_plan_code, 
    prod_qty,      
    order_detail_code      
FROM t_prod_plan
WHERE work_inst_code = ?; 
`;
//작업공정의 작업
// 생산계획업데이트(완료여부 Y update)

//주문테이블(주문서상태 생산완료) 
const updateOrderListStatus=`
UPDATE t_order_detail
SET state = ? 
WHERE order_detail_code = ?;
`; 
const getMaterialHoldForRelease=`
SELECT
    hold_id,        
    hold_qty,     
    release_qty,      
    use_yn         
FROM
    t_hold         
WHERE
    work_inst_code = ?     
    AND material_code = ?  
    AND lot_code = ?     
    AND use_yn IN ('0b1b', '0b2b');
`;

const updateProdPlanComplete=`
UPDATE t_prod_plan
SET
    complete= 'Y',        
 
WHERE
    prod_plan_code = ?

`;
const updateOrderDetailStatus=`
UPDATE t_order_detail
SET
    order_detail_state = ?   
WHERE
    order_detail_code = ?
`

//생산작업이력조회를 위한 쿼리
const selectworkProcessPref=`
SELECT work_perf_code,
        work_inst_code,
        work_process_code,
        input_qty,
        prod_qty,
        defect_qty,
        work_inst_reg_date,
        emp_num,
        equi_code
FROM t_inst_perf
`;

module.exports={
        inOunSoInboundForProcess,
        getSemiProdCodesFromBomView,
        insertPrdPref,
        selectWorkProcess,
        updateWorkProcess,
        inSemiPrdForProcess,
        getWorkInstMaterials,
        materialReleaseForProcess,
        updateMaterialHold,
        insertSemiProdOut,
        updateMaterialHoldUseYn,
        updateWorkInstStatus,
        getWorkInstDetailsForCompletion,
        getProdPlanByWorkInst,
        updateOrderListStatus,
        getMaterialHoldForRelease,
        updateProdPlanComplete,
        updateOrderDetailStatus,
        selectworkProcessPref
}