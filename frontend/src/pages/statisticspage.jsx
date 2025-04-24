import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";

export default function StatisticsPage() {
  // For navigation, storing the selected option
  const [selectedOption, setSelectedOption] = useState("top-products");

  return (
    <div className="w-screen h-screen bg-[#fff3ea] font-['Kumbh_Sans'] text-lg font-normal flex flex-col items-center">
      <Header />

      {/* Navigation Section */}
      <div className="w-full bg-[#ff952b] py-4">
        <nav className="flex justify-center space-x-6">
          <button
            className={`text-lg ${selectedOption === "top-products" ? "font-bold" : ""}`}
            onClick={() => setSelectedOption("top-products")}
          >
            Top Products
          </button>
          <button
            className={`text-lg ${selectedOption === "sales-trends" ? "font-bold" : ""}`}
            onClick={() => setSelectedOption("sales-trends")}
          >
            Sales Trends
          </button>
          <button
            className={`text-lg ${selectedOption === "region-revenue" ? "font-bold" : ""}`}
            onClick={() => setSelectedOption("region-revenue")}
          >
            Region Revenue
          </button>
        </nav>
      </div>

      {/* Main content with 2:3 ratio */}
      <main className="flex-grow flex items-start justify-center w-full px-8 py-8">
        <div className="flex w-full gap-8">
          {/* Left Side: Table */}
          <div className="w-2/5 bg-white p-4 shadow-lg rounded-lg h-[450px]">
            <h2 className="text-xl font-semibold mb-4 text-black">Top 5 Products by Revenue</h2>
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="border-b py-2 text-left text-black">Product</th>
                  <th className="border-b py-2 text-left text-black">Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b py-2 text-black">Product A</td>
                  <td className="border-b py-2 text-black">$1000</td>
                </tr>
                <tr>
                  <td className="border-b py-2 text-black">Product B</td>
                  <td className="border-b py-2 text-black">$1500</td>
                </tr>
                <tr>
                  <td className="border-b py-2 text-black">Product C</td>
                  <td className="border-b py-2 text-black">$2000</td>
                </tr>
                <tr>
                  <td className="border-b py-2 text-black">Product D</td>
                  <td className="border-b py-2 text-black">$2500</td>
                </tr>
                <tr>
                  <td className="border-b py-2 text-black">Product E</td>
                  <td className="border-b py-2 text-black">$3000</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right Side: Chart Section */}
          <div className="w-3/5 bg-white p-4 shadow-lg rounded-lg h-[380px] overflow-hidden">
            <h2 className="text-xl font-semibold mb-4 text-black">Revenue Chart</h2>
            {/* Placeholder chart */}
            <div className="w-full h-[300px] bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex justify-center items-center text-white font-semibold">
              <p className="rounded-lg">Chart Placeholder</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
