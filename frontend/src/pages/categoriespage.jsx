import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/header";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [sortOrder, setSortOrder] = useState("Ascending");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    category_id: "",
    category_name: "",
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("role") !== "Manager") {
      navigate("/profile");
      return;
    }

    fetchCategories({});
  }, [navigate]);

  const fetchCategories = (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.category_id)
      queryParams.append("category_id", params.category_id); // Add category_id if present
    if (params.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params.is_ascending !== undefined)
      queryParams.append("is_ascending", params.is_ascending ? 1 : 0);

    fetch(`http://localhost:5000/api/categories?${queryParams.toString()}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  };

  const handleSort = () => {
    fetchCategories({
      sort_by: "category_name",
      is_ascending: sortOrder === "Ascending" ? 1 : 0,
    });
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
  };

  const closeEditModal = () => {
    setSelectedCategory(null);
  };

  const handleSaveChanges = () => {
    if (!selectedCategory) return;
    fetch(
      `http://localhost:5000/api/categories/?category_id=${selectedCategory.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_name: selectedCategory.category_name }),
        credentials: "include",
      }
    )
      .then((response) => {
        if (response.ok) {
          setCategories((prevCategories) =>
            prevCategories.map((c) =>
              c.id === selectedCategory.id ? selectedCategory : c
            )
          );
          closeEditModal();
        } else {
          return response.json().then((data) => {
            throw new Error(data.error);
          });
        }
      })
      .catch((error) => console.error("Error updating category:", error));
  };

  const handleDeleteCategory = () => {
    if (!selectedCategory) return;
    fetch(
      `http://localhost:5000/api/categories/?category_id=${selectedCategory.id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    )
      .then((response) => {
        if (response.ok) {
          setCategories((prevCategories) =>
            prevCategories.filter((c) => c.id !== selectedCategory.id)
          );
          closeEditModal();
        } else {
          return response.json().then((data) => {
            throw new Error(data.error);
          });
        }
      })
      .catch((error) => console.error("Error deleting category:", error));
  };

  const handleAddCategory = () => {
    fetch("http://localhost:5000/api/categories/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        category_id: newCategory.category_id,
        category_name: newCategory.category_name,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          return response.json().then((data) => {
            throw new Error(data.error);
          });
        }
      })
      .then(() => {
        setAddCategoryModalOpen(false);
        setNewCategory({ category_id: "", category_name: "" });
        setErrorMessage(null);
        fetchCategories({});
      })
      .catch((err) => {
        console.error("Error adding category:", err);
        setErrorMessage(err.message);
      });
  };

  return (
    <div className="w-screen min-w-[1000px] h-screen bg-[#fff3ea] font-['Kumbh_Sans'] text-lg font-normal flex flex-col relative">
      <Header />
      <main className="flex-grow flex flex-col w-full h-screen overflow-hidden px-8 py-8">
        <div className="w-full flex spacetransitions-x-6 mb-4 gap-4">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="flex-1 border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20]"
          >
            <option value="Ascending">Ascending</option>
            <option value="Descending">Descending</option>
          </select>
          <button
            onClick={handleSort}
            className="flex-1 border bg-[#f57b20] rounded-md px-3 py-2 cursor-pointer hover:bg-[#db6c1c] text-[#fff3ea]"
          >
            Sort
          </button>
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex-1 border bg-[#f57b20] rounded-md px-3 py-2 cursor-pointer hover:bg-[#db6c1c] text-[#fff3ea]"
          >
            Make Report
          </button>
        </div>

        <div className="w-full bg-[#f57b20] mt-6 p-0 overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full border-collapse bg-[#f57b20] text-[#fff3ea] justify-space-between">
            <thead>
              <tr className="bg-[#db6c1c] sticky top-0">
                <th className="px-4 py-2">Category ID</th>
                <th className="px-4 py-2">Category Name</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="2" className="text-center py-4 text-[#fff3ea]">
                    -
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id_category}
                    className="border-b border-[#fff3ea] hover:bg-[#db6c1c] text-center cursor-pointer"
                    onDoubleClick={() => openEditModal(category)}
                  >
                    <td className="px-4 py-2">{category.id_category}</td>
                    <td className="px-4 py-2">{category.category_name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {localStorage.getItem("role") === "Manager" && (
          <button
            onClick={() => {
              setAddCategoryModalOpen(true);
              setNewCategory({ category_id: "", category_name: "" });
              setErrorMessage(null);
            }}
            className="border bg-[#f57b20] px-3 py-2 cursor-pointer hover:bg-[#db6c1c] text-[#fff3ea]"
          >
            Add new category
          </button>
        )}
      </main>

      {selectedCategory && localStorage.getItem("role") === "Manager" && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-[#FFF3EA] rounded-2xl shadow-lg p-8 w-96 relative">
            <button
              onClick={closeEditModal}
              className="absolute top-4 right-4 text-[#f57b20] cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-2xl mb-4 text-[#f57b20]">Edit Category</h2>
            <input
              type="text"
              value={selectedCategory.category_name}
              onChange={(e) =>
                setSelectedCategory({
                  ...selectedCategory,
                  category_name: e.target.value,
                })
              }
              className="w-full border p-2 mb-4 rounded border-[#f57b20] text-[#f57b20]"
            />
            <div className="flex justify-between">
              <button
                onClick={handleDeleteCategory}
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

      {addCategoryModalOpen && localStorage.getItem("role") === "Manager" && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 transition-all duration-200 opacity-100">
          <div className="bg-[#FFF3EA] rounded-2xl shadow-lg p-8 w-96 relative">
            <button
              onClick={() => {
                setAddCategoryModalOpen(false);
                setErrorMessage(null);
              }}
              className="absolute top-4 right-4 text-[#f57b20] cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-2xl mb-4 text-[#f57b20]">Add Category</h2>
            <input
              type="text"
              value={newCategory.category_id}
              onChange={(e) =>
                setNewCategory({
                  ...newCategory,
                  category_id: e.target.value,
                })
              }
              placeholder="Category ID"
              className="w-full border p-2 mb-4 rounded border-[#f57b20] text-[#f57b20]"
            />
            <input
              type="text"
              value={newCategory.category_name}
              onChange={(e) =>
                setNewCategory({
                  ...newCategory,
                  category_name: e.target.value,
                })
              }
              placeholder="Category Name"
              className="w-full border p-2 mb-4 rounded border-[#f57b20] text-[#f57b20]"
            />
            {errorMessage && (
              <p className="text-red-600 text-sm">{errorMessage}</p>
            )}
            <button
              onClick={handleAddCategory}
              className="bg-[#f57b20] text-white px-4 py-2 rounded cursor-pointer hover:bg-[#db6c1c] w-full"
            >
              Add Category
            </button>
          </div>
        </div>
      )}

      {reportModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-3/4 h-full relative">
            <button
              onClick={() => setReportModalOpen(false)}
              className="absolute top-4 right-4 text-[#f57b20] cursor-pointer"
            >
              ✕
            </button>
            <iframe
              src="http://localhost:5000/api/categories/report/preview?preview=true"
              title="Categories Report Preview"
              className="w-full h-[calc(100%-4rem)] border-0"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
