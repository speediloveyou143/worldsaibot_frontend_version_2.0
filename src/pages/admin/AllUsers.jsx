import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../../config/constant";

function Row(props) {
  const { number, data, showAlert } = props;
  const navigate = useNavigate();

  async function handleDelete() {
    try {
      const response = await axios.delete(
        `${BACKEND_URL}/delete-profile/${data._id}`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        showAlert("User deleted successfully!", "success");
      } else {
        showAlert("Failed to delete the user.", "error");
      }
    } catch (error) {
      showAlert("An error occurred while deleting the user.", "error");
    }
  }

  const isPaid = data.courses?.length > 1;
  const paidStatus = isPaid ? "Paid" : "Not Paid";
  const statusClass = isPaid ? "text-green-500" : "text-red-500";

  return (
    <tr>
      <th>{number}</th>
      <td>{data.name}</td>
      <td>{data.email}</td>
      <td>{data.number}</td>
      <td>{data.batchNumber}</td>
      <td className={statusClass}>{paidStatus}</td>
      <td className="text-success cursor-pointer">
        <Link to={`/admin-dashboard/profile/update-pc/${data._id}`}>
          update
        </Link>
      </td>
      <td className="text-success cursor-pointer">
        <Link to={`/admin-dashboard/profile/update-ic/${data._id}`}>
          update
        </Link>
      </td>
      <td className="text-success cursor-pointer">
        <Link to={`/admin-dashboard/profile/update-cc/${data._id}`}>
          update
        </Link>
      </td>
      <td className="text-success cursor-pointer">
        <Link to={`/admin-dashboard/profile/update-invoice/${data._id}`}>
          update
        </Link>
      </td>
      <td className="text-success cursor-pointer">
        <Link to={`/admin-dashboard/profile/update-user/${data._id}`}>
          update
        </Link>
      </td>
      <td className="text-error cursor-pointer" onClick={handleDelete}>
        delete
      </td>
    </tr>
  );
}

function AllUsers() {
  const [userData, setUserData] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [paidFilter, setPaidFilter] = useState("All");
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setProgress(100);
  };

  const dismissAlert = () => {
    setAlert(null);
    setProgress(100);
  };

  useEffect(() => {
    if (alert) {
      const duration = 3000;
      const interval = 50;
      const decrement = (interval / duration) * 100;

      const timer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - decrement;
          if (newProgress <= 0) {
            dismissAlert();
            clearInterval(timer);
            return 0;
          }
          return newProgress;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [alert]);

  async function users() {
    try {
      const response = await axios.get(`${BACKEND_URL}/show-profiles`, {
        withCredentials: true,
      });
      setUserData(response?.data?.data || []);
    } catch (err) {
      showAlert("Something went wrong while fetching users.", "error");
      setUserData([]);
    }
  }

  useEffect(() => {
    users();
  }, []);

  const filteredUsers = userData.filter((user) => {
    const matchesEmail = user.email
      .toLowerCase()
      .includes(searchEmail.toLowerCase());
    const isPaid = user.courses?.length > 1;
    const matchesPaid =
      paidFilter === "All" ||
      (paidFilter === "Paid" && isPaid) ||
      (paidFilter === "Not Paid" && !isPaid);
    return matchesEmail && matchesPaid;
  });

  return (
    <div className="h-full w-full overflow-x-auto overflow-y-auto pb-[80px] md:pb-0">
      {/* Filter Buttons and Search Bar */}
      <div className="m-2 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-sm">
          <input
            type="text"
            placeholder="Search by email..."
            className="input input-bordered w-full pl-10 pr-4 py-2 shadow-md focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-row space-x-2 mt-3 md:mt-0 justify-center md:justify-end">
          <button
            className={`btn btn-sm w-[80px] md:w-auto ${
              paidFilter === "All" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setPaidFilter("All")}
          >
            All
          </button>
          <button
            className={`btn btn-sm w-[80px] md:w-auto ${
              paidFilter === "Paid" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setPaidFilter("Paid")}
          >
            Paid
          </button>
          <button
            className={`btn btn-sm w-[80px] md:w-auto ${
              paidFilter === "Not Paid" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setPaidFilter("Not Paid")}
          >
            Not Paid
          </button>
        </div>
      </div>

      <table className="table table-xs table-pin-rows table-pin-cols w-full">
        <thead>
          <tr>
            <th>#</th>
            <td>Name</td>
            <td>Email</td>
            <td>Number</td>
            <td>B-Number</td>
            <td>Paid Status</td>
            <td>P-c</td>
            <td>I-c</td>
            <td>C-c</td>
            <td>Invoice</td>
            <td>Update</td>
            <td>Delete</td>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((x, index) => (
              <Row key={x._id} number={index + 1} data={x} showAlert={showAlert} />
            ))
          ) : (
            <tr>
              <td colSpan="12" className="text-center">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <th>#</th>
            <td>Name</td>
            <td>Email</td>
            <td>Number</td>
            <td>B-Number</td>
            <td>Paid Status</td>
            <td>P-c</td>
            <td>I-c</td>
            <td>C-c</td>
            <td>Invoice</td>
            <td>Update</td>
            <td>Delete</td>
          </tr>
        </tfoot>
      </table>

      {alert && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 z-[50] ${
            alert.type === "success" ? "bg-green-600" : "bg-red-600"
          } flex flex-col w-80`}
        >
          <div className="flex items-center space-x-2">
            <span className="flex-1">{alert.message}</span>
            <button
              onClick={dismissAlert}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="w-full h-1 mt-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllUsers;