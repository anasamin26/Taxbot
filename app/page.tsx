"use client";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const handleLetsGetStartedClick = () => {
    router.push("/login"); // Replace '/chat' with the path of the page you want to navigate to
  };

  return (
    <div>
      <Navbar />
      <div className="bg-black min-h-screen flex flex-col justify-center items-center">
        <div className="max-w-md">
          <h1 className="text-5xl text-pretty text-lime-400 font-bold">
            Taxbot
          </h1>
          <p className="py-2">
            Introducing TaxBot, your AI-powered tax assistant! Submit your W-2
            forms effortlessly and engage in intuitive conversations about taxes
            with cutting-edge AI technology. Simplify tax season with
            personalized assistance and get answers to your tax queries
            instantly.
          </p>
        </div>
        <button
          className=" mt-3 btn bg-lime-400 hover:bg-lime-600 text-black btn-xs sm:btn-sm md:btn-md lg:btn-lg"
          onClick={handleLetsGetStartedClick}
        >
          Lets Get Started
        </button>
      </div>
    </div>
  );
}
