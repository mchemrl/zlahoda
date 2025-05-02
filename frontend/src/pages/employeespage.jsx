import React, { useState, useEffect } from "react";
import Header from "../components/header";
import {
  handlePrint,
  usePrintStyles,
  PrintHeader,
} from "../utils/print.jsx";

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [sortOrder, setSortOrder] = useState("Ascending");
    const [sortField, setSortField] = useState("empl_surname");
    const [employeeRole, setEmployeeRole] = useState("All");
    const [searchValue, setSearchValue] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [errorModal, setErrorModal] = useState({ open: false, title: "", message: "" });
    const [addEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        id_employee: "",
        empl_name: "",
        empl_surname: "",
        empl_patronymic: "",
        empl_role: "Cashier",
        salary: "",
        date_of_birth: "",
        date_of_start: "",
        phone_number: "",
        city: "",
        street: "",
        zip_code: ""
    });

    useEffect(() => {
        fetchEmployees();
    }, [sortField, sortOrder, employeeRole]);

    usePrintStyles();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const toInputDate = (dateString) => {
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
    };

    const fetchEmployees = () => {
        const params = new URLSearchParams();
        if (employeeRole !== "All") params.append("role", employeeRole);
        params.append("sort_by", sortField);
        params.append("is_ascending", sortOrder === "Ascending" ? 1 : 0);
        if (searchValue) {
            params.append('search_by', 'empl_surname');
            params.append("search_value", searchValue);
        }
        const url = `http://localhost:5000/api/employees/?${params.toString()}`;
        fetch(url, { credentials: "include" })
            .then(res => res.json())
            .then(data => setEmployees(Array.isArray(data) ? data : [data]))
            .catch(err => console.error("Error fetching employees:", err));
    };

    const handleSearch = () => fetchEmployees();

    const openEditModal = (employee) => {
        setSelectedEmployee({
            ...employee,
            salary: Number(employee.salary),
            date_of_birth: toInputDate(employee.date_of_birth),
            date_of_start: toInputDate(employee.date_of_start),
        });
    };

    const closeEditModal = () => {
        setSelectedEmployee(null);
        setErrorModal({ open: false, title: "", message: "" });
    };

    const handleDeleteEmployee = () => {
        if (!selectedEmployee) return;
        const url = `http://localhost:5000/api/employees/?employee_id=${selectedEmployee.id_employee}`;
        fetch(url, { method: "DELETE", credentials: "include" })
            .then(async res => {
                const data = await res.json().catch(() => ({}));
                if (res.status === 200) {
                    setEmployees(prev => prev.filter(e => e.id_employee !== selectedEmployee.id_employee));
                    closeEditModal();
                } else {
                    setErrorModal({
                        open: true,
                        title: "Failed to delete employee",
                        message: "You can't delete an employee that has associated receipts",
                    });
                }
            })
            .catch(err => {
                console.error("Error deleting employee:", err);
                setErrorModal({ open: true, title: "Failed to delete employee", message: 'Network error' });
            });
    };

    const handleSaveChanges = () => {
        if (!selectedEmployee) return;
        const payload = {
            employee_name:      selectedEmployee.empl_name,
            employee_surname:   selectedEmployee.empl_surname,
            employee_patronymic:selectedEmployee.empl_patronymic,
            employee_role:      selectedEmployee.empl_role,
            salary:             Number(selectedEmployee.salary),
            date_of_birth:      selectedEmployee.date_of_birth,
            date_of_start:      selectedEmployee.date_of_start,
            phone_number:       selectedEmployee.phone_number,
            city:               selectedEmployee.city,
            street:             selectedEmployee.street,
            zip_code:           selectedEmployee.zip_code
        };
        fetch(`http://localhost:5000/api/employees/?employee_id=${selectedEmployee.id_employee}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to update employee');
                return res.json();
            })
            .then(() => {
                fetchEmployees();
                closeEditModal();
            })
            .catch(err => setErrorModal({ open: true, title: "Failed to update employee", message: err.message }));
    };

    const handleAddEmployee = () => {
        const payload = {
            employee_id:        newEmployee.id_employee,
            employee_name:      newEmployee.empl_name,
            employee_surname:   newEmployee.empl_surname,
            employee_patronymic:newEmployee.empl_patronymic,
            employee_role:      newEmployee.empl_role,
            salary:             Number(newEmployee.salary),
            date_of_birth:      newEmployee.date_of_birth,
            date_of_start:      newEmployee.date_of_start,
            phone_number:       newEmployee.phone_number,
            city:               newEmployee.city,
            street:             newEmployee.street,
            zip_code:           newEmployee.zip_code
        };
        fetch("http://localhost:5000/api/employees/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(data => { throw new Error(data.error || 'Failed to add employee'); });
                }
                return res.json();
            })
            .then(() => {
                fetchEmployees();
                setAddEmployeeModalOpen(false);
                setNewEmployee({
                    id_employee: "",
                    empl_name: "",
                    empl_surname: "",
                    empl_patronymic: "",
                    empl_role: "Cashier",
                    salary: "",
                    date_of_birth: "",
                    date_of_start: "",
                    phone_number: "",
                    city: "",
                    street: "",
                    zip_code: ""
                });
            })
            .catch(err => setErrorModal({ open: true, title: "Failed to add employee", message: "Make sure you entered correct data and required fields are not empty." }));
    };

    return (
            <div
                className='w-screen min-w-[1000px] h-screen bg-[#fff3ea] font-["Kumbh_Sans"] text-lg font-normal flex flex-col relative'>
                <Header/>
                {errorModal.open && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-0 z-60">
                    <div className="bg-white rounded-lg p-6 w-80 text-center shadow-lg">
                        <h3 className="text-xl font-semibold mb-4 text-red-600">
                            {errorModal.title}
                        </h3>
                        <p className="mb-6 text-black">{errorModal.message}</p>
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                            onClick={() => setErrorModal({ open: false, title: "", message: "" })}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
    {addEmployeeModalOpen && localStorage.getItem("role") === "Manager" && (
      <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
        <div className="bg-[#FFF3EA] rounded-2xl shadow-lg p-6 w-11/12 max-w-4xl relative max-h-[90vh] overflow-y-auto">
          <button
            className="absolute top-3 right-3 text-[#f57b20] text-xl"
            onClick={() => setAddEmployeeModalOpen(false)}
          >
            ✕
          </button>
          <h2 className="text-xl mb-4 text-[#f57b20]">Add Employee</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* First column */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-[#f57b20]">ID</label>
                <input
                  type="text"
                  value={newEmployee.id_employee}
                  onChange={e => setNewEmployee({ ...newEmployee, id_employee: e.target.value })}
                  className="w-full border p-1.5 rounded border-[#f57b20] text-[#f57b20] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#f57b20]">Surname</label>
                <input
                  type="text"
                  value={newEmployee.empl_surname}
                  onChange={e => setNewEmployee({ ...newEmployee, empl_surname: e.target.value })}
                  className="w-full border p-1.5 rounded border-[#f57b20] text-[#f57b20] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#f57b20]">Name</label>
                <input
                  type="text"
                  value={newEmployee.empl_name}
                  onChange={e => setNewEmployee({ ...newEmployee, empl_name: e.target.value })}
                  className="w-full border p-1.5 rounded border-[#f57b20] text-[#f57b20] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#f57b20]">Patronymic</label>
                <input
                  type="text"
                  value={newEmployee.empl_patronymic}
                  onChange={e => setNewEmployee({ ...newEmployee, empl_patronymic: e.target.value })}
                  className="w-full border p-1.5 rounded border-[#f57b20] text-[#f57b20] text-sm"
                />
              </div>
            </div>
    
            {/* Second column */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-[#f57b20]">Role</label>
                <select
                  value={newEmployee.empl_role}
                  onChange={e => setNewEmployee({ ...newEmployee, empl_role: e.target.value })}
                  className="w-full border p-1.5 rounded border-[#f57b20] text-[#f57b20] text-sm"
                >
                  <option value="Manager">Manager</option>
                  <option value="Cashier">Cashier</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#f57b20]">Salary</label>
                <input
                  type="number"
                  value={newEmployee.salary}
                  onChange={e => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                  className="w-full border p-1.5 rounded border-[#f57b20] text-[#f57b20] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#f57b20]">Date of Birth</label>
                <input
                  type="date"
                  value={newEmployee.date_of_birth}
                  onChange={e => setNewEmployee({ ...newEmployee, date_of_birth: e.target.value })}
                  className="w-full border p-1.5 rounded border-[#f57b20] text-[#f57b20] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#f57b20]">Date of Start</label>
                <input
                  type="date"
                  value={newEmployee.date_of_start}
                  onChange={e => setNewEmployee({ ...newEmployee, date_of_start: e.target.value })}
                  className="w-full border p-1.5 rounded border-[#f57b20] text-[#f57b20] text-sm"
                />
              </div>
            </div>
    
            {/* Third column */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-[#f57b20]">Phone</label>
                <input
                  type="tel"
                  value={newEmployee.phone_number}
                  onChange={e => setNewEmployee({ ...newEmployee, phone_number: e.target.value })}
                  className="w-full border p-1.5 rounded border-[#f57b20] text-[#f57b20] text-sm"
                  pattern="\+[0-9]{12}"
                  title="Format: +380XXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm text-[#f57b20]">City</label>
                <input
                  type="text"
                  value={newEmployee.city}
                  onChange={e => setNewEmployee({ ...newEmployee, city: e.target.value })}
                  className="w-full border p-1.5 rounded border-[#f57b20] text-[#f57b20] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#f57b20]">Street</label>
                <input
                  type="text"
                  value={newEmployee.street}
                  onChange={e => setNewEmployee({ ...newEmployee, street: e.target.value })}
                  className="w-full border p-1.5 rounded border-[#f57b20] text-[#f57b20] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-[#f57b20]">Zip Code</label>
                <input
                  type="text"
                  value={newEmployee.zip_code}
                  onChange={e => setNewEmployee({ ...newEmployee, zip_code: e.target.value })}
                  className="w-full border p-1.5 rounded border-[#f57b20] text-[#f57b20] text-sm"
                />
              </div>
            </div>
          </div>
    
          {/* Add button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleAddEmployee}
              className="bg-[#f57b20] text-white px-4 py-1.5 rounded hover:bg-[#db6c1c] text-sm"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    )}
                <main className="flex-grow flex flex-col w-full h-screen overflow-hidden px-8 py-8">
                    <div className="w-full flex space-x-6 mb-4">
                        <input
                            type="text"
                            placeholder="Search employees by surname"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="flex-3 border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20] placeholder-[#f57b20]"
                        />
                        <button
                            onClick={handleSearch}
                            className="flex-1 border bg-[#f57b20] rounded-md cursor-pointer hover:bg-[#db6c1c] text-white"
                        >
                            Filter
                        </button>
                              {localStorage.getItem("role")=== "Manager" && (
                        <button
                          onClick={handlePrint}
                          className="flex-1 border bg-[#f57b20] rounded-md px-3 py-2 cursor-pointer hover:bg-[#db6c1c] text-[#fff3ea]"
                        >
                          Print
                        </button>
                      )}
                    </div>
    
                    <div className="w-full flex space-x-6">
                        <select
                            value={employeeRole}
                            onChange={(e) => setEmployeeRole(e.target.value)}
                            className="flex-1 border border-[#f57b20] rounded-md pl-3 py-2 bg-[#fff3ea] text-[#f57b20]"
                        >
                            <option value="All">All roles</option>
                            <option value="Manager">Manager</option>
                            <option value="Cashier">Cashier</option>
                        </select>
    
                        <select
                            value={sortField}
                            onChange={(e) => setSortField(e.target.value)}
                            className="flex-1 border border-[#f57b20] rounded-md pl-4 py-2 bg-[#fff3ea] text-[#f57b20]"
                        >
                            <option value="empl_surname">Sort by surname</option>
                            <option value="empl_name">Sort by name</option>
                            <option value="empl_patronymic">Sort by patronymic</option>
                            <option value="salary">Sort by salary</option>
                            <option value="date_of_birth">Sort by date of birth</option>
                            <option value="date_of_start">Sort by start date</option>
                            <option value="city">Sort by city</option>
                            <option value="zip_code">Sort by zip code</option>
                        </select>
    
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="flex-1 border border-[#f57b20] rounded-md px-3 py-2 bg-[#fff3ea] text-[#f57b20]"
                        >
                            <option value="Ascending">Ascending</option>
                            <option value="Descending">Descending</option>
                        </select>
                    </div>
                <PrintHeader title="Employee Report" />

                    <div id="print-content" className="w-full bg-[#f57b20] mt-6 p-0 overflow-x-auto max-h-[60vh] overflow-y-auto">
                        <table className="w-full border-collapse bg-[#f57b20] text-[#fff3ea] text-xs">
                            <thead>
                            <tr className="bg-[#db6c1c] sticky top-0">
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Surname</th>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Patronymic</th>
                                <th className="px-4 py-2">Role</th>
                                <th className="px-4 py-2">Salary</th>
                                <th className="px-4 py-2">Date of Birth</th>
                                <th className="px-4 py-2">Start Date</th>
                                <th className="px-4 py-2">Phone Number</th>
                                <th className="px-4 py-2">City</th>
                                <th className="px-4 py-2">Street</th>
                                <th className="px-4 py-2">Zip Code</th>
                            </tr>
                            </thead>
                            <tbody>
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan="12" className="text-center py-4 text-[#fff3ea]">
                                        No employees found
                                    </td>
                                </tr>
                            ) : (
                                employees.map((employee) => (
                                    <tr
                                        key={employee.id_employee}
                                        className="border-b border-[#fff3ea] hover:bg-[#db6c1c] cursor-pointer text-center"
                                        onDoubleClick={() => openEditModal(employee)}
                                    >
                                        <td className="px-4 py-2">{employee.id_employee}</td>
                                        <td className="px-4 py-2">{employee.empl_surname}</td>
                                        <td className="px-4 py-2">{employee.empl_name}</td>
                                        <td className="px-4 py-2">{employee.empl_patronymic}</td>
                                        <td className="px-4 py-2">{employee.empl_role}</td>
                                        <td className="px-4 py-2">{employee.salary}</td>
                                        <td className="px-4 py-2">{formatDate(employee.date_of_birth)}</td>
                                        <td className="px-4 py-2">{formatDate(employee.date_of_start)}</td>
                                        <td className="px-4 py-2">{employee.phone_number}</td>
                                        <td className="px-4 py-2">{employee.city}</td>
                                        <td className="px-4 py-2">{employee.street}</td>
                                        <td className="px-4 py-2">{employee.zip_code}</td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                    {localStorage.getItem("role") === "Manager" && (
                <button
                  onClick={() => {
                    setAddEmployeeModalOpen(true);
                    setNewEmployee({
                        id_employee: "",
                        empl_name: "",
                        empl_surname: "",
                        empl_patronymic: "",
                        empl_role: "Cashier",
                        salary: "",
                        date_of_birth: "",
                        date_of_start: "",
                        phone_number: "",
                        city: "",
                        street: "",
                        zip_code: ""
                      });
                  }}
                  className="border bg-[#f57b20] px-3 py-2 cursor-pointer hover:bg-[#db6c1c] text-[#fff3ea]"
                >
                  Add new employee
                </button>
              )}
                </main>
                {selectedEmployee && (
                    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm overflow-y-auto py-8">
                        <div className="bg-[#FFF3EA] rounded-2xl shadow-lg p-8 w-11/12 max-w-4xl relative">
                            <button
                                className="absolute top-4 right-4 text-[#f57b20] cursor-pointer"
                                onClick={closeEditModal}
                            >
                                ✕
                            </button>
    
                            <h2 className="text-2xl mb-6 text-[#f57b20]">Edit Employee</h2>
    
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[#f57b20]">ID</label>
                                        <input
                                            type="text"
                                            value={selectedEmployee.id_employee}
                                            onChange={(e) =>
                                                setSelectedEmployee({
                                                    ...selectedEmployee,
                                                    id_employee: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded border-[#f57b20] text-[#f57b20]"
                                        />
                                    </div>
    
    
                                    <div>
                                        <label className="block text-[#f57b20]">Surname</label>
                                        <input
                                            type="text"
                                            value={selectedEmployee.empl_surname}
                                            onChange={(e) =>
                                                setSelectedEmployee({
                                                    ...selectedEmployee,
                                                    empl_surname: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded border-[#f57b20] text-[#f57b20]"
                                        />
                                    </div>
    
                                    <div>
                                        <label className="block text-[#f57b20]">Name</label>
                                        <input
                                            type="text"
                                            value={selectedEmployee.empl_name}
                                            onChange={(e) =>
                                                setSelectedEmployee({
                                                    ...selectedEmployee,
                                                    empl_name: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded border-[#f57b20] text-[#f57b20]"
                                        />
                                    </div>
    
                                    <div>
                                        <label className="block text-[#f57b20]">Patronymic</label>
                                        <input
                                            type="text"
                                            value={selectedEmployee.empl_patronymic}
                                            onChange={(e) =>
                                                setSelectedEmployee({
                                                    ...selectedEmployee,
                                                    empl_patronymic: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded border-[#f57b20] text-[#f57b20]"
                                        />
                                    </div>
    
                                    <div>
                                        <label className="block text-[#f57b20]">Role</label>
                                        <select
                                            value={selectedEmployee.empl_role}
                                            onChange={(e) =>
                                                setSelectedEmployee({
                                                    ...selectedEmployee,
                                                    empl_role: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded border-[#f57b20] text-[#f57b20]"
                                        >
                                            <option value="Manager">Manager</option>
                                            <option value="Cashier">Cashier</option>
                                        </select>
                                    </div>
    
                                    <div>
                                        <label className="block text-[#f57b20]">Salary</label>
                                        <input
                                            type="number"
                                            value={selectedEmployee.salary}
                                            onChange={(e) =>
                                                setSelectedEmployee({
                                                    ...selectedEmployee,
                                                    salary: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded border-[#f57b20] text-[#f57b20]"
                                        />
                                    </div>
                                </div>
    
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[#f57b20]">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={selectedEmployee.date_of_birth}
                                            onChange={(e) =>
                                                setSelectedEmployee({
                                                    ...selectedEmployee,
                                                    date_of_birth: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded border-[#f57b20] text-[#f57b20]"
                                        />
                                    </div>
    
                                    <div>
                                        <label className="block text-[#f57b20]">Date of Start</label>
                                        <input
                                            type="date"
                                            value={selectedEmployee.date_of_start}
                                            onChange={(e) =>
                                                setSelectedEmployee({
                                                    ...selectedEmployee,
                                                    date_of_start: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded border-[#f57b20] text-[#f57b20]"
                                        />
                                    </div>
    
                                    <div>
                                        <label className="block text-[#f57b20]">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={selectedEmployee.phone_number}
                                            onChange={(e) =>
                                                setSelectedEmployee({
                                                    ...selectedEmployee,
                                                    phone_number: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded border-[#f57b20] text-[#f57b20]"
                                            pattern="\+[0-9]{12}"
                                            title="Format: +380XXXXXXXXX"
                                        />
                                    </div>
    
                                    <div>
                                        <label className="block text-[#f57b20]">City</label>
                                        <input
                                            type="text"
                                            value={selectedEmployee.city}
                                            onChange={(e) =>
                                                setSelectedEmployee({
                                                    ...selectedEmployee,
                                                    city: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded border-[#f57b20] text-[#f57b20]"
                                        />
                                    </div>
    
                                    <div>
                                        <label className="block text-[#f57b20]">Street</label>
                                        <input
                                            type="text"
                                            value={selectedEmployee.street}
                                            onChange={(e) =>
                                                setSelectedEmployee({
                                                    ...selectedEmployee,
                                                    street: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded border-[#f57b20] text-[#f57b20]"
                                        />
                                    </div>
    
                                    <div>
                                        <label className="block text-[#f57b20]">Zip Code</label>
                                        <input
                                            type="text"
                                            value={selectedEmployee.zip_code}
                                            onChange={(e) =>
                                                setSelectedEmployee({
                                                    ...selectedEmployee,
                                                    zip_code: e.target.value,
                                                })
                                            }
                                            className="w-full border p-2 rounded border-[#f57b20] text-[#f57b20]"
                                        />
                                    </div>
                                </div>
                            </div>
    
                            <div className="flex justify-between mt-6">
                                <button
                                    onClick={handleDeleteEmployee}
                                    className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-700"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={handleSaveChanges}
                                    className="bg-[#f57b20] text-white px-4 py-2 rounded cursor-pointer hover:bg-[#db6c1c]"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }