import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "C:\\Users\\lucka\\OneDrive\\Документы\\GitHub\\zlahodareal\\frontend\\src\\components\\header.jsx";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/employees/me", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setUser(data);
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        setError(error.message);
      });
  }, []);

  const handleLogOut = () => {
    fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          localStorage.clear();
          navigate("/");
        } else {
          console.error("Logout failed.");
        }
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <div className="w-screen h-screen bg-[#fff3ea] font-['Kumbh_Sans'] text-lg font-normal flex flex-col items-center">
      <Header />
      {user !== null ? (
        <main className="flex-grow flex flex-row items-center justify-center w-full h-screen overflow-hidden px-8 py-8">
          <div>
            <img
              src="static/bumbastik/bumbastik_scary.gif"
              alt="Loading GIF"
              className="w-105 h-105"
            />
          </div>

          <div className="bg-[#fff3ea] flex flex-col items-center text-left space-y-4 w-full max-w-md">
            <h1 className="text-3xl font-bold text-[#f57b20]">
              {user?.empl_surname} {user?.empl_patronymic} {user?.empl_name}
            </h1>
            <p className="text-lg text-[#f57b20]">{user?.empl_role}</p>
            <div className="bg-[#f57b20] p-6 rounded-lg shadow-md text-white w-full shadow-lg">
              <h2 className="font-bold text-lg mb-2">Personal info:</h2>
              <p>
                Birthdate: {new Date(user?.date_of_birth).toLocaleDateString()}
              </p>
              <p>Phone number: {user?.phone_number}</p>
              <p>
                Home address: {user?.city}, {user?.street}, {user?.zip_code}
              </p>
              <p>Card number: {user?.id_employee}</p>
              <p>Salary: ₴{parseFloat(user?.salary).toLocaleString()}</p>
              <p>
                Employment start date:{" "}
                {new Date(user?.date_of_start).toLocaleDateString()}
              </p>
            </div>

            <div className="flex space-x-4 mt-4">
              <button
                className="bg-red-500 flex-grow text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer"
                onClick={handleLogOut}
              >
                Log out
              </button>
            </div>
          </div>
        </main>
      ) : (
        <img src="static/loading.gif" className="mt-45 w-50 h-50" />
      )}
    </div>
  );
}
