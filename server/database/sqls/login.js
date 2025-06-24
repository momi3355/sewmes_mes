const loginCheck = 
`SELECT dept,
        emp_num,
        emp_name,
        emp_tel
FROM t_employees
WHERE emp_num = ? AND login_pw = ?`

// 로그인 정보 저장
const loginSave =

module.exports={
  loginCheck,
}