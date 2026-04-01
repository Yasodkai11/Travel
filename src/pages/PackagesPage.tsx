import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

interface PackageApiRecord {
  id: number;
  title: string;
  location: string;
  duration_days: number;
  price: number;
  description: string | null;
}

export function PackagesPage() {
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [packages, setPackages] = useState<PackageApiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadPackages = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch(`${apiBaseUrl}/packages/`);
        const data = await response.json().catch(() => []);

        if (!response.ok) {
          setErrorMessage(data?.detail || "Failed to load holiday packages.");
          return;
        }

        setPackages(Array.isArray(data) ? data : []);
      } catch (error) {
        setErrorMessage(
          "Unable to reach backend. Please ensure API server is running.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPackages();
  }, [apiBaseUrl]);

  const filteredPackages = useMemo(() => {
    const query = destination.trim().toLowerCase();
    if (!query) {
      return packages;
    }

    return packages.filter(
      (pkg) =>
        pkg.location.toLowerCase().includes(query) ||
        pkg.title.toLowerCase().includes(query),
    );
  }, [packages, destination]);

  return (
    <div className="pb-16">
      <div className="bg-primary text-white py-12 text-center">
        <h1 className="text-3xl font-bold tracking-wider uppercase">
          Holiday Packages
        </h1>
        <p className="text-white/70 mt-2">
          Complete travel solutions for your perfect vacation
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-12 border border-gray-100">
          <form
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Source
              </label>
              <input
                type="text"
                name="destination"
                id="destination"
                placeholder="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Destination
              </label>
              <input
                type="text"
                name="package"
                id="package"
                placeholder="Package title"
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
            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              <Search size={18} />
              SEARCH
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-accent pl-4">
            Available Package Bundles
          </h2>

          {isLoading ? (
            <div className="rounded-lg bg-white p-6 text-center text-gray-500 border border-gray-100">
              Loading packages...
            </div>
          ) : null}

          {!isLoading && errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {!isLoading && !errorMessage && filteredPackages.length === 0 ? (
            <div className="rounded-lg bg-white p-6 text-center text-gray-500 border border-gray-100">
              No package bundles match your search.
            </div>
          ) : null}

          {!isLoading &&
            !errorMessage &&
            filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary mb-2">
                      {pkg.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      Location: {pkg.location}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      Duration: {pkg.duration_days} day(s)
                    </p>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {pkg.description ||
                        "Curated package bundle with transportation, stay, and highlights included."}
                    </p>
                  </div>

                  <div className="md:min-w-[210px] md:text-right border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                    <p className="text-2xl font-bold text-primary mb-1">
                      LKR {Number(pkg.price).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">Per package</p>
                    <Link
                      to="/book-package"
                      state={{
                        packageBundle: pkg,
                        preselectedStartDate: travelDate,
                      }}
                      className="inline-flex items-center justify-center w-full rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90"
                    >
                      Book Package
                    </Link>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
