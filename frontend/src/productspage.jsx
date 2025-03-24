import React, { useState } from "react";

export default function ProductsPage() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("All categories");

  const mockData = [
    {
      id: 1,
      name: "Orange Juice",
      category: "Beverages",
      characteristics: "Fresh, Vitamin C, No added sugar",
    },
    {
      id: 2,
      name: "Milk",
      category: "Dairy",
      characteristics: "Organic, Lactose-free, High calcium",
    },
    {
      id: 3,
      name: "Chips",
      category: "Snacks",
      characteristics: "Crunchy, Low sodium, Gluten-free",
    },
    {
      id: 4,
      name: "Apple Juice",
      category: "Beverages",
      characteristics: "100% Natural, No preservatives, Rich in antioxidants",
    },
    {
      id: 5,
      name: "Yogurt",
      category: "Dairy",
      characteristics: "Probiotic, Low fat, Strawberry flavor",
    },
    {
      id: 6,
      name: "Chocolate Bar",
      category: "Snacks",
      characteristics: "Dark chocolate, 70% cocoa, Vegan",
    },
    {
      id: 7,
      name: "Green Tea",
      category: "Beverages",
      characteristics: "Antioxidant-rich, Caffeine-free, Refreshing",
    },
    {
      id: 8,
      name: "Cheese",
      category: "Dairy",
      characteristics: "Aged cheddar, Sharp flavor, High protein",
    },
    {
      id: 9,
      name: "Popcorn",
      category: "Snacks",
      characteristics: "Butter flavor, Lightly salted, Gluten-free",
    },
    {
      id: 10,
      name: "Iced Coffee",
      category: "Beverages",
      characteristics: "Cold brew, Low calorie, Sweetened",
    },
    {
      id: 11,
      name: "Butter",
      category: "Dairy",
      characteristics: "Unsalted, Grass-fed, Rich flavor",
    },
    {
      id: 12,
      name: "Granola Bar",
      category: "Snacks",
      characteristics: "Oats, Honey, Nuts, Gluten-free",
    },
    {
      id: 13,
      name: "Lemonade",
      category: "Beverages",
      characteristics: "Tart, Refreshing, No artificial flavors",
    },
    {
      id: 14,
      name: "Sour Cream",
      category: "Dairy",
      characteristics: "Creamy, Tangy, Low fat",
    },
    {
      id: 15,
      name: "Pretzels",
      category: "Snacks",
      characteristics: "Salted, Crunchy, Low fat",
    },
    {
      id: 16,
      name: "Soda",
      category: "Beverages",
      characteristics: "Carbonated, Sweet, Assorted flavors",
    },
    {
      id: 17,
      name: "Whipped Cream",
      category: "Dairy",
      characteristics: "Light, Fluffy, Sweetened",
    },
    {
      id: 18,
      name: "Trail Mix",
      category: "Snacks",
      characteristics: "Nuts, Dried fruit, Chocolate chips",
    },
    {
      id: 19,
      name: "Energy Drink",
      category: "Beverages",
      characteristics: "High caffeine, Sugar-free, Berry flavor",
    },
    {
      id: 20,
      name: "Cottage Cheese",
      category: "Dairy",
      characteristics: "High protein, Low fat, Creamy texture",
    },
  ];

  const filteredData = mockData.filter((product) => {
    const nameMatch = product.name
      .toLowerCase()
      .includes(productName.toLowerCase());
    const categoryMatch =
      category === "All categories" || product.category === category;
    return nameMatch && categoryMatch;
  });

  return (
    <div className="w-screen h-screen bg-[#fff3ea] font-['Kumbh_Sans'] text-lg font-normal flex flex-col">
      {/* Header */}
      <header className="w-screen h-24 bg-orange-500 bg-opacity-75 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] flex justify-between items-center px-6">
        <div className="w-28 text-center text-orange-50 text-3xl font-normal font-['Kumbh_Sans']">
          Zlahoda
        </div>
        <nav className="flex space-x-6 text-orange-50 text-lg font-normal font-['Kumbh_Sans']">
          <ul className="flex space-x-6">
            <li className="cursor-pointer hover:underline">Client</li>
            <li className="cursor-pointer hover:underline">Products</li>
            <li className="cursor-pointer hover:underline">Store Products</li>
            <li className="cursor-pointer hover:underline">Checks</li>
            <li className="cursor-pointer hover:underline">Profile</li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col w-full h-screen overflow-hidden px-8 py-8">
        {/* Search & Filter Section */}
        <div className="w-full flex space-x-6">
          <input
            id="productName"
            type="text"
            placeholder="Search by product name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="flex-1 border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20] placeholder-[#f57b20] focus:outline-none focus:ring-2 focus:ring-[#f57b20]"
          />
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20] focus:outline-none focus:ring-2 focus:ring-[#f57b20]"
          >
            <option>All categories</option>
            <option>Beverages</option>
            <option>Snacks</option>
            <option>Dairy</option>
          </select>
        </div>

        {/* Table Section */}
        <div
          className="w-full bg-[#f57b20] mt-6 p-0 overflow-x-auto"
          style={{ maxHeight: "60vh", overflowY: "auto" }}
        >
          <table className="w-full border-collapse bg-[#f57b20] text-[#fff3ea]">
            <thead>
              <tr className="bg-[#db6c1c] sticky top-0">
                <th className="px-4 py-2 border-b border-[#fff3ea] w-1/3">
                  Product
                </th>
                <th className="px-4 py-2 border-b border-[#fff3ea] w-1/3">
                  Category
                </th>
                <th className="px-4 py-2 border-b border-[#fff3ea] w-1/3">
                  Characteristics
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-[#fff3ea] hover:bg-[#db6c1c]"
                  >
                    <td className="px-4 py-2 w-1/3">{product.name}</td>
                    <td className="px-4 py-2 w-1/3">{product.category}</td>
                    <td className="px-4 py-2 w-1/3">
                      {product.characteristics}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-4 py-4 text-center">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
