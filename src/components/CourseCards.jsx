import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../config/constant";

function Course(props) {
  return (
    <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-blue-900 rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl w-full min-w-[280px] max-w-[320px] group">
      {/* Glowing Effect on Hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-teal-500 via-purple-500 to-pink-500 blur-md"></div>

      <div className="relative rounded-xl overflow-hidden bg-gray-900">
        <figure className="relative h-52 w-full overflow-hidden">
          <img
            src={props.data.imageUrl}
            alt="Course"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-5">
            <h2 className="text-2xl font-bold text-white">
              {props.data.courseName}
              <span className="bg-gradient-to-r from-teal-400 to-blue-400 text-transparent bg-clip-text ml-2">
                English
              </span>
            </h2>
          </div>
        </figure>
        <div className="p-5 bg-gradient-to-b from-gray-900 to-blue-950">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-300">
                Mode: <span className="font-semibold text-white">Online</span>
              </p>
              <p className="text-sm text-gray-300">
                Status: <span className="text-teal-400 font-semibold">Ongoing</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-300">
                Price:{" "}
                <span className="font-semibold text-white">
                  ₹{props.data.price}
                </span>
              </p>
              <p className="text-sm text-gray-300">
                Duration:{" "}
                <span className="font-semibold text-white">
                  {props.data.duration} days
                </span>
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-300">
              Free Internship:{" "}
              <span className="text-teal-400 font-semibold">Available</span>
            </p>
            <p className="text-sm text-gray-300">
              Certificate:{" "}
              <span className="font-semibold text-white">
                Completion + Internship
              </span>
            </p>
            <p className="text-sm text-gray-300">
              Recordings:{" "}
              <span className="font-semibold text-white">
                {props.data.hours}+ hrs
              </span>
            </p>
          </div>
          <div className="mt-6">
            <Link to={`/buy-now/${props.data.nextId}/${props.data._id}`}>
              <button className="w-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-full px-6 py-2.5 text-white font-semibold text-sm uppercase tracking-wide hover:from-teal-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg">
                Visit & Buy Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseCards() {
  const [courses, setCourses] = useState([]);

  async function fetchCourses() {
    const response = await axios.get(`${BACKEND_URL}/show-courses`, {
      withCredentials: true,
    });
    setCourses(response?.data?.data);
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  if (courses.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-white bg-gray-900">
        No courses found
      </div>
    );
  }

  return (
    <div className="w-full overflow-y-auto">
      <div className="bg-gray-900 p-4 sm:p-6 overflow-y-auto">
        <div className="w-full max-w-none px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-center text-white mb-8 sm:mb-12 bg-gradient-to-r from-teal-400 to-blue-400 text-transparent bg-clip-text">
            Discover Your Path to Mastery
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 justify-items-center">
            {courses.map((x, index) => (
              <Course key={index} data={x} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseCards;