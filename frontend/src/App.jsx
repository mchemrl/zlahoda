import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/loginpage";
import ProductsPage from "./pages/productspage";
import StoreProducts from "./pages/storeproducts";
import ProfilePage from "./pages/profile";
import ClientsPage from "./pages/clientspage";
import CategoriesPage from "./pages/categoriespage.jsx";
import ChecksPage from "./pages/checkspage.jsx";
import StatisticsPage from "./pages/statisticspage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/store-products" element={<StoreProducts />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/receipts" element={<ChecksPage />} />
      <Route path="/statistics" element={<StatisticsPage />} />
    </Routes>
  );
}
