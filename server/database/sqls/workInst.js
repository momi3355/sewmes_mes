
// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )

// 조건없이 전체조회
//작성할 때 백틱`` 사용.
const selectProdPlansList =
`SELECT
            pp.prod_plan_code,
            pp.prod_code,
            pp.prod_qty,
            pp.reg_date,
            od.dead_date
        FROM
            t_prod_plan pp
        LEFT JOIN
            t_order_detail od ON pp.order_detail_code = od.order_detail_code
        WHERE
            pp.complete = ?`;

// 작업지시서 등록(새로운 작업지시 생성)
const insertWorkInstList =
`INSERT INTO t_work_inst (
    work_inst_code,                                                                                                                                                                                 
    prod_plan_code,
    bom_code,
    inst_qty,
    inst_date,
    prod_code,
    emp_num,
    inst_reg_date,
    inst_state    
)VALUES(?,?,?,?,?,?,?,?,?)`;

//bom_code를 조회
const selectBomByProdCode=
`SELECT bom_code
FROM t_bom
WHERE prod_code=?
`;
//가장큰 작업지시 코드 조회
const selectMaxWorkInstCode=
`SELECT MAX(work_inst_code) AS max_code
FROM t_work_inst
WHERE work_inst_code LIKE 'I%'
`;
module.exports = {
    selectProdPlansList,
    insertWorkInstList,
    selectBomByProdCode,
    selectMaxWorkInstCode,
}

