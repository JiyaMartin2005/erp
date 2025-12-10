import { useState, useEffect } from "react";
import axios from "axios";
import "./style.css";

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [otpStep, setOtpStep] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  // OTP state
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(120); // 2 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);

  // Handle countdown timer
  useEffect(() => {
    let interval;
    
    if (timerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setTimerActive(false);
    }
    
    return () => clearInterval(interval);
  }, [timerActive, countdown]);

  // Start timer when OTP step begins
  useEffect(() => {
    if (otpStep) {
      setCountdown(120);
      setTimerActive(true);
    }
  }, [otpStep]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/login", {
        email: loginEmail,
        password: loginPassword,
      });
      console.log(res.data);
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/register", {
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      });
      console.log(res.data);
      alert(res.data.message);
      setOtpStep(true); // Move to OTP step after successful registration
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await axios.post("http://localhost:5000/resend-otp", {
        email: registerEmail,
      });
      console.log(res.data);
      alert(res.data.message);
      setCountdown(120);
      setTimerActive(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to resend OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/verify-otp", {
        email: registerEmail,
        otp: otp,
      });
      console.log(res.data);
      alert(res.data.message);
      
      // Reset and go back to login
      setOtpStep(false);
      setIsLogin(true);
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setOtp("");
      setTimerActive(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "OTP verification failed");
    }
  };

  // Format countdown time to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="wrapper">
      {/* Login Form */}
      {isLogin && !otpStep && (
        <>
          <h2 className="title-login">Login</h2>
          <form className="form active" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
            <p>
              Don't have an account?{" "}
              <span onClick={() => setIsLogin(false)}>Sign Up</span>
            </p>
          </form>
        </>
      )}

      {/* Register Form */}
      {!isLogin && !otpStep && (
        <>
          <h2 className="title-register">Register</h2>
          <form className="form active" onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Name"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              required
            />
            <button type="submit">Send OTP</button>
            <p>
              Already have an account?{" "}
              <span onClick={() => setIsLogin(true)}>Sign In</span>
            </p>
          </form>
        </>
      )}

      {/* OTP Form */}
      {otpStep && (
        <>
          <h2 className="title-otp">Verify OTP</h2>
          <form className="form active" onSubmit={handleVerifyOtp}>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit">Verify OTP</button>
            
            {/* Countdown Timer */}
            <div className="timer-container">
              {timerActive ? (
                <p>Resend OTP in: <span className="timer">{formatTime(countdown)}</span></p>
              ) : (
                <button 
                  type="button" 
                  className="resend-btn" 
                  onClick={handleResendOtp}
                >
                  Resend OTP
                </button>
              )}
            </div>
            
            <p>
              Wrong email?{" "}
              <span onClick={() => {
                setOtpStep(false);
                setTimerActive(false);
              }}>Go Back</span>
            </p>
          </form>
        </>
      )}
    </div>
  );
}