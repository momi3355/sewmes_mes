
// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )

// 조건없이 전체조회
//작성할 때 백틱`` 사용.
//생산계획수량>지시된총수량 모달표시
const selectProdPlansList =
` SELECT
    pp.prod_plan_code,
    pp.prod_code,
    tp.prod_name,
    pp.prod_qty,
    (pp.prod_qty - IFNULL(SUM_TWI.sum_inst_qty, 0)) AS remain_qty, 
    pp.reg_date,
    od.dead_date
FROM
    t_prod_plan pp
JOIN
    t_product tp ON pp.prod_code = tp.prod_code
LEFT JOIN
    t_order_detail od ON pp.order_detail_code = od.order_detail_code
LEFT JOIN (
    SELECT
        twi.prod_plan_code,
        SUM(twi.inst_qty) AS sum_inst_qty
    FROM
        t_work_inst twi
    GROUP BY
        twi.prod_plan_code
) AS SUM_TWI ON pp.prod_plan_code = SUM_TWI.prod_plan_code
WHERE
    pp.prod_qty > IFNULL(SUM_TWI.sum_inst_qty, 0)`;

//작업지시코드 전체 조회
const allworkInstList =
` SELECT
        twi.work_inst_code,
        twi.prod_plan_code,
        twi.prod_code,
        tp.prod_name,
        twi.inst_qty,
        od.dead_date,
        twi.inst_state,
        twi.emp_num,
        twi.inst_reg_date
    FROM
        t_work_inst twi
    LEFT JOIN  -- <<-- 여기를 LEFT JOIN으로 변경!
        t_product tp ON twi.prod_code = tp.prod_code
    LEFT JOIN
        t_prod_plan tpp ON twi.prod_plan_code = tpp.prod_plan_code
    LEFT JOIN
        t_order_detail od ON tpp.order_detail_code = od.order_detail_code
    WHERE 1=1
    ORDER BY twi.inst_reg_date DESC
`;

//작업지시테이블에 작업지시코드가 있는지 확인
const checkWorkInstCode=`
SELECT COUNT(*) AS count FROM t_work_inst WHERE work_inst_code=?
`;

 //작업지시업데이트
 const updateWorkInstList= `
    UPDATE t_work_inst
        SET
            prod_plan_code = ?,
            prod_code = ?,
            bom_code = ?,
            inst_qty = ?,
            inst_state = ?,
            emp_num = ?,
            inst_date = CASE
                            WHEN ? IS NULL OR ? = '' THEN NULL
                            ELSE ?
                        END,
            inst_reg_date = ?
        WHERE work_inst_code = ?
`;  



const deleteHoldSql =
`DELETE FROM t_hold WHERE  work_inst_code=?`;



// 지시코드 클릭 하지 않고 초기 작업지시의 지시상태가 생산전, 생산중인 경우 작업지시서 다건조회

const selectWorkInstListDefault =
` SELECT
            twi.WORK_INST_CODE,
            twi.PROD_CODE,
            tp.PROD_NAME,
            twi.INST_QTY,
            twi.DEAD_DATE,
            twi.INST_STATE,
            twi.EMP_NUM,
            twi.INST_REG_DATE
        FROM
            t_work_inst twi
        JOIN
            t_product tp ON twi.PROD_CODE = tp.PROD_CODE
        WHERE
            twi.INST_STATE IN ('0S1S', '0S2S')
        ORDER BY twi.INST_REG_DATE DESC` ;

 // 작업지시테이블에 제품코드에 맞는  공정흐름도, 설비 조회      




// 작업지시서 등록(새로운 작업지시 생성)
const insertWorkInstList =
 `
        INSERT INTO t_work_inst (
            work_inst_code, prod_plan_code, prod_code, bom_code,
            inst_qty, inst_state, emp_num, inst_date, inst_reg_date
        ) VALUES (
            ?, ?, ?, ?,
            ?, ?, ?,
            CASE
                WHEN ? IS NULL OR ? = '' THEN NULL
                ELSE ?
            END,
            ?
        )
    `;


const selectBomDetailsByBomCode=` SELECT item_code, need  FROM t_bom_detail WHERE bom_code = ?`;

// 생산계획없이 작업지시 생성할 때 bom_code를 조회
const selectBomByProdCode=
`SELECT bom_code
FROM t_bom
WHERE prod_code=?
`;



//가장큰 작업지시 코드 조회(작업지시코드생성함수를 위함임)
const selectMaxWorkInstCode=
`SELECT MAX(work_inst_code) AS max_code
FROM t_work_inst
WHERE work_inst_code LIKE 'I%'
`;
//가장큰 자재홀드테이클 홀드코드 조회
const selectMaxHoldId=
` SELECT MAX(hold_id) AS max_code
        FROM t_hold
        WHERE hold_id LIKE 'H%'
`;


   // 1. 특정 작업지시 코드에 대한 모든 홀드 데이터 조회 (material_code 포함)
  const  selectHoldsByWorkInstCode= `
        SELECT hold_id, material_code, hold_qty
        FROM t_hold
        WHERE work_inst_code = ?
    `;

// FAB 자재의 재고를 입고일 오름차순으로 가져오는 쿼리 (가장 오래된 재고부터)
const selectInboundMaterialsForFab=`
        SELECT
            inbound_code,
            lot,
            inbound_qty,
            stock_status
        FROM t_material_inbound
        WHERE material_code = ? AND inbound_qty > 0 
        ORDER BY inbound_date ASC, inbound_code ASC; 

`;

    // 2. 홀드 데이터 업데이트 쿼리 (hold_id 기준)
   const  updateHold= `
        UPDATE t_hold
        SET
            hold_qty = ?
            ,lot_code = ?
        WHERE
            hold_id = ?
            AND material_code = ? -- 안전을 위해 material_code도 조건에 추가
    `;

    // 3. 홀드 데이터 단일 삭제 쿼리 (hold_id 기준)
  const  deleteHoldById= `
        DELETE FROM t_hold
        WHERE hold_id = ?
    `;


   const  insertSingleHold= `
        INSERT INTO t_hold (hold_id, material_code, hold_qty, work_inst_code,use_yn,lot_code,release_qty)
        VALUES (?, ?, ?, ?,'0b2b',?,0)
    `;
    const callCreateCodeProcForHoldId = `
    CALL createcode_proc('t_hold', 'hold_id', 'H', @newHoldId);
    SELECT @newHoldId AS new_hold_id;
`;

const selectWorkInstState = `
    SELECT inst_state
    FROM t_work_inst
    WHERE work_inst_code = ?
`;

// 2. 특정 작업지시와 관련된 자재 홀드 삭제
const deleteHoldsByWorkInstCode = `
    DELETE FROM t_hold
    WHERE work_inst_code = ?
`;

// 3. 작업지시 자체 삭제
const deleteWorkInst = `
    DELETE FROM t_work_inst
    WHERE work_inst_code = ?
`;


//작업지시 테이블 bom_code로 소요량 조회회
module.exports = {
    selectProdPlansList,
    allworkInstList,
    deleteHoldSql,
    checkWorkInstCode,
    updateWorkInstList,
    selectWorkInstListDefault,
    insertWorkInstList,
    selectBomByProdCode,
    selectMaxWorkInstCode,
    selectBomDetailsByBomCode,
    selectMaxHoldId,
    selectHoldsByWorkInstCode,
    updateHold,
    deleteHoldById,
    insertSingleHold,
    callCreateCodeProcForHoldId,
    selectWorkInstState,
    deleteHoldsByWorkInstCode,
    deleteWorkInst,
    selectInboundMaterialsForFab,
}
