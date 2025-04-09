import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      navigate("/products");
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="grid grid-cols-2 h-screen">
      {/* Left side: Login form */}
      <div className="flex flex-col justify-center items-center bg-[#FFF2E9] p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-[#F57B20]">Welcome back</h1>
        <p className="text-[#F57B20]">Enter your account details</p>

        <div className="mt-6 space-y-4 w-full max-w-sm">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-lg text-[#F57B20] bg-white shadow-sm focus:ring focus:ring-[#F57B20] focus:border-[#F57B20]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg text-[#F57B20] bg-white shadow-sm focus:ring focus:ring-[#F57B20] focus:border-[#F57B20]"
          />

          {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

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
        <img
          src="static/bumbastik/bumbastik_gift.gif"
          alt="Loading GIF"
          className="absolute inset-0 m-auto w-90 h-90"
        />
      </div>
    </div>
  );
}
