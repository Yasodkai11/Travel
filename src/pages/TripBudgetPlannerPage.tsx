import React, { useState } from "react";
interface BudgetCategory {
  name: string;
  plannedAmount: number;
  notes: string;
}
export function TripBudgetPlannerPage() {
  // Form State
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [currency, setCurrency] = useState("USD");
  const [totalBudget, setTotalBudget] = useState<number | "">("");
  // Categories State
  const [categories, setCategories] = useState<BudgetCategory[]>([
    {
      name: "Flights / Transport",
      plannedAmount: 0,
      notes: "",
    },
    {
      name: "Accommodation",
      plannedAmount: 0,
      notes: "",
    },
    {
      name: "Food",
      plannedAmount: 0,
      notes: "",
    },
    {
      name: "Local Transport",
      plannedAmount: 0,
      notes: "",
    },
    {
      name: "Activities / Tickets",
      plannedAmount: 0,
      notes: "",
    },
    {
      name: "Shopping",
      plannedAmount: 0,
      notes: "",
    },
    {
      name: "Travel Insurance",
      plannedAmount: 0,
      notes: "",
    },
    {
      name: "Miscellaneous",
      plannedAmount: 0,
      notes: "",
    },
  ]);
  // UI State
  const [showSummary, setShowSummary] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  // Currency Symbols
  const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    LKR: "Rs.",
    INR: "₹",
  };
  const handleCategoryChange = (
    index: number,
    field: keyof BudgetCategory,
    value: string | number,
  ) => {
    const newCategories = [...categories];
    newCategories[index] = {
      ...newCategories[index],
      [field]: value,
    };
    setCategories(newCategories);
  };
  const handleGeneratePlan = async () => {
    const newErrors = [];
    if (!tripName) newErrors.push("Trip Name is required");
    if (!destination) newErrors.push("Destination is required");
    if (!startDate) newErrors.push("Start Date is required");
    if (!endDate) newErrors.push("End Date is required");
    if (!totalBudget) newErrors.push("Total Budget is required");
    if (newErrors.length > 0) {
      setErrors(newErrors);
      setShowSummary(false);
      setSaveError("");
      setSaveMessage("");
    } else {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setErrors([]);
        setSaveError("Please log in to save this budget plan.");
        setSaveMessage("");
        setShowSummary(true);
        return;
      }

      setIsSubmitting(true);
      setSaveError("");
      setSaveMessage("");

      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

      const categoryFieldMap: Record<
        string,
        { amount: string; notes: string }
      > = {
        "Flights / Transport": {
          amount: "flights_transport_amount",
          notes: "flights_transport_notes",
        },
        Accommodation: {
          amount: "accommodation_amount",
          notes: "accommodation_notes",
        },
        Food: { amount: "food_amount", notes: "food_notes" },
        "Local Transport": {
          amount: "local_transport_amount",
          notes: "local_transport_notes",
        },
        "Activities / Tickets": {
          amount: "activities_amount",
          notes: "activities_notes",
        },
        Shopping: { amount: "shopping_amount", notes: "shopping_notes" },
        "Travel Insurance": {
          amount: "insurance_amount",
          notes: "insurance_notes",
        },
        Miscellaneous: { amount: "misc_amount", notes: "misc_notes" },
      };

      const payload: Record<string, string | number | null> = {
        trip_name: tripName,
        total_budget: Number(totalBudget),
        destination,
        start_date: startDate ? `${startDate}T00:00:00` : null,
        end_date: endDate ? `${endDate}T00:00:00` : null,
        travelers,
        currency,
      };

      for (const category of categories) {
        const map = categoryFieldMap[category.name];
        if (map) {
          payload[map.amount] = Number(category.plannedAmount) || 0;
          payload[map.notes] = category.notes || "";
        }
      }

      try {
        const response = await fetch(`${apiBaseUrl}/budget/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.detail || "Failed to save budget plan");
        }

        setSaveMessage(`Budget plan saved successfully. ID: ${result.id}`);
        setSaveError("");
      } catch (error) {
        setSaveMessage("");
        setSaveError(
          error instanceof Error ? error.message : "Failed to save budget plan",
        );
      } finally {
        setIsSubmitting(false);
        setErrors([]);
        setShowSummary(true);
      }
    }
  };
  const handleReset = () => {
    setTripName("");
    setDestination("");
    setStartDate("");
    setEndDate("");
    setTravelers(1);
    setCurrency("USD");
    setTotalBudget("");
    setCategories(
      categories.map((c) => ({
        ...c,
        plannedAmount: 0,
        notes: "",
      })),
    );
    setShowSummary(false);
    setErrors([]);
    setSaveMessage("");
    setSaveError("");
  };
  // Calculations
  const totalPlanned = categories.reduce(
    (sum, cat) => sum + Number(cat.plannedAmount),
    0,
  );
  const remaining = Number(totalBudget) - totalPlanned;
  const perPerson = Number(totalBudget) / travelers;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const perDay = Number(totalBudget) / (diffDays === 0 ? 1 : diffDays);
  return (
    <div className="pb-16">
      {/* Top Band */}
      <div className="bg-primary text-white py-12 text-center mb-8">
        <h1 className="text-3xl font-bold tracking-wider uppercase">
          TRIP BUDGET PLANNER
        </h1>
        <p className="text-white/70 mt-2">
          Plan and manage your travel budget effortlessly
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Trip Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
            <h2 className="text-xl font-bold text-primary mb-6 border-b pb-2">
              Trip Details
            </h2>

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6 text-sm">
                <ul className="list-disc list-inside">
                  {errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="trip_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Trip Name
                </label>
                <input
                  type="text"
                  id="trip_name"
                  name="trip_name"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g. Summer Vacation 2025"
                />
              </div>

              <div>
                <label
                  htmlFor="destination"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Destination
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g. Sri Lanka"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="start_date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    htmlFor="end_date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="travelers"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Travelers
                  </label>
                  <input
                    type="number"
                    id="travelers"
                    name="travelers"
                    min="1"
                    value={travelers}
                    onChange={(e) =>
                      setTravelers(parseInt(e.target.value) || 1)
                    }
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    htmlFor="currency"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="LKR">LKR (Rs.)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="total_budget"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Total Budget
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">
                    {currencySymbols[currency]}
                  </span>
                  <input
                    type="number"
                    id="total_budget"
                    name="total_budget"
                    min="0"
                    value={totalBudget}
                    onChange={(e) =>
                      setTotalBudget(parseFloat(e.target.value) || "")
                    }
                    className="w-full p-2 pl-10 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleGeneratePlan}
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Generate Plan"}
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded hover:bg-gray-300 transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Budget Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-primary">
                Budget Breakdown
              </h2>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-primary text-white uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 w-1/3">Category</th>
                    <th className="px-4 py-3 w-1/4">
                      Planned ({currencySymbols[currency]})
                    </th>
                    <th className="px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {cat.name}
                        <input
                          type="hidden"
                          name={`categories[${idx}][name]`}
                          value={cat.name}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          name={`categories[${idx}][planned_amount]`}
                          value={cat.plannedAmount}
                          onChange={(e) =>
                            handleCategoryChange(
                              idx,
                              "plannedAmount",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-full p-1 border border-gray-200 rounded focus:ring-1 focus:ring-primary text-right"
                          min="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          name={`categories[${idx}][notes]`}
                          value={cat.notes}
                          onChange={(e) =>
                            handleCategoryChange(idx, "notes", e.target.value)
                          }
                          className="w-full p-1 border border-gray-200 rounded focus:ring-1 focus:ring-primary"
                          placeholder="Add notes..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        {showSummary && (
          <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {saveMessage && (
              <div className="mb-4 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {saveMessage}
              </div>
            )}

            {saveError && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {saveError}
              </div>
            )}

            <h2 className="text-xl font-bold text-primary mb-6 border-b border-gray-100 pb-4">
              Budget Summary
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Total Planned
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {currencySymbols[currency]}
                  {totalPlanned.toLocaleString()}
                </p>
              </div>

              <div
                className={`p-4 rounded-lg border ${remaining >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
              >
                <p
                  className={`text-xs font-bold uppercase tracking-wide mb-1 ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  Remaining
                </p>
                <p
                  className={`text-2xl font-bold ${remaining >= 0 ? "text-green-700" : "text-red-700"}`}
                >
                  {currencySymbols[currency]}
                  {remaining.toLocaleString()}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">
                  Per Person
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {currencySymbols[currency]}
                  {perPerson.toFixed(2)}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  {travelers} traveler{travelers > 1 ? "s" : ""}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">
                  Per Day
                </p>
                <p className="text-2xl font-bold text-purple-800">
                  {currencySymbols[currency]}
                  {perDay.toFixed(2)}
                </p>
                <p className="text-xs text-purple-500 mt-1">
                  {Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1} day
                  {diffDays > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
