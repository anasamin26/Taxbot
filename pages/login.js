import "../globals.css";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (event) => {
    try {
      event.preventDefault();
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem("token", token);
        router.push("/homepage");
      } else if (response.status === 401) {
        console.error("Invalid email or password");
      } else {
        throw new Error("Failed to Login");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="hero min-h-screen bg-black ">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Login</h1>
          <p className="py-6">
            Welcome Back! Lets answer all your W2 form related queries
          </p>
        </div>
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-200">
          <form className="card-body">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="Enter your Email"
                value={email}
                className="input input-bordered"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                className="input input-bordered"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <label className="label">
                <a
                  href="/register"
                  className="label-text-alt link link-hover cursor-pointer"
                >
                  Not Registered? Signup
                </a>
              </label>
            </div>
            <div className="form-control mt-6">
              <button
                className="btn bg-lime-400 hover:bg-lime-600 text-black"
                onClick={(e) => handleLogin(e)}
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
