"""
Seed script to populate the database with sample data
Run this script after creating the database tables
"""

from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models import (
    UserModel,
    TrainModel,
    TrainBookingModel,
    TrainPaymentModel,
    HotelModel,
    HotelBookingModel,
    HotelPaymentModel,
    PackageModel,
    PackageBookingModel,
    PackagePaymentModel,
    PlaceModel,
)
from app.utils.auth import hash_password

# Create tables
Base.metadata.create_all(bind=engine)

# Get database session
db = SessionLocal()

try:
    # Clear existing data (optional, comment out if you want to keep existing data)
    db.query(PackagePaymentModel).delete()
    db.query(PackageBookingModel).delete()
    db.query(HotelPaymentModel).delete()
    db.query(HotelBookingModel).delete()
    db.query(TrainPaymentModel).delete()
    db.query(TrainBookingModel).delete()
    db.query(UserModel).delete()
    db.query(TrainModel).delete()
    db.query(HotelModel).delete()
    db.query(PackageModel).delete()
    db.query(PlaceModel).delete()

    # Create sample users
    user1 = UserModel(
        name="John Doe",
        email="john@example.com",
        password_hash=hash_password("password123"),
    )

    user2 = UserModel(
        name="Jane Smith",
        email="jane@example.com",
        password_hash=hash_password("password123"),
    )

    db.add(user1)
    db.add(user2)
    db.commit()
    print("✓ Sample users created")

    # Create sample trains
    trains_data = [
        {
            "train_name": "Express 101",
            "departure_station": "Colombo Central",
            "arrival_station": "Kandy Junction",
            "departure_time": datetime.utcnow() + timedelta(days=1, hours=8),
            "arrival_time": datetime.utcnow() + timedelta(days=1, hours=12),
            "price": 2500,
        },
        {
            "train_name": "Morning Express",
            "departure_station": "Colombo Fort",
            "arrival_station": "Galle Station",
            "departure_time": datetime.utcnow() + timedelta(days=2, hours=6),
            "arrival_time": datetime.utcnow() + timedelta(days=2, hours=10),
            "price": 1800,
        },
        {
            "train_name": "Night Express",
            "departure_station": "Colombo Central",
            "arrival_station": "Matara",
            "departure_time": datetime.utcnow() + timedelta(days=3, hours=20),
            "arrival_time": datetime.utcnow() + timedelta(days=4, hours=6),
            "price": 3000,
        },
    ]

    for train_data in trains_data:
        train = TrainModel(**train_data)
        db.add(train)

    db.commit()
    print("✓ Sample trains created")

    # Create sample hotels
    hotels_data = [
        {
            "name": "Luxury Heights Hotel",
            "location": "Colombo",
            "price_per_night": 12000,
            "rating": 4.8,
            "description": "A premium 5-star hotel with world-class amenities and exceptional service",
        },
        {
            "name": "Sea View Resort",
            "location": "Galle",
            "price_per_night": 8500,
            "rating": 4.5,
            "description": "Beachfront resort with stunning ocean views and water sports facilities",
        },
        {
            "name": "Mountain Paradise Hotel",
            "location": "Kandy",
            "price_per_night": 6000,
            "rating": 4.3,
            "description": "Cozy hotel nestled in the mountains with nature views and hiking trails",
        },
        {
            "name": "Tropical Escape Villa",
            "location": "Mirissa",
            "price_per_night": 7000,
            "rating": 4.6,
            "description": "Charming villa perfect for beach lovers with private pool",
        },
    ]

    for hotel_data in hotels_data:
        hotel = HotelModel(**hotel_data)
        db.add(hotel)

    db.commit()
    print("✓ Sample hotels created")

    # Create sample packages
    packages_data = [
        {
            "title": "Classic Sri Lanka Tour",
            "location": "Nationwide",
            "duration_days": 7,
            "price": 50000,
            "description": "Explore the highlights of Sri Lanka including temples, beaches, and tea plantations",
        },
        {
            "title": "Beach & Beach Relaxation",
            "location": "South Coast",
            "duration_days": 5,
            "price": 35000,
            "description": "Relax on pristine beaches and enjoy water sports at the best beach destinations",
        },
        {
            "title": "Cultural Heritage Tour",
            "location": "Central & North Central",
            "duration_days": 6,
            "price": 45000,
            "description": "Immerse yourself in Sri Lanka's rich cultural heritage and ancient temples",
        },
        {
            "title": "Adventure Seeker Package",
            "location": "Central Highlands",
            "duration_days": 4,
            "price": 40000,
            "description": "Experience trekking, wildlife spotting, and mountain climbing adventures",
        },
    ]

    for package_data in packages_data:
        package = PackageModel(**package_data)
        db.add(package)

    db.commit()
    print("✓ Sample packages created")

    # Create sample places
    places_data = [
        {
            "name": "Sigiriya Rock Fortress",
            "district": "Matale",
            "description": "Ancient rock fortress with historical significance and stunning views",
            "image_url": "https://example.com/sigiriya.jpg",
        },
        {
            "name": "Temple of the Tooth",
            "district": "Kandy",
            "description": "Sacred Buddhist temple housing the tooth relic of Buddha",
            "image_url": "https://example.com/temple.jpg",
        },
        {
            "name": "Mirissa Beach",
            "district": "Matara",
            "description": "Beautiful crescent beach perfect for swimming and whale watching",
            "image_url": "https://example.com/mirissa.jpg",
        },
        {
            "name": "Nuwara Eliya",
            "district": "Nuwara Eliya",
            "description": "Mountain town known as Little England with tea plantations",
            "image_url": "https://example.com/nuwara.jpg",
        },
        {
            "name": "Galle Fort",
            "district": "Galle",
            "description": "UNESCO World Heritage site - historic Portuguese fort",
            "image_url": "https://example.com/galle.jpg",
        },
        {
            "name": "Horton Plains National Park",
            "district": "Nuwara Eliya",
            "description": "Scenic highland national park with trekking trails and wildlife",
            "image_url": "https://example.com/horton.jpg",
        },
        {
            "name": "Adam's Peak",
            "district": "Ratnapura",
            "description": "Sacred mountain peak with pilgrimage route and spiritual significance",
            "image_url": "https://example.com/adams_peak.jpg",
        },
        {
            "name": "Colombo National Museum",
            "district": "Colombo",
            "description": "Leading museum showcasing Sri Lankan art, history and culture",
            "image_url": "https://example.com/museum.jpg",
        },
    ]

    for place_data in places_data:
        place = PlaceModel(**place_data)
        db.add(place)

    db.commit()
    print("✓ Sample places created")

    print("\n✅ Database seeding completed successfully!")
    print("\nSample data created:")
    print(f"  - Users: {db.query(UserModel).count()}")
    print(f"  - Trains: {db.query(TrainModel).count()}")
    print(f"  - Hotels: {db.query(HotelModel).count()}")
    print(f"  - Packages: {db.query(PackageModel).count()}")
    print(f"  - Places: {db.query(PlaceModel).count()}")

    print("\nYou can now login with:")
    print("  Email: john@example.com")
    print("  Password: password123")

except Exception as e:
    db.rollback()
    print(f"❌ Error during seeding: {str(e)}")

finally:
    db.close()
