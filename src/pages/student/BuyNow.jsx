import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { BACKEND_URL, RAZORPAY_KEY } from "../../../config/constant";

function BuyNow() {
  const { id, courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [isPaymentSectionVisible, setIsPaymentSectionVisible] = useState(false);
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const { user } = useSelector((state) => state.user || {});
  const { _id, name, email } = user || {};

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

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => showAlert("Failed to load Razorpay script.", "error");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch roadmap and course data
  useEffect(() => {
    const fetchRoadmapData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/show-roadmap/${id}`, {
          withCredentials: true,
        });
        setRoadmapData(response.data);
      } catch (error) {
        showAlert(
          error.response?.data?.message || "Failed to fetch roadmap details.",
          "error"
        );
      }
    };

    const fetchCourseData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/show-course/${courseId}`, {
          withCredentials: true,
        });
        const data = {
          ...response.data,
          offerPrice: response.data.price * 0.3, // 70% discount
        };
        setCourseData(data);
      } catch (error) {
        showAlert(
          error.response?.data?.message || "Failed to fetch course details.",
          "error"
        );
      }
    };

    fetchRoadmapData();
    fetchCourseData();
  }, [id, courseId]);

  // Handle scroll for mobile "Buy Now" button visibility
  useEffect(() => {
    const handleScroll = () => {
      const paymentSection = document.getElementById("payment-section");
      if (paymentSection) {
        const rect = paymentSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          setIsPaymentSectionVisible(true);
        } else {
          setIsPaymentSectionVisible(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePayment = () => {
    if (!user || !_id || !name || !email) {
      showAlert("Please sign in to proceed with payment.", "error");
      navigate("/signup");
      return;
    }

    if (!courseData) {
      showAlert("Course details not loaded. Please try again later.", "error");
      return;
    }

    if (!razorpayLoaded || !window.Razorpay) {
      showAlert("Payment gateway not loaded. Please try again.", "error");
      return;
    }

    const { courseName = "Unknown Course", price = 0, offerPrice = price, imageUrl = "", recordingId = "" } = courseData;
    const finalPrice = offerPrice || price;

    const options = {
      key: RAZORPAY_KEY,
      amount: finalPrice * 100, // Amount in paise
      currency: "INR",
      name: "World's AI Bot",
      description: courseName,
      image: imageUrl,
      handler: async function (response) {
        const paymentData = {
          courses: [
            {
              transactionId: response.razorpay_payment_id,
              amount: finalPrice,
              status: true,
              email,
              name,
              courseName,
              recordingsId: recordingId,
            },
          ],
        };

        try {
          setPaymentLoading(true);
          await axios.put(`${BACKEND_URL}/update-user/${_id}`, paymentData, {
            withCredentials: true,
          });
          showAlert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`, "success");
        } catch (error) {
          showAlert(
            error.response?.data?.message || "Failed to update payment details.",
            "error"
          );
        } finally {
          setPaymentLoading(false);
        }
      },
      theme: {
        color: "#3399cc",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", function (response) {
      showAlert(`Payment failed! Reason: ${response.error.description}`, "error");
    });
    razorpay.open();
  };

  const scrollToPayment = () => {
    const paymentSection = document.getElementById("payment-section");
    if (paymentSection) {
      paymentSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 p-2 lg:p-8 bg-gradient-to-br from-gray-950 via-black to-blue-950 min-h-screen text-white">
      <div className="w-full lg:w-2/3 bg-gray-900 p-2 lg:p-8 rounded-lg lg:rounded-2xl shadow-lg lg:shadow-2xl border border-gray-800 overflow-y-auto max-h-screen">
        {roadmapData ? (
          <>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-2 lg:p-6 rounded-lg lg:rounded-t-2xl">
              <h1 className="text-xl lg:text-4xl font-bold text-white">{roadmapData.courseName || "Course Name"}</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-6 mt-2 lg:mt-6">
              <div className="bg-gray-800 p-2 lg:p-6 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500 transition-all">
                <div className="flex items-center gap-2 lg:gap-4">
                  <div>
                    <h2 className="text-lg lg:text-xl font-semibold text-purple-400">Project-Based Learning</h2>
                    <p className="mt-1 lg:mt-2 text-gray-300">Hands-on projects to solidify your skills.</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 p-2 lg:p-6 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500 transition-all">
                <h2 className="text-lg lg:text-xl font-semibold text-purple-400">Live Classes</h2>
                <p className="mt-1 lg:mt-2 text-gray-300">Duration: {roadmapData.duration || "N/A"} hours</p>
              </div>
              <div className="bg-gray-800 p-2 lg:p-6 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500 transition-all">
                <h2 className="text-lg lg:text-xl font-semibold text-purple-400">Lifetime Recording Access</h2>
                <p className="mt-1 lg:mt-2 text-gray-300">Revisit lessons anytime, anywhere.</p>
              </div>
              <div className="bg-gray-800 p-2 lg:p-6 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500 transition-all">
                <h2 className="text-lg lg:text-xl font-semibold text-purple-400">24x7 Doubt Solving</h2>
                <p className="mt-1 lg:mt-2 text-gray-300">Get your queries resolved instantly.</p>
              </div>
              <div className="bg-gray-800 p-2 lg:p-6 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500 transition-all">
                <h2 className="text-lg lg:text-xl font-semibold text-purple-400">Certification</h2>
                <p className="mt-1 lg:mt-2 text-gray-300">Earn a certificate upon course completion.</p>
              </div>
              <div className="bg-gray-800 p-2 lg:p-6 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500 transition-all">
                <h2 className="text-lg lg:text-xl font-semibold text-purple-400">Free Internship</h2>
                <p className="mt-1 lg:mt-2 text-gray-300">Get free internship opportunity</p>
              </div>
            </div>
            <div className="mt-4 lg:mt-8">
              <h2 className="text-lg lg:text-2xl font-bold text-white">Skills You'll Learn</h2>
              {roadmapData.skills && roadmapData.skills.map((skill, index) => (
                <div key={index} className="collapse collapse-arrow bg-gray-800 mt-2 lg:mt-4 border border-gray-700 rounded-lg shadow-lg">
                  <input type="radio" name="my-accordion-2" />
                  <div className="collapse-title text-lg lg:text-xl font-medium text-purple-400">
                    {skill.skillName || "Skill"}
                  </div>
                  <div className="collapse-content">
                    <ul className="list-disc pl-4 lg:pl-6 text-gray-300">
                      {skill.subTopics && skill.subTopics.map((subTopic, subIndex) => (
                        <li key={subIndex}>{subTopic}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 lg:mt-8 bg-gray-800 p-2 lg:p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="flex items-center gap-2 lg:gap-4">
                <img
                  src={roadmapData.tutorImageUrl || "https://via.placeholder.com/100"}
                  alt={roadmapData.tutorName || "Tutor"}
                  className="w-16 h-16 lg:w-24 lg:h-24 rounded-lg border-2 border-purple-500 object-cover"
                />
                <div>
                  <h2 className="text-lg lg:text-xl font-semibold text-purple-400">{roadmapData.tutorName || "Tutor Name"}</h2>
                  <p className="mt-1 lg:mt-2 text-gray-300">{roadmapData.tutorDescription || "Tutor description goes here."}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-300">Loading roadmap details...</p>
        )}
      </div>

      <div id="payment-section" className="w-full lg:w-1/3 bg-gray-900 p-2 lg:p-8 rounded-lg lg:rounded-2xl shadow-lg lg:shadow-2xl border border-gray-800 lg:sticky lg:top-8 bottom-0">
        {courseData ? (
          <>
            <h1 className="text-lg lg:text-2xl font-bold text-white">{courseData.courseName || "Course Name"}</h1>
            <img
              src={courseData.imageUrl || "https://via.placeholder.com/300"}
              alt={courseData.courseName || "Course"}
              className="w-full h-32 lg:h-48 object-cover rounded-lg mt-2 lg:mt-4"
            />
            <h2 className="text-base lg:text-xl font-semibold text-gray-400 mt-2 lg:mt-4 line-through">
              Original Price: ₹{courseData.price || "0"}
            </h2>
            <h2 className="text-base lg:text-xl font-semibold text-purple-400">
              Offer Price: ₹{(courseData.offerPrice || courseData.price || 0).toFixed(2)} (70% OFF)
            </h2>
            <p className="text-gray-300 mt-1 lg:mt-2">
              Tax (5%): ₹{((courseData.offerPrice || courseData.price || 0) * 0.05).toFixed(2)}
            </p>
            <p className="text-gray-300 mt-1 lg:mt-2">
              Tax Discount: -₹{((courseData.offerPrice || courseData.price || 0) * 0.05).toFixed(2)}
            </p>
            <p className="text-lg lg:text-xl font-semibold text-purple-400 mt-2 lg:mt-4">
              Total: ₹{(courseData.offerPrice || courseData.price || 0).toFixed(2)}
            </p>
            <button
              className="w-full mt-2 lg:mt-6 text-white py-2 lg:py-3 rounded-lg font-semibold transition-all shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/50 disabled:opacity-50"
              onClick={handlePayment}
              disabled={paymentLoading || !razorpayLoaded}
            >
              {paymentLoading ? "Processing..." : "Buy Now"}
            </button>
          </>
        ) : (
          <p className="text-gray-300">Loading course details...</p>
        )}
      </div>

      {!isPaymentSectionVisible && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 p-2 shadow-lg border-t border-gray-800 z-[50]">
          <button
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/50"
            onClick={scrollToPayment}
          >
            Buy Now
          </button>
        </div>
      )}

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

export default BuyNow;