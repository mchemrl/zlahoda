import React, { useState, useEffect } from "react";
import { data, Link } from "react-router-dom";

export default function StoreProductsPage() {
  const [storeProducts, setStoreProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedStoreProduct, setSelectedStoreProduct] = useState(null);
  const [filter, setFilter] = useState("");
  const [promotional, setPromotional] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/store_products?sort=product_name")
      .then((response) => response.json())
      .then(() => {
        (data) => setStoreProducts(data);
        console.log(data);
      })
      .catch((error) => console.error("Error fetching store products:", error));
  }, []);

  const handleDeleteStoreProduct = (UPC) => {
    fetch(`http://127.0.0.1:5000/delete_store_product/${UPC}`, {
      method: "DELETE",
    })
      .then(() => {
        setStoreProducts((prev) => prev.filter((p) => p.UPC !== UPC));
      })
      .catch((error) => console.error("Error deleting store product:", error));
  };

  const openEditModal = (product) => {
    setSelectedStoreProduct({ ...product });
  };

  const closeEditModal = () => {
    setSelectedStoreProduct(null);
  };

  const handleSaveChanges = () => {
    if (!selectedStoreProduct) return;
    fetch(
      `http://127.0.0.1:5000/update_store_product/${selectedStoreProduct.UPC}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedStoreProduct),
      }
    )
      .then((response) => response.json())
      .then((updatedProduct) => {
        setStoreProducts((prev) =>
          prev.map((p) => (p.UPC === updatedProduct.UPC ? updatedProduct : p))
        );
        closeEditModal();
      })
      .catch((error) => console.error("Error updating store product:", error));
  };

  const filteredStoreProducts = storeProducts.filter((product) =>
    product.product_name.toLowerCase().includes(filter.toLowerCase())
  );

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
        <div className="w-full flex space-x-6">
          <input
            type="text"
            placeholder="Search by product name"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-2 border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20] placeholder-[#f57b20]"
          />
          <button
            onClick={() => setPromotional(!promotional)}
            className={`flex-1 border rounded-md px-3 py-2 cursor-pointer ${
              promotional
                ? "bg-[#fff3ea] text-[#f57b20]"
                : "bg-[#f57b20] text-white hover:bg-[#db6c1c]"
            }`}
          >
            {promotional ? "Show All" : "Show Promotional"}
          </button>
        </div>

        <div className="w-full bg-[#f57b20] mt-6 p-0 overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full border-collapse bg-[#f57b20] text-[#fff3ea]">
            <thead>
              <tr className="bg-[#db6c1c] sticky top-0">
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">UPC</th>
                <th className="px-4 py-2">Selling Price</th>
                <th className="px-4 py-2">Count</th>
                <th className="px-4 py-2">Promotional</th>
              </tr>
            </thead>
            <tbody>
              {filteredStoreProducts
                .filter((p) => (promotional ? p.promotional_product : true))
                .map((product) => (
                  <tr
                    key={product.UPC}
                    className="border-b border-[#fff3ea] hover:bg-[#db6c1c] cursor-pointer text-center"
                    onDoubleClick={handleDeleteStoreProduct(product.UPC)}
                  >
                    <td className="px-4 py-2">{product.product_name}</td>
                    <td className="px-4 py-2">{product.UPC}</td>
                    <td className="px-4 py-2">{product.selling_price}</td>
                    <td className="px-4 py-2">{product.products_number}</td>
                    <td className="px-4 py-2">
                      {product.promotional_product ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
