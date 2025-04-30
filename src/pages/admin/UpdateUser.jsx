import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config/constant";

const UpdateUser = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    role: "student",
    batchNumber: 10,
    paymentStatus: false,
    university: "worldsaibot",
  });
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/show-user/${id}`, {
          withCredentials: true,
        });
        const userData = response.data;

        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          number: userData.number || "",
          role: userData.role || "student",
          batchNumber: userData.batchNumber || 10,
          paymentStatus: userData.paymentStatus || false,
          university: userData.university || "worldsaibot",
        });

        setLoading(false);
      } catch (error) {
        showAlert("Failed to fetch user data.", "error");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "number" && value === ""
          ? ""
          : name === "paymentStatus"
          ? value === "true"
          : value,
    });
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.name.trim()) errors.push("Name is required.");
    if (!formData.email.trim()) {
      errors.push("Email is required.");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push("Email format is invalid.");
    }
    if (!formData.number.trim()) errors.push("Number is required.");
    if (!formData.role) errors.push("Role is required.");
    if (!formData.batchNumber) errors.push("Batch Number is required.");
    if (!formData.university.trim()) errors.push("University is required.");

    if (errors.length > 0) {
      showAlert(errors.join(", "), "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.put(
        `${BACKEND_URL}/update-user/${id}`,
        formData,
        { withCredentials: true }
      );
      if (response.status === 200) {
        showAlert("Profile updated successfully!", "success");
      }
    } catch (error) {
      showAlert(
        error.response?.data?.message || "Failed to update profile.",
        "error"
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10 text-white">Loading user data...</div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-black shadow-md rounded-lg p-6 h-full overflow-y-scroll">
      <h2 className="text-xl font-semibold mb-4 text-white">Update User</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-white font-medium mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="Enter name"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-white font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="Enter email"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="number" className="block text-white font-medium mb-2">
            Number
          </label>
          <input
            type="number"
            name="number"
            value={formData.number}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="Enter number"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="role" className="block text-white font-medium mb-2">
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="batchNumber"
            className="block text-white font-medium mb-2"
          >
            Batch Number
          </label>
          <input
            type="number"
            name="batchNumber"
            value={formData.batchNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="Enter batch number"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="paymentStatus"
            className="block text-white font-medium mb-2"
          >
            Payment Status
          </label>
          <select
            name="paymentStatus"
            value={formData.paymentStatus.toString()}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="university"
            className="block text-white font-medium mb-2"
          >
            University
          </label>
          <input
            type="text"
            name="university"
            value={formData.university}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="Enter university"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Update User
        </button>
      </form>

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
};

export default UpdateUser;