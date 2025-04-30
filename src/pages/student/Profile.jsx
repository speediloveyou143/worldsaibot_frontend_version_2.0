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
    <div className="s-profile p-4 sm:p-8 bg-gray-950">
      <div className="flex flex-col items-center">
        <div className="avatar online placeholder mb-4">
          <div className="bg-black text-white w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center">
            <span className="text-4xl sm:text-6xl font-bold uppercase">
              {name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-4xl mb-2">{greeting}</h1>
        <h1 className="text-xl sm:text-3xl mb-6">Welcome Back {name}!</h1>
        <div className="w-full sm:w-3/6 bg-base-400 p-4 sm:p-7 rounded-2xl border-2 border-sky-500 s-form text-center">
          <label className="input input-bordered flex items-center gap-2 mb-3">
            Full Name:
            <input
              type="text"
              className="grow"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="input input-bordered flex items-center gap-2 mb-3">
            Mobile number:
            <input
              type="number"
              className="grow"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </label>
          <label className="input input-bordered flex items-center gap-2 mb-3">
            College Name:
            <input
              type="text"
              className="grow"
              value={universityName}
              onChange={(e) => setUniversityName(e.target.value)}
            />
          </label>
          <p className={`mb-3 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
            {formError}
          </p>
          <button
            className="btn w-full btn-info"
            onClick={handleProfileSave}
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;