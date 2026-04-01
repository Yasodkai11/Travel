import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Train, Hotel, Package as PackageIcon } from "lucide-react";

interface TrainBookingRecord {
  id: number;
  user_id: number;
  train_id: number;
  booking_date: string;
  status: string;
  created_at: string;
  train?: {
    id: number;
    train_name: string;
    departure_station: string;
    arrival_station: string;
    departure_time: string;
    arrival_time: string;
    price: number;
  };
}

interface HotelBookingRecord {
  id: number;
  user_id: number;
  hotel_id: number;
  check_in: string;
  check_out: string;
  status: string;
  created_at: string;
  hotel?: {
    id: number;
    name: string;
    location: string;
    price_per_night: number;
    rating?: number;
    description?: string;
  };
}

interface PackageBookingRecord {
  id: number;
  user_id: number;
  package_id: number;
  start_date: string;
  status: string;
  created_at: string;
  package?: {
    id: number;
    title: string;
    location: string;
    duration_days: number;
    price: number;
    description?: string;
  };
}

export function DashboardPage() {
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const [trainBookings, setTrainBookings] = useState<TrainBookingRecord[]>([]);
  const [hotelBookings, setHotelBookings] = useState<HotelBookingRecord[]>([]);
  const [packageBookings, setPackageBookings] = useState<
    PackageBookingRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const formatDateTime = (value: string) => {
    return new Date(value).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  useEffect(() => {
    const loadBookings = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setErrorMessage("Please login to view your bookings.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [trainResponse, hotelResponse, packageResponse] =
          await Promise.all([
            fetch(`${apiBaseUrl}/trains/bookings/user`, { headers }),
            fetch(`${apiBaseUrl}/hotels/bookings/user`, { headers }),
            fetch(`${apiBaseUrl}/packages/bookings/user`, { headers }),
          ]);

        const [trainData, hotelData, packageData] = await Promise.all([
          trainResponse.json().catch(() => []),
          hotelResponse.json().catch(() => []),
          packageResponse.json().catch(() => []),
        ]);

        if (!trainResponse.ok || !hotelResponse.ok || !packageResponse.ok) {
          const detail =
            (trainData && (trainData.detail as string)) ||
            (hotelData && (hotelData.detail as string)) ||
            (packageData && (packageData.detail as string)) ||
            "Failed to load bookings.";
          setErrorMessage(detail);
          return;
        }

        setTrainBookings(Array.isArray(trainData) ? trainData : []);
        setHotelBookings(Array.isArray(hotelData) ? hotelData : []);
        setPackageBookings(Array.isArray(packageData) ? packageData : []);
      } catch (error) {
        setErrorMessage(
          "Unable to load bookings. Please ensure backend is running.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [apiBaseUrl]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-primary mb-8">My Bookings</h1>

      <div className="space-y-12">
        {isLoading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-500">
            Loading your bookings...
          </div>
        ) : null}

        {!isLoading && errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {/* Trains Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Train className="text-secondary" size={20} />
              Train Bookings
            </h2>
            <Link
              to="/trains"
              className="text-sm font-medium text-primary hover:text-secondary"
            >
              Book New Train &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-primary text-white uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Train</th>
                  <th className="px-6 py-3">Route</th>
                  <th className="px-6 py-3">Booked At</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!isLoading && !errorMessage && trainBookings.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={5}>
                      You have no train bookings yet.
                    </td>
                  </tr>
                ) : null}

                {!isLoading && !errorMessage
                  ? trainBookings.map((booking) => (
                      <tr className="hover:bg-gray-50" key={booking.id}>
                        <td className="px-6 py-4 font-medium">
                          {booking.train?.train_name ||
                            `Train #${booking.train_id}`}
                        </td>
                        <td className="px-6 py-4">
                          {booking.train
                            ? `${booking.train.departure_station} → ${booking.train.arrival_station}`
                            : "Route unavailable"}
                        </td>
                        <td className="px-6 py-4">
                          {formatDateTime(booking.booking_date)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              booking.status === "booked"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {booking.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to="/cancel-train"
                            className="text-red-500 hover:text-red-700 font-medium text-xs border border-red-200 px-3 py-1 rounded hover:bg-red-50"
                          >
                            CANCEL
                          </Link>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        </section>

        {/* Hotels Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Hotel className="text-secondary" size={20} />
              Hotel Bookings
            </h2>
            <Link
              to="/hotels"
              className="text-sm font-medium text-primary hover:text-secondary"
            >
              Book New Hotel &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-primary text-white uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Hotel Name</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Stay Dates</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!isLoading && !errorMessage && hotelBookings.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={5}>
                      You have no hotel bookings yet.
                    </td>
                  </tr>
                ) : null}

                {!isLoading && !errorMessage
                  ? hotelBookings.map((booking) => (
                      <tr className="hover:bg-gray-50" key={booking.id}>
                        <td className="px-6 py-4 font-medium">
                          {booking.hotel?.name || `Hotel #${booking.hotel_id}`}
                        </td>
                        <td className="px-6 py-4">
                          {booking.hotel?.location || "Location unavailable"}
                        </td>
                        <td className="px-6 py-4">
                          {formatDate(booking.check_in)} -{" "}
                          {formatDate(booking.check_out)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              booking.status === "booked"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {booking.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to="/cancel-hotel"
                            className="text-red-500 hover:text-red-700 font-medium text-xs border border-red-200 px-3 py-1 rounded hover:bg-red-50"
                          >
                            CANCEL
                          </Link>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        </section>

        {/* Packages Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <PackageIcon className="text-secondary" size={20} />
              Package Bookings
            </h2>
            <Link
              to="/packages"
              className="text-sm font-medium text-primary hover:text-secondary"
            >
              Book New Package &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-primary text-white uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Package</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Start Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!isLoading && !errorMessage && packageBookings.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={5}>
                      You have no package bookings yet.
                    </td>
                  </tr>
                ) : null}

                {!isLoading && !errorMessage
                  ? packageBookings.map((booking) => (
                      <tr className="hover:bg-gray-50" key={booking.id}>
                        <td className="px-6 py-4 font-medium">
                          {booking.package?.title ||
                            `Package #${booking.package_id}`}
                        </td>
                        <td className="px-6 py-4">
                          {booking.package?.location || "Location unavailable"}
                        </td>
                        <td className="px-6 py-4">
                          {formatDate(booking.start_date)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              booking.status === "booked"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {booking.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to="/cancel-package"
                            className="text-red-500 hover:text-red-700 font-medium text-xs border border-red-200 px-3 py-1 rounded hover:bg-red-50"
                          >
                            CANCEL
                          </Link>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
