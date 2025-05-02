import React, { useState, useEffect } from "react";
import Header from "../components/header";
import CashierStats from "../components/cashierstats.jsx";
import UnpopularLoyaltyProducts from "../components/unpopularloyaltyproducts.jsx";

export default function StatisticsPage() {
  const [selectedOption, setSelectedOption] = useState("top-products");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingTop, setLoadingTop] = useState(false);
  const [errorTop, setErrorTop] = useState(null);
  const [hasFetchedTop, setHasFetchedTop] = useState(false);

  const [printDate, setPrintDate] = useState("");
  const [notPurchased, setNotPurchased] = useState([]);
  const [loadingNP, setLoadingNP] = useState(false);
  const [errorNP, setErrorNP] = useState(null);

  const [totalByCat, setTotalByCat] = useState([]);
  const [totalRevenueByCategoriesMinPrice, setTotalRevenueByCategoriesMinPrice] = useState("");
  const [totalRevenueByCatChart, setTotalRevenueByCatChart] = useState("");
  const [loadingTotalByCat, setLoadingTotalByCat] = useState(false);
  const [errorTotalByCat, setErrorTotalByCat] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [notCategory, setNotCategory] = useState("");
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [errorCustomers, setErrorCustomers] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => console.error("Failed to load categories"));
  }, []);

  const fetchTopProducts = () => {
    setHasFetchedTop(true);
    setLoadingTop(true);
    setErrorTop(null);
    const baseUrl = "http://127.0.0.1:5000/api/statistics/top_products";
    const url = selectedCategory
      ? `${baseUrl}?category=${parseInt(selectedCategory)}`
      : baseUrl;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setErrorTop(data.error);
          setProducts([]);
        } else {
          setProducts(data);
        }
      })
      .catch(() => setErrorTop("Failed to fetch data 🙁"))
      .finally(() => setLoadingTop(false));
  };

  const fetchNotPurchased = () => {
    if (!printDate) return;
    setLoadingNP(true);
    setErrorNP(null);
    fetch(
      `http://127.0.0.1:5000/api/statistics/not_purchased_products?print_date=${printDate}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setErrorNP(data.error);
          setNotPurchased([]);
        } else {
          setNotPurchased(data);
        }
        console.log(printDate);
      })
      .catch(() => setErrorNP("Failed to fetch data 🙁"))
      .finally(() => setLoadingNP(false));
  };

  const fetchTotalByCat = () => {
    if (
      !totalRevenueByCategoriesMinPrice ||
      totalRevenueByCategoriesMinPrice === ""
    ) {
      setLoadingTotalByCat(false);
      setTotalByCat([]);
      setErrorTotalByCat("Please enter minimum price");
      return;
    }

    setLoadingTotalByCat(true);
    setErrorTotalByCat(null);
    const newChart = `http://127.0.0.1:5000/api/statistics/categories_by_revenue_with_min_price_of_product_chart?min_price=${totalRevenueByCategoriesMinPrice}`;
    setTotalRevenueByCatChart(newChart);

    fetch(
      `http://127.0.0.1:5000/api/statistics/categories_by_revenue_with_min_price_of_product?min_price=${totalRevenueByCategoriesMinPrice}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setErrorTotalByCat(data.error);
          setTotalByCat([]);
        } else {
          setTotalByCat(data);
        }
      })
      .catch(() => setErrorTotalByCat("Failed to fetch data 🙁"))
      .finally(() => {
        setLoadingTotalByCat(false);
      });
  };

  const fetchCustomers = () => {
    if (!notCategory || notCategory === "") {
      setErrorCustomers(false);
      setCustomers([]);
      setErrorCustomers("Please choose a category");
      return;
    }

    setLoadingCustomers(true);
    setErrorCustomers(null);
    fetch(
      `http://127.0.0.1:5000/api/statistics/customers_not_from_category_not_from_cashier?category_id=${notCategory}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setErrorCustomers(data.error);
          setCustomers([]);
        } else {
          setCustomers(data);
        }
      })
      .catch(() => setErrorCustomers("Failed to fetch data 🙁"))
      .finally(() => setLoadingCustomers(false));
  };

  const handleTabChange = (key) => {
    setHasFetchedTop(false);
    setErrorTop(null);
    setLoadingTop(false);
    setSelectedOption(key);
    setProducts([]);
    setError(null);
    setLoading(false);
    setSelectedCategory("");
    setNotPurchased([]);
    setErrorNP(null);
    setLoadingNP(false);
    setPrintDate("");

    setTotalByCat([]);
    setTotalRevenueByCategoriesMinPrice("");
    setErrorTotalByCat(null);
    setLoadingTotalByCat(false);

    setCustomers([]);
    setNotCategory("");
    setErrorCustomers(null);
    setLoadingCustomers(false);
  };

  const chartUrl = selectedCategory
    ? `http://127.0.0.1:5000/api/statistics/chart_products?category=${selectedCategory}`
    : `http://127.0.0.1:5000/api/statistics/chart_products`;

  return (
    <div className="w-screen h-screen bg-[#fff3ea] font-['Kumbh_Sans'] text-lg font-normal flex flex-col items-center">
      <Header />
      <div className="w-full bg-[#fc8b38] py-4">
        <nav className="flex justify-center space-x-6">
          {[
            { key: "top-products", label: "Products Analytics" },
            {
              key: "total-revenue-by-categories",
              label: "Total Revenue By Categories",
            },
            { key: "customers", label: "Customers" },
            { key: "cashiers", label: "Employee Performance" },
            {
              key: "unpopular",
              label: "Unpopular Products",
            },
          ].map((opt) => (
            <button
              key={opt.key}
              className={`text-lg ${
                selectedOption === opt.key ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </nav>
      </div>
      <main className="flex-grow w-full px-8 py-8 overflow-auto">
        {selectedOption === "top-products" && (
          <>
            <div className="flex w-full gap-8">
              <div className="w-2/5 bg-white p-4 shadow-lg rounded-lg h-[405px] overflow-auto">
                <h2 className="text-xl font-semibold mb-4 text-black">
                  Top 5 Products by Revenue
                </h2>
                <div className="flex items-center mb-4">
                  <label htmlFor="category" className="mr-2 text-black">
                    Category:
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20]"
                  >
                    <option value="">All</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={fetchTopProducts}
                    className="ml-4 bg-[#f57b20] text-white px-4 py-2 rounded hover:bg-[#db6c1c]"
                  >
                    Fetch
                  </button>
                </div>
                <div className="w-full bg-[#f57b20] rounded-md overflow-hidden">
                  <table className="w-full table-auto bg-[#f57b20] text-[#fff3ea]">
                    <thead>
                      <tr className="bg-[#db6c1c] sticky top-0">
                        <th className="px-4 py-2 text-left">Product</th>
                        <th className="px-4 py-2 text-left">Revenue</th>
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
                          <td
                            colSpan="2"
                            className="py-4 text-center text-red-500"
                          >
                            {error}
                          </td>
                        </tr>
                      )}
                      {!loading && !error && products.length === 0 && (
                        <tr>
                          <td colSpan="2" className="py-4 text-center">
                            Nothing found 😶
                          </td>
                        </tr>
                      )}
                      {!loading &&
                        products.map((prod) => (
                          <tr
                            key={prod.id_product}
                            className="border-b border-[#fff3ea] hover:bg-[#db6c1c]"
                          >
                            <td className="px-4 py-2 text-white">
                              {prod.product_name}
                            </td>
                            <td className="px-4 py-2 text-white">
                              ${Number(prod.total_revenue).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="w-3/5 bg-white p-4 shadow-lg rounded-lg h-[380px] flex flex-col">
                <h2 className="text-xl font-semibold mb-4 text-black">
                  Revenue Chart
                </h2>
                {products.length > 0 ? (
                  <img
                    src={chartUrl}
                    alt="Revenue Bar Chart"
                    className="w-full h-[300px] object-contain"
                  />
                ) : (
                  <img
                    src="static/bumbastik/bumbastik_cry.gif"
                    alt="No Data Available"
                    className="w-full h-[300px] object-contain"
                  />
                )}
              </div>
            </div>
            <div className="w-full bg-white p-4 shadow-lg rounded-lg mt-8 overflow-auto">
              <h2 className="text-xl font-semibold mb-4 text-black">
                Products Not Purchased Within Date Range
              </h2>
              <div className="flex items-center mb-4">
                <input
                  type="date"
                  value={printDate}
                  onChange={(e) => setPrintDate(e.target.value)}
                  className="border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20]"
                />
                <button
                  onClick={fetchNotPurchased}
                  className="ml-2 bg-[#f57b20] text-white px-4 py-2 rounded hover:bg-[#db6c1c]"
                >
                  Fetch
                </button>
              </div>
              <div className="w-full bg-[#f57b20] rounded-md overflow-hidden">
                <table className="w-full table-auto bg-[#f57b20] text-[#fff3ea]">
                  <thead>
                    <tr className="bg-[#db6c1c] sticky top-0">
                      <th className="px-4 py-2 text-left">Product ID</th>
                      <th className="px-4 py-2 text-left">Product Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingNP && (
                      <tr>
                        <td colSpan="2" className="py-4 text-center">
                          Loading...
                        </td>
                      </tr>
                    )}
                    {errorNP && (
                      <tr>
                        <td
                          colSpan="2"
                          className="py-4 text-center text-red-500"
                        >
                          {errorNP}
                        </td>
                      </tr>
                    )}
                    {!loadingNP && !errorNP && notPurchased.length === 0 && (
                      <tr>
                        <td colSpan="2" className="py-4 text-center">
                          No data found 😶
                        </td>
                      </tr>
                    )}
                    {!loadingNP &&
                      notPurchased.map((p) => (
                        <tr
                          key={p.id_product}
                          className="border-b border-[#fff3ea] hover:bg-[#db6c1c]"
                        >
                          <td className="px-4 py-2 text-white">
                            {p.id_product}
                          </td>
                          <td className="px-4 py-2 text-white">
                            {p.product_name}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        {selectedOption === "total-revenue-by-categories" && (
          <div className="flex w-full gap-8">
            <div className="w-3/5 bg-white p-4 shadow-lg rounded-lg h-full overflow-auto">
              <h2 className="text-xl font-semibold mb-4 text-black">
                Total Revenue by Categories with min price of the product
              </h2>
              <div className="flex items-center mb-4 gap-8">
                <input
                  value={totalRevenueByCategoriesMinPrice}
                  onChange={(e) =>
                    setTotalRevenueByCategoriesMinPrice(e.target.value)
                  }
                  className="border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20]"
                  placeholder="Product Min Price"
                />
                <button
                  onClick={fetchTotalByCat}
                  className="bg-[#f57b20] text-white px-4 py-2 rounded hover:bg-[#db6c1c]"
                >
                  Fetch
                </button>
              </div>
              <div className="w-full bg-[#f57b20] rounded-md overflow-hidden">
                <table className="w-full table-auto bg-[#f57b20] text-[#fff3ea]">
                  <thead>
                    <tr className="bg-[#db6c1c] sticky top-0">
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTotalByCat && (
                      <tr>
                        <td colSpan="2" className="py-4 text-center">
                          Loading...
                        </td>
                      </tr>
                    )}
                    {errorTotalByCat && (
                      <tr>
                        <td
                          colSpan="2"
                          className="py-4 text-center text-red-500"
                        >
                          {errorTotalByCat}
                        </td>
                      </tr>
                    )}
                    {!loadingTotalByCat &&
                      !errorTotalByCat &&
                      totalByCat.length === 0 && (
                        <tr>
                          <td colSpan="2" className="py-4 text-center">
                            Nothing found 😶
                          </td>
                        </tr>
                      )}
                    {!loadingTotalByCat &&
                      totalByCat.map((cat) => (
                        <tr
                          key={cat.category_name}
                          className="border-b border-[#fff3ea] hover:bg-[#db6c1c]"
                        >
                          <td className="px-4 py-2 text-white">
                            {cat.category_name}
                          </td>
                          <td className="px-4 py-2 text-white">
                            ${Number(cat.total_revenue).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="w-2/5 bg-white p-4 shadow-lg rounded-lg h-full flex flex-col">
              <h2 className="text-xl font-semibold mb-4 text-black">
                Total Revenue by Categories
              </h2>
                {totalByCat.length > 0 ? (
                    <img
                        src={totalRevenueByCatChart}
                        alt="Total Revenue By Categories Bar Chart"
                        className="w-full h-[400px] object-contain"
                        key={`chart-${totalRevenueByCategoriesMinPrice}-${Date.now()}`}
                    />) : (
                    <img
                        src="static/bumbastik/bumbastik_cry.gif"
                        alt="No Data Available"
                        className="w-full h-[300px] object-contain"
                    />
                )}
            </div>
          </div>
        )}
          {selectedOption === "customers" && (
              <div className="w-full bg-white p-4 shadow-lg rounded-lg overflow-auto">
                        <h2 className="text-xl font-semibold mb-4 text-black">
                            Customers who did not purchase any products from the selected
              category
            </h2>
            <div className="flex items-center mb-4 gap-4">
              <select
                id="category"
                value={notCategory}
                onChange={(e) => setNotCategory(e.target.value)}
                className="border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20]"
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchCustomers}
                className="bg-[#f57b20] text-white px-4 py-2 rounded hover:bg-[#db6c1c]"
              >
                Fetch
              </button>
            </div>
            <div className="w-full bg-[#f57b20] rounded-md overflow-hidden">
              <table className="w-full table-auto bg-[#f57b20] text-[#fff3ea]">
                <thead>
                  <tr className="bg-[#db6c1c] sticky top-0">
                    <th className="px-4 py-2 text-left">Card Number</th>
                    <th className="px-4 py-2 text-left">Customer Surname</th>
                    <th className="px-4 py-2 text-left">Customer Name</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingCustomers && (
                    <tr>
                      <td colSpan="3" className="py-4 text-center">
                        Loading...
                      </td>
                    </tr>
                  )}
                  {errorCustomers && (
                    <tr>
                      <td colSpan="3" className="py-4 text-center text-red-500">
                        {errorCustomers}
                      </td>
                    </tr>
                  )}
                  {!loadingCustomers &&
                    !errorCustomers &&
                    customers.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-4 text-center">
                          No data found 😶
                        </td>
                      </tr>
                    )}
                  {!loadingCustomers &&
                    customers.map((p) => (
                      <tr
                        key={`${p.card_number}`}
                        className="border-b border-[#fff3ea] hover:bg-[#db6c1c]"
                      >
                        <td className="px-4 py-2 text-white">
                          {p.card_number}
                        </td>
                        <td className="px-4 py-2 text-white">
                          {p.cust_surname}
                        </td>
                        <td className="px-4 py-2 text-white">{p.cust_name}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {selectedOption === "cashiers" && <CashierStats></CashierStats>}
        {selectedOption === "unpopular" && (
          <UnpopularLoyaltyProducts></UnpopularLoyaltyProducts>
        )}
      </main>
    </div>
  );
}
