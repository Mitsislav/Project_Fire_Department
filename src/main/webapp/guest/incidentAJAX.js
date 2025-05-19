/* POST AN INCIDENT AS A GUEST */

document.getElementById("incidentForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const incidentType = document.getElementById("incident_type").value;
    const description = document.getElementById("description").value;
    const userPhone = document.getElementById("user_phone").value;
    const address = document.getElementById("address").value;
    const municipality = document.getElementById("municipality").value;
    const prefecture = document.getElementById("prefecture").value;

    if (!incidentType || !description || !userPhone || !address || !municipality || !prefecture) {
        alert("Please fill out all the fields.");
        return;
    }

    const apiUrl = `https://nominatim.openstreetmap.org/search?street=${encodeURIComponent(address)}&city=${encodeURIComponent(municipality)}&state=${encodeURIComponent(prefecture)}&country=Greece&format=json`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const lat = data[0].lat;
                const lon = data[0].lon;

                const incidentData = {
                    incident_type: incidentType,
                    description: greekToLatin(description),
                    user_type: "guest",
                    user_phone: userPhone,
                    address: greekToLatin(address),
                    municipality: greekToLatin(municipality),
                    prefecture: greekToLatin(prefecture),
                    lat: lat,
                    lon: lon,
                    status: "submitted",
                    danger: "unknown"
                };

                fetch("http://localhost:4567/incident", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(incidentData),
                })
                    .then(response => {
                        if (response.ok) {
                            clearReportIncident();
                            return response.json();
                        } else {
                            throw new Error("Failed to submit incident.");
                        }
                    })
                    .then(data => {
                        alert(data.message);
                    })
                    .catch(error => {
                        console.error("Error:", error);
                        alert("An error occurred while submitting the incident.");
                    });
            } else {
                alert("Could not determine the location. Please check the address.");
            }
        })
        .catch(error => {
            console.error("Error fetching location:", error);
            alert("An error occurred while fetching the location.");
        });
});

function greekToLatin(text) {
    const map = {
        'Ά': 'A', 'Έ': 'E', 'Ή': 'H', 'Ί': 'I', 'Ό': 'O', 'Ύ': 'Y', 'Ώ': 'O',
        'ά': 'a', 'έ': 'e', 'ή': 'h', 'ί': 'i', 'ό': 'o', 'ύ': 'y', 'ώ': 'o',
        'Ϊ': 'I', 'Ϋ': 'Y', 'ϊ': 'i', 'ϋ': 'y', 'ΐ': 'i', 'ΰ': 'y',
        'Α': 'A', 'Β': 'B', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z',
        'Η': 'H', 'Θ': 'Th', 'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M',
        'Ν': 'N', 'Ξ': 'X', 'Ο': 'O', 'Π': 'P', 'Ρ': 'R', 'Σ': 'S',
        'Τ': 'T', 'Υ': 'Y', 'Φ': 'F', 'Χ': 'Ch', 'Ψ': 'Ps', 'Ω': 'O',
        'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z',
        'η': 'h', 'θ': 'th', 'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm',
        'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's',
        'ς': 's', 'τ': 't', 'υ': 'y', 'φ': 'f', 'χ': 'ch', 'ψ': 'ps',
        'ω': 'o'
    };

    return text.split('').map(char => map[char] || char).join('');
}

function clearReportIncident(){
    document.getElementById("incident_type").value = "";
    document.getElementById("description").value = "";
    document.getElementById("user_phone").value = "";
    document.getElementById("address").value = "";
    document.getElementById("municipality").value = "";
    document.getElementById("prefecture").value = "";
}
