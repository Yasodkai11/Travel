import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TrainCard } from "../components/cards/TrainCard";
import { WeatherTable } from "../components/WeatherTable";

interface TrainApiRecord {
  id: number;
  train_name: string;
  departure_station: string;
  arrival_station: string;
  departure_time: string;
  arrival_time: string;
  price: number;
}

export function TrainsPage() {
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const districts = [
    "Ampara",
    "Anuradhapura",
    "Badulla",
    "Batticaloa",
    "Colombo",
    "Galle",
    "Gampaha",
    "Hambantota",
    "Jaffna",
    "Kalutara",
    "Kandy",
    "Kegalle",
    "Kilinochchi",
    "Kurunegala",
    "Mannar",
    "Matale",
    "Matara",
    "Monaragala",
    "Mullaitivu",
    "Nuwara Eliya",
    "Polonnaruwa",
    "Puttalam",
    "Ratnapura",
    "Trincomalee",
    "Vavuniya",
  ];
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [district, setDistrict] = useState("Colombo");
  const [trains, setTrains] = useState<TrainApiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadTrains = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await fetch(`${apiBaseUrl}/trains/`);
        const data = await response.json().catch(() => []);

        if (!response.ok) {
          setErrorMessage(data?.detail || "Failed to load trains.");
          return;
        }

        setTrains(Array.isArray(data) ? data : []);
      } catch (error) {
        setErrorMessage(
          "Unable to reach backend. Please ensure API server is running.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadTrains();
  }, [apiBaseUrl]);

  const filteredTrains = useMemo(() => {
    return trains.filter((train) => {
      const sourceMatch = source.trim()
        ? train.departure_station
            .toLowerCase()
            .includes(source.trim().toLowerCase())
        : true;

      const destinationMatch = destination.trim()
        ? train.arrival_station
            .toLowerCase()
            .includes(destination.trim().toLowerCase())
        : true;

      if (!travelDate) {
        return sourceMatch && destinationMatch;
      }

      const departureDate = new Date(train.departure_time)
        .toISOString()
        .slice(0, 10);
      return sourceMatch && destinationMatch && departureDate === travelDate;
    });
  }, [trains, source, destination, travelDate]);

  const formatTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="pb-16">
      {/* Top Band */}
      <div className="bg-primary text-white py-12 text-center">
        <h1 className="text-3xl font-bold tracking-wider uppercase">
          Search Trains
        </h1>
        <p className="text-white/70 mt-2">
          Find the best train routes across Sri Lanka
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-12 border border-gray-100">
          <form
            className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Source
              </label>
              <input
                type="text"
                name="source"
                id="source"
                placeholder="From where?"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Destination
              </label>
              <input
                type="text"
                name="destination"
                id="destination"
                placeholder="To where?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                id="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                District
              </label>
              <select
                name="district"
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50"
              >
                {districts.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
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
        <WeatherTable
          districtName={district}
          travelDate={travelDate}
          apiBaseUrl={apiBaseUrl}
        />

        {/* Results */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-accent pl-4">
          Available Tickets
        </h2>

        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-lg bg-white p-6 text-center text-gray-500 border border-gray-100">
              Loading trains...
            </div>
          ) : null}
          {!isLoading && errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {errorMessage}
            </div>
          ) : null}
          {!isLoading && !errorMessage && filteredTrains.length === 0 ? (
            <div className="rounded-lg bg-white p-6 text-center text-gray-500 border border-gray-100">
              No trains match your search.
            </div>
          ) : null}

          {!isLoading &&
            !errorMessage &&
            filteredTrains.map((train) => (
              <TrainCard
                key={train.id}
                company="Sri Lanka Railways"
                trainNumber={train.train_name}
                from={train.departure_station}
                to={train.arrival_station}
                deptTime={formatTime(train.departure_time)}
                destTime={formatTime(train.arrival_time)}
                price={`LKR ${Number(train.price).toFixed(2)}`}
                onBook="/book-train"
                onBookState={{ train }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
