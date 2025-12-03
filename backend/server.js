const express = require("express");
const cors = require("cors");
require("dotenv").config(); // โหลดตัวแปรจาก .env
const pool = require("./config/db"); // นำเข้า pool จากไฟล์ db.js
const app = express();
const PORT = process.env.PORT; // ใช้พอร์ตจาก .env หรือ 3000 เป็นค่าเริ่มต้น
const auth = require("./routers/auth");
const {readdirSync} = require("fs");
const bycrypt = require("bcryptjs");


// Middleware
app.use(cors()); 
app.use(express.json());//ให้serverอ่านค่าjsonได้


// app.use('/api/auth', authRoutes);


app.get("/", (req, res) => {
    res.send("API is running...");
});


readdirSync("./routers").map((r) => app.use("/api", require("./routers/" + r)));

app.get("/test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()"); // ตัวอย่างการ query
        res.json({
            status:"success",
            message:"Database connected",
            time: result.rows[0].now
        });
    }catch (err) {
        console.error(err);
        res.status(500).json({
            status:"error",
            message:"Database connection failed"
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}` );
})