// 조회
const companyListCheck = 
`SELECT cp_code,
        cp_num,
        cp_name,
        cp_tel,
        cp_manager,
        cp_ceo,
        address,
        refion,
        first_reg,
        note,
        cls,
        use_yn
FROM t_company`

const companyDropDown =
`SELECT cp_name,
        cp_tel,
        address
FROM t_company
WHERE cls = "0g3g"`

module.exports = {
  companyListCheck,
  companyDropDown
}