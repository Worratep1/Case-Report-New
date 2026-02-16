import client from "./client";

// GET
export async function getproducts() {
  const res = await client.get("/products");
  return res.data;
}

// POST
export async function addproducts(name, category) {
  const res = await client.post("/products", {
    product_name: name,
    product_category: category,
  });
  return res.data;
}

// PUT
export async function updateProduct(id, name, category) {
  const res = await client.put(`/products/${id}`, {
    product_name: name,
    product_category: category,
  });
  return res.data;
}

// DELETE
export async function deleteProduct(id) {
  const res = await client.delete(`/products/${id}`);
  return res.data;
}
