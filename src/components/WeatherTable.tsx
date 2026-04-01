import React, { useEffect, useState } from "react";
import { CloudSun } from "lucide-react";

interface WeatherTableProps {
  districtName: string;
  travelDate: string;
  apiBaseUrl: string;
}

interface DistrictForecast {
  district: string;
  date: string;
  condition: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
}

export function WeatherTable({
  districtName,
  travelDate,
  apiBaseUrl,
}: WeatherTableProps) {
  const [forecast, setForecast] = useState<DistrictForecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadForecast = async () => {
      if (!districtName || !travelDate) {
        setForecast(null);
        setError("");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          district: districtName,
          date: travelDate,
        });
        const response = await fetch(
          `${apiBaseUrl}/weather/forecast/district?${params.toString()}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.detail || "Failed to load weather forecast.");
        }

        setForecast(data);
      } catch (err) {
        setForecast(null);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to fetch weather forecast.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadForecast();
  }, [apiBaseUrl, districtName, travelDate]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center gap-2 mb-4 text-primary">
        <CloudSun size={24} />
        <h3 className="text-lg font-bold">
          Weather Forecast ({districtName || "Select District"})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Date</th>
              <th className="px-4 py-3">Condition</th>
              <th className="px-4 py-3">Temp (°C)</th>
              <th className="px-4 py-3">Humidity (%)</th>
              <th className="px-4 py-3 rounded-tr-lg">Wind (km/h)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={5}>
                  Loading forecast...
                </td>
              </tr>
            ) : null}

            {!isLoading && error ? (
              <tr>
                <td className="px-4 py-4 text-red-600" colSpan={5}>
                  {error}
                </td>
              </tr>
            ) : null}

            {!isLoading && !error && forecast ? (
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{forecast.date}</td>
                <td className="px-4 py-3">{forecast.condition}</td>
                <td className="px-4 py-3">{forecast.temperature.toFixed(1)}</td>
                <td className="px-4 py-3">{forecast.humidity}</td>
                <td className="px-4 py-3">{forecast.wind_speed.toFixed(1)}</td>
              </tr>
            ) : null}

            {!isLoading && !error && !forecast ? (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={5}>
                  Select a district and date to view forecast.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
