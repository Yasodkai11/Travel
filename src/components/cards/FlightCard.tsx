import React from 'react';
import { Plane } from 'lucide-react';
import { Link } from 'react-router-dom';
interface FlightCardProps {
  company: string;
  flightNumber: string;
  from: string;
  to: string;
  deptTime: string;
  destTime: string;
  price: string;
  onBook?: string; // URL to book
  seats?: number;
}
export function FlightCard({
  company,
  flightNumber,
  from,
  to,
  deptTime,
  destTime,
  price,
  onBook,
  seats
}: FlightCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border-l-4 border-primary p-6 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Plane className="text-primary" size={20} />
            <h3 className="font-bold text-lg text-primary">
              {company}{' '}
              <span className="text-gray-500 text-sm font-normal">
                – {flightNumber}
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-8 mt-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                From
              </p>
              <p className="font-semibold text-xl">{from}</p>
              <p className="text-sm text-gray-600">{deptTime}</p>
            </div>

            <div className="flex-1 border-t-2 border-dashed border-gray-300 relative h-0">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-gray-400">
                ✈
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                To
              </p>
              <p className="font-semibold text-xl">{to}</p>
              <p className="text-sm text-gray-600">{destTime}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end min-w-[150px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0">
          <p className="text-2xl font-bold text-primary mb-1">{price}*</p>
          {seats !== undefined &&
          <p className="text-sm text-gray-500 mb-3">
              Availability: {seats} seats
            </p>
          }
          {onBook ?
          <Link
            to={onBook}
            className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition w-full text-center">

              Book
            </Link> :

          <button className="px-6 py-2 bg-gray-100 text-gray-400 rounded cursor-not-allowed w-full">
              Details
            </button>
          }
        </div>
      </div>
    </div>);

}