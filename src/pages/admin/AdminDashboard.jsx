
import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../../redux/userSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../../config/constant";

function AdminDashboard() {
  const { user } = useSelector((state) => state.user);
  const name = user?.name || "Guest";
  const one = name.length > 1 ? name[0] + name[1] : name[0] || "G";
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [alert, setAlert] = useState(null); // State for managing alerts
  const [progress, setProgress] = useState(100); // Progress bar state
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const sidebarOptions = [
    { to: "/admin-dashboard", icon: "bi bi-person-circle", label: "Profile" },
    { to: "/admin-dashboard/profile/all-users", icon: "bi bi-people-fill", label: "All Users" },
    { to: "/admin-dashboard/profile/all-registers", icon: "bi bi-person-check-fill", label: "All Registers" },
    { to: "/admin-dashboard/profile/create-course", icon: "bi bi-plus-square-fill", label: "Create Course" },
    { to: "/admin-dashboard/profile/all-courses", icon: "bi bi-book-fill", label: "All Courses" },
    { to: "/admin-dashboard/profile/create-road-map", icon: "bi bi-signpost-split-fill", label: "Create Roadmap" },
    { to: "/admin-dashboard/profile/all-roadmaps", icon: "bi bi-map-fill", label: "All Roadmaps" },
    { to: "/admin-dashboard/profile/create-recordings", icon: "bi bi-mic-mute-fill", label: "Create Recordings" },
    { to: "/admin-dashboard/profile/all-recordings", icon: "bi bi-mic-fill", label: "All Recordings" },
    { to: "/admin-dashboard/profile/create-logo", icon: "bi bi-brush-fill", label: "Create Company Logo" },
    { to: "/admin-dashboard/profile/all-company-logos", icon: "bi bi-building", label: "All Company Logos" },
    { to: "/admin-dashboard/profile/create-video", icon: "bi bi-play-btn-fill", label: "Create Video" },
    { to: "/admin-dashboard/profile/all-videos", icon: "bi bi-camera-video-fill", label: "All Videos" },
    { to: "/admin-dashboard/profile/create-privacy", icon: "bi bi-shield-lock-fill", label: "Create Privacy Policy" },
    { to: "/admin-dashboard/profile/all-privacy", icon: "bi bi-lock-fill", label: "All Privacy Policies" },
    { to: "/admin-dashboard/profile/create-bootcamp", icon: "bi bi-code-square", label: "Create Bootcamp" },
    { to: "/admin-dashboard/profile/all-bootcamps", icon: "bi bi-laptop-fill", label: "All Bootcamps" },
    { to: "/admin-dashboard/profile/create-road-map-topics", icon: "bi bi-list-task", label: "Create Roadmap Topics" },
    { to: "/admin-dashboard/profile/all-road-map-topics", icon: "bi bi-list-check", label: "All Roadmap Topics" },
    { to: "/admin-dashboard/profile/create-job", icon: "bi bi-briefcase-fill", label: "Create Job" },
    { to: "/admin-dashboard/profile/all-jobs", icon: "bi bi-briefcase", label: "All Jobs" },
    { to: "/admin-dashboard/profile/create-data", icon: "bi bi-database-fill", label: "Create Data" },
    { to: "/admin-dashboard/profile/all-create-data", icon: "bi bi-database", label: "All Data" },
    { to: "/admin-dashboard/profile/create-test", icon: "bi bi-clipboard-check-fill", label: "Create Test" },
    { to: "/admin-dashboard/profile/all-tests", icon: "bi bi-clipboard-data", label: "All Tests" },
    { to: "/admin-dashboard/profile/create-interview", icon: "bi bi-clipboard-data", label: "Create Interview" },
    { to: "/admin-dashboard/profile/all-interview", icon: "bi bi-clipboard-data", label: "All Interview Questions" },
  ];

  const visibleOptions = sidebarOptions.slice(0, 4);
  const hiddenOptions = sidebarOptions.slice(4);

  const isActive = (path) => location.pathname === path;

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

  const handleSignOut = async () => {
    try {
      await axios.post(`${BACKEND_URL}/signout`, {}, { withCredentials: true });
      dispatch(clearUser());
      showAlert("Successfully signed out", "success");
      setTimeout(() => navigate("/signin"), 1000); // Navigate after showing success
    } catch (error) {
      showAlert("Failed to sign out. Please try again.", "error");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-blue-950 text-white">
      {/* Left Sidebar */}
      <div className="hidden md:flex flex-col w-[300px] bg-gray-900/50 p-4 h-[calc(100vh-64px)] fixed left-0 top-16 overflow-y-auto border-r border-blue-800/30">
        <div className="ls-p-con mb-6 gap-1 flex items-center space-x-3">
          <h1 className="w-12 bg-black text-white h-12 flex items-center justify-center font-bold text-xl rounded-full">
            {one.toUpperCase()}
          </h1>
          <h1 className="text-xl truncate w-40">{name}</h1>
        </div>
        <div className="flex flex-col flex-grow">
          {sidebarOptions.map((option, index) => (
            <div key={index}>
              <Link to={option.to}>
                <button
                  className={`w-full text-left p-3 rounded-lg hover:bg-blue-900/30 transition-all duration-200 ${
                    isActive(option.to) ? "bg-blue-900/50 border-l-4 border-blue-500" : ""
                  }`}
                >
                  <i className={option.icon}></i> {option.label}
                </button>
              </Link>
              {option.label.startsWith("All") && index < sidebarOptions.length - 1 && index > 1 && (
                <hr className="my-2 border-blue-800/20" />
              )}
            </div>
          ))}
        </div>
        <button
          className="w-full text-left p-3 rounded-lg hover:bg-blue-900/30 transition-all duration-200 mt-auto"
          onClick={handleSignOut}
        >
          <i className="bi bi-box-arrow-right"></i> Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-gray-950 mt-1 md:pb-10 md:ml-[300px] h-[calc(100vh-64px)] fixed top-16 w-full md:w-[calc(100vw-300px)]">
        <Outlet />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-gray-900/50 backdrop-blur-sm p-2 flex justify-around items-center border-t border-blue-800/30 rounded-t-lg">
        {visibleOptions.map((option, index) => (
          <Link key={index} to={option.to}>
            <button
              className={`flex flex-col items-center space-y-1 p-2 hover:bg-blue-900/30 rounded-lg transition-all duration-200 ${
                isActive(option.to) ? "bg-blue-900/50" : ""
              }`}
            >
              <i className={option.icon}></i>
              <span className="text-xs">{option.label}</span>
            </button>
          </Link>
        ))}
        <div className="relative">
          <button
            className="flex flex-col items-center space-y-1 p-2 hover:bg-blue-900/30 rounded-lg transition-all duration-200"
            onClick={() => setIsMoreOpen(!isMoreOpen)}
          >
            <i className="bi bi-three-dots-vertical"></i>
            <span className="text-xs">More</span>
          </button>
          {isMoreOpen && (
            <div className="absolute bottom-14 right-0 w-64 max-h-64 overflow-y-auto bg-gray-900/90 backdrop-blur-md p-4 rounded-lg border border-blue-800/30 shadow-lg">
              {hiddenOptions.map((option, index) => (
                <Link
                  key={index}
                  to={option.to}
                  onClick={() => setIsMoreOpen(false)}
                >
                  <button
                    className={`flex items-center space-x-2 w-full p-2 hover:bg-blue-900/30 rounded-lg transition-all duration-200 ${
                      isActive(option.to) ? "bg-blue-900/50" : ""
                    }`}
                  >
                    <i className={option.icon}></i>
                    <span>{option.label}</span>
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>
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

export default AdminDashboard;