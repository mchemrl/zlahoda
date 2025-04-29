import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";

export default function ChecksPage() {
  const [checkNumber, setCheckNumber] = useState("");
  const [sortOrder, setSortOrder] = useState("Ascending");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState([]);
  const [products, setProducts] = useState([]);
  const [checks, setChecks] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [selectedCashier, setSelectedCashier] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const role = localStorage.getItem("role");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newReceipt, setNewReceipt] = useState({
    products: [{ id_product: "", product_number: 1 }],
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/employees?role=Cashier")
      .then((res) => res.json())
      .then((data) => setCashiers(data))
      .catch((err) => console.error("Error fetching cashiers:", err));

    fetch("http://localhost:5000/api/employees/me", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        newReceipt.id_employee = data.id_employee;
        console.log(newReceipt);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        setError(error.message);
      });

    fetchProducts();
    handleFilter();
  }, []);
  const fetchProducts = () => {
    const queryParams = new URLSearchParams();

    fetch(
      `http://localhost:5000/api/store_products?${queryParams.toString()}`,
      {
        credentials: "include",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
      })
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

  const handleFilter = () => {
    fetchChecks({
      cashier_id: selectedCashier || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });
  };

  return (
    <div className="w-screen h-screen bg-[#fff3ea] font-['Kumbh_Sans'] text-lg font-normal flex flex-col relative">
      <Header />

      <main className="flex-grow flex flex-col w-full h-screen overflow-hidden px-8 py-8">
        <div className="w-full flex flex-wrap gap-4">
          <select
            value={selectedCashier}
            onChange={(e) => setSelectedCashier(e.target.value)}
            className="border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20] flex-1"
          >
            <option value="">All Cashiers</option>
            {cashiers.map((cashier) => (
              <option key={cashier.id_employee} value={cashier.id_employee}>
                {cashier.empl_surname} {cashier.empl_name}
              </option>
            ))}
          </select>

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
        </div>

        <div className="w-full bg-[#f57b20] mt-6 p-0 overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full border-collapse bg-[#f57b20] text-[#fff3ea]">
            <thead>
              <tr className="bg-[#db6c1c] sticky top-0">
                <th className="px-4 py-2">Receipt Number</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Cashier ID</th>
                <th className="px-4 py-2">Total Sum</th>
                {role === "Manager" && <th className="px-4 py-2">Delete</th>}
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
                    className="border-b border-[#fff3ea] hover:bg-[#db6c1c] text-center"
                  >
                    <td className="px-4 py-2">{check.receipt_number}</td>
                    <td className="px-4 py-2">{check.print_date}</td>
                    <td className="px-4 py-2">{check.id_employee}</td>
                    <td className="px-4 py-2">{check.sum_total}</td>
                    {role === "Manager" && (
                      <td>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "Ви впевнені, що хочете видалити цей чек?"
                              )
                            ) {
                              fetch(
                                `http://localhost:5000/api/receipts/?receipt_id=${check.receipt_number}`,
                                {
                                  method: "DELETE",
                                  credentials: "include",
                                }
                              )
                                .then(() => handleFilter())
                                .catch((err) =>
                                  console.error("Error deleting receipt:", err)
                                );
                            }
                          }}
                          className="text-red-600 font-bold cursor-pointer"
                        >
                          X
                        </button>
                      </td>
                    )}
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
              onChange={(e) => {
                setNewReceipt({
                  ...newReceipt,
                  receipt_number: e.target.value,
                });
              }}
              className="border border-[#f57b20] rounded p-2 w-full bg-[#fff3ea] text-[#f57b20] mb-4"
            />
            <input
              type="date"
              onChange={(e) => {
                setNewReceipt({ ...newReceipt, print_date: e.target.value });
              }}
              className="border border-[#f57b20] rounded p-2 w-full bg-[#fff3ea] text-[#f57b20] mb-4"
            />
            <input
              type="text"
              min="1"
              placeholder="Customer card"
              onChange={(e) => {
                setNewReceipt({ ...newReceipt, customer_card: e.target.value });
              }}
              className="w-full mb-6 border p-2 rounded border-[#f57b20] text-[#f57b20]"
            />

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
                  console.log(newReceipt);
                  setErrors([]);
                  fetch("http://localhost:5000/api/receipts/", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
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
    </div>
  );
}
