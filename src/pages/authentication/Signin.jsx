import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../redux/userSlice";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../../config/constant";
function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      {/* Enhanced Starry background with subtle gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-black via-purple-900/10 to-black">
        <div className="stars-layer layer1"></div>
        <div className="stars-layer layer2"></div>
        <div className="stars-layer layer3"></div>
        <div className="stars-layer layer4"></div>
        
        {/* Planets with glow effects */}
        {!isSuccess && (
          <>
            <div className="planet python glow-blue">Python</div>
            <div className="planet react glow-cyan">React</div>
            <div className="planet java glow-amber">Java</div>
            <div className="planet aws glow-orange">AWS</div>
            <div className="planet ai glow-purple">AI</div>
            <div className="planet ml glow-pink">ML</div>
            <div className="planet robotics glow-indigo">Robotics</div>
            <div className="planet nodejs glow-green">Node.js</div>
            <div className="planet docker glow-blue">Docker</div>
            <div className="planet tensorflow glow-orange">TensorFlow</div>
            <div className="planet kubernetes glow-blue">Kubernetes</div>
            <div className="planet git glow-red">Git</div>
          </>
        )}
      </div>
  
      {/* Enhanced card with glass morphism effect */}
      <div className={`w-full max-w-lg backdrop-blur-lg rounded-2xl shadow-xl p-8 ${isSuccess ? '' : 'border border-white/10'} relative z-10 mx-2 mt-8 md:mt-0 bg-gradient-to-br from-gray-900/80 to-gray-800/80`}>
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="success-planet flex flex-col items-center">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-bold text-white">Welcome!</h2>
              <p className="mt-2 text-gray-300">You're now signed in</p>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <span className="text-white text-3xl font-bold tracking-tighter rotate-[21deg]">W</span>
                
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
                Welcome Back
              </h1>
              <p className="text-gray-300">
                Sign in to continue your learning journey
              </p>
            </div>
  
            {formError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {formError}
              </div>
            )}
  
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden transition-all focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/30">
                  <span className="px-3 text-gray-400">
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
                    className="w-full p-3 outline-none bg-transparent text-white placeholder-gray-400"
                  />
                </div>
              </div>
  
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden transition-all focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/30">
                  <span className="px-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 outline-none bg-transparent text-white placeholder-gray-400"
                  />
                </div>
              </div>
  
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-sky-500 focus:ring-sky-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
  
                <Link to="/reset-password-request" className="text-sm text-sky-400 hover:text-sky-300 hover:underline">
                  Forgot password?
                </Link>
              </div>
  
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
  
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800/80 text-gray-400">New to platform?</span>
                </div>
              </div>
  
              <Link 
                to="/signup" 
                className="w-full border border-white/10 text-white py-3 rounded-lg font-medium hover:bg-white/5 transition-all flex items-center justify-center"
              >
                Create an account
              </Link>
            </div>
          </>
        )}
      </div>
  
      {/* Enhanced CSS for starry background and success planet */}
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
          filter: blur(1px);
        }
  
        .layer2 {
          opacity: 0.8;
          animation-duration: 15s;
          background-size: 800px 800px;
          transform: scale(1.2);
          filter: blur(0.5px);
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
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
  
        .planet:hover {
          transform: scale(1.1);
          box-shadow: 0 0 20px currentColor;
        }
  
        /* Glow effects for planets */
        .glow-blue {
          box-shadow: 0 0 15px rgba(56, 182, 255, 0.6);
        }
        .glow-cyan {
          box-shadow: 0 0 15px rgba(34, 211, 238, 0.6);
        }
        .glow-amber {
          box-shadow: 0 0 15px rgba(251, 191, 36, 0.6);
        }
        .glow-orange {
          box-shadow: 0 0 15px rgba(251, 146, 60, 0.6);
        }
        .glow-purple {
          box-shadow: 0 0 15px rgba(192, 132, 252, 0.6);
        }
        .glow-pink {
          box-shadow: 0 0 15px rgba(244, 114, 182, 0.6);
        }
        .glow-indigo {
          box-shadow: 0 0 15px rgba(129, 140, 248, 0.6);
        }
        .glow-green {
          box-shadow: 0 0 15px rgba(52, 211, 153, 0.6);
        }
        .glow-red {
          box-shadow: 0 0 15px rgba(248, 113, 113, 0.6);
        }
  
        /* Planet styles remain the same but with enhanced colors */
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
      `}</style>
    </div>
  );
}

export default Signin;