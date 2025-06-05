// 날짜를 지정한 포맷에 맞춰 반환
const dateFormat =function(value, format) {
  // value : 문자열로 된 날짜
  // format : 출력 포맷 ( 년도는 yyyy, 월은 MM 일은 dd로 표시)
  // value가 null인 경우엔 오늘을 값으로 가지도록 함
  let date =value ==null ? new Date() :new Date(value);
  // 4자리로 표시하는 년도
  let year =date.getFullYear();
  // 2자리로 표시하는 월
  let month =("0"+(date.getMonth() +1)).slice(-2);
  // 2자리로 표시하는 일
  let day =("0"+date.getDate()).slice(-2);
  // 요청한 출력 포맷 중 각 항목(년도, 월, 일)에 해당하는 값들로 대체
  let result =format.replace("yyyy", year)
                      .replace("MM", month)
                      .replace("dd", day);
  return result;
 };
 export default{
  dateFormat,
 };