import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BACKEND_URL } from "../../../config/constant";

function AllBootcamps() {
  const [bootcamps, setBootcamps] = useState([]);
  const [alert, setAlert] = useState(null); // State for managing alerts
  const [progress, setProgress] = useState(100); // Progress bar state

  useEffect(() => {
    const fetchBootcamps = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/all-bootcamps`);
        setBootcamps(response.data);
      } catch (error) {
        showAlert('Error fetching bootcamps. Please try again.', 'error');
      }
    };
    fetchBootcamps();
  }, []);

  // Function to show alerts
  const showAlert = (message, type) => {
    setAlert({ message, type });
    setProgress(100); // Reset progress when new alert is shown
  };

  // Handle alert dismissal
  const dismissAlert = () => {
    setAlert(null);
    setProgress(100);
  };

  // Progress bar and auto-dismiss logic
  useEffect(() => {
    if (alert) {
      const duration = 3000; // 3 seconds
      const interval = 50; // Update every 50ms
      const decrement = (interval / duration) * 100; // Progress reduction per interval

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

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/delete-bootcamp/${id}`, { withCredentials: true });
      setBootcamps(bootcamps.filter((bootcamp) => bootcamp._id !== id));
      showAlert('Bootcamp deleted successfully!', 'success');
    } catch (error) {
      showAlert('Error deleting bootcamp. Please try again.', 'error');
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen p-5 text-[#ccd6f6]">
      <h1 className="text-center text-[#64ffda] mb-8 text-3xl font-bold">All Bootcamps</h1>
      <div className="flex flex-wrap gap-5 justify-center">
        {bootcamps.map((bootcamp) => (
          <div
            key={bootcamp._id}
            className="bg-[#112240] p-5 rounded-lg w-72 shadow-lg transition-transform duration-200 cursor-pointer hover:scale-105 text-[#ccd6f6]"
          >
            <h2 className="text-[#64ffda] mb-3 text-xl font-semibold">{bootcamp.courseName}</h2>
            <p>{bootcamp._id}</p>
            <div className="flex gap-3 mt-5">
              <Link
                to={`/admin-dashboard/profile/update-bootcamp/${bootcamp._id}`}
                className="flex-1 text-center no-underline bg-[#64ffda] text-[#0a192f] px-4 py-2 rounded-lg font-bold"
              >
                Update
              </Link>
              <button
                onClick={() => handleDelete(bootcamp._id)}
                className="flex-1 bg-[#ff4d4d] text-[#0a192f] px-4 py-2 rounded-lg font-bold border-none cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Component */}
      {alert && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 ${
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

export default AllBootcamps;