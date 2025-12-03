import client from "./client";

// GET
export async function getproducts() {
  const res = await client.get("/products");
  return res.data;
}

// POST
export async function addproducts(productName) {
  const res = await client.post("/products", { product_name: productName });
  return res.data;
}

// PUT
export async function updateProduct(id, newName) {
  const res = await client.put(`/products/${id}`, { product_name: newName });
  return res.data;
}

// DELETE
export async function deleteProduct(id) {
  const res = await client.delete(`/products/${id}`);
  return res.data;
}
