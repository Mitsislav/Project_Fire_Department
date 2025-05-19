// Initialize the map
var map = L.map('map').setView([35.3387, 25.1442], 10); // Default to Crete, Greece

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to fetch incidents from the servlet
async function fetchIncidents() {
    try
    {
        let response = await fetch('http://localhost:8081/project2025_war_exploded/RunningIncidentsGuestServlet'); // Update with your actual servlet path
        let incidents = await response.json();

        incidents.forEach(incident => {
            if (incident.lat && incident.lon)
            {
                L.marker([incident.lat, incident.lon])
                    .addTo(map)
                    .bindPopup(`<b>${incident.incident_type}</b><br>${incident.description}`);
            }
        });
    } catch (error) {
        console.error('Error fetching incidents:', error);
    }
}

// Call the function to load incidents
document.addEventListener('DOMContentLoaded', fetchIncidents);
