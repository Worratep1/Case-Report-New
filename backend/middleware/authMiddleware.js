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
    // Token หมดอายุ ไม่ต้อง
    if (err.name === "TokenExpiredError") {
      
      console.log(`[Auth] Token expired for session at ${new Date().toLocaleTimeString()}`);

      return res.status(401).json({
        message: "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่",
        code: "TOKEN_EXPIRED",
      });
    }


    // ถ้าเป็น Error อื่นๆ (เช่น Token ปลอม หรือโดนแก้) ค่อย Log ข้อความ Error
    console.error("authMiddleware error:", err.message);
    return res.status(401).json({
      message: "Token ไม่ถูกต้อง",
    });
  }
};
