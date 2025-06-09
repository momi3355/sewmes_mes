// Service에서 필요하면 DB에 접속할 수 있도록 mapper를 가져옴
const mariadb = require("../database/mapper.js");
// 공통으로 사용하는 기능들 중 필요한 함수만 구조분해할당(Destructuring)으로 가져옴
const {
  convertObjToAry
} = require('../utils/converts.js');

// 실제 제공할 서비스 등록 영역

//전체 조회 + 검색 조회
const qualityList = async ({
  test_name,
  test_target,
  test_ref
}) => {
  const params = [
    test_name,
    test_target,
    test_ref,
  ];

  let list = await mariadb.query("selectQualityList", params)
    .catch(err => console.log(err));
  return list;
}

// 단건조회
const qualityOneSelect = async (qualityCode) => {
  let list = await mariadb.query("selectQualityInfo", qualityCode)
    .catch(err => console.log(err));

  let info = list[0];
  return info;
};

// 등록
const qualityAdd = async (qualityInfo) => {
  // 프로시저 결과가 [ [ [ { '@new_code': generatedCode } ] ] ] 형태로 리턴돼서 구조분해할당 사용
  const [
    [
      [{
        '@new_code': generatedCode
      }]
    ]
  ] = await mariadb.query("createCodeProc", [
    't_quality',
    'quality_code',
    'Q'
  ]);

  qualityInfo.quality_code = generatedCode;

  console.log(qualityInfo);
  let resInfo = await mariadb.query("insertQualityinfo", qualityInfo)
    .catch(err => console.log(err));

  let result = null;

  if (resInfo.affectedRows > 0) {
    result = {
      isSuccessed: true,
    }
  } else {
    result = {
      isSuccessed: false
    }
  }
  return result;
}

// 수정
const qualityModify = async (qualityCode, qualityInfo) => {
  let data = [qualityInfo, qualityCode];

  let resInfo = await mariadb.query("updateQualityinfo", data)
    .catch(err => console.log(err));

  let result = null;

  if (resInfo.affectedRows > 0) {
    result = {
      isUpdated: true,
    };
  } else {
    result = {
      isUpdated: false,
    };
  }
  return result;
};


// 갱신
const qualityRenewal = async (qualityInfo) => {
  `test_name
test_target
test_method
test_ref
test_standard
test_note
ref_img
use_yn`

  //트랜잭션 처리...
  const conn = await mariadb.getConnection();

  try {
    await conn.beginTransaction();

    const [[[{ '@msg' : msg }]]] = await conn.query("renewQuality", qualityInfo.qualityCode);
    let result = null;

    if (msg == 'OK') {
      const update = conn.query("updateQualityinfo", qualityInfo);
      
      if (update.affectedRows > 0) {
        result = {
          isSuccessed: true,
        }
      } else {
        result = {
          isSuccessed: false
        }
      }
      return result;
    }
    } catch {

    }

};

//이력조회
const qualityHistoryList = async (qualityCode) => {
  let list = await mariadb.query("selectQualityHistory", quailtyCode)
    .catch(err => console.log(err));
  return list;
};

module.exports = {
  // 해당 객체에 등록해야지 외부로 노출
  qualityList,
  qualityOneSelect,
  qualityAdd,
  qualityModify,
  qualityRenewal,
  qualityHistoryList,
};