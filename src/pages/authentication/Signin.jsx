import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../redux/userSlice";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../../config/constant";
function Signin() {
  const [email, setEmail] = useState("rakeshabc@gmail.com");
  const [password, setPassword] = useState("rakeshabc@gmail.com");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Added for success animation
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleSignIn() {
    try {
      if (!email || !password) {
        setFormError("Email and password are required");
        return;
      }

      setLoading(true);
      setFormError("");

      const response = await axios.post(
        `${BACKEND_URL}/signin`,
        { email, password },
        { withCredentials: true }
      );

      dispatch(setUser(response.data.user));
      setIsSuccess(true); // Trigger success animation
      setTimeout(() => {
        navigate("/"); // Navigate after animation
      }, 3000); // 3s for full animation
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong");
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
        {/* Planets only when not successful */}
        {!isSuccess && (
          <>
            <div className="planet python">Python</div>
            <div className="planet react">React</div>
            <div className="planet java">Java</div>
            <div className="planet aws">AWS</div>
            <div className="planet ai">AI</div>
            <div className="planet ml">ML</div>
            <div className="planet robotics">Robotics</div>
            <div className="planet nodejs">Node.js</div>
            <div className="planet docker">Docker</div>
            <div className="planet tensorflow">TensorFlow</div>
            <div className="planet kubernetes">Kubernetes</div>
            <div className="planet git">Git</div>
          </>
        )}
      </div>

      <div className={`w-full max-w-lg bg-black/80 rounded-2xl shadow-lg p-6 ${isSuccess ? '' : 'border-2 border-sky-500'} relative z-10 mx-2 mt-8 md:mt-0`}>
        {isSuccess ? (
          <div className="flex justify-center items-center h-full">
            <div className="success-planet">Success!</div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center text-white mb-2">
              Sign In
            </h1>
            <p className="text-center text-gray-300 mb-4">
              Learn with the world's first AI bot
            </p>

            {formError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-1 rounded-md mb-3 text-sm">
                {formError}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex flex-col space-y-1">
                <label className="text-sm text-white">Email</label>
                <div className="flex items-center bg-white/10 border border-gray-700 rounded-lg overflow-hidden">
                  <span className="px-2 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
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

              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full bg-sky-500 text-white py-2 rounded-lg hover:bg-sky-600 transition-all"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

              <p className="text-center text-gray-300 mt-1 md:mt-2">
                Forgot password?{" "}
                <Link to="/reset-password-request" className="text-sky-500 hover:underline">
                  Reset
                </Link>
              </p>

              <p className="text-center text-gray-300 mt-1 md:mt-2">
                Don’t have an account?{" "}
                <Link to="/signup" className="text-sky-500 hover:underline">
                  Sign Up
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
          background: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/stars.png") repeat;
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

        .planet {
          position: absolute;
          border-radius: 50%;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          text-align: center;
          animation: orbit-planet linear infinite;
          border: 2px solid rgba(255, 255, 255, 0.5);
        }

        .python {
          width: 60px;
          height: 60px;
          background: radial-gradient(circle, #1a3c5e 30%, #0a1f33);
          top: 10%;
          left: 10%;
          animation-duration: 25s;
        }

        .react {
          width: 50px;
          height: 50px;
          background: radial-gradient(circle, #1f4a6d 30%, #0a2a44);
          top: 20%;
          right: 15%;
          animation-duration: 20s;
        }

        .java {
          width: 70px;
          height: 70px;
          background: radial-gradient(circle, #4a2b1f 30%, #2a1510);
          bottom: 15%;
          left: 20%;
          animation-duration: 28s;
        }

        .aws {
          width: 55px;
          height: 55px;
          background: radial-gradient(circle, #3f2a1d 30%, #1a100a);
          top: 30%;
          left: 60%;
          animation-duration: 22s;
        }

        .ai {
          width: 45px;
          height: 45px;
          background: radial-gradient(circle, #1a4a4d 30%, #0a2a2d);
          bottom: 25%;
          right: 10%;
          animation-duration: 18s;
        }

        .ml {
          width: 50px;
          height: 50px;
          background: radial-gradient(circle, #4a1f1f 30%, #2a1010);
          top: 50%;
          left: 25%;
          animation-duration: 24s;
        }

        .robotics {
          width: 65px;
          height: 65px;
          background: radial-gradient(circle, #2b2f5e 30%, #151a3b);
          bottom: 10%;
          right: 20%;
          animation-duration: 26s;
        }

        .nodejs {
          width: 60px;
          height: 60px;
          background: radial-gradient(circle, #2f4a3a 30%, #1a2a20);
          top: 15%;
          left: 40%;
          animation-duration: 23s;
        }

        .docker {
          width: 55px;
          height: 55px;
          background: radial-gradient(circle, #1f4a6d 30%, #0a2a44);
          bottom: 20%;
          left: 50%;
          animation-duration: 19s;
        }

        .tensorflow {
          width: 50px;
          height: 50px;
          background: radial-gradient(circle, #4a2f1f 30%, #2a1510);
          top: 35%;
          right: 25%;
          animation-duration: 21s;
        }

        .kubernetes {
          width: 65px;
          height: 65px;
          background: radial-gradient(circle, #2f3f6d 30%, #1a2a44);
          bottom: 30%;
          right: 35%;
          animation-duration: 27s;
        }

        .git {
          width: 45px;
          height: 45px;
          background: radial-gradient(circle, #4a2b1f 30%, #2a1510);
          top: 45%;
          left: 15%;
          animation-duration: 20s;
        }

        @keyframes orbit-planet {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          25% {
            transform: translate(100px, 50px) rotate(90deg) scale(1.1);
          }
          50% {
            transform: translate(0, 100px) rotate(180deg) scale(1);
          }
          75% {
            transform: translate(-100px, 50px) rotate(270deg) scale(1.1);
          }
          100% {
            transform: translate(0, 0) rotate(360deg) scale(1);
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

export default Signin;