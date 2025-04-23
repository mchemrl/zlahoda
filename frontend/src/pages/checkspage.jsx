import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "C:\\Users\\lucka\\OneDrive\\Документы\\GitHub\\zlahodareal\\frontend\\src\\components\\header.jsx";

export default function ChecksPage() {
  const [checkNumber, setCheckNumber] = useState("");
  const [sortOrder, setSortOrder] = useState("Ascending");
  const [checks, setChecks] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [selectedCashier, setSelectedCashier] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const role = localStorage.getItem("role");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newReceipt, setNewReceipt] = useState({
    items: [{ id_product: "", quantity: 1 }],
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/employees?role=Cashier")
      .then((res) => res.json())
      .then((data) => setCashiers(data))
      .catch((err) => console.error("Error fetching cashiers:", err));

    handleFilter();
  }, []);

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
          Додати новий чек
        </button>
      </main>
      {addModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[500px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#f57b20] mb-4">Новий чек</h2>
            {newReceipt.items.map((item, index) => (
              <div key={index} className="flex gap-2 items-center mb-2">
                <input
                  placeholder="ID продукту"
                  value={item.id_product}
                  onChange={(e) => {
                    const updated = [...newReceipt.items];
                    updated[index].id_product = e.target.value;
                    setNewReceipt({ ...newReceipt, items: updated });
                  }}
                  className="border px-2 py-1 flex-1"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Кількість"
                  value={item.quantity}
                  onChange={(e) => {
                    const updated = [...newReceipt.items];
                    updated[index].quantity = Number(e.target.value);
                    setNewReceipt({ ...newReceipt, items: updated });
                  }}
                  className="border px-2 py-1 w-24"
                />
                <button
                  onClick={() => {
                    const updated = newReceipt.items.filter(
                      (_, i) => i !== index
                    );
                    setNewReceipt({ ...newReceipt, items: updated });
                  }}
                  className="text-red-600 font-bold"
                >
                  X
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                setNewReceipt({
                  ...newReceipt,
                  items: [...newReceipt.items, { id_product: "", quantity: 1 }],
                })
              }
              className="text-[#f57b20] underline mb-4"
            >
              + Додати ще товар
            </button>

            <div className="flex justify-between">
              <button
                onClick={() => setAddModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Скасувати
              </button>
              <button
                onClick={() => {
                  fetch("http://localhost:5000/api/receipts", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(newReceipt),
                  })
                    .then((res) => res.json())
                    .then(() => {
                      setAddModalOpen(false);
                      handleFilter();
                    })
                    .catch((err) =>
                      console.error("Error adding receipt:", err)
                    );
                }}
                className="bg-[#f57b20] text-white px-4 py-2 rounded hover:bg-[#db6c1c]"
              >
                Зберегти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
