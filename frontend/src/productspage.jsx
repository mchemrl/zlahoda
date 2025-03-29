import React, { useState, useEffect } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("All categories");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/get_products")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));

    fetch("http://127.0.0.1:5000/get_categories")
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  const openEditModal = (product) => {
    setSelectedProduct({ ...product });
  };

  const closeEditModal = () => {
    setSelectedProduct(null);
  };

  const handleSaveChanges = () => {
    if (!selectedProduct) return;
    fetch(`http://127.0.0.1:5000/update_product/${selectedProduct.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedProduct),
    })
      .then((response) => response.json())
      .then((updatedProduct) => {
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          )
        );
        closeEditModal();
      })
      .catch((error) => console.error("Error updating product:", error));
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;
    fetch(`http://127.0.0.1:5000/delete_product/${selectedProduct.id}`, {
      method: "DELETE",
    })
      .then(() => {
        setProducts((prevProducts) =>
          prevProducts.filter((p) => p.id !== selectedProduct.id)
        );
        closeEditModal();
      })
      .catch((error) => console.error("Error deleting product:", error));
  };
  const handleFilter = () => {
    fetch("http://127.0.0.1:5000/get_products")
      .then((response) => response.json())
      .then((data) => {
        let filteredProducts = data;
        if (productName.trim()) {
          filteredProducts = filteredProducts.filter((product) =>
            product.product_name
              .toLowerCase()
              .includes(productName.toLowerCase())
          );
        }
        if (category !== "All categories") {
          filteredProducts = filteredProducts.filter(
            (product) => product.category_number == category
          );
        }
        setProducts(filteredProducts);
      })
      .catch((error) => console.error("Error filtering products:", error));
  };

  return (
    <div className="w-screen h-screen bg-[#fff3ea] font-['Kumbh_Sans'] text-lg font-normal flex flex-col relative">
      <header className="w-screen h-24 bg-orange-500 bg-opacity-75 shadow-lg flex justify-between items-center px-6">
        <div className="text-orange-50 text-3xl">Zlahoda</div>
        <nav className="flex space-x-6 text-orange-50 text-lg">
          <ul className="flex space-x-6">
            <li className="cursor-pointer hover:underline">Client</li>
            <li className="cursor-pointer hover:underline"><a href="index.html">Products</a></li>
            <li className="cursor-pointer hover:underline"><a href="store_products.html">Store Products</a></li>
            <li className="cursor-pointer hover:underline">Checks</li>
            <li className="cursor-pointer hover:underline">Profile</li>
          </ul>
        </nav>
      </header>

      <main className="flex-grow flex flex-col w-full h-screen overflow-hidden px-8 py-8">
        <div className="w-full flex space-x-6">
          <input
            type="text"
            placeholder="Search by product name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="flex-2 border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20] placeholder-[#f57b20]"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-2 border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20]"
          >
            <option>All categories</option>
            {categories.map((cat) => (
              <option className="w-full" key={cat.id} value={cat.id}>
                {cat.category_name}
              </option>
            ))}
          </select>
          <button
            onClick={handleFilter}
            className="flex-1 border bg-[#f57b20] rounded-md px-3 py-2 cursor-pointer"
          >
            Filter
          </button>
        </div>

        <div className="w-full bg-[#f57b20] mt-6 p-0 overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full border-collapse bg-[#f57b20] text-[#fff3ea]">
            <thead>
              <tr className="bg-[#db6c1c] sticky top-0">
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Characteristics</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[#fff3ea] hover:bg-[#db6c1c] cursor-pointer"
                  onDoubleClick={() => openEditModal(product)}
                >
                  <td className="px-4 py-2">{product.product_name}</td>
                  <td className="px-4 py-2">
                    {categories.find((cat) => cat.id == product.category_number)
                      ?.category_name || "Unknown"}
                  </td>
                  <td className="px-4 py-2">{product.characteristics}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#FFF3EA] rounded-2xl shadow-lg p-8 w-96 relative">
            <button
              onClick={closeEditModal}
              className="absolute top-4 right-4 text-[#f57b20]"
            >
              ✕
            </button>
            <h2 className="text-2xl mb-4 text-[#f57b20]">Edit Product</h2>
            <input
              type="text"
              value={selectedProduct.product_name}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  product_name: e.target.value,
                })
              }
              className="w-full border p-2 mb-4 rounded border-[#f57b20] text-[#f57b20]"
            />
            <select
              value={selectedProduct.category_number}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  category_number: e.target.value,
                })
              }
              className="w-full border p-2 mb-4 rounded border-[#f57b20] text-[#f57b20]"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
            <textarea value={selectedProduct.characteristics}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  characteristics: e.target.value,
                })
              } className="w-full border p-2 mb-4 rounded border-[#f57b20] text-[#f57b20]"></textarea>
            <div className="flex justify-between">
              <button onClick={handleDeleteProduct} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
              <button onClick={handleSaveChanges} className="bg-[#f57b20] text-white px-4 py-2 rounded">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
