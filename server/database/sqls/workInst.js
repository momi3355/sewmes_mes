// 각 변수별로 SQL문을 등록할 때 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 때문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )

// --- 생산 계획 및 작업 지시 조회 ---
// 생산 계획 조회 (생산계획수량 > 지시된총수량 모달 표시용)
const selectProdPlansList =
`SELECT
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

// 작업지시코드 전체 조회
const allworkInstList =
`SELECT
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
LEFT JOIN
    t_product tp ON twi.prod_code = tp.prod_code
LEFT JOIN
    t_prod_plan tpp ON twi.prod_plan_code = tpp.prod_plan_code
LEFT JOIN
    t_order_detail od ON tpp.order_detail_code = od.order_detail_code
WHERE 1=1
ORDER BY twi.inst_reg_date DESC
`;

// 지시코드 클릭 하지 않고 초기 작업지시의 지시상태가 생산전, 생산중인 경우 작업지시서 다건조회
const selectWorkInstListDefault =
`SELECT
    twi.WORK_INST_CODE,
    twi.PROD_CODE,
    tp.PROD_NAME,
    twi.INST_QTY,
    twi.INST_STATE,
    twi.EMP_NUM,
    twi.INST_REG_DATE
FROM
    t_work_inst twi
JOIN
    t_product tp ON twi.PROD_CODE = tp.PROD_CODE
WHERE
    twi.INST_STATE IN ('0S1S', '0S2S')
ORDER BY twi.INST_REG_DATE DESC`;

// --- 작업 지시 상태 및 BOM 관련 ---
// 작업지시테이블에 작업지시코드가 있는지 확인
const checkWorkInstCode = `
SELECT COUNT(*) AS count FROM t_work_inst WHERE work_inst_code = ?
`;

// 생산계획없이 작업지시 생성할 때 bom_code를 조회
const selectBomByProdCode =
`SELECT bom_code
FROM t_bom
WHERE prod_code = ?
`;

// 작업지시 테이블 bom_code로 소요량 조회 (item_code를 통해 실제 품목 유형 조회)


// ... (sqlList 객체의 다른 쿼리들) ...

// 작업지시 테이블 bom_code로 소요량 조회 (t_bom_detail.item_type 활용)
// 여러 번의 LEFT JOIN을 사용하여 다단계 BOM을 펼칩니다 (최대 5단계 깊이 가정).
// ... (sqlList 객체의 다른 쿼리들) ...

// const selectBomDetailsByBomCode = `
// SELECT
//     COALESCE(tm5.material_code, tp5.prod_code,
//              tm4.material_code, tp4.prod_code,
//              tm3.material_code, tp3.prod_code,
//              tm2.material_code, tp2.prod_code,
//              tm1.material_code, tp1.prod_code) AS item_code,
//     COALESCE(tm5.material_type, tp5.prod_type,
//              tm4.material_type, tp4.prod_type,
//              tm3.material_type, tp3.prod_type,
//              tm2.material_type, tp2.prod_type,
//              tm1.material_type, tp1.prod_type) AS item_actual_type,

//     SUM(
//         tbd1.need * ? *
//         COALESCE(tbd2.need, 1) *
//         COALESCE(tbd3.need, 1) *
//         COALESCE(tbd4.need, 1) *
//         COALESCE(tbd5.need, 1)
//     ) AS required_qty
// FROM
//     t_bom_detail tbd1
// LEFT JOIN
//     t_product tp1 ON tbd1.item_code = tp1.prod_code
// LEFT JOIN
//     t_material tm1 ON tbd1.item_code = tm1.material_code
// WHERE
//     tbd1.bom_code = ?

// LEFT JOIN t_bom t_bom2
//     ON tbd1.item_type = '0k1k' AND tbd1.item_code = t_bom2.prod_code
// LEFT JOIN t_bom_detail tbd2 ON t_bom2.bom_code = tbd2.bom_code
// LEFT JOIN t_product tp2 ON tbd2.item_code = tp2.prod_code
// LEFT JOIN t_material tm2 ON tbd2.item_code = tm2.material_code

// LEFT JOIN t_bom t_bom3
//     ON tbd2.item_type = '0k1k' AND tbd2.item_code = t_bom3.prod_code
// LEFT JOIN t_bom_detail tbd3 ON t_bom3.bom_code = tbd3.bom_code
// LEFT JOIN t_product tp3 ON tbd3.item_code = tp3.prod_code
// LEFT JOIN t_material tm3 ON tbd3.item_code = tm3.material_code

// LEFT JOIN t_bom t_bom4
//     ON tbd3.item_type = '0k1k' AND tbd3.item_code = t_bom4.prod_code
// LEFT JOIN t_bom_detail tbd4 ON t_bom4.bom_code = tbd4.bom_code
// LEFT JOIN t_product tp4 ON tbd4.item_code = tp4.prod_code
// LEFT JOIN t_material tm4 ON tbd4.item_code = tm4.material_code

// LEFT JOIN t_bom t_bom5
//     ON tbd4.item_type = '0k1k' AND tbd4.item_code = t_bom5.prod_code
// LEFT JOIN t_bom_detail tbd5 ON t_bom5.bom_code = tbd5.bom_code
// LEFT JOIN t_product tp5 ON tbd5.item_code = tp5.prod_code
// LEFT JOIN t_material tm5 ON tbd5.item_code = tm5.material_code

// WHERE
//     (tbd1.item_type LIKE '0l%'
//     OR tbd2.item_type LIKE '0l%'
//     OR tbd3.item_type LIKE '0l%'
//     OR tbd4.item_type LIKE '0l%'
//     OR tbd5.item_type LIKE '0l%')
// GROUP BY
//     item_code,
//     item_actual_type;
// `;

// 작업지시 상태 조회
const selectWorkInstState = `
SELECT inst_state
FROM t_work_inst
WHERE work_inst_code = ?
`;


// --- 작업 지시 생성, 업데이트, 삭제 ---
// 작업지시서 등록(새로운 작업지시 생성)
const insertWorkInstList =
`INSERT INTO t_work_inst (
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
)`;

// 작업지시 업데이트
const updateWorkInstList = `
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

// 작업지시 자체 삭제
const deleteWorkInst = `
DELETE FROM t_work_inst
WHERE work_inst_code = ?
`;

// --- 코드 생성 및 홀드 관련 ---
// 가장큰 작업지시 코드 조회 (작업지시코드생성함수를 위함)
const selectMaxWorkInstCode =
`SELECT MAX(work_inst_code) AS max_code
FROM t_work_inst
WHERE work_inst_code LIKE 'I%'
`;

// 가장 큰 자재 홀드 테이블 홀드 코드 조회
const selectMaxHoldId =
`SELECT MAX(hold_id) AS max_code
FROM t_hold
WHERE hold_id LIKE 'H%'
`;

// 자재 홀드 ID 생성을 위한 프로시저 호출
const callCreateCodeProcForHoldId = `
CALL createcode_proc('t_hold', 'hold_id', 'H', @newHoldId);
SELECT @newHoldId AS new_hold_id;
`;

// --- 재고 홀드 로직 관련 쿼리 ---

// 특정 작업지시와 관련된 모든 홀드 삭제 (작업지시 업데이트 시 이전 홀드 초기화에 사용)
const deleteHoldsByWorkInstCode = `
DELETE FROM t_hold
WHERE work_inst_code = ?
`;

// 자재 입고 조회 쿼리 (모든 자재 유형에 적용될 수 있도록 이름 변경)
// t_material_inbound 에서 material_code로 재고 LOT 조회 (inbound_date ASC 정렬)
// inbound_qty는 총 입고량, total_hold_qty는 이미 홀드된 양. 실제 가용 수량은 (inbound_qty - total_hold_qty)
const selectInboundMaterialsWithLot = `
SELECT
    inbound_code,
    lot AS lot_code, -- t_hold.lot_code 와 매핑되도록 ALIAS
    inbound_qty,
    total_hold_qty, -- 이미 홀드된 수량
    (inbound_qty - total_hold_qty) AS available_qty -- 실제 가용 수량 계산
FROM t_material_inbound
WHERE material_code = ? AND (inbound_qty - total_hold_qty) > 0
ORDER BY inbound_date ASC, inbound_code ASC;
`;

// 반제품 입고 조회 쿼리 (semi_prod_in에서 입고 건 조회)
// semi_prod_in 에는 `lot` 컬럼이 없으므로 `semi_inbound_code`를 `lot_code`로 사용
// NOTE: semi_prod_in 테이블에 재고 또는 홀드 관련 컬럼(stock_qty, total_hold_qty 등)이 없다면
// inbound_qty를 전체 가용 수량으로 간주합니다. 필요시 테이블 스키마 수정 후 쿼리 조정 필요.
const selectInboundSemiProductsForHold = `
SELECT
    semi_inbound_code,
    prod_code,
    inbound_qty, -- 현재는 이 값을 가용 재고로 사용. 실제 재고 컬럼이 있다면 변경 필요.
    inbound_date
FROM t_semi_prod_in
WHERE prod_code = ? AND inbound_qty > 0
ORDER BY inbound_date ASC, semi_inbound_code ASC;
`;

// t_material_inbound 의 total_hold_qty 업데이트 쿼리 (재고 차감 아님, 홀드 수량 증가)
const updateMaterialInboundHoldQty = `
UPDATE t_material_inbound
SET total_hold_qty = total_hold_qty + ?
WHERE inbound_code = ?;
`;

// t_hold 테이블에 단일 홀드 데이터 삽입 (use_yn을 동적으로 전달)
const insertSingleHold = `
INSERT INTO t_hold (hold_id, material_code, hold_qty, work_inst_code, use_yn, lot_code, release_qty)
VALUES (?, ?, ?, ?, '0b2b', ?, 0) -- release_qty는 0으로 고정
`;

// (참고용) 홀드 데이터 업데이트 쿼리 (현재 사용되지 않으나, 추후 홀드 수량 변경 시 사용 가능)
const updateHold = `
UPDATE t_hold
SET
    hold_qty = ?,
    lot_code = ?
WHERE
    hold_id = ?
    AND material_code = ?
`;

// (참고용) 홀드 데이터 단일 삭제 쿼리 (현재 사용되지 않으나, 특정 홀드 건만 삭제 시 사용 가능)
const deleteHoldById = `
DELETE FROM t_hold
WHERE hold_id = ?
`;


const selectDirectBomDetails = `
SELECT
    tbd.bom_detail_code,
    tbd.need,
    tbd.item_type,
    tbd.item_code,
    tbd.bom_code,
    -- item_code가 제품/반제품이면 t_product의 prod_type을, 자재면 t_material의 material_type을 가져옵니다.
    COALESCE(tp.prod_type, tm.material_type) AS actual_item_type,
    -- item_code가 제품/반제품이면 t_product의 prod_name을, 자재면 t_material의 material_name을 가져옵니다.
    COALESCE(tp.prod_name, tm.material_name) AS item_name,
    -- item_code가 반제품인 경우, 해당 반제품의 BOM 코드를 t_bom 테이블에서 가져옵니다.
    -- (t_bom_detail.item_type이 '0k1k'인 경우에만 유효)
    tb.bom_code AS sub_bom_code
FROM
    t_bom_detail tbd
LEFT JOIN
    t_product tp ON tbd.item_code = tp.prod_code
LEFT JOIN
    t_material tm ON tbd.item_code = tm.material_code
LEFT JOIN
    t_bom tb ON tbd.item_code = tb.prod_code AND tbd.item_type = '0k1k' -- 반제품인 경우에만 BOM 연결
WHERE
    tbd.bom_code = ?;
`;



module.exports = {
    selectProdPlansList,
    allworkInstList,
    checkWorkInstCode,
    updateWorkInstList,
    selectWorkInstListDefault,
    insertWorkInstList,
    selectBomByProdCode,
    selectMaxWorkInstCode,
    // selectBomDetailsByBomCode, // 수정된 쿼리
    selectMaxHoldId,

    deleteHoldsByWorkInstCode, // 작업지시 업데이트 시 이전 홀드 초기화에 사용
    selectInboundMaterialsWithLot, // 자재 (원자재, 부자재, 소모품) LOT 조회
    selectInboundSemiProductsForHold, // 반제품 입고 조회
    updateMaterialInboundHoldQty, // 자재 입고 테이블의 홀드 수량 업데이트
    insertSingleHold, // 홀드 데이터 삽입 (use_yn 동적 전달)
    callCreateCodeProcForHoldId, // 홀드 ID 생성 프로시저 호출

    // 기타
    selectWorkInstState,
    deleteWorkInst,
    selectDirectBomDetails,
    // 참고용 쿼리 (필요시 활성화하여 사용)
    updateHold,
    deleteHoldById,
};