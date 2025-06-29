//전체조회
const selectQualityList = 
`
SELECT quality_code 
	, test_name 
      , test_target 
	, test_ref
      , use_yn
FROM t_quality
WHERE ((? IS NULL OR ? = '') OR test_name LIKE CONCAT('%', ?, '%'))
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
      , use_yn
      , (SELECT file_path 
         FROM images 
         WHERE code = quality_code) AS ref_img
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
      , test_name
      , test_target 
      , test_method 
      , test_ref 
      , test_standard
FROM   t_quality_history
WHERE  quality_code = ?
ORDER BY quality_ver
`;

//코드 생성 프로시저
const createCodeProc =
`
CALL createcode_proc(?, ?, ?, @new_code);
SELECT @new_code AS newCode;
`;

//갱신 프로시저
const renewQuality = 
`
CALL quality_copy_proc(?, @msg);
SELECT @msg AS msg;
`;

//이미지 등록
const insertImages = 
`
INSERT INTO images (code, file_name, original_name, file_path)
VALUES (?, ?, ?, ?)
`;

//이미지 수정
const updateImgInfo = 
`
UPDATE images 
SET ?
WHERE  code = ?
`;

//이미지 있는지 조회
const selectIfImgfind = 
`
SELECT code 
FROM   images 
WHERE  code = ?
`;

//공통코드 조회(groupcode)
const groupCodeSearch = `
SELECT group_name, detail_code, detail_name 
FROM   v_groupcode
WHERE  group_code LIKE CONCAT('%', ?, '%')
`;

//공통코드 상세 조회(detailcode)
const detailCodeSearch = `
SELECT detail_code, detail_name 
FROM   v_groupcode
WHERE  detail_code LIKE CONCAT('%', ?, '%')
`;

module.exports = {
  selectQualityList 
  , selectQualityInfo
  , insertQualityinfo 
  , updateQualityinfo
  , selectQualityHistory
  , createCodeProc
  , renewQuality
  , insertImages
  , updateImgInfo
  , groupCodeSearch
  , detailCodeSearch
  , selectIfImgfind
}