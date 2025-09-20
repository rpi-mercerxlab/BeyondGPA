"use client";

import React from "react";
import { ReactTyped } from "react-typed";

export default function AboveTheFold() {
  return (
    <div
      className="relative flex items-center justify-center h-80 bg-cover bg-center w-full"
      style={{
        backgroundImage: "url('/Mercer-XLab-bg.png')", // replace with your image
      }}
    >
      <div className="bg-black/50 p-6 h-full w-full flex items-center justify-center">
        <h1 className="text-white text-5xl sm:text-6xl font-bold text-center">
          Find Your Next: <br />
          <ReactTyped
            className="italic font-normal"
            strings={["Researcher", "Developer", "Scientist", "Engineer"]}
            typeSpeed={80}
            backSpeed={50}
            backDelay={1500}
            loop
            cursorChar=""
          />
        </h1>
      </div>
    </div>
  );
}
