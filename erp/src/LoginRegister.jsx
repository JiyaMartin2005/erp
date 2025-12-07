import { useState } from "react";
import "./style.css";  // make sure style.css is in src

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true); // true = login, false = register

  return (
    <div className="wrapper">

      {/* Titles */}
      {isLogin ? (
        <h2 className="title-login">Login</h2>
      ) : (
        <h2 className="title-register">Register</h2>
      )}

      {/* Login Form */}
      <form
        className="login-form"
        style={{
          left: isLogin ? "50%" : "-50%",
          opacity: isLogin ? 1 : 0,
        }}
      >
        <input type="text" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="button">Login</button>
        <p>
          Don’t have an account?{" "}
          <span onClick={() => setIsLogin(false)}>Sign Up</span>
        </p>
      </form>

      {/* Register Form */}
      <form
        className="register-form"
        style={{
          left: isLogin ? "150%" : "50%",
          opacity: isLogin ? 0 : 1,
        }}
      >
        <input type="text" placeholder="Name" />
        <input type="text" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="button">Register</button>
        <p>
          Already have an account?{" "}
          <span onClick={() => setIsLogin(true)}>Sign In</span>
        </p>
      </form>
    </div>
  );
}