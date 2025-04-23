import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function ClientsPage() {
  const [surname, setSurname] = useState("");
  const [percentages, setPercentages] = useState([]);
  const [percentage, setPercentage] = useState("");
  const [sortOrder, setSortOrder] = useState("Ascending");
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({});

  useEffect(() => {
    handleFilter();
    console.log(selectedClient);
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
  const openEditModal = (client) => {
    setSelectedClient(client);
  };
  const closeEditModal = () => {
    setSelectedClient(null);
  };

  const handleFilter = () => {
    fetchClients({
      search: surname.trim(),
      percentage: percentage,
      descending: sortOrder === "Descending" ? "True" : undefined,
    });
  };
  const handleDeleteClient = () => {
    if (!selectedClient) return;
    fetch(
      `http://localhost:5000/api/client/?card_number=${selectedClient.card_number}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    )
      .then(() => {
        handleFilter();
        closeEditModal();
      })
      .catch((error) => console.error("Error deleting product:", error));
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
            {localStorage.getItem("role") === "Manager" && (
                            <li className="cursor-pointer hover:underline">
                                <Link to="/categories">Categories</Link>
                            </li>
                        )}
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
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex-1 border bg-[#f57b20] rounded-md px-3 py-2 cursor-pointer hover:bg-[#db6c1c]"
          >
            Make Report
          </button>
        </div>
        <div className="w-full bg-[#f57b20] mt-6 p-0 overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full border-collapse bg-[#f57b20] text-[#fff3ea]">
            <thead>
              <tr className="bg-[#db6c1c] sticky top-0">
                <th className="px-4 py-2">Card Number</th>
                <th className="px-4 py-2">Surname</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Patronymic</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">City</th>
                <th className="px-4 py-2">Street</th>
                <th className="px-4 py-2">ZIP</th>
                <th className="px-4 py-2">Percent</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-[#fff3ea]">
                    -
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr
                    key={client.card_number}
                    className="border-b border-[#fff3ea] hover:bg-[#db6c1c] cursor-pointer text-center"
                    onDoubleClick={() => openEditModal(client)}
                  >
                    <td className="px-4 py-2">{client.card_number}</td>
                    <td className="px-4 py-2">{client.cust_surname}</td>
                    <td className="px-4 py-2">{client.cust_name}</td>
                    <td className="px-4 py-2">
                      {client.cust_patronymic || "-"}
                    </td>
                    <td className="px-4 py-2">{client.phone_number}</td>
                    <td className="px-4 py-2">{client.city}</td>
                    <td className="px-4 py-2">{client.street}</td>
                    <td className="px-4 py-2">{client.zip_code}</td>
                    <td className="px-4 py-2">{client.percent}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
          {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-3/4 h-3/4 relative">
            <button
              onClick={() => setReportModalOpen(false)}
              className="absolute top-4 right-4 text-[#f57b20] cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-2xl mb-4">Clients Report Preview</h2>
            <iframe
              src="http://localhost:5000/api/client/report/preview?preview=true"
              title="Products Report Preview"
              className="w-full h-3/4"
            ></iframe>
          </div>
        </div>
      )}
        {localStorage.getItem("role") === "Manager" && (
          <button
            onClick={() => {
              setAddClientModalOpen(true);
              setNewClient({});
            }}
            className="border bg-[#f57b20] px-3 py-2 cursor-pointer hover:bg-[#db6c1c]"
          >
            Add new client
          </button>
        )}
      </main>
      {selectedClient && localStorage.getItem("role") === "Manager" && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#FFF3EA] rounded-2xl shadow-lg p-8 w-[400px]  max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={closeEditModal}
              className="absolute top-4 right-4 text-[#f57b20] cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-2xl mb-4 text-[#f57b20]">Edit Client</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetch(
                  `http://localhost:5000/api/client/?card_number=${selectedClient.card_number}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(selectedClient),
                  }
                )
                  .then((res) => res.json())
                  .then(() => {
                    closeEditModal();
                    fetchClients();
                  })
                  .catch((err) => console.error("Error updating client:", err));
              }}
              className="space-y-3"
            >
              {[
                "card_number",
                "cust_surname",
                "cust_name",
                "cust_patronymic",
                "phone_number",
                "city",
                "street",
                "zip_code",
                "percent",
              ].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm text-[#f57b20] capitalize">
                    {field.replace(/_/g, " ")}
                  </label>
                  <input
                    type={field === "percent" ? "number" : "text"}
                    value={selectedClient[field] ?? ""}
                    onChange={(e) =>
                      setSelectedClient({
                        ...selectedClient,
                        [field]:
                          field === "percent"
                            ? Number(e.target.value)
                            : e.target.value,
                      })
                    }
                    className="border border-[#f57b20] rounded-md px-3 py-1 bg-white text-[#333]"
                    required={[
                      "card_number",
                      "cust_name",
                      "cust_surname",
                      "phone_number",
                      "percent",
                    ].includes(field)}
                  />
                </div>
              ))}
              <div className="flex justify-between">
                <button
                  onClick={handleDeleteClient}
                  className="bg-red-500 text-white mt-2 px-4 py-2 rounded cursor-pointer hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  type="submit"
                  className="border bg-[#f57b20] rounded-md mt-2 px-4 py-2 cursor-pointer hover:bg-[#db6c1c] text-white"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {addClientModalOpen && localStorage.getItem("role") === "Manager" && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#FFF3EA] rounded-2xl shadow-lg p-8 w-[400px] max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setAddClientModalOpen(false)}
              className="absolute top-4 right-4 text-[#f57b20] cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-2xl mb-4 text-[#f57b20]">Add New Client</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetch(`http://localhost:5000/api/client/`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(newClient),
                })
                  .then((res) => res.json())
                  .then(() => {
                    setAddClientModalOpen(false);
                    fetchClients();
                  })
                  .catch((err) => console.error("Error adding client:", err));
              }}
              className="space-y-3"
            >
              {[
                "card_number",
                "cust_surname",
                "cust_name",
                "cust_patronymic",
                "phone_number",
                "city",
                "street",
                "zip_code",
                "percent",
              ].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm text-[#f57b20] capitalize">
                    {field.replace(/_/g, " ")}
                  </label>
                  <input
                    type={field === "percent" ? "number" : "text"}
                    value={newClient[field] ?? ""}
                    onChange={(e) =>
                      setNewClient({
                        ...newClient,
                        [field]:
                          field === "percent"
                            ? Number(e.target.value)
                            : e.target.value,
                      })
                    }
                    className="border border-[#f57b20] rounded-md px-3 py-1 bg-white text-[#333]"
                    required={[
                      "card_number",
                      "cust_name",
                      "cust_surname",
                      "phone_number",
                      "percent",
                    ].includes(field)}
                  />
                </div>
              ))}

              <button
                type="submit"
                className=" border bg-[#f57b20] text-white mt-2 px-4 py-2 rounded cursor-pointer hover:bg-[#db6c1c]"
              >
                Add New Client
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
