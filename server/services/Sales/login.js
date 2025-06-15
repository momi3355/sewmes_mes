const mariadb = require("../../database/mapper.js"); // 경로 확인!
// const { loginCheck } = require('../../database/sqls/login');
// const pool = require('../../database/db');
const sql = require('../../database/sqls/login');

async function loginCheck(emp_num, login_pw) {
  let conn;
  try {
    conn = await mariadb.getConnection();

    const rows = await conn.query(sql.loginCheck, [emp_num, login_pw]);
    // mariadb 드라이버는 기본적으로 rows[0]이 meta라서 rows.length >= 1 확인
    if (rows.length > 0) {
      return {
        success: true,
        user: rows[0]  // 첫 번째 결과 반환
      };
    } else {
      return {
        success: false,
        message: '아이디 또는 비밀번호가 일치하지 않습니다.'
      };
    }
  } catch (err) {
    console.error('로그인 중 오류 발생:', err);
    return {
      success: false,
      message: '서버 오류가 발생했습니다.'
    };
  } finally {
    if (conn) conn.release(); // 커넥션 반드시 반납
  }
}
module.exports = { loginCheck };