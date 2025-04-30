import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config/constant";

function UpdateRoadMapTopics() {
  const { id } = useParams();
  const [roadMapName, setRoadMapName] = useState("");
  const [roadMapId, setRoadMapId] = useState("");
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
    axios
      .get(`${BACKEND_URL}/show-roadmap-topic/${id}`, { withCredentials: true })
      .then((response) => {
        setRoadMapName(response.data.roadMapName);
        setRoadMapId(response.data.id);
      })
      .catch(() => {
        showAlert("Failed to fetch roadmap topic details.", "error");
      });
  }, [id]);

  const validateForm = () => {
    const errors = [];
    if (!roadMapName.trim()) errors.push("Roadmap Name is required.");
    if (!roadMapId.trim()) errors.push("Roadmap ID is required.");

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
      const response = await axios.patch(
        `${BACKEND_URL}/update-roadmap-topic/${id}`,
        { roadMapName, id: roadMapId },
        { withCredentials: true }
      );
      if (response.status === 200) {
        showAlert("Roadmap topic updated successfully!", "success");
      }
    } catch (err) {
      showAlert(err.response?.data?.message || "Failed to update roadmap topic.", "error");
    }
  };

  return (
    <div className="h-full bg-gray-950 flex items-start justify-center m-3">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Update Roadmap Topic</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="roadMapName">
              Roadmap Name
            </label>
            <input
              type="text"
              id="roadMapName"
              value={roadMapName}
              onChange={(e) => setRoadMapName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              placeholder="Enter roadmap name"
            />
          </div>
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="roadMapId">
              ID
            </label>
            <input
              type="text"
              id="roadMapId"
              value={roadMapId}
              onChange={(e) => setRoadMapId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              placeholder="Enter roadmap ID"
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Update Roadmap Topic
            </button>
          </div>
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

export default UpdateRoadMapTopics;