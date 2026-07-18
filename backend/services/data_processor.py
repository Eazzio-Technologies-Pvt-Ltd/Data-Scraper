'''from services.google_places import get_place_details

TYPE_MAP = {
    "university":        "University",
    "school":            "School",
    "secondary_school":  "School",
    "primary_school":    "School",
    "junior_college":    "College",
    "college":           "College",
    "tutoring_service":  "Coaching Centre",
    "education_center":  "Coaching Centre",
    "training_center":   "Coaching Centre",
    "cafe":              "Cafe",
    "restaurant":        "Restaurant",
    "hospital":          "Hospital",
    "gym":               "Gym",
    "health":            "Healthcare",
    "lodging":           "Hotel",
}

def map_type(google_types: list) -> str:
    for t in google_types:
        if t in TYPE_MAP:
            return TYPE_MAP[t]
    return "Business"

def extract_city(address_components: list) -> str:
    for comp in address_components:
        if "locality" in comp.get("types", []):
            return comp.get("long_name")
    return None

def extract_state(address_components: list) -> str:
    for comp in address_components:
        if "administrative_area_level_1" in comp.get("types", []):
            return comp.get("long_name")
    return None

def extract_pincode(address_components: list) -> str:
    for comp in address_components:
        if "postal_code" in comp.get("types", []):
            pin = comp.get("long_name", "")
            if len(pin) == 6 and pin.isdigit():
                return pin
    return None

def process_results(raw_results: list) -> list:
    processed = []
    for r in raw_results:
        place_id    = r.get("place_id", "")
        components  = r.get("address_components", [])
        details     = get_place_details(place_id) if place_id else {}
        rating_raw  = r.get("rating")
        rating      = round(rating_raw, 1) if rating_raw is not None else None
        business = {
            "place_id":  place_id,
            "name":      (r.get("name") or "").strip(),
            "address":   r.get("formatted_address"),
            "city":      extract_city(components),
            "state":     extract_state(components),
            "pincode":   extract_pincode(components),
            "phone":     details.get("phone"),
            "email":     None,
            "website":   details.get("website"),
            "rating":    rating,
            "type":      map_type(r.get("types", [])),
            "maps_link": f"https://www.google.com/maps/place/?q=place_id:{place_id}" if place_id else None,
        }
        processed.append(business)
    return processed
'''

TYPE_MAP = {
    "university":        "University",
    "school":            "School",
    "college":           "College",
    "coaching":          "Coaching Centre",
    "institute":         "Coaching Centre",
    "tutorial":          "Coaching Centre",
    "cafe":              "Cafe",
    "coffee":            "Cafe",
    "restaurant":        "Restaurant",
    "hospital":          "Hospital",
    "gym":               "Gym",
    "fitness":           "Gym",
    "hotel":             "Hotel",
    "lodge":             "Hotel",
}

def map_type(type_str: str) -> str:
    if not type_str:
        return "Business"
    type_lower = type_str.lower()
    for key, val in TYPE_MAP.items():
        if key in type_lower:
            return val
    return "Business"

def process_results(raw_results: list) -> list:
    processed = []
    for r in raw_results:
        address = r.get("address", "")
        
        # SerpAPI gives us parsed address parts directly
        # Try to get city from address smartly
        city = extract_city_from_serpapi(r)
        
        rating = r.get("rating")
        if rating:
            try:
                rating = round(float(rating), 1)
            except:
                rating = None

        business = {
            "place_id":  r.get("place_id", ""),
            "name":      (r.get("title") or "").strip(),
            "address":   address,
            "city":      city,
            "state":     extract_state_from_address(address),
            "pincode":   extract_pincode_from_address(address),
            "phone":     r.get("phone"),
            "email":     None,
            "website":   r.get("website"),
            "rating":    rating,
            "type":      map_type(r.get("type", "")),
            "maps_link": r.get("links", {}).get("directions") or
                         f"https://www.google.com/maps/search/?q={r.get('title','').replace(' ','+')}",
        }
        processed.append(business)
    return processed

def extract_city_from_address(address: str) -> str:
    if not address:
        return None
    
    parts = [p.strip() for p in address.split(",")]
    
    # Filter out these useless parts
    skip_keywords = [
        "india", "road", "rd", "nagar", "colony", "sector",
        "floor", "building", "plot", "near", "opp", "opposite",
        "block", "phase", "area", "layout", "extension"
    ]
    
    cleaned = []
    for part in parts:
        part = part.strip()
        # Skip blank, India, pincode, state+pincode combos
        if not part:
            continue
        if part.lower() == "india":
            continue
        # Skip if contains 6-digit pincode
        import re
        if re.search(r'\b\d{6}\b', part):
            # Try to extract just the state name without pincode
            clean = re.sub(r'\d+', '', part).strip()
            if clean and len(clean) > 2:
                continue  # this is state line, skip
            continue
        # Skip plus codes like "C8X7+CXR"
        if re.search(r'[A-Z0-9]{4}\+[A-Z0-9]{2,}', part):
            continue
        # Skip if too short
        if len(part) <= 2:
            continue
        # Skip known road/street patterns
        if any(kw in part.lower() for kw in skip_keywords):
            continue
            
        cleaned.append(part)
    
    # City is usually 3rd or 4th from end in Indian addresses
    # Format: "Street, Area, City, State Pincode, India"
    if len(cleaned) >= 2:
        return cleaned[-2]  # second last cleaned part = city
    elif len(cleaned) == 1:
        return cleaned[0]
    
    return None

def extract_state_from_address(address: str) -> str:
    if not address:
        return None
    parts = [p.strip() for p in address.split(",")]
    if len(parts) >= 2:
        # State + pincode usually in last-1 part
        part = parts[-2].strip()
        # Remove pincode if present
        words = part.split()
        state_words = [w for w in words if not w.isdigit()]
        return " ".join(state_words) if state_words else None
    return None

def extract_pincode_from_address(address: str) -> str:
    if not address:
        return None
    import re
    match = re.search(r'\b\d{6}\b', address)
    return match.group() if match else None

def extract_city_from_serpapi(result: dict) -> str:
    """
    SerpAPI address format (India):
    "Street/Area, Locality, City, State Pincode, India"
    City is usually the part just before "State Pincode, India"
    """
    address = result.get("address", "")
    if not address:
        return None
    
    import re
    
    # Split by comma
    parts = [p.strip() for p in address.split(",")]
    
    # Remove "India" from end
    if parts and parts[-1].strip().lower() == "india":
        parts = parts[:-1]
    
    # Remove "State Pincode" part (e.g. "Jharkhand 835222")
    if parts:
        last = parts[-1].strip()
        # If last part has a 6-digit number, it's "State Pincode"
        if re.search(r'\d{6}', last):
            parts = parts[:-1]
    
    # Now last part should be city
    # But skip plus codes and road names
    skip_patterns = [
        r'^[A-Z0-9]{4}\+[A-Z0-9]+',  # plus codes like C8X7+CXR
        r'\bRd\b', r'\bRoad\b', r'\bNH\s*\d+',  # road names
        r'^\d+',  # starts with number
    ]
    
    # Go from end, find first valid city
    for part in reversed(parts):
        part = part.strip()
        if not part or len(part) < 3:
            continue
        # Skip if matches bad patterns
        is_bad = False
        for pattern in skip_patterns:
            if re.search(pattern, part, re.IGNORECASE):
                is_bad = True
                break
        if not is_bad:
            # Remove any trailing pincode numbers
            clean = re.sub(r'\s*\d{6}\s*', '', part).strip()
            if clean and len(clean) > 2:
                return clean
    
    return None