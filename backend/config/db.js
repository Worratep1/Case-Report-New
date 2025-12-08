const {Pool} = require('pg')
require("dotenv").config(); // เราใช้ dotenv เพื่ออ่านไฟล์ .env 

const pool = new Pool({ //ดึงค่าจาก .env
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

pool.on("error", (err) => { //ดักจับ error หากต่อ Database ไม่ได้
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
});
module.exports = pool; // export ตัวแปร pool ออกไปใช้ในไฟล์อื่น ๆ

