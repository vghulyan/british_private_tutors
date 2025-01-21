import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Privacy Policy
        </h1>
        <p className="text-gray-600 mb-6">
          Welcome to {process.env.NEXT_PUBLIC_PROJECT_NAME}. Your privacy is
          critically important to us. This Privacy Policy explains how we
          collect, use, and protect your personal information when you use our
          services.
        </p>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Information We Collect
            </h2>
            <p className="text-gray-600">
              When you use {process.env.NEXT_PUBLIC_PROJECT_NAME}, we may
              collect the following types of information:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              <li>Personal Information (e.g., name, email, phone number).</li>
              <li>
                Payment Details (e.g., billing address, card information).
              </li>
              <li>
                Usage Data (e.g., IP address, device type, and browsing
                history).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              How We Use Your Information
            </h2>
            <p className="text-gray-600">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              <li>To provide and improve our services.</li>
              <li>To process payments and transactions securely.</li>
              <li>
                To communicate with you about updates, promotions, and support.
              </li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Data Protection and Security
            </h2>
            <p className="text-gray-600">
              We are committed to protecting your personal information. We use
              industry-standard security measures, including encryption and
              secure servers, to safeguard your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Sharing Your Information
            </h2>
            <p className="text-gray-600">
              We do not sell your personal information. However, we may share
              your data with trusted third parties, such as:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              <li>Payment processors to complete transactions.</li>
              <li>Service providers to enhance our offerings.</li>
              <li>
                Legal authorities, if required to comply with the law or protect
                our rights.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Your Rights
            </h2>
            <p className="text-gray-600">
              As a user, you have the following rights regarding your data:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              <li>Access your personal data.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Delete your personal data under certain circumstances.</li>
              <li>
                Opt-out of marketing communications by clicking the unsubscribe
                link in our emails.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Changes to This Privacy Policy
            </h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time. When we do,
              we will post the revised version on this page and notify you of
              significant changes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Contact Us
            </h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please
              contact us at:
            </p>
            <p className="text-gray-600 font-medium">
              Email: support@project.com
            </p>
            <p className="text-gray-600 font-medium">Phone: +123-456-7890</p>
            <p className="text-gray-600 font-medium">
              Address: 123 Project St., Project City, Country
            </p>
          </section>
        </div>

        <p className="text-gray-500 text-sm mt-6">
          Effective Date: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
