import React, { useState, useEffect } from "react";
import axios from "axios";
import { CreateCourseValidate } from "../../utils/createCourseValidate";
import { BACKEND_URL } from "../../../config/constant";

function CreateCourse() {
  const [formData, setFormData] = useState({
    courseName: "",
    imageUrl: "",
    price: "",
    duration: "",
    enrolled: "",
    status: "0",
    badge: "trending",
    hours: "",
    nextId: "",
    recordingId: "",
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      const result = CreateCourseValidate(
        formData.courseName,
        formData.imageUrl,
        formData.price,
        formData.duration,
        formData.enrolled,
        formData.status,
        formData.badge,
        formData.hours,
        formData.nextId,
        formData.recordingId
      );
      if (result) {
        showAlert(result, "error");
        return;
      }
      const course = { ...formData };
      const response = await axios.post(
        `${BACKEND_URL}/create-course`,
        course,
        { withCredentials: true }
      );
      if (response.status === 200) {
        showAlert("Course created successfully!", "success");
        setFormData({
          courseName: "",
          imageUrl: "",
          price: "",
          duration: "",
          enrolled: "",
          status: "0",
          badge: "trending",
          hours: "",
          nextId: "",
          recordingId: "",
        });
      } else {
        showAlert("Course not created.", "error");
      }
    } catch (err) {
      showAlert("Something went wrong while creating the course.", "error");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-base-300 p-4 sm:p-7 rounded-2xl border-2 border-sky-500 text-center h-full overflow-y-auto">
      <h1 className="text-2xl sm:text-4xl mb-4">Create Course</h1>

      <div className="space-y-3">
        <label className="input input-bordered flex items-center gap-2">
          <span className="w-28 sm:w-32 text-left">Course Name:</span>
          <input
            type="text"
            name="courseName"
            value={formData.courseName}
            onChange={handleChange}
            className="grow"
          />
        </label>

        <label className="input input-bordered flex items-center gap-2">
          <span className="w-28 sm:w-32 text-left">Image Url:</span>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className="grow"
          />
        </label>

        <label className="input input-bordered flex items-center gap-2">
          <span className="w-28 sm:w-32 text-left">Price:</span>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="grow"
          />
        </label>

        <label className="input input-bordered flex items-center gap-2">
          <span className="w-28 sm:w-32 text-left">Duration:</span>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="grow"
          />
        </label>

        <label className="input input-bordered flex items-center gap-2">
          <span className="w-28 sm:w-32 text-left">Enrolled:</span>
          <input
            type="number"
            name="enrolled"
            value={formData.enrolled}
            onChange={handleChange}
            className="grow"
          />
        </label>

        <label className="input input-bordered flex items-center gap-2">
          <span className="w-28 sm:w-32 text-left">Status:</span>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="grow"
          >
            <option value="0">0</option>
            <option value="1">1</option>
          </select>
        </label>

        <label className="input input-bordered flex items-center gap-2">
          <span className="w-28 sm:w-32 text-left">Badge:</span>
          <select
            name="badge"
            value={formData.badge}
            onChange={handleChange}
            className="grow"
          >
            <option value="trending">Trending</option>
            <option value="best-seller">Best Seller</option>
          </select>
        </label>

        <label className="input input-bordered flex items-center gap-2">
          <span className="w-28 sm:w-32 text-left">Hours:</span>
          <input
            type="number"
            name="hours"
            value={formData.hours}
            onChange={handleChange}
            className="grow"
          />
        </label>

        <label className="input input-bordered flex items-center gap-2">
          <span className="w-28 sm:w-32 text-left">Custom Course ID:</span>
          <input
            type="text"
            name="nextId"
            value={formData.nextId}
            onChange={handleChange}
            className="grow"
          />
        </label>

        <label className="input input-bordered flex items-center gap-2">
          <span className="w-28 sm:w-32 text-left">Recording ID:</span>
          <input
            type="text"
            name="recordingId"
            value={formData.recordingId}
            onChange={handleChange}
            className="grow"
          />
        </label>
      </div>

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

      <button onClick={handleSubmit} className="btn w-full mt-4 btn-info">
        Create Course
      </button>
    </div>
  );
}

export default CreateCourse;