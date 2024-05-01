import "../globals.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  let handleSubmitRegisterFamily = async (event) => {
    event.preventDefault();
    let dataOfNewUser = {
      name: name,
      email: email,
      password: password,
    };
    try {
      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataOfNewUser),
      });

      if (!response.ok) {
        throw new Error("Failed to register");
      } else {
        setEmail("");
        setPassword("");
        setName("");
        router.push("/login");
        console.log("User registered successfully");
      }
    } catch (error) {
      console.error("Registration failed:", error.message);
    }
  };

  return (
    <div className="hero min-h-screen bg-black">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Register</h1>
          <p className="py-6">Create a new account and let's get started</p>
        </div>
        <div className="card w-full shadow-2xl bg-base-300">
          <form className="card-body">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                className="input input-bordered"
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered"
                required
              />

              <label className="label">
                <a
                  href="/login"
                  className="label-text-alt link link-hover cursor-pointer"
                >
                  Already Registered? Signin
                </a>
              </label>
            </div>

            <div className="form-control mt-6">
              <button
                className="btn bg-lime-400 hover:bg-lime-600 text-black"
                onClick={(e) => handleSubmitRegisterFamily(e)}
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
