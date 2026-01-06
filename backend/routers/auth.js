const express = require('express');
const multer = require('multer');
const router = express.Router();
const {register} =require("../controllers/register");
const {getuser} = require("../controllers/register");
const {getUserById} = require("../controllers/register");
const {updateUser} = require("../controllers/register");
const {deleteUser} = require("../controllers/register");
const {login} =require("../controllers/login");
const {addproducts} = require("../controllers/products");
const {getproducts} = require("../controllers/products");
const {deleteProduct} = require("../controllers/products");
const {updateProduct} = require("../controllers/products");
const {createRecipient} = require("../controllers/recipients");
const {getRecipients} = require("../controllers/recipients");
const {updateRecipient} = require("../controllers/recipients");
const {deleteRecipient} = require("../controllers/recipients");
const {createCase,getCases,getCaseById , deleteCase ,updateCase} = require("../controllers/case");
const {getStatuses} = require("../controllers/statuses");
const {getproblems} = require("../controllers/problems");
const {sendDailyReport } = require("../controllers/email");
const upload = multer({ storage: multer.memoryStorage() });
const authMiddleware = require("../middleware/authMiddleware");
const exportReport = require("..//controllers/exportreport");
// const upload = multer({ storage: multer.memoryStorage() }); // 💡 ตั้งค่าให้เก็บไฟล์ไว้ในหน่วยความจำชั่วคราว





router.post("/login", login); // เส้นทางสำหรับล็อกอินผู้ใช้

router.use(authMiddleware);

router.post("/products",addproducts); // เส้นทางสำหรับการเพิ่มสินค้า
router.get("/products",getproducts); // เส้นทางสำหรับการดึงสินค้าทั้งหมด
router.delete("/products/:id",deleteProduct); // เส้นทางสำหรับการลบสินค้าตาม id
router.put("/products/:id",updateProduct); // เส้นทางสำหรับการแก้ไขสินค้าตาม id
router.get("/users", getuser); // เส้นทางสำหรับดึงข้อมูลผู้ใช้ทั้งหมด

router.post("/register", register); // เส้นทางสำหรับการลงทะเบียนผู้ใช้
router.get("/users/:id", getUserById); // เส้นทางสำหรับดึงข้อมูลผู้ใช้ตาม id
router.put("/users/:id", updateUser); // เส้นทางสำหรับแก้ไขข้อมูลผู้ใช้ตาม id
router.delete("/users/:id", deleteUser); // เส้นทางสำหรับลบผู้ใช้ตาม id

router.post("/recipients", createRecipient); // เส้นทางสำหรับการเพิ่มรายชื่อผู้รับ
router.get("/recipients", getRecipients); // เส้นทางสำหรับดึงรายชื่อผู้รับทั้งหมด
router.put("/recipients/:id", updateRecipient);
router.delete("/recipients/:id", deleteRecipient); // เส้นทางสำหรับลบรายชื่อผู้รับตาม id

router.post("/cases", createCase); // เส้นทางสำหรับการสร้างเคสใหม่
router.get("/cases", getCases); // เส้นทางสำหรับดึงเคสทั้งหมด หรือ ดึงเคสตามวันที่
router.get("/cases/:id", getCaseById); // เส้นทางสำหรับดึงเคสตาม id
router.delete("/cases/:id", deleteCase); // เส้นทางสำหรับลบเคสตาม id
router.put("/cases/:id", updateCase); // เส้นทางสำหรับแก้ไขเคสตาม id

router.get("/statuses", getStatuses); // เส้นทางสำหรับดึงสถานะทั้งหมด

router.get("/problems", getproblems); // เส้นทางสำหรับดึงปัญหาทั้งหมด

// router.post("/sendmail",sendDailyReport)
// 💡 แก้ไข: เพิ่ม middleware ของ Multer (upload.array('files')) เข้าไป
// router.post("/sendmail",upload.array("attachments", 5),sendDailyReport);

router.post('/sendmail', upload.fields([
    { name: 'attachments', maxCount: 5 },  // รับไฟล์แนบสูงสุด 5 ไฟล์
    { name: 'reportImage', maxCount: 1 }   // รับรูป Screenshot 1 รูป
]), sendDailyReport);

router.get("/exportreport",exportReport.exportReport)


module.exports = router;
