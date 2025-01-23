import React, { useState } from "react";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isWeekend, startOfMonth, endOfMonth } from "date-fns";
import { BookingDetails } from "./BookingDetails";

type TimeSlot = string;

const BookingDatePicker: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  const today = new Date();

  // Generate time slots based on the day type
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startTime = isWeekend(date) ? 9 : 16; // Weekend starts at 9 AM, weekdays at 4 PM
    const endTime = isWeekend(date) ? 17 : 21; // Weekend ends at 5 PM, weekdays at 9 PM

    for (let hour = startTime; hour < endTime; hour++) {
      slots.push(`${hour}:00 - ${hour + 1}:00`);
    }
    return slots;
  };

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      const slots = generateTimeSlots(date);
      setTimeSlots(slots);
      setSelectedTimeSlot(null); // Reset selected time slot
    }
  };

  // Handle "Next" button click
  const handleNextClick = () => {
    if (selectedDate && selectedTimeSlot) {
      console.log("Selected Date:", selectedDate);
      console.log("Selected Time Slot:", selectedTimeSlot);
      //   alert(
      //     `You have selected:\nDate: ${selectedDate.toDateString()}\nTime Slot: ${selectedTimeSlot}`
      //   );

      if (selectedDate && selectedTimeSlot) {
        setShowBookingDetails(true); // Show the booking details component
      }
    } else {
      alert("Please select a date and a time slot before proceeding.");
    }
  };

  return (
    <div className="flex justify-center items-start bg-gray-100 pt-2 pb-2">
      {/* Card Component */}
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-auto lg:flex lg:space-x-6 p-4">
        {/* Left Column */}
        <div className={`w-full lg:w-1/4 bg-white flex flex-col relative`}>
          {showBookingDetails && (
            <button
              className="absolute top-4 left-4 text-blue-500 hover:underline flex items-center"
              onClick={() => {
                setShowBookingDetails(false); // Navigate back to calendar and time slots
              }}
            >
              ← Back
            </button>
          )}
          <div className="flex justify-center items-center p-6">
            <Image
              src="/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="object-cover"
            />
          </div>
          <div className="flex-grow flex flex-col justify-start items-center">
            <div className="text-center space-y-2 mt-4">
              <h2 className="text-lg font-bold text-gray-800">Assessment</h2>
              <p className="text-gray-600">1 hr</p>
              <p className="text-gray-600">Private Tutors Center</p>
              <p className="text-gray-800 font-bold">£20 GBP</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full lg:w-3/4 flex flex-col lg:flex-row lg:space-x-6">
          {showBookingDetails ? (
            <div className="w-full lg:w-3/4 sm:w-full sm:p-4 sm:rounded-lg sm:shadow-md">
              {/* BookingDetails displayed */}
              <BookingDetails />
            </div>
          ) : (
            <>
              {/* Calendar */}
              {!selectedDate || window.innerWidth >= 1024 ? (
                <div className="w-full lg:w-1/2 bg-gray-50 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">
                    Select a Date:
                  </h2>
                  <DatePicker
                    inline
                    selected={selectedDate}
                    onChange={handleDateChange}
                    minDate={today}
                    maxDate={endOfMonth(today)}
                    calendarClassName="custom-calendar w-full"
                    dayClassName={(date) => {
                      if (date.toDateString() === today.toDateString()) {
                        return "relative text-blue-600 bg-blue-100 rounded-full dot-indicator";
                      }
                      if (date > today) {
                        return "text-blue-600 bg-blue-100 rounded-full";
                      }
                      return "";
                    }}
                  />
                </div>
              ) : null}

              {/* Time Slots */}
              {selectedDate && (
                <div className="w-full lg:w-1/2 bg-gray-50 rounded-lg shadow-md p-6">
                  {window.innerWidth < 1024 && (
                    <button
                      className="mb-4 text-blue-500 hover:underline flex items-center"
                      onClick={() => setSelectedDate(null)} // Back to calendar view
                    >
                      ← Back to Calendar
                    </button>
                  )}
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    Available Time Slots:
                  </h3>
                  <div className="space-y-2">
                    {timeSlots.length > 0 ? (
                      timeSlots.map((slot) => (
                        <div
                          key={slot}
                          className={`flex items-center justify-between px-4 py-2 border rounded-lg cursor-pointer ${
                            selectedTimeSlot === slot
                              ? "bg-blue-500 text-white"
                              : "bg-white hover:bg-blue-100 text-gray-700"
                          }`}
                          onClick={() => setSelectedTimeSlot(slot)}
                        >
                          <span>{slot}</span>
                          {selectedTimeSlot === slot && (
                            <button
                              className="ml-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                              onClick={handleNextClick}
                            >
                              Next
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">No slots available</div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDatePicker;
