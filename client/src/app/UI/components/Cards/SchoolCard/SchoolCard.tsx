import React from "react";
import Image from "next/image";

interface SchoolCardProps {
  country: string;
  city: string;
  schoolName: string;
  description: string;
  overviewLink: string;
  location: string;
  curriculum: string;
  grades: string;
  fees: string;
  image: string;
  logo: string;
}

const SchoolCard: React.FC<SchoolCardProps> = ({
  country,
  city,
  schoolName,
  description,
  overviewLink,
  location,
  curriculum,
  grades,
  fees,
  image,
  logo,
}) => {
  return (
    <div className="flex flex-col lg:flex-row bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Image Section */}
      <div className="relative lg:w-1/2">
        <Image
          src={image}
          alt={schoolName}
          width={400}
          height={50}
          className="object-cover"
        />

        <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md">
          <Image
            src={logo}
            alt={schoolName}
            width={36}
            height={36}
            className="w-12 h-12 object-contain"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="lg:w-1/2 p-6">
        {/* Location */}
        <p className="text-sm text-gray-600 font-semibold">{country}</p>
        <h2 className="text-2xl font-bold text-gray-800">{city}</h2>
        <div className="w-16 h-1 bg-yellow-400 mt-2 mb-4"></div>

        {/* School Name */}
        <h3 className="text-xl font-bold text-gray-900">{schoolName}</h3>
        <p className="text-gray-600 mt-2">{description}</p>

        {/* Overview Link */}
        <div className="mt-4">
          <a
            href={overviewLink}
            className="text-blue-600 font-medium flex items-center hover:underline"
          >
            Overview <span className="ml-2">→</span>
          </a>
        </div>

        {/* Details */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center text-gray-700">
            <i className="fas fa-map-marker-alt text-blue-500 mr-2"></i>
            <span>{location}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <i className="fas fa-graduation-cap text-blue-500 mr-2"></i>
            <span>{curriculum}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <i className="fas fa-book text-blue-500 mr-2"></i>
            <span>{grades}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <i className="fas fa-dollar-sign text-blue-500 mr-2"></i>
            <span>{fees}</span>
          </div>
        </div>

        {/* Website Button */}
        <div className="mt-6">
          <a
            href="#"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 flex items-center"
          >
            Website <i className="fas fa-globe ml-2"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SchoolCard;
