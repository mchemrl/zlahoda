import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/auth/login")
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => {
        console.error("Error fetching user:", error);
        setError(error.message);
      });
  }, []);

  return (
    <div className="w-screen h-screen bg-[#fff3ea] font-['Kumbh_Sans'] text-lg font-normal flex flex-col">
      <header className="w-full h-24 bg-[#f57b20] bg-opacity-75 shadow-lg flex justify-between items-center px-6">
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
            <li className="cursor-pointer hover:underline">Client</li>
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

      <main className="flex-grow flex flex-row items-center justify-center w-full h-screen overflow-hidden px-8 py-8">
         <div><img
            src="static/bumbastik/bumbastik_scary.gif"
            alt="Loading GIF"
            className="w-105 h-105"
          /></div>
        <div className="bg-[#fff3ea] flex flex-col items-center text-left space-y-4 w-full max-w-md">

          <h1 className="text-3xl font-bold text-[#f57b20]">Victoria Dyrda</h1>
          <p className="text-lg text-[#f57b20]">Manager</p>
          <div className="bg-[#f57b20] p-6 rounded-lg shadow-md text-white w-full shadow-lg">
            <h2 className="font-bold text-lg mb-2">Personal info:</h2>
            <p>Birthdate: 14.01.2006</p>
            <p>Phone number: +380 98 930 41 20</p>
            <p>Home address: Kyiv, Oleksandry Ekster</p>
            <p>Card number: 3940258</p>
          </div>


          <div className="flex space-x-4 mt-4">
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer">
              Log out
            </button>
            <button className="bg-[#f57b20] text-white px-4 py-2 rounded-lg hover:bg-[#db6c1c] cursor-pointer">
              Change password
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
