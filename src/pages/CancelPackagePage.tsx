import React from 'react';
import { FlightCard } from '../components/cards/FlightCard';
import { HotelCard } from '../components/cards/HotelCard';
import { AlertTriangle } from 'lucide-react';
export function CancelPackagePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="mb-8 flex justify-center text-red-500">
        <AlertTriangle size={64} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Cancel Package Booking?
      </h1>
      <p className="text-gray-500 mb-12">
        Are you sure you want to cancel this entire package? This action cannot
        be undone.
      </p>

      <div className="text-left space-y-6 mb-12">
        <FlightCard
          company="SriLankan Airlines"
          flightNumber="UL-504"
          from="Colombo"
          to="Dubai"
          deptTime="02:00 PM"
          destTime="06:30 PM"
          price="Included" />

        <HotelCard
          name="Heritance Kandalama"
          address="Dambulla, Central Province"
          distanceFromAirport="150 km"
          price="Included"
          amenities="Infinity Pool, Ayurveda Spa, Nature Trails"
          stars={5} />

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