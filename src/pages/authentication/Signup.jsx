
import React, { useState } from "react";
import axios from "axios";
import { SignupFormValidate } from "../../utils/signupFormvalidate";
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../../config/constant";
function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSignUp() {
    try {
      const result = SignupFormValidate(name, number, email, password, cPassword);
      if (result) {
        setFormError(result);
        return;
      }
      setFormError("");
      setLoading(true);

      const user = {
        name,
        number,
        email,
        password,
      };

      const response = await axios.post(`${BACKEND_URL}/signup`, user, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/signin');
        }, 3000); // 3s for full animation
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-start md:items-center justify-center p-2 bg-black relative overflow-hidden">
      {/* Starry background */}
      <div className="absolute inset-0 z-0">
        <div className="stars-layer layer1"></div>
        <div className="stars-layer layer2"></div>
        <div className="stars-layer layer3"></div>
        <div className="stars-layer layer4"></div>
      </div>

      <div className={`w-full max-w-lg bg-black/80 rounded-2xl shadow-lg p-6 ${isSuccess ? '' : 'border-2 border-sky-500'} relative z-10 mx-2 mt-8 md:mt-0`}>
        {isSuccess ? (
          <div className="flex justify-center items-center h-full">
            <div className="success-planet">Success!</div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center text-white mb-2">
              Sign Up for Free
            </h1>
            <p className="text-center text-gray-300 mb-4">
              Learn with the first worldsAIbot
            </p>

            {formError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-1 rounded-md mb-3 text-sm">
                {formError}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex flex-col space-y-1">
                <label className="text-sm text-white">Full Name</label>
                <div className="flex items-center bg-white/10 border border-gray-700 rounded-lg overflow-hidden">
                  <span className="px-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 outline-none bg-transparent text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm text-white">Mobile Number</label>
                <div className="flex items-center bg-white/10 border border-gray-700 rounded-lg overflow-hidden">
                  <span className="px-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </span>
                  <input
                    type="number"
                    placeholder="1234567890"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full p-2 outline-none bg-transparent text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm text-white">Email</label>
                <div className="flex items-center bg-white/10 border border-gray-700 rounded-lg overflow-hidden">
                  <span className="px-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 outline-none bg-transparent text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm text-white">Password</label>
                <div className="flex items-center bg-white/10 border border-gray-700 rounded-lg overflow-hidden">
                  <span className="px-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 outline-none bg-transparent text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm text-white">Confirm Password</label>
                <div className="flex items-center bg-white/10 border border-gray-700 rounded-lg overflow-hidden">
                  <span className="px-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    placeholder="********"
                    value={cPassword}
                    onChange={(e) => setCPassword(e.target.value)}
                    className="w-full p-2 outline-none bg-transparent text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <button
                onClick={handleSignUp}
                disabled={loading}
                className="w-full bg-sky-500 text-white py-2 rounded-lg hover:bg-sky-600 transition-all"
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>

              <p className="text-center text-gray-300 mt-1 md:mt-2">
                Already have an account?{" "}
                <Link to="/signin" className="text-sky-500 hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </>
        )}
      </div>

      {/* CSS for starry background and success planet */}
      <style jsx>{`
        .stars-layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          background: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/stars.png') repeat;
          animation: deep-stars linear infinite;
          transform-origin: center;
        }

        .layer1 {
          opacity: 1;
          animation-duration: 20s;
          background-size: 1200px 1200px;
          filter: blur(2px);
        }

        .layer2 {
          opacity: 0.8;
          animation-duration: 15s;
          background-size: 800px 800px;
          transform: scale(1.2);
        }

        .layer3 {
          opacity: 0.6;
          animation-duration: 10s;
          background-size: 500px 500px;
          transform: scale(1.5);
        }

        .layer4 {
          opacity: 0.4;
          animation-duration: 5s;
          background-size: 300px 300px;
          transform: scale(2);
        }

        @keyframes deep-stars {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        .success-planet {
          width: 120px;
          height: 120px;
          background: #00ff00; /* Pure green */
          border-radius: 50%;
          color: #000000; /* Black text */
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          position: absolute;
          animation: travel-rotate 2s ease-out forwards, burst 1s ease-out 2s forwards;
        }

        /* Pseudo-elements for burst chunks */
        .success-planet::before,
        .success-planet::after,
        .success-planet > span::before,
        .success-planet > span::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          background: #00ff00;
          border-radius: 50%;
          opacity: 0;
        }

        .success-planet > span::before {
          content: '';
        }

        .success-planet > span::after {
          content: '';
        }

        @keyframes travel-rotate {
          0% {
            transform: translate(-300px, 200px) rotate(0deg) scale(0.5);
            opacity: 1;
          }
          25% {
            transform: translate(0, -200px) rotate(720deg) scale(1); /* Top center */
            opacity: 1;
          }
          50% {
            transform: translate(300px, 200px) rotate(1440deg) scale(1.2); /* Bottom right */
            opacity: 1;
          }
          75% {
            transform: translate(-150px, 0) rotate(2160deg) scale(1); /* Left middle */
            opacity: 1;
          }
          100% {
            transform: translate(0, 0) rotate(2880deg) scale(1); /* Center */
            opacity: 1;
          }
        }

        @keyframes burst {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0);
            opacity: 0;
          }
        }

        @keyframes burst-chunk1 {
          0% {
            opacity: 0;
            transform: translate(0, 0);
          }
          10% {
            opacity: 1;
            transform: translate(0, 0);
          }
          100% {
            opacity: 0;
            transform: translate(-60px, -60px);
          }
        }

        @keyframes burst-chunk2 {
          0% {
            opacity: 0;
            transform: translate(0, 0);
          }
          10% {
            opacity: 1;
            transform: translate(0, 0);
          }
          100% {
            opacity: 0;
            transform: translate(60px, 60px);
          }
        }

        @keyframes burst-chunk3 {
          0% {
            opacity: 0;
            transform: translate(0, 0);
          }
          10% {
            opacity: 1;
            transform: translate(0, 0);
          }
          100% {
            opacity: 0;
            transform: translate(-60px, 60px);
          }
        }

        @keyframes burst-chunk4 {
          0% {
            opacity: 0;
            transform: translate(0, 0);
          }
          10% {
            opacity: 1;
            transform: translate(0, 0);
          }
          100% {
            opacity: 0;
            transform: translate(60px, -60px);
          }
        }

        .success-planet::before {
          animation: burst-chunk1 1s ease-out 2s forwards;
        }

        .success-planet::after {
          animation: burst-chunk2 1s ease-out 2s forwards;
        }

        .success-planet > span::before {
          animation: burst-chunk3 1s ease-out 2s forwards;
        }

        .success-planet > span::after {
          animation: burst-chunk4 1s ease-out 2s forwards;
        }
      `}</style>
    </div>
  );
}

export default Signup;