import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import { handlePrint, usePrintStyles, PrintHeader } from "../utils/print.jsx";

export default function ChecksPage() {
  const [checkNumber, setCheckNumber] = useState("");
  const [sortOrder, setSortOrder] = useState("Ascending");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState([]);
  const [products, setProducts] = useState([]);
  const [checks, setChecks] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCashier, setSelectedCashier] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lookupModalOpen, setLookupModalOpen] = useState(false);
  const [lookupReceiptNumber, setLookupReceiptNumber] = useState("");
  const [lookupReceipt, setLookupReceipt] = useState(null);
  const [lookupError, setLookupError] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [newReceipt, setNewReceipt] = useState({
    products: [{ id_product: "", product_number: 1 }],
  });
  // States for totals and product quantity (Manager only)
  const [totalSumCashier, setTotalSumCashier] = useState(0);
  const [totalSumAll, setTotalSumAll] = useState(0);
  const [productQuantity, setProductQuantity] = useState(0);
  const [selectedProductUPC, setSelectedProductUPC] = useState("");
  const [isFiltered, setIsFiltered] = useState(false); // New state to track if filter is applied

  const role = localStorage.getItem("role");
  usePrintStyles();

  useEffect(() => {
    // Fetch cashiers (for Managers)
    if (role === "Manager") {
      fetch("http://localhost:5000/api/employees?role=Cashier")
        .then((res) => res.json())
        .then((data) => setCashiers(data))
        .catch((err) => console.error("Error fetching cashiers:", err));
    }

    // Fetch current user
    fetch("http://localhost:5000/api/employees/me", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        newReceipt.id_employee = data.id_employee;
        if (role === "Cashier") {
          setSelectedCashier(data.id_employee);
          const today = new Date().toISOString().split("T")[0];
          setStartDate(today);
          setEndDate(today);
          fetchChecks({
            cashier_id: data.id_employee,
            start_date: today,
            end_date: today,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        setError(error.message);
      });

    // Fetch customers
    fetch("http://localhost:5000/api/client/", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setCustomers(data))
      .catch((error) => console.error("Error fetching customers:", error));

    fetchProducts();
    if (role === "Manager") {
      handleFilter();
    }
  }, []);

  const fetchProducts = () => {
    fetch("http://localhost:5000/api/store_products", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  };

  const fetchChecks = (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.cashier_id) queryParams.append("cashier_id", params.cashier_id);
    if (params.start_date) queryParams.append("start_date", params.start_date);
    if (params.end_date) queryParams.append("end_date", params.end_date);

    fetch(`http://localhost:5000/api/receipts?${queryParams.toString()}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setChecks(data))
      .catch((error) => console.error("Error fetching checks:", error));
  };

  const fetchTotals = (cashierId, start, end) => {
    // Fetch total sum for specific cashier
    const cashierParams = new URLSearchParams();
    if (cashierId) cashierParams.append("cashier_id", cashierId);
    if (start) cashierParams.append("start_date", start);
    if (end) cashierParams.append("end_date", end);

    fetch(
      `http://localhost:5000/api/receipts/total_sum?${cashierParams.toString()}`,
      {
        credentials: "include",
      }
    )
      .then((response) => response.json())
      .then((data) => setTotalSumCashier(Number(data.total_sum) || 0))
      .catch((error) =>
        console.error("Error fetching cashier total sum:", error)
      );

    // Fetch total sum for all cashiers
    const allParams = new URLSearchParams();
    if (start) allParams.append("start_date", start);
    if (end) allParams.append("end_date", end);

    fetch(
      `http://localhost:5000/api/receipts/total_sum?${allParams.toString()}`,
      {
        credentials: "include",
      }
    )
      .then((response) => response.json())
      .then((data) => setTotalSumAll(Number(data.total_sum) || 0))
      .catch((error) =>
        console.error("Error fetching all cashiers total sum:", error)
      );

    // Fetch product quantity if a product is selected
    if (selectedProductUPC) {
      const productParams = new URLSearchParams();
      productParams.append("upc", selectedProductUPC);
      if (start) productParams.append("start_date", start);
      if (end) productParams.append("end_date", end);

      fetch(
        `http://localhost:5000/api/receipts/product_amount?${productParams.toString()}`,
        {
          credentials: "include",
        }
      )
        .then((response) => response.json())
        .then((data) => setProductQuantity(Number(data.quantity) || 0))
        .catch((error) =>
          console.error("Error fetching product quantity:", error)
        );
    }
  };

  const handleFilter = () => {
    const params = {
      cashier_id:
        role === "Cashier" ? selectedCashier : selectedCashier || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    };
    fetchChecks(params);
    if (role === "Manager") {
      fetchTotals(selectedCashier, startDate, endDate);
      setIsFiltered(true); // Set filter applied state
    }
  };

  const handleDelete = () => {
    if (selectedReceipt) {
      fetch(
        `http://localhost:5000/api/receipts/?receipt_id=${selectedReceipt.receipt_number}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      )
        .then(() => {
          setDeleteModalOpen(false);
          setSelectedReceipt(null);
          handleFilter();
        })
        .catch((err) => console.error("Error deleting receipt:", err));
    }
  };

  const handleRowClick = (check) => {
    if (role === "Manager") {
      setSelectedReceipt(check);
      setDeleteModalOpen(true);
    }
  };

  const handleReceiptLookup = () => {
    setLookupError("");
    fetch(
      `http://localhost:5000/api/receipts?receipt_id=${lookupReceiptNumber}`,
      {
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) throw new Error("Receipt not found");
        return response.json();
      })
      .then((receiptData) => {
        return fetch(
          `http://localhost:5000/api/sales/?receipt_id=${lookupReceiptNumber}`,
          {
            credentials: "include",
          }
        )
          .then((salesResponse) => {
            if (!salesResponse.ok) throw new Error("Sales not found");
            return salesResponse.json();
          })
          .then((salesData) => {
            setLookupReceipt({ ...receiptData, products: salesData });
          });
      })
      .catch((error) => {
        setLookupError(error.message);
        setLookupReceipt(null);
      });
  };

  return (
    <div className="w-screen h-screen bg-[#fff3ea] font-['Kumbh_Sans'] text-lg font-normal flex flex-col relative">
      <Header />
      <main className="flex-grow flex flex-col w-full h-screen overflow-hidden px-8 py-8">
        <div className="w-full flex flex-wrap gap-4">
          {role === "Manager" && (
            <>
              <select
                value={selectedCashier}
                onChange={(e) => {
                  setSelectedCashier(e.target.value);
                }}
                className="border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20] flex-1"
              >
                <option value="">All Cashiers</option>
                {cashiers.map((cashier) => (
                  <option key={cashier.id_employee} value={cashier.id_employee}>
                    {cashier.empl_surname} {cashier.empl_name}{" "}
                    {cashier.empl_patronymic || ""}
                  </option>
                ))}
              </select>
              <select
                value={selectedProductUPC}
                onChange={(e) => setSelectedProductUPC(e.target.value)}
                className="border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20] flex-1"
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product.upc} value={product.upc}>
                    {product.product_name}{" "}
                    {product.promotional_product ? "(Promo)" : ""}
                  </option>
                ))}
              </select>
            </>
          )}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20] flex-2"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20] flex-2"
          />
          <button
            onClick={handleFilter}
            className="bg-[#f57b20] rounded-md px-3 py-2 cursor-pointer hover:bg-[#db6c1c] text-white flex-1"
          >
            Filter
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 border bg-[#f57b20] rounded-md px-3 py-2 cursor-pointer hover:bg-[#db6c1c] text-[#fff3ea]"
          >
            Print
          </button>
          {role === "Cashier" && (
            <button
              onClick={() => setLookupModalOpen(true)}
              className="flex-1 border bg-[#f57b20] rounded-md px-3 py-2 cursor-pointer hover:bg-[#db6c1c] text-[#fff3ea]"
            >
              Lookup Receipt
            </button>
          )}
        </div>

        {/* Display Totals (Manager only) */}
        {role === "Manager" && (
          <div className="mt-4 bg-[#fff3ea] p-4 rounded-md border border-[#f57b20] text-[#f57b20]">
            <h3 className="text-xl font-bold text-[#f57b20] mb-2">
              Sales Summary
            </h3>
            {isFiltered && selectedCashier && (
              <div>
                Total Sales by Selected Cashier:{" "}
                <strong>
                  {Number(totalSumCashier).toFixed(2) ===
                  Number(totalSumAll).toFixed(2)
                    ? "-"
                    : "$" + Number(totalSumCashier).toFixed(2)}
                </strong>
              </div>
            )}
            {isFiltered && (
              <div>
                Total Sales by All Cashiers:{" "}
                <strong>${Number(totalSumAll).toFixed(2)}</strong>
              </div>
            )}
            {isFiltered && selectedProductUPC && (
              <div>
                Total Units Sold of Selected Product:{" "}
                <strong>
                  {Number(productQuantity) === 0
                    ? "-"
                    : Number(productQuantity)}
                </strong>
              </div>
            )}
          </div>
        )}

        <PrintHeader title="Check Report" />
        <div
          id="print-content"
          className="w-full bg-[#f57b20] mt-6 p-0 overflow-x-auto max-h-[60vh] overflow-y-auto"
        >
          <table className="w-full border-collapse bg-[#f57b20] text-[#fff3ea]">
            <thead>
              <tr className="bg-[#db6c1c] sticky top-0">
                <th className="px-4 py-2">Receipt Number</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Cashier Name</th>
                <th className="px-4 py-2">Total Sum</th>
              </tr>
            </thead>
            <tbody>
              {checks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    -
                  </td>
                </tr>
              ) : (
                checks.map((check) => (
                  <tr
                    key={check.receipt_number}
                    className={`border-b border-[#fff3ea] hover:bg-[#db6c1c] text-center ${
                      role === "Manager" ? "cursor-pointer" : ""
                    }`}
                    onClick={() => handleRowClick(check)}
                  >
                    <td className="px-4 py-2">{check.receipt_number}</td>
                    <td className="px-4 py-2">{check.print_date}</td>
                    <td className="px-4 py-2">{check.full_name}</td>
                    <td className="px-4 py-2">{check.sum_total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="border bg-[#f57b20] px-3 py-2 cursor-pointer hover:bg-[#db6c1c]"
        >
          Add new receipt
        </button>
      </main>

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-[#FFF3EA] rounded-2xl shadow-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-[#f57b20] mb-4">
              Confirm Delete
            </h2>
            <p className="mb-6 text-black">
              Are you sure you want to delete this receipt?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedReceipt(null);
                }}
                className="border border-[#f57b20] text-[#f57b20] px-4 py-2 rounded hover:bg-[#ffebdb] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-[#f57b20] text-white px-4 py-2 rounded hover:bg-[#db6c1c] cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Receipt Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#FFF3EA] rounded-2xl shadow-lg p-8 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setAddModalOpen(false)}
              className="absolute top-4 right-4 text-[#f57b20] cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-[#f57b20] mb-4">
              New receipt
            </h2>
            {errors.length > 0 && (
              <div className="text-red-600 mb-4">
                {errors.map((err, idx) => (
                  <div key={idx}>{err}</div>
                ))}
              </div>
            )}
            <input
              type="text"
              placeholder="Receipt id"
              onChange={(e) =>
                setNewReceipt({ ...newReceipt, receipt_number: e.target.value })
              }
              className="border border-[#f57b20] rounded p-2 w-full bg-[#fff3ea] text-[#f57b20] mb-4"
            />
            <input
              type="date"
              onChange={(e) =>
                setNewReceipt({ ...newReceipt, print_date: e.target.value })
              }
              className="border border-[#f57b20] rounded p-2 w-full bg-[#fff3ea] text-[#f57b20] mb-4"
            />
            <select
              value={newReceipt.customer_card || ""}
              onChange={(e) =>
                setNewReceipt({
                  ...newReceipt,
                  customer_card: e.target.value || null,
                })
              }
              className="w-full mb-6 border p-2 rounded border-[#f57b20] text-[#f57b20]"
            >
              <option value="">Select customer card (optional)</option>
              {customers.map((customer) => (
                <option key={customer.card_number} value={customer.card_number}>
                  {customer.card_number} - {customer.cust_surname}{" "}
                  {customer.cust_name} {customer.cust_patronymic || ""}
                </option>
              ))}
            </select>
            {newReceipt.products.map((item, index) => (
              <div key={index} className="flex gap-2 items-center mb-4">
                <select
                  value={item.upc}
                  onChange={(e) => {
                    const selectedUPC = e.target.value;
                    const selectedProduct = products.find(
                      (prod) => prod.upc === selectedUPC
                    );
                    const updated = [...newReceipt.products];
                    updated[index] = {
                      ...updated[index],
                      upc: selectedProduct.upc,
                      is_promo: selectedProduct.promotional_product,
                    };
                    setNewReceipt({ ...newReceipt, products: updated });
                  }}
                  className="w-full border p-2 rounded border-[#f57b20] text-[#f57b20]"
                >
                  <option value="">Select product</option>
                  {products.map((prod) => (
                    <option key={prod.upc} value={prod.upc}>
                      {prod.product_name}
                      {prod.promotional_product ? " (Promo)" : ""}
                      {` ${prod.products_number} in stock`}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={item.product_number}
                  onChange={(e) => {
                    const updated = [...newReceipt.products];
                    updated[index].product_number = Number(e.target.value);
                    setNewReceipt({ ...newReceipt, products: updated });
                  }}
                  className="border border-[#f57b20] border p-2 rounded border-[#f57b20] text-[#f57b20]"
                />
                <button
                  onClick={() => {
                    const updated = newReceipt.products.filter(
                      (_, i) => i !== index
                    );
                    setNewReceipt({ ...newReceipt, products: updated });
                  }}
                  className="text-red-600 font-bold cursor-pointer"
                >
                  X
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                setNewReceipt({
                  ...newReceipt,
                  products: [
                    ...newReceipt.products,
                    { id_product: "", product_number: 1 },
                  ],
                })
              }
              className="text-[#f57b20] underline mb-4 cursor-pointer"
            >
              + Add another good
            </button>
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setErrors([]);
                  fetch("http://localhost:5000/api/receipts/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(newReceipt),
                  })
                    .then(async (res) => {
                      if (!res.ok) {
                        const err = await res.json();
                        setErrors(
                          Array.isArray(err.message)
                            ? err.message
                            : [err.message || "Error saving receipt"]
                        );
                        return;
                      }
                      setAddModalOpen(false);
                      setNewReceipt({
                        products: [{ id_product: "", product_number: 1 }],
                      });
                      handleFilter();
                    })
                    .catch((err) => {
                      setErrors(["Network error while saving receipt."]);
                      console.error("Error adding receipt:", err);
                    });
                }}
                className="bg-[#f57b20] text-white px-4 py-2 rounded hover:bg-[#db6c1c] cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lookup Receipt Modal */}
      {lookupModalOpen && role === "Cashier" && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-[#FFF3EA] rounded-2xl shadow-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#f57b20]">
                Lookup Receipt
              </h2>
              <button
                onClick={() => {
                  setLookupModalOpen(false);
                  setLookupReceipt(null);
                  setLookupReceiptNumber("");
                  setLookupError("");
                }}
                className="text-[#f57b20] cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter receipt number"
                value={lookupReceiptNumber}
                onChange={(e) => setLookupReceiptNumber(e.target.value)}
                className="border border-[#f57b20] rounded p-2 w-full bg-[#fff3ea] text-[#f57b20]"
              />
              <button
                onClick={handleReceiptLookup}
                className="mt-2 bg-[#f57b20] text-white px-4 py-2 rounded hover:bg-[#db6c1c] cursor-pointer w-full"
              >
                Search
              </button>
            </div>
            {lookupError && (
              <div className="text-red-600 mb-4">{lookupError}</div>
            )}
            {lookupReceipt && (
              <div className="text-black">
                <div className="mb-2">
                  <strong>Receipt Number:</strong>{" "}
                  {lookupReceipt.receipt_number}
                </div>
                <div className="mb-2">
                  <strong>Date:</strong> {lookupReceipt.print_date}
                </div>
                <div className="mb-2">
                  <strong>Cashier Name:</strong> {lookupReceipt.full_name}
                </div>
                <div className="mb-2">
                  <strong>Customer Card:</strong>{" "}
                  {lookupReceipt.card_number || "-"}
                </div>
                <div className="mb-2">
                  <strong>Total Sum:</strong> {lookupReceipt.sum_total}
                </div>
                <h3 className="font-bold text-[#f57b20] mt-4 mb-2">Products</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#f57b20] text-[#fff3ea]">
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Quantity</th>
                      <th className="px-4 py-2">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lookupReceipt.products?.length > 0 ? (
                      lookupReceipt.products.map((product, index) => (
                        <tr
                          key={index}
                          className="border-b border-[#f57b20] text-center"
                        >
                          <td className="px-4 py-2">{product.product_name}</td>
                          <td className="px-4 py-2">
                            {product.product_number}
                          </td>
                          <td className="px-4 py-2">{product.selling_price}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-4">
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
