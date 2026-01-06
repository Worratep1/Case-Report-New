const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "ไม่มีสิทธิ์เข้าถึง (ไม่พบ token) ",
      });
    }

    const token = authHeader.split(" ")[1];

    // verify token ด้วย SECRET ใน .env
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    // เก็บข้อมูล user จาก token ไว้ใน req.user

    req.user = decode;

    next();
  } catch (err) {
    console.error("authMiddleware error:", err);
    return res.status(401).json({
      message: "Token ไม่ถูกต้องหรือหมดอายุเเล้ว",
    });
  }
};
