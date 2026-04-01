import React, { memo } from "react";
import { Link } from "react-router-dom";
import { Hotel, MapPin, Package, Train } from "lucide-react";
export function HomePage() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 z-10">
            <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-accent font-semibold text-sm tracking-wide uppercase">
              Best Travel Services
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Visit your dream <span className="text-secondary">places</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-lg">
              Choose from multiple premium travel packages. We make your journey
              memorable with the best deals and services.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/register"
                className="px-8 py-3 bg-accent text-charcoal font-bold rounded-lg hover:bg-accent/90 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Sign Up
              </Link>
              <Link
                to="/packages"
                className="px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition border border-white/20"
              >
                View Packages
              </Link>
            </div>
          </div>

          <div className="relative lg:h-[500px] flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm p-8 overflow-hidden">
            <img
              src="/src/assets/images/home/homeImg.jpg"
              alt="Travel Illustration"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Package,
              title: "PACKAGES",
              desc: "Get customized packages",
              link: "/packages",
              color: "bg-blue-500",
            },
            {
              icon: Train,
              title: "TRAINS",
              desc: "Book scenic train rides across Sri Lanka",
              link: "/trains",
              color: "bg-sky-500",
            },
            {
              icon: Hotel,
              title: "HOTELS",
              desc: "Get exciting deals on hotels",
              link: "/hotels",
              color: "bg-indigo-500",
            },
            {
              icon: MapPin,
              title: "PLACES",
              desc: "Famous places & getaways",
              link: "/places",
              color: "bg-teal-500",
            },
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.link}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group border border-gray-100"
            >
              <div
                className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
              >
                <item.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-secondary font-semibold tracking-wider uppercase text-sm">
          Services
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-primary mt-2 mb-4">
          Explore Our Travel Services
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-12">
          We provide comprehensive travel solutions including flight bookings,
          hotel reservations, and complete holiday packages tailored to your
          needs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Package,
              title: "Exclusive Packages",
              desc: "Tailored holiday experiences for families, couples, and solo travelers.",
            },
            {
              icon: Train,
              title: "Train Journeys",
              desc: "Experience scenic railway routes across Sri Lanka with comfortable and affordable train services.",
            },
            {
              icon: Hotel,
              title: "Luxurious Hotels",
              desc: "Handpicked hotels ranging from budget-friendly to 5-star luxury resorts.",
            },
          ].map((service, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-secondary/30 transition-colors"
            >
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                <service.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
