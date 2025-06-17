// 조회
const companyListCheck = 
`SELECT cp_code,
        cp_num,
        cp_name,
        cp_tel,
        cp_manager,
        cp_ceo,
        address,
        region,
        first_reg,
        note,
        cls,
        use_yn
FROM t_company`

const companyDropDown =
`SELECT cp_name,
        cp_code,
        cp_tel,
        address
FROM t_company
WHERE cls = "0g3g"`

// 외주업체 만 출력
const outCompany =
`SELECT cp_code,
        cp_name,
        region,
        use_yn,
        first_reg
 FROM   t_company
 WHERE  cls = "0g1g"`


 // 외주업체 가능제품 등록
 const outProdCompany =
 `INSERT INTO t_outsou_order_list (
              outsou_list_code,
              prod_code,
              cp_code)
  VALUES (?, ?, ?)`

 const getNextOrderCode =
`SELECT outsou_list_code 
FROM t_outsou_order_list 
ORDER BY outsou_list_code DESC LIMIT 1`

  // 해당 외주업체 의 가능외주제품 조회
 const yesOutProdList =
`SELECT b.prod_code,
        b.prod_name,
        b.category,
        b.color,
        b.size
FROM t_outsou_order_list a join t_product b
ON a.prod_code = b.prod_code
WHERE a.cp_code = ?`

// 업체별 외주가능제품 삭제
const yesOutProdDelite =
`DELETE FROM t_outsou_order_list WHERE cp_code = ? AND prod_code = ?`

module.exports = {
  companyListCheck,
  companyDropDown,
  outCompany,
  outProdCompany,
  yesOutProdList,
  getNextOrderCode,
  yesOutProdDelite
}




