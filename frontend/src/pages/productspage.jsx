import React, {useState, useEffect} from "react";
import Header from "../components/header";
import {
    handlePrint,
    usePrintStyles,
    PrintHeader,
} from "../utils/print.jsx";

export default function ProductsPage() {
    const [suggestions, setSuggestions] = useState([]);
    const [inputFocused, setInputFocused] = useState(false);
    const [allProducts, setAllProducts] = useState([]);

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [productName, setProductName] = useState("");
    const [category, setCategory] = useState("All categories");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [addProductModalOpen, setAddProductModalOpen] = useState(false);
    const [errorModal, setErrorModal] = useState({open: false, message: ""});
    const [sortOrder, setSortOrder] = useState("Ascending");
    const [newProduct, setNewProduct] = useState({
        product_name: "",
        category_number: categories[0]?.id || "",
        characteristics: "",
    });

    const handleInputChange = () => {
        const searchTerm = (productName || "").toLowerCase().trim();

        if (category === "All categories") {
            const matches = allProducts
                .filter(p => (p.product_name || "").toLowerCase().includes(searchTerm))
                .map(p => p.product_name);
            setSuggestions([...new Set(matches)]);
            console.log("Filtered products:", {
                allProducts: allProducts,
                filtered: matches
            });
            return;
        }

        const selectedCategory = categories.find(cat => cat.id === parseInt(category));
        if (!selectedCategory) return;

        const matches = allProducts
            .filter(p =>
                (p.product_name || "").toLowerCase().includes(searchTerm) &&
                p.category_name === selectedCategory.category_name
            )
            .map(p => p.product_name);
        setSuggestions([...new Set(matches)]);
        console.log("Filtered products:", {
                allProducts: allProducts,
                filtered: matches
            });
    };

    useEffect(() => {
        handleInputChange();
    }, [productName, category, products]);

    usePrintStyles();

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
                if (allProducts.length === 0) {
                    setAllProducts(data);
                }
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
                headers: {"Content-Type": "application/json"},
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
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    setErrorModal({open: true, message: data.error});
                    return;
                }
                setProducts((prev) =>
                    prev.filter((p) => p.id !== selectedProduct.id)
                );
                closeEditModal();
            })
            .catch((err) => {
                console.error("Error deleting product:", err);
            });
    };

    const handleAddProduct = () => {
        fetch("http://localhost:5000/api/products/", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
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
            <Header/>
            {errorModal.open && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-0 z-50">
                    <div className="bg-white rounded-lg p-6 w-80 text-center shadow-lg">
                        <h3 className="text-xl font-semibold mb-4 text-red-600">
                            You can't delete a product that is associated with store product
                        </h3>
                        <p className="mb-6">{errorModal.message}</p>
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                            onClick={() => setErrorModal({open: false, message: ""})}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            <main className="flex-grow flex flex-col w-full h-screen overflow-hidden px-8 py-8">
                <div className="w-full flex space-x-6">
                    <div className="flex-2 relative w-full">
                        <input
                            type="text"
                            placeholder="Search by product name"
                            value={productName}
                            onChange={(e) => {
                                setProductName(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleFilter();
                                    e.currentTarget.blur();
                                }
                            }}
                            onFocus={() => setInputFocused(true)}
                            onBlur={() => {
                                setTimeout(() => {
                                    setInputFocused(false);
                                    setSuggestions([]);
                                }, 200);
                            }}
                            className="w-full border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20] placeholder-[#f57b20]"
                        />
                        {suggestions.length > 0 && inputFocused && productName.length >= 0 && (
                            <ul className="absolute bg-white border border-[#f57b20] text-[#f57b20] mt-1 w-full max-h-40 overflow-y-auto z-50 rounded shadow-md">
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="px-4 py-2 hover:bg-[#fff3ea] cursor-pointer"
                                        onMouseDown={(e) => e.preventDefault()} // Запобігаємо втраті фокусу при кліку
                                        onClick={() => {
                                            setProductName(suggestion);
                                            setSuggestions([]);
                                        }}
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <select
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                        }}
                        className="flex-2 border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20]"
                    >
                        <option value="All categories">All categories</option>
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
                        className="flex-1 border bg-[#f57b20] rounded-md px-3 py-2 cursor-pointer hover:bg-[#db6c1c] text-[#fff3ea]"
                    >
                        Filter
                    </button>
                    {localStorage.getItem("role") === "Manager" && (
                        <button
                            onClick={handlePrint}
                            className="flex-1 border bg-[#f57b20] rounded-md px-3 py-2 cursor-pointer hover:bg-[#db6c1c] text-[#fff3ea]"
                        >
                            Print
                        </button>
                    )}
                </div>

                <PrintHeader title="Product Report"/>

                <div id="print-content"
                     className="w-full bg-[#f57b20] mt-6 p-0 overflow-x-auto max-h-[60vh] overflow-y-auto">
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
                        className="border bg-[#f57b20] px-3 py-2 cursor-pointer hover:bg-[#db6c1c] text-[#fff3ea]"
                    >
                        Add new product
                    </button>
                )}
            </main>

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