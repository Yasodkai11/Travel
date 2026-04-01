import React from 'react';
import { FlightCard } from '../components/cards/FlightCard';
import { AlertTriangle } from 'lucide-react';
export function CancelFlightPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="mb-8 flex justify-center text-red-500">
        <AlertTriangle size={64} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Cancel Flight Booking?
      </h1>
      <p className="text-gray-500 mb-12">
        Are you sure you want to cancel this reservation? This action cannot be
        undone.
      </p>

      <div className="text-left mb-12">
        <FlightCard
          company="SriLankan Airlines"
          flightNumber="UL-305"
          from="Colombo"
          to="Chennai"
          deptTime="08:30 AM"
          destTime="10:15 AM"
          price="$125"
          seats={2} />

      </div>

      <div className="flex justify-center gap-4">
        <button className="px-8 py-3 bg-gray-200 text-gray-700 font-bold rounded hover:bg-gray-300 transition">
          Go Back
        </button>
        <button className="px-8 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition shadow-lg">
          C A N C E L
        </button>
      </div>
    </div>);

}