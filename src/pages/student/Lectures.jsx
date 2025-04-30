
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CourseCards from '../../components/CourseCards';

function Lectures() {
  const { user } = useSelector((state) => state.user || {});
  const courses = user?.courses || [];
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
    if (!user) {
      showAlert("Loading user data...", "info");
    } else if (courses.length === 0) {
      showAlert("No paid courses found. Explore available courses!", "info");
    } else {
      showAlert("Your paid courses loaded successfully!", "success");
    }
  }, [user, courses]);

  useEffect(() => {
    if (courses.length > 0) {
      courses.forEach((course) => {
        showAlert(
          `Course "${course.courseName}" is ${course.status ? 'Active' : 'Expired'}`,
          course.status ? 'success' : 'error'
        );
      });
    }
  }, [courses]);

  const handleWatchRecordings = (courseName) => {
    showAlert(`Navigating to recordings for ${courseName}...`, "info");
  };

  return (
    <div className="w-full min-h-screen p-4 bg-gradient-to-br from-gray-950 to-gray-900 text-white overflow-y-auto">
      {/* Alert Component */}
      {alert && (
  <div
    className={`fixed top-[85px] left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 z-[100] ${
      alert.type === 'success'
        ? 'bg-green-600'
        : alert.type === 'info'
        ? 'bg-blue-600'
        : 'bg-red-600'
    } flex flex-col w-80 sm:bottom-4 sm:right-4 sm:top-auto sm:left-auto sm:translate-x-0 opacity-100`}
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
        className="h-full bg-white transition-all duration-[16ms] ease-linear"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
)}

      {user ? (
        courses.length > 0 ? (
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Your Paid Courses
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-gray-900/50 border border-blue-800/30 hover:border-blue-600/50 transition-all min-w-[280px] max-w-[350px]"
                >
                  <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {course.courseName}
                  </h3>
                  <p className="text-gray-300 text-sm">Amount Paid: ₹{course.amount}</p>
                  <p className="text-gray-300 text-sm">Transaction ID: {course.transactionId}</p>
                  <p className="text-gray-300 text-sm">Purchased By: {course.name}</p>
                  <p className="text-gray-300 text-sm">Gmail: {course.email}</p>
                  <p
                    className={`font-medium mt-2 text-sm ${
                      course.status ? 'text-green-400' : 'text-red-500'
                    }`}
                  >
                    Status: {course.status ? 'Active' : 'Expired'}
                  </p>
                  {course.status && (
                    <Link to={`/student-dashboard/profile/recordings/${course.recordingsId}`}>
                      <button
                        onClick={() => handleWatchRecordings(course.courseName)}
                        className="mt-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 text-sm"
                      >
                        Watch Recordings
                      </button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center w-full">
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              No Paid Courses
            </h2>
            <p className="text-gray-300 mb-4 text-sm">Please purchase a course to access lectures.</p>
            <div className="w-full">
              <CourseCards />
            </div>
          </div>
        )
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Loading...
          </h2>
        </div>
      )}
    </div>
  );
}

export default Lectures;