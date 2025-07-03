import requests
import json
import time
import random
import string
from datetime import datetime, timedelta

# Base URL for API
BASE_URL = "http://localhost:8001"

# Test data
def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for _ in range(length))

# Generate unique test data
random_suffix = generate_random_string()
TEST_USER1 = {
    "username": f"testuser_{random_suffix}",
    "email": f"testuser_{random_suffix}@example.com",
    "full_name": "Test User",
    "password": "Password123!"
}

TEST_USER2 = {
    "username": f"renter_{random_suffix}",
    "email": f"renter_{random_suffix}@example.com",
    "full_name": "Renter User",
    "password": "Password123!"
}

TEST_ITEM = {
    "title": "Mountain Bike",
    "description": "High-quality mountain bike for rent, perfect for weekend adventures.",
    "category": "vehicles",
    "price_per_day": 25.50,
    "images": [],
    "location": {
        "type": "Point",
        "coordinates": [-122.4194, 37.7749],  # San Francisco coordinates
        "address": "123 Market St",
        "city": "San Francisco",
        "state": "CA",
        "country": "USA",
        "postal_code": "94103"
    },
    "available_dates": [
        (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d") 
        for i in range(1, 30)
    ]
}

# Test booking data (will be filled during test)
TEST_BOOKING = {
    "item_id": "",  # Will be filled after item creation
    "start_date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
    "end_date": (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d"),
    "total_amount": 0,  # Will be calculated based on item price
    "message": "I would like to rent this bike for a weekend trip."
}

# Test results
test_results = {
    "passed": 0,
    "failed": 0,
    "tests": []
}

def log_test(name, passed, message=""):
    """Log test result"""
    status = "PASSED" if passed else "FAILED"
    print(f"[{status}] {name}: {message}")
    test_results["tests"].append({
        "name": name,
        "passed": passed,
        "message": message
    })
    if passed:
        test_results["passed"] += 1
    else:
        test_results["failed"] += 1

# Test functions
def test_register(user_data):
    """Test user registration"""
    response = requests.post(f"{BASE_URL}/api/auth/register", json=user_data)
    
    if response.status_code == 200:
        data = response.json()
        log_test("User Registration", True, f"Successfully registered user: {user_data['username']}")
        return data
    else:
        log_test("User Registration", False, f"Failed to register user: {response.text}")
        return None

def test_login(email, password):
    """Test user login"""
    login_data = {
        "email": email,
        "password": password
    }
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        log_test("User Login", True, f"Successfully logged in user: {email}")
        return data
    else:
        log_test("User Login", False, f"Failed to login: {response.text}")
        return None

def test_get_current_user(token):
    """Test getting current user info"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        log_test("Get Current User", True, f"Successfully retrieved user info: {data['username']}")
        return data
    else:
        log_test("Get Current User", False, f"Failed to get user info: {response.text}")
        return None

def test_update_profile(token, update_data):
    """Test updating user profile"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(f"{BASE_URL}/api/auth/profile", json=update_data, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        log_test("Update Profile", True, f"Successfully updated profile: {update_data}")
        return data
    else:
        log_test("Update Profile", False, f"Failed to update profile: {response.text}")
        return None

def test_create_item(token, item_data):
    """Test creating an item"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/api/items", json=item_data, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        log_test("Create Item", True, f"Successfully created item: {data['title']}")
        return data
    else:
        log_test("Create Item", False, f"Failed to create item: {response.text}")
        return None

def test_get_items():
    """Test getting all items"""
    response = requests.get(f"{BASE_URL}/api/items")
    
    if response.status_code == 200:
        data = response.json()
        log_test("Get Items", True, f"Successfully retrieved {len(data)} items")
        return data
    else:
        log_test("Get Items", False, f"Failed to get items: {response.text}")
        return None

def test_get_item(item_id):
    """Test getting a specific item"""
    response = requests.get(f"{BASE_URL}/api/items/{item_id}")
    
    if response.status_code == 200:
        data = response.json()
        log_test("Get Item", True, f"Successfully retrieved item: {data['title']}")
        return data
    else:
        log_test("Get Item", False, f"Failed to get item: {response.text}")
        return None

def test_update_item(token, item_id, update_data):
    """Test updating an item"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(f"{BASE_URL}/api/items/{item_id}", json=update_data, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        log_test("Update Item", True, f"Successfully updated item: {data['title']}")
        return data
    else:
        log_test("Update Item", False, f"Failed to update item: {response.text}")
        return None

def test_get_my_items(token):
    """Test getting user's items"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/items/my", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        log_test("Get My Items", True, f"Successfully retrieved {len(data)} user items")
        return data
    else:
        log_test("Get My Items", False, f"Failed to get user items: {response.text}")
        return None

def test_create_booking(token, booking_data):
    """Test creating a booking"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/api/bookings", json=booking_data, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        log_test("Create Booking", True, f"Successfully created booking for item: {booking_data['item_id']}")
        return data
    else:
        log_test("Create Booking", False, f"Failed to create booking: {response.text}")
        return None

def test_get_bookings(token):
    """Test getting user's bookings"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/bookings", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        log_test("Get Bookings", True, f"Successfully retrieved {len(data)} bookings")
        return data
    else:
        log_test("Get Bookings", False, f"Failed to get bookings: {response.text}")
        return None

def test_update_booking(token, booking_id, update_data):
    """Test updating a booking status"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(f"{BASE_URL}/api/bookings/{booking_id}", json=update_data, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        log_test("Update Booking", True, f"Successfully updated booking status to: {update_data['status']}")
        return data
    else:
        log_test("Update Booking", False, f"Failed to update booking: {response.text}")
        return None

def run_tests():
    """Run all tests in sequence"""
    print("\n===== STARTING API TESTS =====\n")
    
    # 1. Register first user (item owner)
    owner_data = test_register(TEST_USER1)
    if not owner_data:
        print("Cannot continue tests without user registration")
        return
    
    owner_token = owner_data["access_token"]
    
    # 2. Register second user (renter)
    renter_data = test_register(TEST_USER2)
    if not renter_data:
        print("Cannot continue tests without second user registration")
        return
    
    renter_token = renter_data["access_token"]
    
    # 3. Login as owner
    login_data = test_login(TEST_USER1["email"], TEST_USER1["password"])
    if login_data:
        owner_token = login_data["access_token"]
    
    # 4. Get owner user info
    owner_info = test_get_current_user(owner_token)
    
    # 5. Update owner profile
    profile_update = {
        "bio": "I love outdoor activities and sharing my equipment with others.",
        "phone": "555-123-4567"
    }
    updated_profile = test_update_profile(owner_token, profile_update)
    
    # 6. Create an item as owner
    item_data = test_create_item(owner_token, TEST_ITEM)
    if not item_data:
        print("Cannot continue tests without item creation")
        return
    
    item_id = item_data["id"]
    
    # 7. Get all items
    all_items = test_get_items()
    
    # 8. Get specific item
    specific_item = test_get_item(item_id)
    
    # 9. Update item
    item_update = {
        "title": "Premium Mountain Bike",
        "description": "Upgraded description: High-quality mountain bike for rent, perfect for weekend adventures and trail riding."
    }
    updated_item = test_update_item(owner_token, item_id, item_update)
    
    # 10. Get owner's items
    owner_items = test_get_my_items(owner_token)
    
    # 11. Create booking as renter
    TEST_BOOKING["item_id"] = item_id
    TEST_BOOKING["total_amount"] = TEST_ITEM["price_per_day"] * 2  # 2 days rental
    
    booking_data = test_create_booking(renter_token, TEST_BOOKING)
    if not booking_data:
        print("Cannot continue tests without booking creation")
        return
    
    booking_id = booking_data["id"]
    
    # 12. Get renter's bookings
    renter_bookings = test_get_bookings(renter_token)
    
    # 13. Get owner's bookings (should include the booking for their item)
    owner_bookings = test_get_bookings(owner_token)
    
    # 14. Update booking status as owner
    booking_update = {
        "status": "approved"
    }
    updated_booking = test_update_booking(owner_token, booking_id, booking_update)
    
    # Print summary
    print("\n===== TEST SUMMARY =====")
    print(f"Total tests: {test_results['passed'] + test_results['failed']}")
    print(f"Passed: {test_results['passed']}")
    print(f"Failed: {test_results['failed']}")
    print("=======================\n")

if __name__ == "__main__":
    run_tests()