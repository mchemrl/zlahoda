import React, {useState, useEffect} from "react";
import Header from "../components/header";

export default function StatisticsPage() {
    const [selectedOption, setSelectedOption] = useState("top-products");
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [printDate, setPrintDate] = useState("");
    const [notPurchased, setNotPurchased] = useState([]);
    const [loadingNP, setLoadingNP] = useState(false);
    const [errorNP, setErrorNP] = useState(null);

    const [avgSellingPrice, setAvgSellingPrice] = useState([]);
    const [loadingAvgPrice, setLoadingAvgPrice] = useState(false);
    const [errorAvgPrice, setErrorAvgPrice] = useState(null);

    const [unsoldProducts, setUnsoldProducts] = useState([]);
    const [unsoldStartDate, setUnsoldStartDate] = useState("");
    const [unsoldEndDate, setUnsoldEndDate] = useState("");
    const [unsoldCategoryId, setUnsoldCategoryId] = useState("");
    const [loadingUnsold, setLoadingUnsold] = useState(false);
    const [errorUnsold, setErrorUnsold] = useState(null);

    useEffect(() => {
        fetch("http://127.0.0.1:5000/api/categories")
            .then(res => res.json())
            .then(setCategories)
            .catch(() => console.error("Failed to load categories"));
    }, []);

    useEffect(() => {
        if (selectedOption !== "top-products") return;
        setLoading(true);
        setError(null);
        const baseUrl = "http://127.0.0.1:5000/api/statistics/top_products";
        const url = selectedCategory
            ? `${baseUrl}?category=${selectedCategory}`
            : baseUrl;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                    setProducts([]);
                } else {
                    setProducts(data);
                }
            })
            .catch(() => setError("Failed to fetch data 🙁"))
            .finally(() => setLoading(false));
    }, [selectedOption, selectedCategory]);

    useEffect(() => {
        if (selectedOption !== "average-selling-price") return;
        fetchAvgSellingPrice();
    }, [selectedOption]);

    const fetchNotPurchased = () => {
        if (!printDate) return;
        setLoadingNP(true);
        setErrorNP(null);
        fetch(`http://127.0.0.1:5000/api/statistics/not_purchased_products?print_date=${printDate}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setErrorNP(data.error);
                    setNotPurchased([]);
                } else {
                    setNotPurchased(data);
                }
                console.log(printDate)
            })
            .catch(() => setErrorNP("Failed to fetch data 🙁"))
            .finally(() => setLoadingNP(false));
    };

    const fetchAvgSellingPrice = () => {
        setLoadingAvgPrice(true);
        setErrorAvgPrice(null);
        fetch("http://127.0.0.1:5000/api/statistics/average_selling_price_by_categories")
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setErrorAvgPrice(data.error);
                    setAvgSellingPrice([]);
                } else {
                    setAvgSellingPrice(data);
                }
            })
            .catch(() => setErrorAvgPrice("Failed to fetch data 🙁"))
            .finally(() => setLoadingAvgPrice(false));
    };

    const average_selling_price_by_categories_chart = "http://127.0.0.1:5000/api/statistics/average_selling_price_by_categories_chart";

    const fetchUnsoldProducts = () => {
        if (!unsoldCategoryId || unsoldCategoryId === "") {
            setLoadingUnsold(false);
            setUnsoldProducts([]);
            setErrorUnsold("Please select a category before fetching data");
            return;
        }

        if (!unsoldStartDate || !unsoldEndDate) {
            setLoadingUnsold(false);
            setUnsoldProducts([]);
            setErrorUnsold("Please select both start and end valid dates");
            return;
        }

        setLoadingUnsold(true);
        setErrorUnsold(null);
        fetch(`http://127.0.0.1:5000/api/statistics/unsold_products_from_not_category_in_period_of_time?category_id=${unsoldCategoryId}&start_date=${unsoldStartDate}&end_date=${unsoldEndDate}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setErrorUnsold(data.error);
                    setUnsoldProducts([]);
                } else {
                    setUnsoldProducts(data);
                }
            })
            .catch(() => setErrorUnsold("Failed to fetch data 🙁"))
            .finally(() => setLoadingUnsold(false));
    };

    const handleTabChange = key => {
        setSelectedOption(key);
        setProducts([]);
        setError(null);
        setLoading(false);
        setSelectedCategory("");
        setNotPurchased([]);
        setErrorNP(null);
        setLoadingNP(false);
        setPrintDate("");

        setAvgSellingPrice([]);
        setErrorAvgPrice(null);
        setLoadingAvgPrice(false);

        setUnsoldProducts([]);
        setErrorUnsold(null);
        setLoadingUnsold(false);
        setUnsoldStartDate("");
        setUnsoldEndDate("");
        setUnsoldCategoryId("");
    };

    const chartUrl = selectedCategory
        ? `http://127.0.0.1:5000/api/statistics/chart_products?category=${selectedCategory}`
        : `http://127.0.0.1:5000/api/statistics/chart_products`;

    return (
        <div
            className="w-screen h-screen bg-[#fff3ea] font-['Kumbh_Sans'] text-lg font-normal flex flex-col items-center">
            <Header/>
            <div className="w-full bg-[#fc8b38] py-4">
                <nav className="flex justify-center space-x-6">
                    {[
                        {key: 'top-products', label: 'Top Products'},
                        {key: 'sales-trends', label: 'Sales Trends'},
                        {key: 'region-revenue', label: 'Region Revenue'},
                        {key: 'average-selling-price', label: 'Average Selling Price'},
                        {key: 'unsold-products', label: 'Unsold Products'},
                    ].map(opt => (
                        <button
                            key={opt.key}
                            className={`text-lg ${selectedOption === opt.key ? 'font-bold' : ''}`}
                            onClick={() => handleTabChange(opt.key)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </nav>
            </div>
            <main className="flex-grow w-full px-8 py-8 overflow-auto">
                {selectedOption === 'top-products' && (
                    <>
                        <div className="flex w-full gap-8">
                            <div className="w-2/5 bg-white p-4 shadow-lg rounded-lg h-[380px] overflow-auto">
                                <h2 className="text-xl font-semibold mb-4 text-black">Top 5 Products by Revenue</h2>
                                <div className="flex items-center mb-4">
                                    <label htmlFor="category" className="mr-2 text-black">Category:</label>
                                    <select
                                        id="category"
                                        value={selectedCategory}
                                        onChange={e => setSelectedCategory(e.target.value)}
                                        className="border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20]"
                                    >
                                        <option value="">All</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                                        ))}
                                    </select>
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
                                        {loading && <tr>
                                            <td colSpan="2" className="py-4 text-center">Loading...</td>
                                        </tr>}
                                        {error && <tr>
                                            <td colSpan="2" className="py-4 text-center text-red-500">{error}</td>
                                        </tr>}
                                        {!loading && !error && products.length === 0 && <tr>
                                            <td colSpan="2" className="py-4 text-center">Nothing found 😶</td>
                                        </tr>}
                                        {!loading && products.map(prod => (
                                            <tr key={prod.id_product}
                                                className="border-b border-[#fff3ea] hover:bg-[#db6c1c]">
                                                <td className="px-4 py-2 text-white">{prod.product_name}</td>
                                                <td className="px-4 py-2 text-white">${Number(prod.total_revenue).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="w-3/5 bg-white p-4 shadow-lg rounded-lg h-[380px] flex flex-col">
                                <h2 className="text-xl font-semibold mb-4 text-black">Revenue Chart</h2>
                                <img
                                    src={chartUrl}
                                    alt="Revenue Bar Chart"
                                    className="w-full h-[300px] object-contain"
                                />
                            </div>
                        </div>
                        <div className="w-full bg-white p-4 shadow-lg rounded-lg mt-8 overflow-auto">
                            <h2 className="text-xl font-semibold mb-4 text-black">Products Not Purchased Within Date
                                Range</h2>
                            <div className="flex items-center mb-4">
                                <input
                                    type="date"
                                    value={printDate}
                                    onChange={e => setPrintDate(e.target.value)}
                                    className="border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20]"
                                />
                                <button
                                    onClick={fetchNotPurchased}
                                    className="ml-2 bg-[#f57b20] text-white px-4 py-2 rounded hover:bg-[#db6c1c]"
                                >Fetch
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
                                    {loadingNP && <tr>
                                        <td colSpan="2" className="py-4 text-center">Loading...</td>
                                    </tr>}
                                    {errorNP && <tr>
                                        <td colSpan="2" className="py-4 text-center text-red-500">{errorNP}</td>
                                    </tr>}
                                    {!loadingNP && !errorNP && notPurchased.length === 0 && <tr>
                                        <td colSpan="2" className="py-4 text-center">No data found 😶</td>
                                    </tr>}
                                    {!loadingNP && notPurchased.map(p => (
                                        <tr key={p.id_product} className="border-b border-[#fff3ea] hover:bg-[#db6c1c]">
                                            <td className="px-4 py-2 text-white">{p.id_product}</td>
                                            <td className="px-4 py-2 text-white">{p.product_name}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {selectedOption === 'average-selling-price' && (
                    <div className="flex w-full gap-8">
                        <div className="w-2/5 bg-white p-4 shadow-lg rounded-lg h-full overflow-auto">
                            <h2 className="text-xl font-semibold mb-4 text-black">Average Selling Price by
                                Categories</h2>
                            <div className="w-full bg-[#f57b20] rounded-md overflow-hidden">
                                <table className="w-full table-auto bg-[#f57b20] text-[#fff3ea]">
                                    <thead>
                                    <tr className="bg-[#db6c1c] sticky top-0">
                                        <th className="px-4 py-2 text-left">Category</th>
                                        <th className="px-4 py-2 text-left">Average Price</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {loadingAvgPrice && <tr>
                                        <td colSpan="2" className="py-4 text-center">Loading...</td>
                                    </tr>}
                                    {errorAvgPrice && <tr>
                                        <td colSpan="2" className="py-4 text-center text-red-500">{errorAvgPrice}</td>
                                    </tr>}
                                    {!loadingAvgPrice && !errorAvgPrice && avgSellingPrice.length === 0 && <tr>
                                        <td colSpan="2" className="py-4 text-center">Nothing found 😶</td>
                                    </tr>}
                                    {!loadingAvgPrice && avgSellingPrice.map(cat => (
                                        <tr key={cat.category_name}
                                            className="border-b border-[#fff3ea] hover:bg-[#db6c1c]">
                                            <td className="px-4 py-2 text-white">{cat.category_name}</td>
                                            <td className="px-4 py-2 text-white">${Number(cat.average_selling_price).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="w-3/5 bg-white p-4 shadow-lg rounded-lg h-full flex flex-col">
                            <h2 className="text-xl font-semibold mb-4 text-black">Average Selling Price By
                                Categories</h2>
                            <img
                                src={average_selling_price_by_categories_chart}
                                alt="Average Selling Price By Categories Bar Chart"
                                className="w-full h-[400px] object-contain"
                            />
                        </div>
                    </div>
                )}

                {selectedOption === 'unsold-products' && (
                    <div className="w-full bg-white p-4 shadow-lg rounded-lg overflow-auto">
                        <h2 className="text-xl font-semibold mb-4 text-black">Unsold Products Except for Selected
                            Category for Period of Time</h2>
                        <div className="flex items-center mb-4 gap-4">
                            <select
                                value={unsoldCategoryId}
                                onChange={e => setUnsoldCategoryId(e.target.value)}
                                className="border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20]"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={unsoldStartDate}
                                onChange={e => setUnsoldStartDate(e.target.value)}
                                className="border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20]"
                            />
                            <input
                                type="date"
                                value={unsoldEndDate}
                                onChange={e => setUnsoldEndDate(e.target.value)}
                                className="border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20]"
                            />
                            <button
                                onClick={fetchUnsoldProducts}
                                className="bg-[#f57b20] text-white px-4 py-2 rounded hover:bg-[#db6c1c]"
                            >Fetch
                            </button>
                        </div>
                        <div className="w-full bg-[#f57b20] rounded-md overflow-hidden">
                            <table className="w-full table-auto bg-[#f57b20] text-[#fff3ea]">
                                <thead>
                                <tr className="bg-[#db6c1c] sticky top-0">
                                    <th className="px-4 py-2 text-left">Category</th>
                                    <th className="px-4 py-2 text-left">Product Name</th>
                                    <th className="px-4 py-2 text-left">UPC</th>
                                    <th className="px-4 py-2 text-left">Selling Price</th>
                                    <th className="px-4 py-2 text-left">Quantity</th>
                                    <th className="px-4 py-2 text-left">Promotional</th>
                                </tr>
                                </thead>
                                <tbody>
                                {loadingUnsold && <tr>
                                    <td colSpan="6" className="py-4 text-center">Loading...</td>
                                </tr>}
                                {errorUnsold && <tr>
                                    <td colSpan="6" className="py-4 text-center text-red-500">{errorUnsold}</td>
                                </tr>}
                                {!loadingUnsold && !errorUnsold && unsoldProducts.length === 0 && <tr>
                                    <td colSpan="6" className="py-4 text-center">No data found 😶</td>
                                </tr>}
                                {!loadingUnsold && unsoldProducts.map(p => (
                                    <tr key={`${p.product_name}-${p.promotional_product}`}
                                        className="border-b border-[#fff3ea] hover:bg-[#db6c1c]">
                                        <td className="px-4 py-2 text-white">{p.category_name}</td>
                                        <td className="px-4 py-2 text-white">{p.product_name}</td>
                                        <td className="px-4 py-2 text-white">{p.upc}</td>
                                        <td className="px-4 py-2 text-white">${Number(p.selling_price).toFixed(2)}</td>
                                        <td className="px-4 py-2 text-white">{p.products_number}</td>
                                        <td className="px-4 py-2 text-white">{p.promotional_product ? "Yes" : "No"}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {['sales-trends', 'region-revenue'].includes(selectedOption) && (
                    <div className="flex-grow flex items-center justify-center w-full text-gray-500">
                        No data available for this section.
                    </div>
                )}
            </main>
        </div>
    );
}