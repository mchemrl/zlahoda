import { useState } from "react";
import { FaUserTie, FaCashRegister } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem("role", role);
    console.log("Logged in as:", role);
    navigate("/products");
  };

  return (
    <div className="grid grid-cols-2 h-screen">
      {/* Left side: Login form */}
      <div className="flex flex-col justify-center items-center bg-[#FFF2E9] p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-[#F57B20]">Welcome back</h1>
        <p className="text-[#F57B20]">Enter your account details</p>

        <div className="mt-6 space-y-4 w-full max-w-sm">
          {/* Mutually exclusive role selection */}
          <button
            onClick={() => setRole("manager")}
            className={`flex items-center justify-center w-full p-3 border rounded-lg transition ${
              role === "manager"
                ? "bg-[#F57B20] text-white"
                : "bg-white text-[#F57B20] border-[#F57B20]"
            }`}
          >
            <FaUserTie className="mr-2" /> I am a Manager
          </button>
          <button
            onClick={() => setRole("cashier")}
            className={`flex items-center justify-center w-full p-3 border rounded-lg transition ${
              role === "cashier"
                ? "bg-[#F57B20] text-white"
                : "bg-white text-[#F57B20] border-[#F57B20]"
            }`}
          >
            <FaCashRegister className="mr-2" /> I am a Cashier
          </button>

          <input
            type="text"
            placeholder="Email or username"
            className="w-full p-3 border rounded-lg text-[#F57B20] bg-white shadow-sm focus:ring focus:ring-[#F57B20] focus:border-[#F57B20]"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg text-[#F57B20] bg-white shadow-sm focus:ring focus:ring-[#F57B20] focus:border-[#F57B20]"
          />

          <button
            className="w-full bg-[#F57B20] text-white p-3 rounded-lg hover:bg-[#d9691c] transition"
            onClick={handleLogin}
          >
            Sign in
          </button>
        </div>
      </div>

      {/* Right side: Shopping cart pattern */}
      <div className="bg-[#F57B20] flex justify-center items-center relative">
        <div className="absolute inset-0 opacity-20 bg-repeat bg-[url('/cart-pattern.png')]"></div>
      </div>
    </div>
  );
}
