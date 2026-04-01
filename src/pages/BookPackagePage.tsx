import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface PackageApiRecord {
  id: number;
  title: string;
  location: string;
  duration_days: number;
  price: number;
  description: string | null;
}

type PaymentMethod = "card" | "paypal";

interface PackageBookingWithPaymentResponse {
  booking_id: number;
  package_id: number;
  user_id: number;
  start_date: string;
  travelers_count: number;
  amount: number;
  status: string;
  message: string;
  payment: {
    booking_reference: string;
    transaction_id: string;
    payment_method: PaymentMethod;
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

const toApiDateTime = (dateString: string) => {
  return `${dateString}T00:00:00`;
};

export function BookPackagePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const routeState = location.state as {
    packageBundle?: PackageApiRecord;
    preselectedStartDate?: string;
  } | null;
  const selectedPackage = routeState?.packageBundle;
  const today = formatInputDate(new Date());

  const [startDate, setStartDate] = useState(
    routeState?.preselectedStartDate || today,
  );
  const [travelers, setTravelers] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [bookingReference, setBookingReference] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const packagePrice = selectedPackage?.price ?? 0;
  const taxesAndFees = 150;
  const subtotal = packagePrice * travelers;
  const total = subtotal + taxesAndFees;

  const validateCardPayload = () => {
    if (paymentMethod !== "card") {
      return null;
    }

    if (!/^\d{12,19}$/.test(cardNumber.trim())) {
      return "Please enter a valid card number.";
    }

    if (cardHolder.trim().length < 2) {
      return "Card holder name is required.";
    }

    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry.trim())) {
      return "Expiry must be in MM/YY format.";
    }

    if (!/^\d{3,4}$/.test(cvv.trim())) {
      return "Please enter a valid CVV.";
    }

    return null;
  };

  const handleConfirmBooking = async () => {
    if (!selectedPackage) {
      setErrorMessage("No package selected. Please choose a package first.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      setErrorMessage("Please login first to book this package.");
      return;
    }

    if (!startDate) {
      setErrorMessage("Please select a valid package start date.");
      return;
    }

    const cardValidationError = validateCardPayload();
    if (cardValidationError) {
      setErrorMessage(cardValidationError);
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setBookingReference("");
    setTransactionId("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/packages/book-with-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          package_id: selectedPackage.id,
          start_date: toApiDateTime(startDate),
          travelers_count: travelers,
          payment_method: paymentMethod,
          card_number: paymentMethod === "card" ? cardNumber.trim() : undefined,
          card_holder: paymentMethod === "card" ? cardHolder.trim() : undefined,
          expiry: paymentMethod === "card" ? expiry.trim() : undefined,
          cvv: paymentMethod === "card" ? cvv.trim() : undefined,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | PackageBookingWithPaymentResponse
        | { detail?: string }
        | null;

      if (!response.ok) {
        setErrorMessage(
          (data as { detail?: string } | null)?.detail ||
            "Unable to book package. Please try again.",
        );
        return;
      }

      const successData = data as PackageBookingWithPaymentResponse;
      setBookingReference(successData.payment.booking_reference);
      setTransactionId(successData.payment.transaction_id);

      setSuccessMessage(
        "Payment successful. Package booked successfully. Redirecting to dashboard...",
      );
      window.setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      setErrorMessage(
        "Unable to reach backend. Please ensure API server is running.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedPackage) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
          <h1 className="text-2xl font-bold text-primary mb-3">
            No Package Selected
          </h1>
          <p className="text-gray-600 mb-6">
            Please select a package bundle from the packages page first.
          </p>
          <Link
            to="/packages"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary/90"
          >
            Go to Packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-8 border-b pb-4">
        Confirm Package Booking
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">
              Selected Package Bundle
            </h2>
            <div className="space-y-3">
              <p className="text-xl font-bold text-primary">
                {selectedPackage.title}
              </p>
              <p className="text-sm text-gray-500">
                Location: {selectedPackage.location}
              </p>
              <p className="text-sm text-gray-500">
                Duration: {selectedPackage.duration_days} day(s)
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedPackage.description ||
                  "Curated package bundle with travel, stay, and top attractions included."}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Booking Details</h2>
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Travelers
                </label>
                <input
                  type="number"
                  value={travelers}
                  min={1}
                  max={10}
                  onChange={(e) => {
                    const parsed = Number.parseInt(e.target.value, 10);
                    const safeValue = Number.isNaN(parsed)
                      ? 1
                      : Math.max(1, Math.min(10, parsed));
                    setTravelers(safeValue);
                  }}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="card">Card Payment</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              {paymentMethod === "card" ? (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(e.target.value.replace(/\s/g, ""))
                      }
                      placeholder="1234123412341234"
                      maxLength={19}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Holder
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name on card"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
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
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="md:col-span-2 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                  PayPal selected. Clicking confirm will capture payment and
                  complete your package booking.
                </div>
              )}
            </form>

            {errorMessage ? (
              <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="mt-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {successMessage}
                {bookingReference ? (
                  <div className="mt-2 text-xs text-green-800">
                    Booking Ref: {bookingReference}
                  </div>
                ) : null}
                {transactionId ? (
                  <div className="text-xs text-green-800">
                    Transaction ID: {transactionId}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* Payment Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Package Summary
            </h3>
            <div className="space-y-3 mb-6 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Bundle Price x {travelers}</span>
                <span>LKR {Number(subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees</span>
                <span>LKR {taxesAndFees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Travelers</span>
                <span>{travelers}</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6 flex justify-between font-bold text-2xl text-primary">
              <span>Total</span>
              <span>LKR {total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleConfirmBooking}
              disabled={isSubmitting}
              className="w-full py-4 bg-accent text-charcoal font-bold text-lg rounded-lg hover:bg-accent/90 transition shadow-md transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing Payment..." : "Pay & Confirm Booking"}
            </button>
            <p className="text-xs text-center text-gray-400 mt-4">
              Payment and booking will be saved to your account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
