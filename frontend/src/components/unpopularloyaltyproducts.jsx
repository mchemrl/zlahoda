import React, { useEffect, useState } from "react";
import axios from "axios";

const UnpopularLoyaltyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUnpopularProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/statistics/unpopular_loyalty_products`
      );
      const data = await res.json();

      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setError(data.error || "Failed to fetch products");
        setProducts([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error loading products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnpopularProducts();
  }, []);

  return (
    <div className="flex flex-col w-full gap-8">
      <h2 className="text-xl font-semibold mb-4 text-black">
        Unpopular Products Among non-Loyalty Clients
      </h2>
      <div className="w-full bg-[#f57b20] rounded-md overflow-hidden">
        <table className="w-full table-auto bg-[#f57b20] text-[#fff3ea]">
          <thead>
            <tr className="bg-[#db6c1c] sticky top-0">
              <th className="px-4 py-2 ">Product</th>
              <th className="px-4 py-2">Category</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="2" className="py-4 text-center">
                  Loading...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan="2" className="py-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && products.length === 0 && (
              <tr>
                <td colSpan="2" className="py-4 text-center">
                  All products bought by loyalty card holders 😊
                </td>
              </tr>
            )}
            {!loading &&
              products.map((product) => (
                <tr
                  key={product.id_product}
                  className="border-b border-[#fff3ea] hover:bg-[#db6c1c]"
                >
                  <td className="px-4 py-2 text-center text-white">
                    {product.product_name}
                  </td>
                  <td className="px-4 py-2 text-center text-white">
                    {product.category}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UnpopularLoyaltyProducts;
