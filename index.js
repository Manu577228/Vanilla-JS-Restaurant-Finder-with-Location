document.getElementById('find-restaurants').addEventListener('click', () => {
    const location = document.getElementById('search-input').value.trim();
    if (location) {
        fetchLocationCoordinates(location);
    } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showRestaurantsByPosition, showError);
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

function fetchLocationCoordinates(location) {
    const nominatimEndpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${location}`;

    fetch(nominatimEndpoint)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                fetchRestaurants(lat, lon);
            } else {
                alert('Location not found.');
            }
        })
        .catch(error => {
            console.error('Error fetching location data from Nominatim:', error);
        });
}

function showRestaurantsByPosition(position) {
    const { latitude, longitude } = position.coords;
    fetchRestaurants(latitude, longitude);
}

function fetchRestaurants(latitude, longitude) {
    const overpassEndpoint = `https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=restaurant](around:5000,${latitude},${longitude});out;`;

    fetch(overpassEndpoint)
        .then(response => response.json())
        .then(data => {
            const restaurants = data.elements;
            const restaurantsContainer = document.getElementById('restaurants');
            restaurantsContainer.innerHTML = ''; // Clear previous results

            if (restaurants.length === 0) {
                restaurantsContainer.innerHTML = '<p>No restaurants found nearby.</p>';
                return;
            }

            restaurants.forEach(restaurant => {
                const card = document.createElement('div');
                card.className = 'restaurant-card';

                // Create the card content
                card.innerHTML = `
                    <a href="https://www.openstreetmap.org/?mlat=${restaurant.lat}&mlon=${restaurant.lon}" target="_blank" rel="noopener noreferrer">
                        <h2>${restaurant.tags.name || 'Unnamed Restaurant'}</h2>
                    </a>
                    <p>${restaurant.tags.cuisine || 'Cuisine not specified'}</p>
                    <p>Lat: ${restaurant.lat}, Lon: ${restaurant.lon}</p>
                `;

                // Append the card to the container
                restaurantsContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching data from Overpass API:', error);
        });
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}
