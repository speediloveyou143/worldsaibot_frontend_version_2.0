import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../../config/constant";

function Course(props) {
  const { data, showAlert } = props;

  async function handleDelete() {
    try {
      const response = await axios.delete(
        `${BACKEND_URL}/delete-course/${data._id}`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        showAlert("Course deleted successfully!", "success");
      } else {
        showAlert("Failed to delete the course.", "error");
      }
    } catch (error) {
      showAlert("An error occurred while deleting the course.", "error");
    }
  }

  return (
    <div className="card shadow-2xl bg-base-300 sm:w-80 w-full sm:m-3 m-4 my-4 shadow-xl h-fit">
      <figure>
        <img
          src={data.imageUrl}
          alt="Shoes"
          className="h-[170px] w-full"
        />
      </figure>
      <div className="card-body p-3">
        <h2 className="card-title">
          {data.courseName}
          <div className="badge badge-secondary">English</div>
        </h2>
        <div className="flex align-center justify-between">
          <div>
            <p className="p-0 m-0">
              Mode:<span className="">Online</span>
            </p>
            <p className="p-0 m-0">
              Status:<span className="text-success">Ongoing</span>
            </p>
          </div>
          <div>
            <p className="p-0 m-0">Price:{data.price}</p>
            <p className="p-0 m-0">Duration:{data.duration} days</p>
          </div>
        </div>
        <p className="p-0 m-0">
          Free Internship:<span className="text-success">Available</span>
        </p>
        <p className="p-0 m-0">Certificate:Completion+Internship</p>
        <p className="p-0 m-0">
          Recordings:{data.hours}+hrs
          <span className="badge bg-success text-black font-bold">
            Life Time Access
          </span>
        </p>
        <div className="card-actions justify-end">
          <Link to={`/admin-dashboard/profile/all-courses/${data._id}`}>
            <div className="badge badge-outline bg-success text-black cursor-pointer p-3">
              Update
            </div>
          </Link>
          <div
            className="badge badge-outline bg-error text-black cursor-pointer p-3"
            onClick={handleDelete}
          >
            Delete
          </div>
        </div>
      </div>
    </div>
  );
}

function AllCourses() {
  const [courses, setCourses] = useState([]);
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

  async function fetchCourses() {
    try {
      const response = await axios.get(`${BACKEND_URL}/show-courses`, {
        withCredentials: true,
      });
      setCourses(response?.data?.data || []);
    } catch (error) {
      setCourses([]);
      showAlert("Error fetching courses. Please try again.", "error");
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  if (courses.length === 0) {
    return <div>No courses found</div>;
  }

  return (
    <div className="h-full overflow-y-scroll flex flex-wrap h-full overflow-y-auto pb-[100px] justify-evenly">
      {courses.map((x, index) => (
        <Course key={index} data={x} showAlert={showAlert} />
      ))}
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
}

export default AllCourses;