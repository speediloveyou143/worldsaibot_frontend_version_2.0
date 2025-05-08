import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Footer from '../../components/Footer';
import { BACKEND_URL } from '../../../config/constant';

const Home = (props) => {
  const [companies, setCompanies] = useState([]);
  const [videos, setVideos] = useState([]);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);
  const companiesScrollerRef = useRef(null);
  const videosScrollerRef = useRef(null);

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

    // Fetch companies
    const fetchCompanies = async () => {
      try {
        showAlert("Loading companies...", "info");
        const response = await axios.get(`${BACKEND_URL}/show-companies`);
        setCompanies(response.data);
        showAlert("Companies loaded successfully!", "success");
      } catch (error) {
        showAlert(
          error.response?.data?.message || "Failed to fetch companies.",
          "error"
        );
      }
    };

    // Fetch videos
    const fetchVideos = async () => {
      try {
        showAlert("Loading videos...", "info");
        const response = await axios.get(`${BACKEND_URL}/show-videos`);
        const data = Array.isArray(response.data) ? response.data : [];
        setVideos(data);
        if (data.length > 0) {
          showAlert("Videos loaded successfully!", "success");
        } else {
          showAlert("No videos available.", "info");
        }
      } catch (error) {
        showAlert(
          error.response?.data?.message || "Failed to fetch videos.",
          "error"
        );
        setVideos([]);
      }
    };
    fetchCompanies();
    fetchVideos();
  }, []);

  useEffect(() => {
    const companiesScroller = companiesScrollerRef.current;
    if (!companiesScroller) return;
    let animationFrame;
    const scrollSpeed = 1;
    const autoScroll = () => {
      if (companiesScroller.scrollLeft >= companiesScroller.scrollWidth - companiesScroller.clientWidth) {
        companiesScroller.scrollLeft = 0;
      } else {
        companiesScroller.scrollLeft += scrollSpeed;
      }
      animationFrame = requestAnimationFrame(autoScroll);
    };
    autoScroll();
    return () => cancelAnimationFrame(animationFrame);
  }, [companies]);

  const achievements = [
    { title: 'Highest Package', value: '₹48.5 LPA', icon: '🏆' },
    { title: 'Average Salary', value: '₹12.8 LPA', icon: '💰' },
    { title: 'Companies Hiring', value: '500+', icon: '🏢' },
    { title: 'Career Mentors', value: '100+', icon: '👨‍🏫' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-0">
      {/* Alert Component */}
      {alert && (
  <div
    className={`fixed top-[85px] left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 z-[100] ${
      alert.type === 'success'
        ? 'bg-green-600'
        : alert.type === 'info'
        ? 'bg-blue-600'
        : 'bg-red-600'
    } flex flex-col w-80 sm:bottom-4 sm:right-4 sm:top-auto sm:left-auto sm:translate-x-0 opacity-0`}
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

      <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="relative z-10 px-4 max-w-5xl mx-auto text-center">
          <div className="mb-8 transform hover:scale-105 transition-transform">
            <span className="inline-block my-5 px-6 py-2 text-lg shadow-xl rounded-[23px] bg-blue-900/20 border border-blue-800/30 hover:border-blue-600/50">
              {props.bannerData.offer||''}
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-bold mb-8 leading-tight bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
            {props.bannerData.heading||''}
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {props.bannerData.tag||''}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <button
              onClick={() => setIsModalOpen(true)}
              className="group px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105 rounded-lg bg-blue-900/20 border border-blue-800/30 hover:border-blue-600/50"
            >
              Join Free{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </button>
            <Link to="/courses">
              <button className="px-8 py-4 text-lg transition-all duration-300 rounded-lg bg-blue-900/20 border border-blue-800/30 hover:border-blue-600/50 hover:scale-105">
                Explore Courses
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              ['10K+', 'Active Learners'],
              ['95%', 'Placement Rate'],
              ['500+', 'Course Hours'],
              ['50+', 'Industry Partners'],
            ].map(([stat, label], index) => (
              <div
                key={label}
                className="group p-6 transition-all duration-300 transform hover:scale-105 rounded-lg bg-blue-900/20 border border-blue-800/30 hover:border-blue-600/50"
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <div className="text-3xl font-bold mb-2">{stat}</div>
                <div className="text-sm text-gray-300">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for Bootcamps */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div
            className="relative bg-gradient-to-b from-[#1a1a1a] to-[#000000] rounded-xl p-6 w-full max-w-md 
              border-2 border-transparent bg-clip-padding animate-glow"
          >
            <style>
              {`
                @keyframes glow {
                  0% { 
                    box-shadow: 0 0 10px rgba(138, 43, 226, 0.5), 
                               0 0 20px rgba(75, 0, 130, 0.4), 
                               0 0 30px rgba(112, 44, 246, 0.3); 
                    border-color: rgba(138, 43, 226, 0.8);
                  }
                  50% { 
                    box-shadow: 0 0 20px rgba(138, 43, 226, 0.7), 
                               0 0 30px rgba(75, 0, 130, 0.6), 
                               0 0 40px rgba(112, 44, 246, 0.5); 
                    border-color: rgba(75, 0, 130, 0.9);
                  }
                  100% { 
                    box-shadow: 0 0 10px rgba(138, 43, 226, 0.5), 
                               0 0 20px rgba(75, 0, 130, 0.4), 
                               0 0 30px rgba(112, 44, 246, 0.3); 
                    border-color: rgba(138, 43, 226, 0.8);
                  }
                }
                .animate-glow {
                  animation: glow 2s infinite ease-in-out;
                }
              `}
            </style>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white tracking-wide">Bootcamps</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-purple-300 transition-colors"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {props.bootcamps||[].map((bootcamp) => (
                <Link
                  key={bootcamp._id}
                  to={`/free-class/${bootcamp._id}`}
                  onClick={() => setIsModalOpen(false)}
                  className="block px-4 py-3 text-white bg-gradient-to-r from-[#2a2a2a] to-[#1a1a1a] 
                    rounded-lg transition-all duration-300 ease-in-out 
                    hover:scale-105 hover:bg-gradient-to-r hover:from-[#8A2BE2] hover:to-[#4B0082] 
                    hover:shadow-[0_0_15px_rgba(138,43,226,0.6)] 
                    active:scale-95 active:shadow-inner text-center font-medium"
                >
                  {bootcamp.roadMapName}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <hr className="mx-[70px] border-[3px] hidden sm:block" />

      <div className="py-16 relative overflow-hidden">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Our Hiring Partners</h2>
          <div className="relative overflow-x-auto" ref={companiesScrollerRef}>
            <div className="flex gap-8 py-6">
              {[...companies, ...companies].map((company, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 transform hover:scale-110 transition-transform duration-300"
                >
                  <div className="w-32 h-32 p-4 flex items-center justify-center rounded-lg bg-blue-900/20 border border-blue-800/30 hover:border-blue-600/50">
                    <img src={company.logo} alt={company.companyName} className="w-20 h-20 object-contain" />
                  </div>
                  <p className="text-center text-sm text-gray-300 mt-3">{company.companyName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <hr className="mx-[70px] border-[3px] hidden sm:block" />

      <div className="py-20 relative overflow-hidden">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Success Stories</h2>
          <div className="max-w-[90%] mx-auto overflow-x-auto overflow-y-hidden" ref={videosScrollerRef}>
            <div className="flex gap-6 pb-8">
              {Array.isArray(videos) && videos.length > 0 ? (
                videos.map((video) => (
                  <div
                    key={video._id}
                    className="flex-shrink-0 w-[300px] h-[450px] group rounded-lg bg-blue-900/20 border border-blue-800/30 hover:border-blue-600/50"
                  >
                    <div className="relative h-[300px] transform group-hover:scale-[1.02] transition-transform">
                      <iframe
                        src={video.videoUrl}
                        allow="autoplay"
                        
                        className="absolute top-0 left-0 w-full h-full rounded-t-lg"
                      ></iframe>
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-xl mb-3 group-hover:text-gray-400 transition-colors">
                        {video.name}
                      </h3>
                      <p className="text-sm text-gray-300 mb-4">
                        {video.jobRole} at {video.companyName}
                      </p>
                      <span className="text-green-400 font-medium text-lg">{video.package}LPA</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-300">No videos available</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <hr className="mx-[70px] border-[3px] hidden sm:block" />

      <div className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="group p-8 transition-all duration-300 transform hover:scale-105 rounded-lg bg-blue-900/20 border border-blue-800/30 hover:border-blue-600/50"
              >
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">
                  {achievement.icon}
                </div>
                <div className="text-3xl font-bold mb-2">{achievement.value}</div>
                <div className="text-lg text-gray-300">{achievement.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer {...props.bannerData} />
    </div>
  );
};

export default Home;