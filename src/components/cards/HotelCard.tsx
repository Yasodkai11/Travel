import React from "react";
import { MapPin, Star } from "lucide-react";
import { Link, To } from "react-router-dom";

const HOTEL_IMAGE_PLACEHOLDER =
  "https://placehold.co/192x128/e5e7eb/9ca3af?text=No+Image";

interface HotelCardProps {
  name: string;
  address: string;
  imageUrl?: string;
  distanceFromAirport: string;
  price: string;
  amenities: string;
  stars: number;
  onBook?: To;
  onBookState?: unknown;
  rooms?: number;
}
export function HotelCard({
  name,
  address,
  imageUrl,
  distanceFromAirport,
  price,
  amenities,
  stars,
  onBook,
  onBookState,
  rooms,
}: HotelCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 flex gap-4 p-4 hover:shadow-lg transition-shadow">
      <img
        src={imageUrl || HOTEL_IMAGE_PLACEHOLDER}
        alt={name}
        className="w-48 h-32 object-cover rounded-lg flex-shrink-0"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = HOTEL_IMAGE_PLACEHOLDER;
        }}
      />

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-primary mb-1">{name}</h3>
            <div className="flex text-accent">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < stars ? "currentColor" : "none"}
                  className={i < stars ? "text-accent" : "text-gray-300"}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center text-gray-600 text-sm mb-2">
            <MapPin size={14} className="mr-1" />
            {address}
          </div>

          <p className="text-sm text-blue-500 mb-3">
            {distanceFromAirport} from nearest airport
          </p>

          <p className="text-sm text-gray-500 line-clamp-2 mb-4">
            <span className="font-semibold">Amenities:</span> {amenities}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-primary">{price}</span>
            <span className="text-gray-500 text-sm"> /night</span>
            {rooms !== undefined && (
              <p className="text-xs text-gray-500 mt-1">
                Available Rooms: {rooms}
              </p>
            )}
          </div>

          {onBook ? (
            <Link
              to={onBook}
              state={onBookState}
              className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
            >
              Book Room
            </Link>
          ) : (
            <button className="px-6 py-2 bg-gray-100 text-gray-400 rounded cursor-not-allowed">
              Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
