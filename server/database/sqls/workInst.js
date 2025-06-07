
// 각 변수별로 SQL문을 등록할 떄 백틱(``)을 사용하는 이유는 줄바꿈 허용을 허용하기 떄문.
// ( 따옴표는 줄을 바꿀 경우 값이 깨지면서 에러발생 )

// 조건없이 전체조회
//작성할 때 백틱`` 사용.
const selectProdPlansList =
`SELECT
            pp.prod_plan_code,
            pp.prod_code,
            od.prod_name,
            pp.prod_qty,
            pp.reg_date,
            od.dead_date
        FROM
            t_prod_plan pp
        LEFT JOIN
            t_order_detail od ON pp.order_detail_code = od.order_detail_code
        WHERE
            pp.complete = 'N'`;

// 등록

module.exports = {
    selectProdPlansList,

}

