import React, { useEffect, useState } from "react";
import axios from "axios";

const CashierStats = () => {
  const [minReceipts, setMinReceipts] = useState(0);
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chartUrl, setChartUrl] = useState("");

  const fetchCashiers = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/statistics/cashiers_by_receipts?min_receipts=${minReceipts}`
      );
      const data = await res.json();

      if (Array.isArray(data)) {
        setCashiers(data);
      } else {
        console.error("Expected array, got:", data);
        setCashiers([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setCashiers([]);
    }
  };
  const fetchChart = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/statistics/chart_cashiers_by_receipts?min_receipts=${minReceipts}`
      );
      if (!res.ok) throw new Error("Chart fetch failed");
      const blob = await res.blob();
      setChartUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error loading chart:", error);
    }
  };

  useEffect(() => {
    fetchCashiers();
    fetchChart();
  }, [minReceipts]);

  return (
    <div className="flex w-full gap-8">
      <div className="w-2/5 bg-white p-4 shadow-lg rounded-lg h-[405px] overflow-auto">
        <h2 className="text-xl font-semibold mb-4 text-black">
          Employees by registered checks Revenue
        </h2>
        <div className="flex items-center mb-4">
          <label htmlFor="minReceipts" className="mr-2 text-black">
            Min Receipts:
          </label>
          <input
            type="number"
            id="minReceipts"
            value={minReceipts}
            onChange={(e) => setMinReceipts(e.target.value)}
            className="border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20]"
            min={0}
          />
        </div>
        <div className="w-full bg-[#f57b20] rounded-md overflow-hidden">
          <table className="w-full table-auto bg-[#f57b20] text-[#fff3ea]">
            <thead>
              <tr className="bg-[#db6c1c] sticky top-0">
                <th className="px-4 py-2 text-left">Employee</th>
                <th className="px-4 py-2 text-left">Receipts</th>
                <th className="px-4 py-2 text-left">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="3" className="py-4 text-center">
                    Loading...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && cashiers.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-4 text-center">
                    Nothing found 😶
                  </td>
                </tr>
              )}
              {!loading &&
                cashiers.map((c) => (
                  <tr
                    key={c.id_employee}
                    className="border-b border-[#fff3ea] hover:bg-[#db6c1c]"
                  >
                    <td className="px-4 py-2 text-white">{c.full_name}</td>
                    <td className="px-4 py-2 text-white">{c.receipt_count}</td>
                    <td className="px-4 py-2 text-white">
                      ₴{Number(c.total_sales).toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="w-3/5 bg-white p-4 shadow-lg rounded-lg h-[380px] flex flex-col">
        <h2 className="text-xl font-semibold mb-4 text-black">Revenue Chart</h2>
        {cashiers.length > 0 ? (
          <img
            src={chartUrl}
            alt="Employee Revenue Chart"
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
  );
};

export default CashierStats;
