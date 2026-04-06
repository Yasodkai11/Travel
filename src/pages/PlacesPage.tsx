import { useState } from "react";
import { Search } from "lucide-react";
import { PlaceCard } from "../components/cards/PlaceCard";
import sigiriyaImg from "../assets/images/places/sigiriyaImg.jpg";
import templeImg from "../assets/images/places/templeImg.jpg";
import gallefortImg from "../assets/images/places/gallefortImg.jpg";
import ellaImg from "../assets/images/places/ellaImg.jpg";
import yalaImg from "../assets/images/places/yalaImg.jpg";
import mirissaImg from "../assets/images/places/mirissaImg.jpg";

interface Place {
  id: number;
  name: string;
  description: string;
  image: string;
}

export function PlacesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const places: Place[] = [
    {
      id: 1,
      name: "Sigiriya Rock Fortress",
      description:
        "An ancient rock fortress and palace ruin in the central Matale District, surrounded by the remains of an extensive network of gardens and reservoirs.",
      image: sigiriyaImg,
    },
    {
      id: 2,
      name: "Temple of the Tooth",
      description:
        "A Buddhist temple in Kandy that houses the relic of the tooth of the Buddha, one of the most sacred places of worship in the Buddhist world.",
      image: templeImg,
    },
    {
      id: 3,
      name: "Galle Fort",
      description:
        "A fortification first built by the Portuguese in 1588 on the southwestern tip of Sri Lanka, later extensively fortified by the Dutch during the 17th century.",
      image: gallefortImg,
    },
    {
      id: 4,
      name: "Ella & Nine Arches Bridge",
      description:
        "A stunning viaduct bridge in the hill country of Sri Lanka, surrounded by lush green tea plantations and misty mountains near the charming town of Ella.",
      image: ellaImg,
    },
    {
      id: 5,
      name: "Yala National Park",
      description:
        "Sri Lanka's most visited national park, renowned for having one of the highest leopard densities in the world, along with elephants, crocodiles, and diverse birdlife.",
      image: yalaImg,
    },
    {
      id: 6,
      name: "Mirissa Beach",
      description:
        "A beautiful crescent-shaped beach on the southern coast of Sri Lanka, famous for whale watching, surfing, and breathtaking sunsets.",
      image: mirissaImg,
    },
  ];

  const filteredPlaces = places.filter(
    (place) =>
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleExplore = (placeId?: number) => {
    const place = places.find((p) => p.id === placeId);
    if (!place) {
      return;
    }

    const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, Sri Lanka`)}`;
    window.open(googleMapsSearchUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="pb-16">
      <div className="bg-primary text-white py-12 text-center">
        <h1 className="text-3xl font-bold tracking-wider uppercase">
          Explore Places
        </h1>
        <p className="text-white/70 mt-2">
          Discover beautiful destinations around the world
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-12 border border-gray-100 max-w-2xl mx-auto">
          <form
            className="flex gap-4"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Search City
              </label>
              <input
                type="text"
                name="city"
                id="city"
                placeholder="Enter city name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
              >
                <Search size={18} />
                SEARCH
              </button>
            </div>
          </form>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlaces.length > 0 ? (
            filteredPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                id={place.id}
                name={place.name}
                description={place.description}
                image={place.image}
                onExplore={handleExplore}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p className="text-lg">
                No places found matching "{searchQuery}". Try a different
                search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
