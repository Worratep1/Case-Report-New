const pool = require("../config/db");

// Controller สำหรับเพิ่ม Game / Product ใหม่
exports.addproducts  = async (req, res) => {
  const { product_name } = req.body;

  // 1) เช็คว่าผู้ใช้ส่งชื่อเกมมาหรือยัง
  if (!product_name || product_name.trim() === "") {
    return res.status(400).json({ message: "กรุณากรอกชื่อเกม" });
  }
  if (product_name.length>100){
    return res.status(400).json({
      message:"ชื่อยาวเกินไป (ต้องไม่เกิน 100 ตัวอักษร)"
    })
  }

  try {
      // 2) เช็คว่ามีชื่อ product นี้ในระบบแล้วหรือยัง (กันข้อมูลซ้ำ)
    const checkproducts = await pool.query(
      "SELECT * FROM products WHERE   product_name = $1",
      [product_name.trim()]
    );

    if (checkproducts.rows.length > 0) {
      return res.status(409).json({ message: "มีชื่อนี้อยู่ในระบบแล้ว" });
    }
      // 3) ถ้ายังไม่มี -> INSERT ลงตาราง products
    const newProduct = await pool.query(
      "INSERT INTO products (product_name) VALUES ($1) RETURNING *",
      [product_name.trim()]
    );
    // 4) ตอบกลับไปให้ Front-end ทราบว่าเพิ่มสำเร็จ
    return res.status(201).json({
      message: "เพิ่มใหม่สำเร็จ",
      product: newProduct.rows[0],
    });
  } catch (err) {
    console.error("Error in addGame", err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบไม่สามารภเพิ่มได้" });
  }
};

//ดึงรายการ Game / Products ทั้งหมด
exports.getproducts = async (req, res) => {
  try {
    const products = await pool.query(
      "SELECT * FROM products ORDER BY product_id ASC");
    return res.json({
      products: products.rows,
    });
  } catch (err) {
    console.error("Error in getproducts", err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบไม่สามารถดึงข้อมูลได้" });


  }
};


// ลบ Product ตาม id (ลบออกจากตารางจริง ๆ - hard delete)
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;  // ดึงมาจาก /products/:id

  // 1) เช็คว่า front ส่ง id มาจริงไหม
  if (!id) {
    return res.status(400).json({ message: "กรุณาระบุ product_id" });
  }

  try {
    // 2) ลบออกจากตาราง products เลย
    const result = await pool.query(
      `DELETE FROM products
       WHERE product_id = $1
       RETURNING product_id, product_name`,
      [id]
    );

    // ถ้า rowCount = 0 แปลว่าไม่เจอ id นี้
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "ไม่พบ Product ที่ต้องการลบ" });
    }

    // 3) ตอบกลับว่าลบสำเร็จ พร้อมข้อมูลที่ถูกลบ
    return res.json({
      message: "ลบสำเร็จ",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("Error in deleteProduct:", err);
    return res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในระบบ ไม่สามารถลบ Product ได้" });
  }
};

// แก้ไข Product ตาม id , name (แก้ไขข้อมูลจริง ๆ ในตาราง - hard update)
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { product_name } = req.body;

  // validation
  if (!product_name) {
    return res.status(400).json({ message: "กรุณากรอกชื่อ product_name" });
  }

  // ตรวจสอบว่ามี product ที่จะอัปเดตหรือไม่
  try {
    const result = await pool.query(
      `UPDATE products
       SET product_name = $1
       WHERE product_id = $2
       RETURNING product_id, product_name`,
      [product_name, id]
    );
      // ถ้า rowCount = 0 แปลว่าไม่เจอ id นี้
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "ไม่พบที่ต้องการแก้ไข" });
    }

    return res.json({
      message: "แก้ไขสำเร็จ",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("Error update product:", err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาด ไม่สามารถแก้ไขได้" });
  }
};
