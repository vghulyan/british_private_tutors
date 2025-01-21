"use client";

import React from "react";
import Footer from "../UI/components/Footer/Footer";

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Welcome to {process.env.NEXT_PUBLIC_PROJECT_NAME}
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-8">
          Together we can build a bright future
        </p>
        <h3>
          Our team is growing fast. We would love your help in making this
          school truly special.
        </h3>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Service 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              Equip students with the skills
            </h3>
            <p className="text-gray-600">
              We do this by offering international curricula and designing,
              building and managing the best educational facilities in the UK.
              We continuously evaluate and improve our facilities to ensure our
              schools remain valuable cornerstones of their communities.
            </p>
          </div>

          {/* Service 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              Our way
            </h3>
            <h4 className="text-gray-600">
              Our holistic approach enables us to meet the individual learning
              needs of our students and provide the framework within which all
              partners in education can support young people on the road to
              further learning. Our aim is to create an empowering learning
              environment and help each student to stretch the boundaries of his
              or her potential.
            </h4>
          </div>

          {/* Service 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              Environment created for excellence
            </h3>
            <h4 className="text-gray-600">
              Our attention to key areas of education ensures that British
              Private Tutors schools will always be assets to their communities
              offering first-rate learning environments. We equip students with
              a varied skill set enabling them to hold their own at school and
              beyond. In a world of change prepare graduates for the reality of
              today’s workplace.
            </h4>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Background
        </h2>
        <ul className="list-disc list-inside text-gray-600">
          <li>
            BPT’s main activities include investment in the development and
            operation of K-12 schools, and other supporting initiatives.
          </li>
          <li>
            Right at the heart of our school community is our staff. Each member
            of our hand-picked, highly qualified and motivated team works to
            ensure our schools deliver the best possible intellectual, personal
            and social learning experiences. It is the strength and commitment
            of our family of teachers which makes BPT so much more than the sum
            of its parts.
          </li>
        </ul>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
