import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from "../../../config/constant";

function CreateLogo() {
  const [companyName, setCompanyName] = useState('');
  const [logo, setLogo] = useState('');
  const [errors, setErrors] = useState({});
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

  const validateForm = () => {
    const newErrors = {};
    if (!companyName.trim()) newErrors.companyName = 'Company Name is required';
    if (!logo.trim()) newErrors.logo = 'Logo URL is required';
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors).join(', ');
      showAlert(errorMessages, 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.post(
        `${BACKEND_URL}/create-logo`,
        { companyName, logo },
        { withCredentials: true }
      );
      if (response.status === 200) {
        showAlert('Company logo created successfully!', 'success');
        setCompanyName('');
        setLogo('');
        setErrors({});
      }
    } catch (error) {
      showAlert(error.response?.data?.message || 'An error occurred while creating the logo.', 'error');
    }
  };

  return (
    <div className="bg-gray-950 sm:flex sm:items-center sm:justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full sm:max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Create Company Logo</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="companyName">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.companyName
                  ? 'border-red-500 focus:ring-red-500 bg-gray-700 text-white'
                  : 'border-gray-600 focus:ring-blue-500 bg-gray-700 text-white'
              }`}
              placeholder="Enter company name"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="logo">
              Logo URL
            </label>
            <input
              type="text"
              id="logo"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.logo
                  ? 'border-red-500 focus:ring-red-500 bg-gray-700 text-white'
                  : 'border-gray-600 focus:ring-blue-500 bg-gray-700 text-white'
              }`}
              placeholder="Enter logo URL"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Create Logo
          </button>
        </form>

        {alert && (
          <div
            className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 z-[50] ${
              alert.type === 'success' ? 'bg-green-600' : 'bg-red-600'
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
    </div>
  );
}

export default CreateLogo;