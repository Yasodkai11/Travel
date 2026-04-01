# Travel Services Module


def calculate_budget_remaining(total_budget: float, spent: float) -> float:
    """Calculate remaining budget"""
    return total_budget - spent


def calculate_total_spent(
    food_cost: float, transport_cost: float, hotel_cost: float, activities_cost: float
) -> float:
    """Calculate total spent across all categories"""
    return food_cost + transport_cost + hotel_cost + activities_cost


def calculate_hotel_stay_duration(check_in, check_out):
    """Calculate the number of nights for a hotel booking"""
    duration = (check_out - check_in).days
    return max(duration, 1)  # At least 1 night


def calculate_train_duration(departure_time, arrival_time):
    """Calculate train journey duration in hours"""
    duration = (arrival_time - departure_time).total_seconds() / 3600
    return round(duration, 2)
