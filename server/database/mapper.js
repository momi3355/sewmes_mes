const mariadb = require("mariadb");
const sqlList = require("./sqlList.js");

const connectionPool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_DB,
  connectionLimit: process.env.DB_LIMIT,
  
  multipleStatements: true,
  permitSetMultiParamEntries: true,
  insertIdAsNumber: true,
  bigIntAsNumber: true,

  logger: {
    query: console.log,
    error: console.log,
  },
});

const query = async (alias, values = []) => {
  let executeSql = sqlList[alias];
  let conn;
  try {
    conn = await connectionPool.getConnection();
    let res = await conn.query(executeSql, values);
    return res;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};
const directQuery = async (sql, params = []) => {
  const conn = await connectionPool.getConnection();
  try {
    return await conn.query(sql, params);
  } finally {
    conn.release();
  }
};
const getConnection = async () => {
  return await connectionPool.getConnection();
};
module.exports = {
  query,
  directQuery,
  getConnection
};
