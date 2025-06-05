const selectProcessList =
`SELECT process_code
        , process_name
        , detail
        , equi_type
        , need_time
        , process_type
        , use_yn
FROM t_process_master
ORDER BY process_code`;

module.exports = {
    selectProcessList

}
