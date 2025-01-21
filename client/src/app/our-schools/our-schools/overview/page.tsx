"use client";
import React from "react";
import FilterComponent from "./FilterComponent";
import SchoolCard from "@/app/UI/components/Cards/SchoolCard/SchoolCard";

const OurSchoolsOverview = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <FilterComponent />

      <div className="pt-2">
        <SchoolCard
          country="UK"
          city="London"
          schoolName="Greenford Quya School of Research & Innovation"
          description="Discover GQ School of Research and Innovation – one of the finest schools in the world."
          overviewLink="#"
          location="Greenford Quya, Greenford, London, UK"
          curriculum="British Curriculum"
          grades="FS1 - Year 13"
          fees="GBP £3000"
          image="/logo.png" // Replace with your image URL
          logo="/logo.png" // Replace with your logo URL
        />
      </div>
    </div>
  );
};

export default OurSchoolsOverview;
