import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BACKEND_URL } from "../../../config/constant";

const UpdateInvoice = () => {
  const { id } = useParams();
  const [courses, setCourses] = useState([
    {
      transactionId: "",
      amount: 0,
      status: false,
      courseName: "",
      email: "",
      name: "",
      recordingsId: "12345",
    },
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
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/show-user/${id}`, {
          withCredentials: true,
        });

        if (response.status === 200) {
          const userCourses = response.data.courses || [];
          setCourses(userCourses.length > 0 ? userCourses : [
            {
              transactionId: "",
              amount: 0,
              status: false,
              courseName: "",
              email: "",
              name: "",
              recordingsId: "12345",
            },
          ]);
        }
      } catch (error) {
        showAlert("Failed to fetch courses.", "error");
      }
    };

    fetchCourses();
  }, [id]);

  const handleChange = (index, field, value) => {
    const updatedCourses = [...courses];
    updatedCourses[index][field] = value;
    setCourses(updatedCourses);
  };

  const handleAddCourse = () => {
    setCourses([
      ...courses,
      {
        transactionId: "",
        amount: 0,
        status: false,
        courseName: "",
        email: "",
        name: "",
        recordingsId: "12345",
      },
    ]);
  };

  const handleRemoveCourse = (index) => {
    const updatedCourses = courses.filter((_, i) => i !== index);
    setCourses(updatedCourses);
  };

  const validate = () => {
    const newErrors = [];
    let isValid = true;

    courses.forEach((course) => {
      const fieldErrors = [];

      if (!course.transactionId.trim()) {
        fieldErrors.push("Transaction ID is required.");
        isValid = false;
      }
      if (course.amount <= 0) {
        fieldErrors.push("Amount must be greater than 0.");
        isValid = false;
      }
      if (!course.courseName.trim()) {
        fieldErrors.push("Course Name is required.");
        isValid = false;
      }
      if (!course.email.trim()) {
        fieldErrors.push("Email is required.");
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(course.email)) {
        fieldErrors.push("Email is invalid.");
        isValid = false;
      }
      if (!course.name.trim()) {
        fieldErrors.push("Name is required.");
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
          { courses },
          { withCredentials: true }
        );
        if (response.status === 200) {
          showAlert("Courses updated successfully!", "success");
        }
      } catch (error) {
        showAlert("Failed to update courses.", "error");
      }
    }
  };

  return (
    <div className="p-6 bg-[#030712] h-full overflow-y-scroll m-4 rounded shadow-md">
      <h1 className="text-white text-xl font-bold mb-6">Update Courses</h1>

      {courses.map((course, index) => (
        <div
          key={index}
          className="mb-6 p-4 bg-[#18181b] rounded shadow relative"
        >
          <div className="mb-4">
            <label className="block text-white font-medium mb-2">Transaction ID:</label>
            <input
              type="text"
              value={course.transactionId}
              onChange={(e) => handleChange(index, "transactionId", e.target.value)}
              placeholder="Enter Transaction ID"
              className="w-full px-3 py-2 rounded border border-gray-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-white font-medium mb-2">Amount:</label>
            <input
              type="number"
              value={course.amount}
              onChange={(e) => handleChange(index, "amount", e.target.value)}
              placeholder="Enter Amount"
              className="w-full px-3 py-2 rounded border border-gray-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-white font-medium mb-2">Status:</label>
            <select
              value={course.status}
              onChange={(e) => handleChange(index, "status", e.target.value === "true")}
              className="w-full px-3 py-2 rounded border border-gray-400"
            >
              <option value={false}>False</option>
              <option value={true}>True</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-white font-medium mb-2">Course Name:</label>
            <input
              type="text"
              value={course.courseName}
              onChange={(e) => handleChange(index, "courseName", e.target.value)}
              placeholder="Enter Course Name"
              className="w-full px-3 py-2 rounded border border-gray-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-white font-medium mb-2">Email:</label>
            <input
              type="email"
              value={course.email}
              onChange={(e) => handleChange(index, "email", e.target.value)}
              placeholder="Enter Email"
              className="w-full px-3 py-2 rounded border border-gray-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-white font-medium mb-2">Name:</label>
            <input
              type="text"
              value={course.name}
              onChange={(e) => handleChange(index, "name", e.target.value)}
              placeholder="Enter Name"
              className="w-full px-3 py-2 rounded border border-gray-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-white font-medium mb-2">Recordings ID:</label>
            <input
              type="text"
              value={course.recordingsId}
              onChange={(e) => handleChange(index, "recordingsId", e.target.value)}
              placeholder="Enter Recordings ID"
              className="w-full px-3 py-2 rounded border border-gray-400"
            />
          </div>

          <button
            onClick={() => handleRemoveCourse(index)}
            className="absolute top-4 right-4 bg-red-500 text-white px-3 py-2 rounded shadow"
          >
            Remove
          </button>
        </div>
      ))}

      <div className="flex justify-between items-center">
        <button
          onClick={handleAddCourse}
          className="px-4 py-2 bg-green-500 text-white rounded shadow"
        >
          Add Course
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded shadow"
        >
          Submit
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

export default UpdateInvoice;