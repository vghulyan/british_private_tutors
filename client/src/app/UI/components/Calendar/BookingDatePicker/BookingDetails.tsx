export const BookingDetails: React.FC = () => {
  return (
    <div className="bg-gray-50 rounded-lg shadow-md p-6 w-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Enter Details</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-gray-700 font-bold">Name *</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your name"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-bold">Email *</label>
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-bold">
            Payment information *
          </label>
          <div className="bg-white border rounded-lg p-4">
            <p className="mb-2 font-bold text-gray-700">Price: £20 GBP</p>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
              placeholder="Name on card"
              required
            />
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Card number"
              required
            />
            <p>Your payments are securely processed by Stripe.</p>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Schedule Event
        </button>
      </form>
    </div>
  );
};
