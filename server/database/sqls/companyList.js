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
        DATE_FORMAT(first_reg, '%Y-%m-%d') AS first_reg
 FROM   t_company
 WHERE  cls = "0g1g"`


 // 외주업체 가능제품 등록
 const outProdCompany =
 `INSERT INTO t_outsou_order_list (
              outsou_list_code,
              prod_code,
              cp_code)
  VALUES (?, ?, ?)`

  // 외주업체 가능제품 삭제
 const getNextOrderCode =
`SELECT outsou_list_code 
FROM t_outsou_order_list 
ORDER BY outsou_list_code DESC LIMIT 1`

// 외주업체 가능제품 삭제
const outProdCompanyDelect =
`DELETE FROM t_outsou_order_list WHERE outsou_list_code = ?`

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

// 외주(봉제) 제품 조회
const bongJaeProd = `
  SELECT prod_code,
         prod_name,
         category,
         color,
         size
  FROM t_product
  WHERE prod_name LIKE '%봉제%'
`;

module.exports = {
  companyListCheck,
  companyDropDown,
  outCompany,
  outProdCompany,
  yesOutProdList,
  getNextOrderCode,
  bongJaeProd,
  outProdCompanyDelect,
}




