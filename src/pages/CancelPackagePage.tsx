import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

interface PackageBookingState {
  booking?: {
    id: number;
    package_id: number;
    start_date: string;
    status: string;
    package?: {
      id: number;
      title: string;
      location: string;
      duration_days: number;
      price: number;
      description?: string;
    };
  };
}

export function CancelPackagePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingId: bookingIdParam } = useParams();
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const booking = (location.state as PackageBookingState | null)?.booking;
  const bookingId = booking?.id ?? Number.parseInt(bookingIdParam || "", 10);

  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCancel = async () => {
    if (!Number.isFinite(bookingId)) {
      setErrorMessage("Missing booking id. Please return to the dashboard.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setErrorMessage("Please login first to cancel this booking.");
      return;
    }

    setIsCancelling(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${apiBaseUrl}/packages/cancel/${bookingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(data?.detail || "Unable to cancel package booking.");
        return;
      }

      navigate("/dashboard");
    } catch (error) {
      setErrorMessage("Unable to cancel package booking right now.");
    } finally {
      setIsCancelling(false);
    }
  };

  const pkg = booking?.package;

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

      <div className="text-left mb-12 space-y-4">
        {pkg ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
            <h3 className="text-xl font-bold text-primary mb-2">{pkg.title}</h3>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Location:</span> {pkg.location}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Duration:</span>{" "}
              {pkg.duration_days} days
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">Price:</span> LKR{" "}
              {Number(pkg.price).toFixed(2)}
            </p>
            {pkg.description && (
              <p className="text-gray-600">
                <span className="font-semibold">Description:</span>{" "}
                {pkg.description}
              </p>
            )}
          </div>
        ) : null}

        {booking ? (
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-left text-sm text-gray-600">
            <p>
              <span className="font-semibold text-gray-800">Booking ID:</span>{" "}
              {Number.isFinite(bookingId) ? bookingId : "Unavailable"}
            </p>
            {booking.start_date ? (
              <p className="mt-1">
                <span className="font-semibold text-gray-800">Start Date:</span>{" "}
                {new Date(booking.start_date).toLocaleDateString()}
              </p>
            ) : null}
            {booking.status ? (
              <p className="mt-1">
                <span className="font-semibold text-gray-800">Status:</span>{" "}
                {booking.status.toUpperCase()}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="px-8 py-3 bg-gray-200 text-gray-700 font-bold rounded hover:bg-gray-300 transition"
        >
          Go Back
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isCancelling || !Number.isFinite(bookingId)}
          className="px-8 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition shadow-lg disabled:cursor-not-allowed disabled:bg-red-300"
        >
          {isCancelling ? "CANCELLING..." : "CANCEL"}
        </button>
      </div>
    </div>
  );
}
