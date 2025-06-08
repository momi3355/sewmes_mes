const selectProductByConditions = `
    SELECT 
        prod_code,
        prod_name,
        prod_type,
        category,
        use_yn,
        unit,
        color,
        size,
        note
    FROM t_product
    WHERE prod_type = '0k2k'
        /**조건절**/
    ORDER BY CAST(SUBSTRING(prod_code, 2) AS UNSIGNED)
`;
module.exports = {
    selectProductByConditions
}
