import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function ClientsPage() {
  const [surname, setSurname] = useState("");
  const [percentages, setPercentages] = useState([]);
  const [percentage, setPercentage] = useState("");
  const [sortOrder, setSortOrder] = useState("Ascending");
  const [clients, setClients] = useState([]);

  useEffect(() => {
    handleFilter();
  }, []);

  const fetchClients = (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append("search", params.search);
    if (params.percentage && params.percentage !== "All percentages")
      queryParams.append("percent", params.percentage);
    if (params.descending) queryParams.append("descending", params.descending);

    fetch(`http://localhost:5000/api/client?${queryParams.toString()}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setClients(data);
        const uniquePercents = [
          ...new Set(data.map((client) => client.percent)),
        ];

        if (params.percentage === "") setPercentages(uniquePercents);
      })
      .catch((error) => console.error("Error fetching clients:", error));
  };

  const handleFilter = () => {
    fetchClients({
      search: surname.trim(),
      percentage: percentage,
      descending: sortOrder === "Descending" ? "True" : undefined,
    });
  };

  return (
    <div className="w-screen h-screen bg-[#fff3ea] font-['Kumbh_Sans'] text-lg font-normal flex flex-col relative">
      <header className="w-screen h-24 bg-[#f57b20] bg-opacity-75 shadow-lg flex justify-between items-center px-6">
        <div className="text-orange-50 text-3xl flex items-center">
          Zlahoda
          <img
            src="static/bumbastik/bumbastik_thumbs.gif"
            alt="Loading GIF"
            className="w-15 h-15"
          />
        </div>
        <nav className="flex space-x-6 text-orange-50 text-lg">
          <ul className="flex space-x-6">
            <li className="cursor-pointer hover:underline">
              <Link to="/clients">Client</Link>
            </li>
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
          {localStorage.getItem("role") === "Cashier" ? (
            <input
              type="text"
              placeholder="Search by client surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="flex-2 border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20] placeholder-[#f57b20]"
            />
          ) : (
            <select
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="flex-2 border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20]"
            >
              <option>All percentages</option>
              {percentages.map((percent) => (
                <option className="w-full" key={percent} value={percent}>
                  {percent}%
                </option>
              ))}
            </select>
          )}
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
            className="flex-1 border bg-[#f57b20] rounded-md px-3 py-2 cursor-pointer hover:bg-[#db6c1c]"
          >
            Filter
          </button>
        </div>
        <div className="w-full bg-[#f57b20] mt-6 p-0 overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full border-collapse bg-[#f57b20] text-[#fff3ea]">
            <thead>
              <tr className="bg-[#db6c1c] sticky top-0">
                <th className="px-4 py-2">Card Number</th>
                <th className="px-4 py-2">Surname</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Percent</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 || clients[0].card_number == null ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-[#fff3ea]">
                    -
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr
                    key={client.card_number}
                    className="border-b border-[#fff3ea] hover:bg-[#db6c1c] cursor-pointer text-center"
                    onDoubleClick={() => {
                      console.log("Double-clicked client:", client.card_number);
                    }}
                  >
                    <td className="px-4 py-2">{client.card_number}</td>
                    <td className="px-4 py-2">{client.cust_surname}</td>
                    <td className="px-4 py-2">{client.cust_name}</td>
                    <td className="px-4 py-2">{client.phone_number}</td>
                    <td className="px-4 py-2">{client.percent}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
