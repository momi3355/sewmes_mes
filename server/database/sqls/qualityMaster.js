//전체조회
const selectQualityList = 
`
SELECT quality_code 
	, test_name 
      , test_target 
	, test_ref
FROM t_quality
WHERE use_yn = '0b1b'
AND ((? IS NULL OR ? = '') OR test_name LIKE CONCAT('%', ?, '%'))
AND ((? IS NULL OR ? = '') OR test_target LIKE CONCAT('%', ?, '%'))
AND ((? IS NULL OR ? = '') OR test_ref LIKE CONCAT('%', ?, '%'))
`;

//단건조회
const selectQualityInfo = 
`
SELECT quality_code
      , test_name 
      , test_target 
      , test_method 
      , test_ref 
      , test_standard 
      , test_note 
      , ref_img
      , use_yn
FROM   t_quality
WHERE  quality_code = ?
`;

//등록
const insertQualityinfo = 
`
INSERT t_quality
SET ?
`;

//수정
const updateQualityinfo = 
`
UPDATE t_quality
SET ? 
WHERE quality_code = ?
`;

//품질이력조회
const selectQualityHistory = 
`
SELECT quality_ver 
      , test_target 
      , test_method 
      , test_ref 
      , test_standard
      , test_note
FROM   t_quality_history
WHERE  quality_code = ?
`;

//코드 생성 프로시저
const createCodeProc =
`
CALL createcode_proc(?, ?, ?, @new_code) 
SELECT @new_code
`;

//갱신 프로시저
const renewQuality = 
`
CALL quality_copy_proc(?, @msg)
SELECT @msg
`;

module.exports = {
  selectQualityList 
  , selectQualityInfo
  , insertQualityinfo 
  , updateQualityinfo
  , selectQualityHistory
  , createCodeProc
  , renewQuality
}