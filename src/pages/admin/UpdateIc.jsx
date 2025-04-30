import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config/constant";

const UpdateIc = ({ apiUrl }) => {
  const { id } = useParams();
  const [iCertificates, setICertificates] = useState([
    { name: "", status: false, startDate: "", endDate: "", courseName: "" },
  ]);
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
    const fetchCertificates = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/show-user/${id}`, {
          withCredentials: true,
        });
        if (response.status === 200) {
          const certificates = response.data.iCertificates || [];
          if (certificates.length === 0) {
            setICertificates([{ name: "", status: false, startDate: "", endDate: "", courseName: "" }]);
          } else {
            setICertificates(certificates);
          }
        }
      } catch (error) {
        showAlert("Failed to fetch certificates.", "error");
      }
    };
    fetchCertificates();
  }, [id]);

  const handleChange = (index, field, value) => {
    const updatedCertificates = [...iCertificates];
    updatedCertificates[index][field] = value;
    setICertificates(updatedCertificates);
  };

  const handleAddCertificate = () => {
    setICertificates([
      ...iCertificates,
      { name: "", status: false, startDate: "", endDate: "", courseName: "" },
    ]);
  };

  const handleRemoveCertificate = (index) => {
    const updatedCertificates = iCertificates.filter((_, i) => i !== index);
    setICertificates(updatedCertificates);
  };

  const validate = () => {
    const newErrors = [];
    let isValid = true;

    iCertificates.forEach((certificate) => {
      const fieldErrors = [];

      if (!certificate.name.trim()) {
        fieldErrors.push("Name is required.");
        isValid = false;
      }
      if (!certificate.startDate.trim()) {
        fieldErrors.push("Start Date is required.");
        isValid = false;
      }
      if (!certificate.endDate.trim()) {
        fieldErrors.push("End Date is required.");
        isValid = false;
      }
      if (!certificate.courseName.trim()) {
        fieldErrors.push("Course Name is required.");
        isValid = false;
      }

      if (fieldErrors.length > 0) {
        newErrors.push(fieldErrors.join(", "));
      }
    });

    if (newErrors.length > 0) {
      showAlert(newErrors.join(" | "), "error");
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await axios.put(
          `${BACKEND_URL}/update-user/${id}`,
          { iCertificates: iCertificates },
          { withCredentials: true }
        );
        if (response.status === 200) {
          showAlert("Certificates updated successfully!", "success");
        }
      } catch (error) {
        showAlert("Failed to update certificates.", "error");
      }
    }
  };

  return (
    <div className="p-1 sm:p-6 sm:pb-0 pb-[110px] bg-gray-950 h-full overflow-y-auto m-4 rounded shadow-md">
      <h1 className="text-white text-xl font-bold mb-6">Update Internship Certificates</h1>

      {iCertificates.map((certificate, index) => (
        <div
          key={index}
          className="mb-6 p-4 bg-[#18181b] rounded shadow relative"
        >
          <div className="mb-4">
            <label className="block text-white font-medium mb-2">Name:</label>
            <input
              type="text"
              value={certificate.name}
              onChange={(e) => handleChange(index, "name", e.target.value)}
              placeholder="Enter certificate name"
              className="w-full px-3 py-2 rounded border border-gray-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-white font-medium mb-2">Status:</label>
            <select
              value={certificate.status}
              onChange={(e) => handleChange(index, "status", e.target.value === "true")}
              className="w-full px-3 py-2 rounded border border-gray-400"
            >
              <option value={false}>False</option>
              <option value={true}>True</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-white font-medium mb-2">Start Date:</label>
            <input
              type="date"
              value={certificate.startDate}
              onChange={(e) => handleChange(index, "startDate", e.target.value)}
              className="w-full px-3 py-2 rounded border border-gray-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-white font-medium mb-2">End Date:</label>
            <input
              type="date"
              value={certificate.endDate}
              onChange={(e) => handleChange(index, "endDate", e.target.value)}
              className="w-full px-3 py-2 rounded border border-gray-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-white font-medium mb-2">Course Name:</label>
            <input
              type="text"
              value={certificate.courseName}
              onChange={(e) => handleChange(index, "courseName", e.target.value)}
              placeholder="Enter course name"
              className="w-full px-3 py-2 rounded border border-gray-400"
            />
          </div>

          <button
            type="button"
            onClick={() => handleRemoveCertificate(index)}
            className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddCertificate}
        className="px-5 py-2 bg-green-500 text-black rounded hover:bg-green-600"
      >
        + Add Certificate
      </button>

      <div className="mt-6">
        <button
          type="submit"
          onClick={handleSubmit}
          className="px-5 py-2 bg-blue-500 text-black rounded hover:bg-blue-600"
        >
          Update Certificates
        </button>
      </div>

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
  );
};

export default UpdateIc;