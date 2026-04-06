import { MapPin } from "lucide-react";

interface PlaceCardProps {
  id?: number;
  name: string;
  description: string;
  image?: string;
  onExplore?: (placeId?: number) => void;
}

export function PlaceCard({
  id,
  name,
  description,
  image,
  onExplore,
}: PlaceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col">
      {/* ✅ Show image if provided, fallback to placeholder */}
      <div className="h-48 bg-gray-200 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="text-gray-400" size={48} />
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-primary mb-2">{name}</h3>
        <p className="text-gray-600 text-sm leading-relaxed flex-1">
          {description}
        </p>
        <button
          type="button"
          onClick={() => onExplore?.(id)}
          className="mt-4 text-secondary font-semibold hover:text-primary text-sm uppercase tracking-wide self-start"
        >
          Explore &rarr;
        </button>
      </div>
    </div>
  );
}
