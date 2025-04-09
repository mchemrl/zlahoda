import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function StoreProductsPage() {
  const [storeProducts, setStoreProducts] = useState([]);
  const [selectedStoreProduct, setSelectedStoreProduct] = useState(null);
  const [category, setCategory] = useState("All categories");
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("product_name");
  const [sortOrder, setSortOrder] = useState("Ascending");
  const [categories, setCategories] = useState([]);
  const [promotional, setPromotional] = useState("all");
  const [addStoreProductModalOpen, setAddStoreProductModalOpen] =
    useState(false);
  const [products, setProducts] = useState([]);
  const [debouncedFilter, setDebouncedFilter] = useState(filter);
  const [newStoreProduct, setNewStoreProduct] = useState({
    upc: "",
    id_product: "",
    products_number: "",
    upc_prom: "",
    selling_price: "",
    promotional_product: "",
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(filter);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filter]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/categories")
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error fetching categories:", error));

    fetch(`http://127.0.0.1:5000/api/products?}`)
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

    const url = `http://127.0.0.1:5000/api/store_products?${params.toString()}`;
    console.log(params);

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setStoreProducts(Array.isArray(data) ? data : [data]);
        console.log(data);
      })
      .catch((error) => console.error("Error fetching store products:", error));
  };

  const handleFilter = () => {
    setDebouncedFilter(filter);
    fetchStoreProducts();
  };

  const handleDeleteStoreProduct = (upc) => {
    fetch(`http://127.0.0.1:5000/store_product/${upc}`, {
      method: "DELETE",
    })
      .then(() => {
        setStoreProducts((prev) => prev.filter((p) => p.upc !== upc));
      })
      .catch((error) => console.error("Error deleting store product:", error));
  };

  const handleAddStoreProduct = () => {
    fetch("http://127.0.0.1:5000/api/store_product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStoreProduct),
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
          id_product: products[0]?.id_product || "",
          products_number: "",
          upc_prom: "",
          selling_price: "",
          promotional_product: false,
        });
      })
      .catch((err) => console.error("Error adding product:", err));
  };

  return (
    <div className='w-screen h-screen bg-[#fff3ea] font-["Kumbh_Sans"] text-lg font-normal flex flex-col relative'>
      <header className="w-screen h-24 bg-[#f57b20] bg-opacity-75 shadow-lg flex justify-between items-center px-6">
        <div className="text-orange-50 text-3xl flex items-center">
          Zlahoda
          <img
            src="static/bumbastik/bumbastik_clapping.gif"
            alt="Loading GIF"
            className="w-15 h-15"
          />
        </div>
        <nav className="flex space-x-6 text-orange-50 text-lg">
          <ul className="flex space-x-6">
            <li className="cursor-pointer hover:underline">Client</li>
            <li className="cursor-pointer hover:underline">
              <Link to="/products">Products</Link>
            </li>
            <li className="cursor-pointer hover:underline">
              <Link to="/store-products">Store Products</Link>
            </li>
            <li className="cursor-pointer hover:underline">Checks</li>
            <li className="cursor-pointer hover:underline">
              <Link to="/profile">Profile</Link>
            </li>
          </ul>
        </nav>
      </header>

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
        </div>
        <div className="w-full flex space-x-6">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 border border-[#f57b20] rounded-md pl-3 py-2 bg-[#fff3ea] text-[#f57b20]"
          >
            <option>All categories</option>
            {categories.map((cat) => (
              <option className="w-full" key={cat.id} value={cat.id}>
                {cat.category_name}
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
                    onDoubleClick={() => handleDeleteStoreProduct(product.upc)}
                  >
                    <td className="px-4 py-2">{product.product_name}</td>
                    <td className="px-4 py-2">{product.upc}</td>
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
              id_product: products.length,
              category_number: categories[0].id,
            });
          }}
          className="border bg-[#f57b20] px-3 py-2 cursor-pointer hover:bg-[#db6c1c]"
        >
          Add new store product
        </button>
      </main>
      {addStoreProductModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#FFF3EA] rounded-2xl shadow-lg p-8 w-96 relative">
            <button
              onClick={() => setAddStoreProductModalOpen(false)}
              className="absolute top-4 right-4 text-[#f57b20] cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-2xl mb-4 text-[#f57b20]">Add Store Product</h2>
            <label className="flex items-center space-x-2 mb-4 text-[#f57b20] cursor-pointer">
              <input
                type="checkbox"
                checked={newStoreProduct.promotional_product}
                onChange={(e) =>
                  setNewStoreProduct({
                    ...newStoreProduct,
                    promotional_product: e.target.checked,
                  })
                }
                className="cursor-pointer appearance-none w-5 h-5 border-2 border-[#f57b20] rounded-sm checked:bg-[#f57b20] checked:border-transparent transition-all duration-200 align-middle"
              />
              <span className="leading-none">Promotional</span>
            </label>
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
              value={newStoreProduct.id_product}
              onChange={(e) =>
                setNewStoreProduct({
                  ...newStoreProduct,
                  id_product: e.target.value,
                })
              }
              className="w-full border p-2 mb-4 rounded border-[#f57b20] text-[#f57b20]"
            >
              {products.map((cat) => (
                <option key={cat.id_product} value={cat.id_product}>
                  {cat.product_name}
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
    </div>
  );
}
