import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
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
          <li className="cursor-pointer hover:underline">
            <Link to="/receipts">Receipts</Link>
          </li>
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
  );
};

export default Header;
