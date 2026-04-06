import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { TrainCard } from "../components/cards/TrainCard";

interface TrainBookingState {
  booking?: {
    id: number;
    booking_date: string;
    status: string;
    train?: {
      id: number;
      train_name: string;
      departure_station: string;
      arrival_station: string;
      departure_time: string;
      arrival_time: string;
      price: number;
    };
  };
}

export function CancelTrainPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingId: bookingIdParam } = useParams();
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const booking = (location.state as TrainBookingState | null)?.booking;
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
      const response = await fetch(`${apiBaseUrl}/trains/cancel/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(data?.detail || "Unable to cancel train booking.");
        return;
      }

      navigate("/dashboard");
    } catch (error) {
      setErrorMessage("Unable to cancel train booking right now.");
    } finally {
      setIsCancelling(false);
    }
  };

  const train = booking?.train;

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

      <div className="text-left mb-12 space-y-4">
        {train ? (
          <TrainCard
            company="Sri Lanka Railways"
            trainNumber={train.train_name}
            from={train.departure_station}
            to={train.arrival_station}
            deptTime={new Date(train.departure_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            destTime={new Date(train.arrival_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            price={`LKR ${Number(train.price).toFixed(2)}`}
          />
        ) : null}

        <div className="rounded-lg border border-gray-200 bg-white p-4 text-left text-sm text-gray-600">
          <p>
            <span className="font-semibold text-gray-800">Booking ID:</span>{" "}
            {Number.isFinite(bookingId) ? bookingId : "Unavailable"}
          </p>
          {booking?.booking_date ? (
            <p className="mt-1">
              <span className="font-semibold text-gray-800">Booked At:</span>{" "}
              {new Date(booking.booking_date).toLocaleString()}
            </p>
          ) : null}
          {booking?.status ? (
            <p className="mt-1">
              <span className="font-semibold text-gray-800">Status:</span>{" "}
              {booking.status.toUpperCase()}
            </p>
          ) : null}
        </div>
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
