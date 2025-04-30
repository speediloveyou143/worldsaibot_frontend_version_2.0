import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config/constant";

function UpdatePrivacy() {
  const { id } = useParams();
  const [heading, setHeading] = useState("");
  const [paragraph, setParagraph] = useState("");
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
      .get(`${BACKEND_URL}/show-privacy/${id}`, { withCredentials: true })
      .then((response) => {
        setHeading(response.data.heading);
        setParagraph(response.data.paragraph);
      })
      .catch(() => {
        showAlert("Failed to fetch privacy details.", "error");
      });
  }, [id]);

  const validateForm = () => {
    const errors = [];
    if (!heading.trim()) errors.push("Heading is required.");
    if (!paragraph.trim()) errors.push("Paragraph is required.");

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
        `${BACKEND_URL}/update-privacy/${id}`,
        { heading, paragraph },
        { withCredentials: true }
      );
      if (response.status === 200) {
        showAlert("Privacy entry updated successfully!", "success");
      }
    } catch (err) {
      showAlert(err.response?.data?.message || "Failed to update privacy entry.", "error");
    }
  };

  return (
    <div className="h-full mt-4 sm:mt-5 m-3 bg-gray-950 flex items-start justify-center">
      <div className="bg-gray-800 p-4 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Update Privacy Entry</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="heading">
              Heading
            </label>
            <input
              type="text"
              id="heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              placeholder="Enter heading"
            />
          </div>
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="paragraph">
              Paragraph
            </label>
            <textarea
              id="paragraph"
              value={paragraph}
              onChange={(e) => setParagraph(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              placeholder="Enter paragraph"
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Update Privacy Entry
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

export default UpdatePrivacy;