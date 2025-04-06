import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/loginpage";
import ProductsPage from "./pages/productspage";
import StoreProducts from "./pages/storeproducts";
import ProfilePage from "./pages/profile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/store-products" element={<StoreProducts />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}
