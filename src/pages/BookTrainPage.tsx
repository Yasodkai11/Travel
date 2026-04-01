import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TrainCard } from "../components/cards/TrainCard";

interface TrainApiRecord {
  id: number;
  train_name: string;
  departure_station: string;
  arrival_station: string;
  departure_time: string;
  arrival_time: string;
  price: number;
}

interface BookWithPaymentResponse {
  booking_id: number;
  train_id: number;
  user_id: number;
  seats_count: number;
  amount: number;
  status: string;
  message: string;
  payment: {
    booking_reference: string;
    transaction_id: string;
    payment_method: "card" | "paypal";
    payment_status: string;
    amount: number;
  };
}

export function BookTrainPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const selectedTrain = (location.state as { train?: TrainApiRecord } | null)
    ?.train;

  const [seatsRequested, setSeatsRequested] = useState(1);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availableSeats, setAvailableSeats] = useState(0);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [paymentResult, setPaymentResult] =
    useState<BookWithPaymentResponse | null>(null);

  const formatTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCheckAvailability = async () => {
    if (!selectedTrain) {
      setErrorMessage("No train selected. Please choose a train first.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setAvailabilityChecked(false);
    setIsCheckingAvailability(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/trains/${selectedTrain.id}/availability?seats=${seatsRequested}`,
      );
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(data?.detail || "Failed to check availability.");
        return;
      }

      setAvailabilityChecked(true);
      setIsAvailable(Boolean(data?.can_book));
      setAvailableSeats(Number(data?.available_seats ?? 0));
    } catch (error) {
      setErrorMessage("Unable to check availability. Please try again.");
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const ticketPrice = selectedTrain?.price ?? 0;
  const taxes = 2;
  const total = ticketPrice * seatsRequested + taxes;

  const isCardPayloadValid = useMemo(() => {
    if (paymentMethod !== "card") {
      return true;
    }

    const cardDigits = cardNumber.replace(/\s+/g, "");
    return (
      cardHolder.trim().length >= 2 &&
      /^\d{12,19}$/.test(cardDigits) &&
      /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry) &&
      /^\d{3,4}$/.test(cvv)
    );
  }, [paymentMethod, cardHolder, cardNumber, expiry, cvv]);

  const handlePay = async () => {
    if (!selectedTrain) {
      setErrorMessage("No train selected. Please choose a train first.");
      return;
    }

    if (!availabilityChecked || !isAvailable) {
      setErrorMessage("Please check availability before payment.");
      return;
    }

    if (!isCardPayloadValid) {
      setErrorMessage("Please enter valid card details.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setErrorMessage("Please login first to complete booking.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsPaying(true);

    const cardDigits = cardNumber.replace(/\s+/g, "");
    const payload = {
      train_id: selectedTrain.id,
      seats_count: seatsRequested,
      payment_method: paymentMethod,
      card_number: paymentMethod === "card" ? cardDigits : undefined,
      card_holder: paymentMethod === "card" ? cardHolder.trim() : undefined,
      expiry: paymentMethod === "card" ? expiry : undefined,
      cvv: paymentMethod === "card" ? cvv : undefined,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/trains/book-with-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(data?.detail || "Payment failed. Please try again.");
        return;
      }

      setPaymentResult(data as BookWithPaymentResponse);
      setSuccessMessage(
        `Payment successful. Booking reference: ${data.payment.booking_reference}`,
      );
      window.setTimeout(() => {
        navigate("/dashboard");
      }, 1400);
    } catch (error) {
      setErrorMessage("Unable to complete payment. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  if (!selectedTrain) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
          <h1 className="text-2xl font-bold text-primary mb-3">
            No Train Selected
          </h1>
          <p className="text-gray-600 mb-6">
            Please choose a train from the train page before booking.
          </p>
          <Link
            to="/trains"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary/90"
          >
            Go to Trains
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-8 border-b pb-4">
        Book Train
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Train Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Train Details
            </h2>
            <TrainCard
              company="Sri Lanka Railways"
              trainNumber={selectedTrain.train_name}
              from={selectedTrain.departure_station}
              to={selectedTrain.arrival_station}
              deptTime={formatTime(selectedTrain.departure_time)}
              destTime={formatTime(selectedTrain.arrival_time)}
              price={`LKR ${Number(ticketPrice).toFixed(2)}`}
              available={true}
            />
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Passenger Details
            </h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Seats
                </label>
                <input
                  type="number"
                  name="seats"
                  min="1"
                  max="10"
                  value={seatsRequested}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value, 10);
                    const safeValue = Number.isNaN(value)
                      ? 1
                      : Math.max(1, Math.min(10, value));
                    setSeatsRequested(safeValue);
                    setAvailabilityChecked(false);
                    setIsAvailable(false);
                    setAvailableSeats(0);
                    setSuccessMessage("");
                  }}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as "card" | "paypal")
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="card">Card</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              {paymentMethod === "card" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Holder
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="John Doe"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(
                          e.target.value.replace(/[^\d\s]/g, "").slice(0, 23),
                        )
                      }
                      placeholder="4111 1111 1111 1111"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) =>
                          setExpiry(
                            e.target.value.replace(/[^\d/]/g, "").slice(0, 5),
                          )
                        }
                        placeholder="09/28"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) =>
                          setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                        }
                        placeholder="123"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                </>
              ) : null}

              <button
                type="button"
                onClick={handleCheckAvailability}
                disabled={isCheckingAvailability}
                className="w-full py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition font-medium"
              >
                {isCheckingAvailability ? "Checking..." : "Check Availability"}
              </button>

              {availabilityChecked && (
                <div
                  className={`mt-4 p-3 rounded text-center font-bold ${isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {isAvailable
                    ? `Available! ${availableSeats} seats remaining`
                    : "BOOKED - Not enough seats available"}
                </div>
              )}

              {errorMessage ? (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  {successMessage}
                </div>
              ) : null}

              {paymentResult ? (
                <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  Transaction: {paymentResult.payment.transaction_id}
                </div>
              ) : null}
            </form>
          </div>
        </div>

        {/* Payment Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Price Summary
            </h3>
            <div className="flex justify-between mb-2 text-gray-600">
              <span>Ticket Price</span>
              <span>
                LKR {Number(ticketPrice).toFixed(2)} x {seatsRequested}
              </span>
            </div>
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Taxes & Fees</span>
              <span>LKR {taxes.toFixed(2)}</span>
            </div>
            <div className="border-t pt-4 mb-6 flex justify-between font-bold text-lg text-primary">
              <span>Total</span>
              <span>LKR {total.toFixed(2)}</span>
            </div>

            {availabilityChecked && isAvailable ? (
              <button
                onClick={handlePay}
                disabled={isPaying || !isCardPayloadValid}
                className="w-full py-3 bg-accent text-charcoal font-bold rounded-lg hover:bg-accent/90 transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPaying
                  ? "Processing Payment..."
                  : paymentMethod === "card"
                    ? "Pay with Card"
                    : "Pay with PayPal"}
              </button>
            ) : (
              <button
                disabled
                className="w-full py-3 bg-gray-200 text-gray-400 font-bold rounded-lg cursor-not-allowed"
              >
                {availabilityChecked && !isAvailable
                  ? "Not Available"
                  : "Check availability first"}
              </button>
            )}

            <p className="text-xs text-center text-gray-400 mt-4">
              Secure payment processing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
