import random
import math


def fuzz_coordinates(lat: float, lng: float, min_meters: int = 50, max_meters: int = 100) -> tuple[float, float]:
    """
    Apply random offset to coordinates for privacy protection.
    
    Args:
        lat: Original latitude
        lng: Original longitude
        min_meters: Minimum offset distance in meters
        max_meters: Maximum offset distance in meters
    
    Returns:
        Tuple of (fuzzed_lat, fuzzed_lng)
    """
    offset_distance = random.uniform(min_meters, max_meters)
    angle = random.uniform(0, 2 * math.pi)
    
    lat_offset = (offset_distance * math.cos(angle)) / 111320
    lng_offset = (offset_distance * math.sin(angle)) / (111320 * math.cos(math.radians(lat)))
    
    fuzzed_lat = lat + lat_offset
    fuzzed_lng = lng + lng_offset
    
    return fuzzed_lat, fuzzed_lng
