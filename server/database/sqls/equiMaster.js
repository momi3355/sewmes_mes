//설비 전체조회
const selectEquiList = 
`
SELECT equi_code 
     , equi_name 
     , equi_type 
     , use_yn
     , equi_note 
     , install_date
     , last_check
     , check_date
FROM   t_equipment
WHERE  ((? IS NULL OR ? = '') OR equi_name LIKE CONCAT('%', ?, '%'))
  AND  ((? IS NULL OR ? = '') OR equi_type = ?)
  AND (
        (? IS NULL OR ? = '' OR ? = '') 
        OR (
            ? = '0v1v' AND install_date BETWEEN ? AND ?
        )
        OR (
            ? = '0v2v' AND last_check BETWEEN ? AND ?
        )
        OR (
            ? = '0v3v' AND check_date BETWEEN ? AND ?
        )
    )
`;


//설비 단건조회
const selectEquiInfo = 
`
SELECT equi_code 
       , equi_name 
       , model_name 
       , maker 
       , make_date 
       , install_date 
       , equi_type 
       , last_check 
       , check_date 
       , check_interval 
       , equi_status 
       , use_yn 
       , equi_note 
       , (SELECT file_path 
         FROM images 
         WHERE code = equi_code) AS equi_img
FROM   t_equipment 
WHERE  equi_code = ?
`;

//설비 등록
const insertEquiInfo = 
`
INSERT t_equipment 
SET    ? 
`;

//설비 수정
const updateEquiInfo = 
`
UPDATE t_equipment 
SET    ?
WHERE  equi_code = ?
`;

//설비이력 조회
const selectEquiHistory = 
`
SELECT equi_code
       , cate 
       , start_date 
       , end_date 
       , history_detail 
       , history_note 
       , emp_num
FROM   t_equi_history
WHERE  equi_code = ?
`;

module.exports = {
 selectEquiList, 
 selectEquiInfo,
 insertEquiInfo,
 updateEquiInfo,
 selectEquiHistory 
}