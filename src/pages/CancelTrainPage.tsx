import React from 'react';
import { TrainCard } from '../components/cards/TrainCard';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
export function CancelTrainPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="mb-8 flex justify-center text-red-500">
        <AlertTriangle size={64} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Cancel Train Booking?
      </h1>
      <p className="text-gray-500 mb-12">
        Are you sure you want to cancel this reservation? This action cannot be
        undone.
      </p>

      <div className="text-left mb-12">
        <TrainCard
          company="Sri Lanka Railways"
          trainNumber="EXP-1001"
          from="Colombo Fort"
          to="Kandy"
          deptTime="06:15 AM"
          destTime="09:30 AM"
          price="$8"
          seats={2} />

      </div>

      <div className="flex justify-center gap-4">
        <Link
          to="/dashboard"
          className="px-8 py-3 bg-gray-200 text-gray-700 font-bold rounded hover:bg-gray-300 transition">

          Go Back
        </Link>
        <button className="px-8 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition shadow-lg">
          C A N C E L
        </button>
      </div>
    </div>);

}