import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "C:\\Users\\lucka\\OneDrive\\Документы\\GitHub\\zlahodareal\\frontend\\src\\components\\header.jsx";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("All categories");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("Ascending");
  const [newProduct, setNewProduct] = useState({
    product_name: "",
    category_number: categories[0]?.id || "",
    characteristics: "",
  });

  useEffect(() => {
    handleFilter();
    fetch("http://localhost:5000/api/categories", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, [newProduct, selectedProduct]);

  const openEditModal = (product) => {
    setSelectedProduct({
      ...product,
      category_number: categories.find(
        (cat) => cat.category_name === product.category_name
      ).id,
    });
  };

  const closeEditModal = () => {
    setSelectedProduct(null);
  };

  const fetchProducts = (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append("search", params.search);
    if (params.category && params.category !== "All categories")
      queryParams.append("category", params.category);
    if (params.descending) queryParams.append("descending", params.descending);

    fetch(`http://localhost:5000/api/products?${queryParams.toString()}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => console.error("Error fetching products:", error));
  };

  const handleFilter = () => {
    fetchProducts({
      search: productName.trim(),
      category: category,
      descending: sortOrder === "Descending" ? "True" : undefined,
    });
  };

  const handleSaveChanges = () => {
    if (!selectedProduct) return;
    fetch(
      `http://localhost:5000/api/products/?id_product=${selectedProduct.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedProduct),
        credentials: "include",
      }
    )
      .then((response) => response.json())
      .then((updatedProduct) => {
        const category = categories.find(
          (cat) => cat.id === updatedProduct.category_number
        );
        const fullProduct = {
          ...updatedProduct,
          category_name:
            category?.category_name || selectedProduct.category_name,
        };

        setProducts((prevProducts) =>
          prevProducts.map((p) => (p.id === fullProduct.id ? fullProduct : p))
        );
        closeEditModal();
      })
      .catch((error) => console.error("Error updating product:", error));
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;
    fetch(
      `http://localhost:5000/api/products/?id_product=${selectedProduct.id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    )
      .then(() => {
        setProducts((prevProducts) =>
          prevProducts.filter((p) => p.id !== selectedProduct.id)
        );
        closeEditModal();
      })
      .catch((error) => console.error("Error deleting product:", error));
  };

  const handleAddProduct = () => {
    fetch("http://localhost:5000/api/products/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        product_name: newProduct.product_name,
        category_number: newProduct.category_number,
        characteristics: newProduct.characteristics,
      }),
    })
      .then((res) => res.json())
      .then((createdProduct) => {
        setProducts((prev) => [...prev, createdProduct]);
        setAddProductModalOpen(false);
        setNewProduct({
          product_name: "",
          category_number: categories[0]?.id || "",
          characteristics: "",
        });
      })
      .catch((err) => console.error("Error adding product:", err));
  };

  return (
    <div className="w-screen h-screen bg-[#fff3ea] font-['Kumbh_Sans'] text-lg font-normal flex flex-col relative">
      <Header />

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
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="flex-1 border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20]"
          >
            <option value="Ascending">Ascending</option>
            <option value="Descending">Descending</option>
          </select>
          <button
            onClick={handleFilter}
            className="flex-1 border bg-[#f57b20] rounded-md px-3 py-2 cursor-pointer hover:bg-[#db6c1c]"
          >
            Filter
          </button>
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex-1 border bg-[#f57b20] rounded-md px-3 py-2 cursor-pointer hover:bg-[#db6c1c]"
          >
            Make Report
          </button>
        </div>

        <div className="w-full bg-[#f57b20] mt-6 p-0 overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full border-collapse bg-[#f57b20] text-[#fff3ea] justify-space-between">
            <thead>
              <tr className="bg-[#db6c1c] sticky top-0">
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Characteristics</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-[#fff3ea]">
                    -
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-[#fff3ea] hover:bg-[#db6c1c] text-center cursor-pointer"
                    onDoubleClick={() => openEditModal(product)}
                  >
                    <td className="px-4 py-2">{product.product_name}</td>
                    <td className="px-4 py-2">{product.category_name}</td>
                    <td className="px-4 py-2">{product.characteristics}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {localStorage.getItem("role") === "Manager" && (
          <button
            onClick={() => {
              setAddProductModalOpen(true);
              setNewProduct({
                product_name: "",
                category_number: categories[0]?.id || "",
                characteristics: "",
              });
            }}
            className="border bg-[#f57b20] px-3 py-2 cursor-pointer hover:bg-[#db6c1c]"
          >
            Add new product
          </button>
        )}
      </main>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-3/4 h-3/4 relative">
            <button
              onClick={() => setReportModalOpen(false)}
              className="absolute top-4 right-4 text-[#f57b20] cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-2xl mb-4">Products Report Preview</h2>
            <iframe
              src="http://localhost:5000/api/products/report/preview?preview=true"
              title="Products Report Preview"
              className="w-full h-3/4"
            ></iframe>
          </div>
        </div>
      )}

      {selectedProduct && localStorage.getItem("role") === "Manager" && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#FFF3EA] rounded-2xl shadow-lg p-8 w-96 relative">
            <button
              onClick={closeEditModal}
              className="absolute top-4 right-4 text-[#f57b20] cursor-pointer"
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
            <textarea
              value={selectedProduct.characteristics}
              onChange={(e) =>
                setSelectedProduct({
                  ...selectedProduct,
                  characteristics: e.target.value,
                })
              }
              className="w-full border p-2 mb-4 rounded border-[#f57b20] text-[#f57b20]"
            ></textarea>
            <div className="flex justify-between">
              <button
                onClick={handleDeleteProduct}
                className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={handleSaveChanges}
                className="bg-[#f57b20] text-white px-4 py-2 rounded cursor-pointer hover:bg-[#db6c1c]"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
      {addProductModalOpen && localStorage.getItem("role") === "Manager" && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#FFF3EA] rounded-2xl shadow-lg p-8 w-96 relative">
            <button
              onClick={() => setAddProductModalOpen(false)}
              className="absolute top-4 right-4 text-[#f57b20] cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-2xl mb-4 text-[#f57b20]">Add Product</h2>
            <input
              type="text"
              value={newProduct.product_name}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  product_name: e.target.value,
                })
              }
              placeholder="Product Name"
              className="w-full border p-2 mb-4 rounded border-[#f57b20] text-[#f57b20]"
            />
            <select
              value={newProduct.category_number}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
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
            <textarea
              value={newProduct.characteristics}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  characteristics: e.target.value,
                })
              }
              placeholder="Characteristics"
              className="w-full border p-2 mb-4 rounded border-[#f57b20] text-[#f57b20]"
            ></textarea>
            <button
              onClick={handleAddProduct}
              className="bg-[#f57b20] text-white px-4 py-2 rounded cursor-pointer hover:bg-[#db6c1c] w-full"
            >
              Add Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
