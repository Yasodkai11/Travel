import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { HotelCard } from "../components/cards/HotelCard";
import { WeatherTable } from "../components/WeatherTable";

interface HotelApiRecord {
  id: number;
  name: string;
  location: string;
  price_per_night: number;
  rating: number | null;
  description: string | null;
  image_url: string | null;
}

export function HotelsPage() {
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const [city, setCity] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [hotels, setHotels] = useState<HotelApiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadHotels = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await fetch(`${apiBaseUrl}/hotels/`);
        const data = await response.json().catch(() => []);

        if (!response.ok) {
          setErrorMessage(data?.detail || "Failed to load hotels.");
          return;
        }

        setHotels(Array.isArray(data) ? data : []);
      } catch (error) {
        setErrorMessage(
          "Unable to reach backend. Please ensure API server is running.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadHotels();
  }, [apiBaseUrl]);

  const filteredHotels = useMemo(() => {
    const query = city.trim().toLowerCase();
    if (!query) {
      return hotels;
    }

    return hotels.filter(
      (hotel) =>
        hotel.location.toLowerCase().includes(query) ||
        hotel.name.toLowerCase().includes(query),
    );
  }, [hotels, city]);

  return (
    <div className="pb-16">
      {/* Top Band */}
      <div className="bg-primary text-white py-12 text-center">
        <h1 className="text-3xl font-bold tracking-wider uppercase">
          Search Hotels
        </h1>
        <p className="text-white/70 mt-2">Luxury stays at affordable prices</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-12 border border-gray-100">
          <form
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                City / Location
              </label>
              <input
                type="text"
                name="city"
                id="city"
                placeholder="Where do you want to stay?"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Check-in Date
              </label>
              <input
                type="date"
                name="date"
                id="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              <Search size={18} />
              SEARCH
            </button>
          </form>
        </div>

        {/* Weather Section */}
        <WeatherTable cityName="Colombo" />

        {/* Results */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-accent pl-4">
          Available Hotels
        </h2>

        <div className="space-y-6">
          {isLoading ? (
            <div className="rounded-lg bg-white p-6 text-center text-gray-500 border border-gray-100">
              Loading hotels...
            </div>
          ) : null}
          {!isLoading && errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {errorMessage}
            </div>
          ) : null}
          {!isLoading && !errorMessage && filteredHotels.length === 0 ? (
            <div className="rounded-lg bg-white p-6 text-center text-gray-500 border border-gray-100">
              No hotels match your search.
            </div>
          ) : null}

          {!isLoading &&
            !errorMessage &&
            filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                name={hotel.name}
                address={hotel.location}
                imageUrl={
                  hotel.image_url
                    ? `${apiBaseUrl}${hotel.image_url}`
                    : undefined
                }
                distanceFromAirport="Distance data available at booking stage"
                price={`LKR ${Number(hotel.price_per_night).toFixed(2)}`}
                amenities={
                  hotel.description || "Comfortable stay with modern facilities"
                }
                stars={Math.max(1, Math.min(5, Math.round(hotel.rating || 4)))}
                onBook="/book-hotel"
                onBookState={{
                  hotel,
                  preselectedCheckInDate: checkInDate,
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
