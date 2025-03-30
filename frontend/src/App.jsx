import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./loginpage";
import ProductsPage from "./productspage";
import StoreProducts from "./storeproducts";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/store-products" element={<StoreProducts />} />
    </Routes>
  );
}
