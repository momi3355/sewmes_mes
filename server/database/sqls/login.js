const loginCheck = 
`SELECT dept,
        emp_num,
        emp_name,
        login_pw
FROM t_employees
WHERE emp_num = ? AND login_pw = ?`

module.exports={
  loginCheck,
}