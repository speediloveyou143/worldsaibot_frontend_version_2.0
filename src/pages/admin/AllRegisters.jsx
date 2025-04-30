import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../../config/constant";

function Row(props) {
  const { number, data, showAlert } = props;

  async function handleDelete() {
    try {
      const response = await axios.delete(
        `${BACKEND_URL}/delete-register/${data._id}`,
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

  return (
    <>
      <tr>
        <th>{number}</th>
        <td>{data.name}</td>
        <td>{data.email}</td>
        <td>{data.mobile}</td>
        <td>{data.country}</td>
        <td>{data.state}</td>
        <td>{data.course}</td>
        <td className="text-error cursor-pointer" onClick={handleDelete}>
          Delete
        </td>
      </tr>
    </>
  );
}

function AllRegisters() {
  const [userData, setUserData] = useState([]);
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

  async function fetchUsers() {
    try {
      const response = await axios.get(`${BACKEND_URL}/all-registers`, {
        withCredentials: true,
      });
      setUserData(response?.data || []);
    } catch (err) {
      showAlert("Something went wrong while fetching users.", "error");
      setUserData([]);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="h-full w-full overflow-x-scroll overflow-y-scroll pb-[80px] sm:pb-[0px]">
      <table className="table table-xs table-pin-rows table-pin-cols">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Country</th>
            <th>State</th>
            <th>Course</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {userData.length > 0 ? (
            userData.map((user, index) => (
              <Row key={user._id} number={index + 1} data={user} showAlert={showAlert} />
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Country</th>
            <th>State</th>
            <th>Course</th>
            <th>Delete</th>
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

export default AllRegisters;