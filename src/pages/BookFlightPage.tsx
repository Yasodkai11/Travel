import React from 'react';
import { FlightCard } from '../components/cards/FlightCard';
export function BookFlightPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-8 border-b pb-4">
        Confirm Flight Booking
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Flight Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Flight Details
            </h2>
            <FlightCard
              company="SriLankan Airlines"
              flightNumber="UL-305"
              from="Colombo"
              to="Chennai"
              deptTime="08:30 AM"
              destTime="10:15 AM"
              price="$125"
              seats={38} />

          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Passenger Details
            </h2>
            <form className="space-y-4" action="#" method="POST">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Seats
                </label>
                <input
                  type="number"
                  name="seats"
                  min="1"
                  max="10"
                  defaultValue="1"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary" />

              </div>
              <button
                type="button"
                className="w-full py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition">

                Check Availability
              </button>
            </form>
          </div>
        </div>

        {/* Payment Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Price Summary
            </h3>
            <div className="flex justify-between mb-2 text-gray-600">
              <span>Ticket Price</span>
              <span>$125</span>
            </div>
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Taxes & Fees</span>
              <span>$15</span>
            </div>
            <div className="border-t pt-4 mb-6 flex justify-between font-bold text-lg text-primary">
              <span>Total</span>
              <span>$140</span>
            </div>

            <button className="w-full py-3 bg-accent text-charcoal font-bold rounded-lg hover:bg-accent/90 transition shadow-md">
              Pay with PayPal
            </button>
            <p className="text-xs text-center text-gray-400 mt-4">
              Secure payment processing
            </p>
          </div>
        </div>
      </div>
    </div>);

}