import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";

export default function StoreProductsPage() {
  const [storeProducts, setStoreProducts] = useState([]);
  const [selectedStoreProduct, setSelectedStoreProduct] = useState(null);
  const [category, setCategory] = useState("All categories");
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("product_name");
  const [sortOrder, setSortOrder] = useState("Ascending");
  const [categories, setCategories] = useState([]);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [promotional, setPromotional] = useState("all");
  const [addStoreProductModalOpen, setAddStoreProductModalOpen] =
    useState(false);
  const [products, setProducts] = useState([]);
  const [newStoreProduct, setNewStoreProduct] = useState({
    upc: "",
    id: "",
    products_number: "",
    upc_prom: "",
    selling_price: "",
    promotional_product: "",
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/categories", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error fetching categories:", error));

    fetch(`http://localhost:5000/api/products?}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, [addStoreProductModalOpen]);

  useEffect(() => {
    fetchStoreProducts();
  }, []);

  const fetchStoreProducts = () => {
    const params = new URLSearchParams();

    if (filter.trim()) {
      params.append("upc", filter.trim());
    }

    if (promotional === "promotional") {
      params.append("promotional", true);
    } else if (promotional === "non-promotional") {
      params.append("promotional", false);
    }

    if (sortBy) {
      params.append("sort", sortBy);
    }

    sortOrder === "Descending"
      ? params.append("descending", true)
      : params.delete("descending");

    if (category && category !== "All categories")
      params.append("category", category);
    else params.delete("category");

    const url = `http://localhost:5000/api/store_products?${params.toString()}`;
    console.log(params);

    fetch(url, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setStoreProducts(Array.isArray(data) ? data : [data]);
        console.log(data);
      })
      .catch((error) => console.error("Error fetching store products:", error));
  };

  const handleFilter = () => {
    fetchStoreProducts();
  };

  const openEditModal = (product) => {
    setSelectedStoreProduct({
      ...product,
      safe_price: product.selling_price,
      originalPromotional: product.promotional_product,
    });
  };

  const closeEditModal = () => {
    setSelectedStoreProduct(null);
  };

  const handleDeleteStoreProduct = () => {
    console.log(selectedStoreProduct);
    fetch(
      `http://localhost:5000/api/store_products/?upc=${selectedStoreProduct.upc}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    )
      .then(() => {
        setStoreProducts((prev) =>
          prev.filter((p) => p.upc !== selectedStoreProduct.upc)
        );
      })
      .catch((error) => console.error("Error deleting store product:", error));
    setSelectedStoreProduct(null);
  };

  const DISCOUNT_RATE = 0.8;

  const handleSaveChanges = () => {
    if (!selectedStoreProduct) return;

    const {
      id_product,
      upc,
      upc_prom,
      selling_price,
      products_number,
      promotional_product: isPromo,
      originalPromotional,
    } = selectedStoreProduct;

    const newQty = parseInt(products_number, 10);
    const oldQty =
      storeProducts.find((p) => p.upc === upc)?.products_number ?? 0;
    const qtyDelta = newQty - oldQty;

    const toggledToPromo = isPromo && !originalPromotional;
    if (toggledToPromo) {
      const postPayload = {
        id_product: parseInt(id_product, 10),
        upc: upc_prom,
        upc_prom: upc,
        selling_price: parseFloat(selling_price),
        products_number: newQty,
        promotional_product: true,
      };
      fetch("http://localhost:5000/api/store_products/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(postPayload),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((created) => {
          setStoreProducts((prev) =>
            prev
              .map((p) =>
                p.upc === upc ? { ...p, products_number: oldQty - newQty } : p
              )
              .concat({
                upc: created.upc,
                upc_prom: created.upc_prom,
                id_product: created.id_product,
                selling_price: created.prices.gross_price,
                products_number: created.products_number,
                promotional_product: true,
                product_name: selectedStoreProduct.product_name,
                characteristics: selectedStoreProduct.characteristics,
                category: selectedStoreProduct.category,
              })
          );
          closeEditModal();
        })
        .catch((err) => console.error(err));
      return;
    }

    const payload = {
      id_product: parseInt(id_product, 10),
      upc,
      upc_prom: isPromo ? upc_prom : null,
      selling_price: parseFloat(selling_price),
      products_number: newQty,
      promotional_product: isPromo,
    };

    fetch(
      `http://localhost:5000/api/store_products/?upc=${encodeURIComponent(
        upc
      )}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    )
      .then((res) =>
        res.ok ? res.json() : res.json().then((e) => Promise.reject(e))
      )
      .then((updated) => {
        setStoreProducts((prev) =>
          prev.map((p) =>
            p.upc === updated.upc
              ? {
                  ...p,
                  selling_price: updated.prices.gross_price,
                  products_number: updated.products_number,
                }
              : p
          )
        );

        if (!isPromo) {
          const newPromoPrice = parseFloat(
            (updated.prices.gross_price * DISCOUNT_RATE).toFixed(2)
          );
          setStoreProducts((prev) =>
            prev.map((p) =>
              p.id_product === id_product && p.promotional_product
                ? { ...p, selling_price: newPromoPrice }
                : p
            )
          );
        } else {
          setStoreProducts((prev) =>
            prev.map((p) =>
              p.id_product === id_product && !p.promotional_product
                ? { ...p, products_number: p.products_number - qtyDelta }
                : p
            )
          );
        }

        closeEditModal();
      })
      .catch((err) => console.error(err));
  };

  const handleAddStoreProduct = () => {
    const payload = {
      id_product: parseInt(newStoreProduct.id),
      upc: newStoreProduct.upc.trim(),
      upc_prom: newStoreProduct.upc_prom?.trim() || "",
      selling_price: parseFloat(newStoreProduct.selling_price),
      products_number: parseInt(newStoreProduct.products_number),
      promotional_product: Boolean(newStoreProduct.promotional_product),
    };
    console.log(payload);

    if (
      !payload.id_product ||
      !payload.upc ||
      !payload.selling_price ||
      !payload.products_number
    ) {
      console.error("Missing required fields");
      return;
    }

    fetch("http://localhost:5000/api/store_products/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add store product");
        return res.json();
      })
      .then(() => {
        setAddStoreProductModalOpen(false);
        fetchStoreProducts();
        setNewStoreProduct({
          upc: "",
          id: products[0]?.id || "",
          products_number: "",
          upc_prom: "",
          selling_price: "",
          promotional_product: false,
        });
      })
      .catch((err) => console.error("Error adding product:", err));
  };

  const hasPromoSibling =
    selectedStoreProduct &&
    storeProducts.some(
      (p) =>
        p.id_product === selectedStoreProduct.id_product &&
        p.promotional_product
    );
  const showPromoCheckbox =
    selectedStoreProduct &&
    !selectedStoreProduct.promotional_product &&
    !hasPromoSibling;

  return (
    <div className='w-screen min-w-[1000px] h-screen bg-[#fff3ea] font-["Kumbh_Sans"] text-lg font-normal flex flex-col relative'>
      <Header />
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
              src="http://localhost:5000/api/store_products/report/preview"
              title="Store Products Report Preview"
              className="w-full h-3/4"
            ></iframe>
          </div>
        </div>
      )}
      <main className="flex-grow flex flex-col w-full h-screen overflow-hidden px-8 py-8">
        <div className="w-full flex space-x-6 mb-4">
          <input
            type="text"
            placeholder="Search by UPC"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleFilter();
            }}
            className="flex-3 border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20] placeholder-[#f57b20]"
          />
          <button
            onClick={handleFilter}
            className="flex-1 border bg-[#f57b20] rounded-md  cursor-pointer hover:bg-[#db6c1c] text-white"
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
        <div className="w-full flex space-x-6">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 border border-[#f57b20] rounded-md pl-3 py-2 bg-[#fff3ea] text-[#f57b20]"
          >
            <option>All categories</option>
            {categories.map((product) => (
              <option className="w-full" key={product.id} value={product.id}>
                {product.category_name}
              </option>
            ))}
          </select>
          <select
            value={promotional}
            onChange={(e) => setPromotional(e.target.value)}
            className="flex-1 border border-[#f57b20] rounded-md pl-3 py-2 bg-[#fff3ea] text-[#f57b20]"
          >
            <option value="all">Promotional and non-promotional</option>
            <option value="promotional">Promotional</option>
            <option value="non-promotional">Non-promotional</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 border border-[#f57b20] rounded-md pl-4 py-2 bg-[#fff3ea] text-[#f57b20]"
          >
            <option value="product_name">Sort by name</option>
            <option value="products_number">Sort by quantity</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="flex-1 border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20]"
          >
            <option value="Ascending">Ascending</option>
            <option value="Descending">Descending</option>
          </select>
        </div>

        <div className="w-full bg-[#f57b20] mt-6 p-0 overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full border-collapse bg-[#f57b20] text-[#fff3ea]">
            <thead>
              <tr className="bg-[#db6c1c] sticky top-0">
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">UPC</th>
                <th className="px-4 py-2">Selling Price</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Promotional</th>
              </tr>
            </thead>
            <tbody>
              {storeProducts.length === 0 || storeProducts[0].upc == null ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-[#fff3ea]">
                    -
                  </td>
                </tr>
              ) : (
                storeProducts.map((product) => (
                  <tr
                    key={product.upc}
                    className="border-b border-[#fff3ea] hover:bg-[#db6c1c] cursor-pointer text-center"
                    onDoubleClick={() => openEditModal(product)}
                  >
                    <td className="px-4 py-2">{product.product_name}</td>
                    <td className="px-4 py-2">
                      {product.promotional ? product.upc_prom : product.upc}
                    </td>
                    <td className="px-4 py-2">{product.selling_price}</td>
                    <td className="px-4 py-2">{product.products_number}</td>
                    <td className="px-4 py-2">
                      {product.promotional_product ? "Yes" : "No"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => {
            setAddStoreProductModalOpen(true);
            setNewStoreProduct({
              ...newStoreProduct,
              id: products.length,
              category_number: categories[0].id,
            });
          }}
          className="border bg-[#f57b20] px-3 py-2 cursor-pointer hover:bg-[#db6c1c]"
        >
          Add new store product
        </button>
      </main>
      {addStoreProductModalOpen &&
        localStorage.getItem("role") === "Manager" && (
          <div
            className={`fixed inset-0 flex items-center justify-center backdrop-blur-sm transition-all duration-200 opacity-100`}
          >
            <div className="bg-[#FFF3EA] rounded-2xl shadow-lg p-8 w-96 relative">
              <button
                onClick={() => setAddStoreProductModalOpen(false)}
                className="absolute top-4 right-4 text-[#f57b20] cursor-pointer"
              >
                ✕
              </button>
              <h2 className="text-2xl mb-4 text-[#f57b20]">
                Add Store Product
              </h2>
              <input
                type="text"
                value={newStoreProduct.upc}
                onChange={(e) =>
                  setNewStoreProduct({
                    ...newStoreProduct,
                    upc: e.target.value,
                  })
                }
                placeholder="UPC"
                className="w-full border p-2 mb-4 rounded border-[#f57b20] text-[#f57b20]"
              />
              <select
                value={newStoreProduct.id}
                onChange={(e) =>
                  setNewStoreProduct({
                    ...newStoreProduct,
                    id: e.target.value,
                  })
                }
                className="w-full border p-2 mb-4 rounded border-[#f57b20] text-[#f57b20]"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.product_name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newStoreProduct.selling_price}
                onChange={(e) =>
                  setNewStoreProduct({
                    ...newStoreProduct,
                    selling_price: e.target.value,
                  })
                }
                placeholder="Price"
                className="w-full border p-2 mb-4 rounded border-[#f57b20] text-[#f57b20]"
              />
              <input
                type="text"
                value={newStoreProduct.products_number}
                onChange={(e) =>
                  setNewStoreProduct({
                    ...newStoreProduct,
                    products_number: e.target.value,
                  })
                }
                placeholder="Quantity"
                className="w-full border p-2 mb-4 rounded border-[#f57b20] text-[#f57b20]"
              />

              <button
                onClick={handleAddStoreProduct}
                className="bg-[#f57b20] text-white px-4 py-2 rounded cursor-pointer hover:bg-[#db6c1c] w-full"
              >
                Add Store Product
              </button>
            </div>
          </div>
        )}

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
              src="http://localhost:5000/api/store_products/report/preview?preview=true"
              title="Products Report Preview"
              className="w-full h-3/4"
            ></iframe>
          </div>
        </div>
      )}

      {selectedStoreProduct && localStorage.getItem("role") === "Manager" && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#FFF3EA] rounded-2xl shadow-lg p-8 w-96 relative">
            <button
              className="absolute top-4 right-4 text-[#f57b20] cursor-pointer"
              onClick={closeEditModal}
            >
              ✕
            </button>

            <h2 className="text-2xl mb-4 text-[#f57b20]">Edit Store Product</h2>

            {showPromoCheckbox && (
              <label className="flex items-center space-x-2 mb-4 text-[#f57b20] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedStoreProduct.promotional_product}
                  onChange={(e) =>
                    setSelectedStoreProduct((prev) => ({
                      ...prev,
                      promotional_product: e.target.checked,
                      upc_prom: "",
                      selling_price: e.target.checked ? "" : prev.selling_price,
                    }))
                  }
                  className="cursor-pointer appearance-none w-5 h-5 border-2 border-[#f57b20] rounded-sm checked:bg-[#f57b20] checked:border-transparent transition-all duration-200 align-middle"
                />
                <span className="leading-none">Make promotional</span>
              </label>
            )}

            {selectedStoreProduct.promotional_product ? (
              <input
                type="text"
                value={selectedStoreProduct.upc_prom}
                onChange={(e) =>
                  setSelectedStoreProduct({
                    ...selectedStoreProduct,
                    upc_prom: e.target.value,
                  })
                }
                placeholder="UPC_prom"
                className="w-full border p-2 mb-4 rounded border-[#f57b20] text-[#f57b20]"
              />
            ) : (
              <input
                type="text"
                value={selectedStoreProduct.selling_price}
                onChange={(e) =>
                  setSelectedStoreProduct({
                    ...selectedStoreProduct,
                    selling_price: e.target.value,
                  })
                }
                placeholder="Price"
                className="w-full border p-2 mb-4 rounded border-[#f57b20] text-[#f57b20]"
              />
            )}

            <input
              type="text"
              value={selectedStoreProduct.products_number}
              onChange={(e) =>
                setSelectedStoreProduct({
                  ...selectedStoreProduct,
                  products_number: e.target.value,
                })
              }
              placeholder="Quantity"
              className="w-full border p-2 mb-4 rounded border-[#f57b20] text-[#f57b20]"
            />

            <div className="flex justify-between">
              <button
                onClick={handleDeleteStoreProduct}
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
    </div>
  );
}
