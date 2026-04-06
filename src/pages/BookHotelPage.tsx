import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HotelCard } from "../components/cards/HotelCard";

interface HotelApiRecord {
  id: number;
  name: string;
  location: string;
  price_per_night: number;
  rating: number | null;
  description: string | null;
  image_url: string | null;
}

interface HotelPaymentResult {
  booking_id: number;
  hotel_id: number;
  user_id: number;
  rooms_count: number;
  nights: number;
  amount: number;
  status: string;
  payment: {
    booking_reference: string;
    transaction_id: string;
    payment_method: "card" | "paypal";
    payment_status: string;
    amount: number;
  };
}

const formatInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (dateString: string, days: number) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return formatInputDate(date);
};

const toIsoDateTime = (dateString: string) => {
  return new Date(`${dateString}T00:00:00`).toISOString();
};

export function BookHotelPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const routeState = location.state as {
    hotel?: HotelApiRecord;
    preselectedCheckInDate?: string;
  } | null;
  const selectedHotel = routeState?.hotel;
  const selectedHotelImageUrl = selectedHotel?.image_url
    ? `${apiBaseUrl}${selectedHotel.image_url}`
    : undefined;

  const today = formatInputDate(new Date());
  const defaultCheckIn = routeState?.preselectedCheckInDate || today;
  const [checkInDate, setCheckInDate] = useState(defaultCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(addDays(defaultCheckIn, 1));
  const [roomsRequested, setRoomsRequested] = useState(1);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availableRooms, setAvailableRooms] = useState(0);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [paymentResult, setPaymentResult] = useState<HotelPaymentResult | null>(
    null,
  );

  const nights = useMemo(() => {
    const start = new Date(`${checkInDate}T00:00:00`);
    const end = new Date(`${checkOutDate}T00:00:00`);
    const diffDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(1, Number.isNaN(diffDays) ? 1 : diffDays);
  }, [checkInDate, checkOutDate]);

  const roomPrice = selectedHotel?.price_per_night ?? 0;
  const taxes = 22;
  const total = roomPrice * roomsRequested * nights + taxes;

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

  const validateDates = () => {
    const checkIn = new Date(`${checkInDate}T00:00:00`);
    const checkOut = new Date(`${checkOutDate}T00:00:00`);
    return checkOut > checkIn;
  };

  const handleCheckAvailability = async () => {
    if (!selectedHotel) {
      setErrorMessage("No hotel selected. Please choose a hotel first.");
      return;
    }

    if (!validateDates()) {
      setErrorMessage("Check-out date must be after check-in date.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setAvailabilityChecked(false);
    setIsCheckingAvailability(true);

    try {
      const checkInIso = encodeURIComponent(toIsoDateTime(checkInDate));
      const checkOutIso = encodeURIComponent(toIsoDateTime(checkOutDate));
      const response = await fetch(
        `${apiBaseUrl}/hotels/${selectedHotel.id}/availability?check_in=${checkInIso}&check_out=${checkOutIso}&rooms=${roomsRequested}`,
      );
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(data?.detail || "Failed to check availability.");
        return;
      }

      setAvailabilityChecked(true);
      setIsAvailable(Boolean(data?.can_book));
      setAvailableRooms(Number(data?.available_rooms ?? 0));
    } catch (error) {
      setErrorMessage("Unable to check room availability. Please try again.");
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handlePay = async () => {
    if (!selectedHotel) {
      setErrorMessage("No hotel selected. Please choose a hotel first.");
      return;
    }

    if (!validateDates()) {
      setErrorMessage("Check-out date must be after check-in date.");
      return;
    }

    if (!availabilityChecked || !isAvailable) {
      setErrorMessage("Please check room availability before payment.");
      return;
    }

    if (!isCardPayloadValid) {
      setErrorMessage("Please provide valid card details.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setErrorMessage("Please login first to complete hotel booking.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsPaying(true);

    const cardDigits = cardNumber.replace(/\s+/g, "");
    const payload = {
      hotel_id: selectedHotel.id,
      check_in: toIsoDateTime(checkInDate),
      check_out: toIsoDateTime(checkOutDate),
      rooms_count: roomsRequested,
      payment_method: paymentMethod,
      card_number: paymentMethod === "card" ? cardDigits : undefined,
      card_holder: paymentMethod === "card" ? cardHolder.trim() : undefined,
      expiry: paymentMethod === "card" ? expiry : undefined,
      cvv: paymentMethod === "card" ? cvv : undefined,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/hotels/book-with-payment`, {
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

      setPaymentResult(data as HotelPaymentResult);
      setSuccessMessage(
        `Payment successful. Booking reference: ${data.payment.booking_reference}`,
      );

      window.setTimeout(() => {
        navigate("/dashboard");
      }, 1400);
    } catch (error) {
      setErrorMessage("Unable to process payment right now. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  if (!selectedHotel) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
          <h1 className="text-2xl font-bold text-primary mb-3">
            No Hotel Selected
          </h1>
          <p className="text-gray-600 mb-6">
            Please select a hotel from the hotels page before booking.
          </p>
          <Link
            to="/hotels"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary/90"
          >
            Go to Hotels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-8 border-b pb-4">
        Confirm Hotel Booking
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Hotel Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Hotel Details
            </h2>
            <HotelCard
              name={selectedHotel.name}
              address={selectedHotel.location}
              imageUrl={selectedHotelImageUrl}
              distanceFromAirport="Distance details available at check-in"
              price={`LKR ${Number(selectedHotel.price_per_night).toFixed(2)}`}
              amenities={
                selectedHotel.description ||
                "Comfortable stay with modern facilities"
              }
              stars={Math.max(
                1,
                Math.min(5, Math.round(selectedHotel.rating || 4)),
              )}
              rooms={availabilityChecked ? availableRooms : undefined}
            />
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Booking Details
            </h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    min={today}
                    onChange={(e) => {
                      setCheckInDate(e.target.value);
                      if (checkOutDate <= e.target.value) {
                        setCheckOutDate(addDays(e.target.value, 1));
                      }
                      setAvailabilityChecked(false);
                      setIsAvailable(false);
                      setAvailableRooms(0);
                    }}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    min={addDays(checkInDate, 1)}
                    onChange={(e) => {
                      setCheckOutDate(e.target.value);
                      setAvailabilityChecked(false);
                      setIsAvailable(false);
                      setAvailableRooms(0);
                    }}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Rooms
                </label>
                <input
                  type="number"
                  name="rooms"
                  min="1"
                  max="10"
                  value={roomsRequested}
                  onChange={(e) => {
                    const parsed = Number.parseInt(e.target.value, 10);
                    const safeValue = Number.isNaN(parsed)
                      ? 1
                      : Math.max(1, Math.min(10, parsed));
                    setRoomsRequested(safeValue);
                    setAvailabilityChecked(false);
                    setIsAvailable(false);
                    setAvailableRooms(0);
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
                        placeholder="09/29"
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
                className="w-full py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
              >
                {isCheckingAvailability ? "Checking..." : "Check Availability"}
              </button>

              {availabilityChecked ? (
                <div
                  className={`mt-2 p-3 rounded text-center font-bold ${isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {isAvailable
                    ? `Available! ${availableRooms} rooms remaining`
                    : "Not enough rooms available"}
                </div>
              ) : null}

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
              <span>Room Price</span>
              <span>
                LKR {Number(roomPrice).toFixed(2)} x {roomsRequested} x {nights}{" "}
                night(s)
              </span>
            </div>
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Taxes</span>
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
                Check availability first
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
