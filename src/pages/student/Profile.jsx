import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ProfileUpdateValidate } from "../../utils/profileUpdateValidate";
import { useSelector } from "react-redux";
import { BACKEND_URL } from '../../../config/constant';

function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [formError, setFormError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [greeting, setGreeting] = useState("");
  const { user } = useSelector((state) => state.user);
  const role = user?.role;

  async function profile() {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/profile`, {
        withCredentials: true,
      });
      const { name, number, university } = data;
      setName(name || "");
      setNumber(number || "");
      setUniversityName(university || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }

  function updateGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Good Afternoon");
    } else if (hour >= 18 && hour < 22) {
      setGreeting("Good Evening");
    } else {
      setGreeting("Good Night");
    }
  }

  useEffect(() => {
    profile();
    updateGreeting();
  }, []);

  const handleProfileSave = async () => {
    const validationError = ProfileUpdateValidate(name, number, universityName);

    if (validationError) {
      setFormError(validationError);
      setIsSuccess(false);
      clearError();
      return;
    }

    try {
      const response = await axios.patch(
        `${BACKEND_URL}/profile/edit`,
        { name, universityName, number },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setFormError("Profile updated successfully!");
        setIsSuccess(true);
        clearError(() => {
          if (role === 'admin') {
            navigate("/admin-dashboard");
          } else {
            navigate("/student-dashboard/profile");
          }
        });
      } else {
        setFormError(response.message || "An error occurred!");
        setIsSuccess(false);
        clearError();
      }
    } catch (error) {
      setFormError("Failed to update profile. Please try again later.");
      setIsSuccess(false);
      clearError();
    }
  };

  const clearError = (callback = () => {}) => {
    setTimeout(() => {
      setFormError("");
      setIsSuccess(false);
      callback();
    }, 2000);
  };

  return (
    <div className="s-profile p-6 sm:p-10 bg-gray-950 min-h-screen flex items-center justify-center">
  <div className="flex flex-col items-center w-full max-w-2xl">
    {/* Avatar Section */}
    <div className="flex flex-col items-center mb-8">
      <div className="avatar online placeholder mb-5">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-5xl sm:text-7xl font-bold uppercase tracking-wider">
            {name.slice(0, 2).toUpperCase()}
          </span>
        </div>
      </div>
      <h1 className="text-3xl sm:text-5xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
        {greeting}
      </h1>
      <h2 className="text-xl sm:text-3xl text-gray-300 font-medium text-center">
        Welcome back, <span className="text-white font-semibold">{name}</span>!
      </h2>
    </div>

    {/* Profile Form */}
    <div className="w-full bg-gray-900 p-6 sm:p-8 rounded-xl border border-gray-700 shadow-xl backdrop-blur-sm bg-opacity-50">
      <div className="space-y-2">
        <div className="form-control">
          <label className="label">
            <span className="label-text text-gray-400">Full Name</span>
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            className="input input-bordered w-full bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-gray-400">Mobile Number</span>
          </label>
          <input
            type="tel"
            placeholder="Enter your mobile number"
            className="input input-bordered w-full bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-white"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-gray-400">College Name</span>
          </label>
          <input
            type="text"
            placeholder="Enter your college name"
            className="input input-bordered w-full bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-white"
            value={universityName}
            onChange={(e) => setUniversityName(e.target.value)}
          />
        </div>

        {/* Status Message */}
        {formError && (
          <div className={`mt-2 text-sm ${isSuccess ? 'text-green-400' : 'text-red-400'} flex items-center justify-center`}>
            {isSuccess ? (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            )}
            {formError}
          </div>
        )}

        {/* Save Button */}
        <button
          className="btn w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 border-none text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
          onClick={handleProfileSave}
        >
          Save Profile
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>
  );
}

export default Profile;