/* if someone wants to register redirect to the index.html */

document.getElementById("register").addEventListener("click", function () {
    window.location.href = "index.html";
});

/* submit the login page */
let tempLat ; let tempLon;

document.getElementById("login").addEventListener("click",function (event) {
    event.preventDefault();

    /* getting values from form input fields */
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    /* getting the document field from the error login */
    const errorElement = document.getElementById("loginError");

    if(username.length > 0 && password.length > 0){
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function (){
            if(this.readyState === 4 && this.status === 200){
                const response = JSON.parse(this.responseText);
                if(response.success){
                    /* user is logged in now and needs to hide the login section and appear the logged one */
                    document.getElementById("login_section").style.display = "none";
                    document.getElementById("logged_section").style.display = "block";
                    document.getElementById("close_incidents_section").style.display="block";
                    document.getElementById("newIncidentContainer").style.display="block";
                    /* getting the values of the fields from the response of servlet */
                    document.getElementById("usernameF").value = response.username;
                    document.getElementById("firstnameF").value = response.firstname;
                    document.getElementById("lastnameF").value = response.lastname;
                    document.getElementById("emailF").value = response.email;
                    document.getElementById("passwordF").value = response.password;
                    document.getElementById("birthdateF").value = response.birthdate;
                    document.getElementById("genderF").value = response.gender;
                    document.getElementById("afmF").value = response.afm;
                    document.getElementById("countryF").value = response.country;
                    document.getElementById("addressF").value = response.address;
                    document.getElementById("municipalityF").value = response.municipality;
                    document.getElementById("prefectureF").value = response.prefecture;
                    document.getElementById("jobF").value = response.job;
                    document.getElementById("telephoneF").value = response.telephone;
                    tempLat=response.lat;
                    tempLon=response.lon;

                    //localStorage.setItem("tempLat", tempLat);
                    //localStorage.setItem("tempLon", tempLon);

                    loadIncidents();
                    getAllIncidents().then(r => getCloseIncidents());

                }else{
                    errorElement.textContent = "Invalid username or password.";
                }
            }else if (this.readyState === 4){
                errorElement.textContent = "Error during login. Please try again.";
                console.error(`Error checking login:`, this.statusText);
            }
        };
        xhttp.open("GET", `http://localhost:8081/project2025_war_exploded/LoginServlet?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, true);
        xhttp.send();
    }else{
        errorElement.textContent = "Please fill in both username and password.";
    }
})

/* clearing the previous spans */

document.getElementById("username").addEventListener("input", function (){
    const errorElement = document.getElementById("loginError");
    errorElement.textContent = "";
})
document.getElementById("password").addEventListener("input", function (){
    const errorElement = document.getElementById("loginError");
    errorElement.textContent = "";
})

/* to update the information about the logged-in user */

document.getElementById("update").addEventListener("click", function (event) {
    event.preventDefault();

    const form = document.getElementById("profileForm");

    if (!form.checkValidity()) {
        alert("Fill out all fields correctly!");
        form.reportValidity();
        return;
    }

    const address = greekToLatin(document.getElementById("addressF").value);

    getUserIdFromServer(function () {

        getLatLonFromAddress(address, function (lat, lon) {
            if (!lat || !lon) {
                alert("Error: Unable to retrieve location for the given address.");
                return;
            }

            const data = {
                username: document.getElementById("usernameF").value,
                firstname: greekToLatin(document.getElementById("firstnameF").value),
                lastname: greekToLatin(document.getElementById("lastnameF").value),
                email: document.getElementById("emailF").value,
                password: greekToLatin(document.getElementById("passwordF").value),
                birthdate: document.getElementById("birthdateF").value,
                gender: document.getElementById("genderF").value,
                afm: document.getElementById("afmF").value,
                country: document.getElementById("countryF").value,
                address: address,
                municipality: greekToLatin(document.getElementById("municipalityF").value),
                prefecture: greekToLatin(document.getElementById("prefectureF").value),
                job: greekToLatin(document.getElementById("jobF").value),
                telephone: document.getElementById("telephoneF").value,
                lat: lat,
                lon: lon
            };

            const jsonData = JSON.stringify(data);

            const xhr = new XMLHttpRequest();
            xhr.open("POST", "http://localhost:8081/project2025_war_exploded/LoginServlet", true);
            xhr.setRequestHeader("Content-Type", "application/json");

            xhr.onload = function () {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        alert(response.message);
                        location.reload();
                    } else {
                        alert("Error: " + response.message);
                    }
                } else {
                    alert("Error: " + xhr.status + " " + xhr.statusText);
                }
            };

            xhr.onerror = function () {
                alert("Request failed. Unable to connect to the server.");
            };

            xhr.send(jsonData);
        });
    });
});


function getUserIdFromServer(callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:8081/project2025_war_exploded/CookieServlet", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.loggedIn && response.data) {
                try {
                    const userData = JSON.parse(response.data);
                    callback(userData.username);
                } catch (error) {
                    console.error("Error parsing userData:", error);
                    callback(null);
                }
            } else {
                console.warn("User not logged in or missing data!");
                callback(null);
            }
        } else {
            console.error("Failed to fetch UserData. Server response:", xhr.status);
            callback(null);
        }
    };

    xhr.onerror = function () {
        console.error("Error while making request to CookieServlet");
        callback(null);
    };

    xhr.send();
}

function getLatLonFromAddress(address, callback) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);
                if (data.length > 0) {
                    const lat = data[0].lat;
                    const lon = data[0].lon;
                    callback(lat, lon);
                } else {
                    console.warn("No results found for address:", address);
                    callback(null, null);
                }
            } catch (error) {
                console.error("Error parsing response:", error);
                callback(null, null);
            }
        } else {
            console.error("Failed to fetch geolocation:", xhr.statusText);
            callback(null, null);
        }
    };

    xhr.onerror = function () {
        console.error("Request failed.");
        callback(null, null);
    };

    xhr.send();
}

/* */

/* converting the greek words into latin through the table mapping */
function greekToLatin(text){
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

/* logout button event listener for disconnect */

document.getElementById("logout").addEventListener("click", function (){

    document.getElementById("profileForm").reset();

    /* hide this section */
    document.getElementById("logged_section").style.display = "none";
    document.getElementById("incidents_section").style.display="none";
    document.getElementById("close_incidents_section").style.display="none";
    document.getElementById("newIncidentContainer").style.display="none";
    /* appear the login section again */
    document.getElementById("login_section").style.display = "block";

});

/* Cookie Handling */

document.addEventListener("DOMContentLoaded",function (){

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            const response = JSON.parse(this.responseText);
            if (response.loggedIn) {
                document.getElementById("login_section").style.display = "none";
                document.getElementById("logged_section").style.display = "block";
                document.getElementById("close_incidents_section").style.display="block";
                document.getElementById("newIncidentContainer").style.display="block";
                /* user data */
                document.getElementById("usernameF").value = response.data.username;
                document.getElementById("firstnameF").value = response.data.firstname;
                document.getElementById("lastnameF").value = response.data.lastname;
                document.getElementById("emailF").value = response.data.email;
                document.getElementById("passwordF").value = response.data.password;
                document.getElementById("birthdateF").value = response.data.birthdate;
                document.getElementById("genderF").value = response.data.gender;
                document.getElementById("afmF").value = response.data.afm;
                document.getElementById("countryF").value = response.data.country;
                document.getElementById("addressF").value = response.data.address;
                document.getElementById("municipalityF").value = response.data.municipality;
                document.getElementById("prefectureF").value = response.data.prefecture;
                document.getElementById("jobF").value = response.data.job;
                document.getElementById("telephoneF").value = response.data.telephone;

                loadIncidents();

                loadIncidents();
                getAllIncidents().then(r => getCloseIncidents());
            } else {
                document.getElementById("login_section").style.display = "block";
                document.getElementById("logged_section").style.display = "none";
            }
        }
    };
    xhttp.open("GET", "http://localhost:8081/project2025_war_exploded/CookieServlet", true);
    xhttp.send();
});

/* deleting cookie at log out */

document.getElementById("logout").addEventListener("click", function (){
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            const response = JSON.parse(this.responseText);
            if (response.success) {
                document.getElementById("login_section").style.display = "block";
                document.getElementById("logged_section").style.display = "none";
                document.getElementById("incidents_section").style.display="none";

                closeChat();
            }
        }
    };
    xhttp.open("POST", "http://localhost:8081/project2025_war_exploded/CookieServlet", true);
    xhttp.send();
});

let isEmailValid = false;    /* Initial state of valid email */

/* checking for duplicates in logged in page where user update his info */

document.getElementById("emailF").addEventListener("input", function () {
    checkDuplicateUP("email", this.value, "emailError");
});

/* function use the CheckDuplicateServlet */
function checkDuplicateUP(field,value,errorElementID){
    const errorElement=document.getElementById(errorElementID);
    const userType="user";

    if(value.length > 0){
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if(this.readyState === 4 && this.status === 200){
                const response = JSON.parse(this.responseText);
                if (response.duplicate) {
                    errorElement.textContent = `${field} is already taken.`;
                    isEmailValid=false;
                } else {
                    errorElement.textContent = "";
                    isEmailValid=true;
                }
            }else if (this.readyState === 4){
                errorElement.textContent = "Error checking for duplicates.";
                console.error(`Error checking ${field}:`, this.statusText);
                isEmailValid=false;
            }
            updateUP();
        };
        xhttp.open("GET", `http://localhost:8081/project2025_war_exploded/CheckDuplicateServlet?field=${encodeURIComponent(field)}&value=${encodeURIComponent(value)}&userType=${encodeURIComponent(userType)}`, true);
        xhttp.send();
    }else{
        errorElement.textContent = ""; /* clear the span*/
        isEmailValid=false;
        updateUP();
    }
}
function updateUP(){
    const updateBtn = document.getElementById("update");
    updateBtn.disabled = !(isEmailValid);
}

/* load all incidents */

function loadIncidents() {
    document.getElementById("incidents_section").style.display="block";

    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:8081/project2025_war_exploded/IncidentServlet", true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const incidents = JSON.parse(xhr.responseText);
            displayIncidents(incidents);
        } else {
            alert("Failed to fetch incidents.");
        }
    };

    xhr.onerror = function () {
        console.error("Error fetching incidents.");
    };

    xhr.send();
}

/* display all running incidents */

function displayIncidents(incidents) {
    const tableBody = document.querySelector("#incidents_table tbody");
    tableBody.innerHTML = "";

    const runningIncidents = incidents.filter(incident => incident.status === "running");

    runningIncidents.forEach(incident => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${incident.incident_type}</td>
            <td>${incident.description}</td>
            <td>${incident.danger}</td>
            <td>${incident.address}</td>
            <td>${incident.start_datetime}</td>
            <td>${incident.user_phone!=="null" ? incident.user_phone : "Not Available"}</td>
            <td>
                <button class="send-message-btn" data-id="${incident.incident_id}">Send Message</button>
            </td>
        `;

        tableBody.appendChild(row);

        const sendMessageBtn = row.querySelector(".send-message-btn");
        sendMessageBtn.addEventListener("click", function () {
            openChat(incident.incident_id);
        });
    });
}

/* open message chat */

function openChat(incidentId) {
    const chatSection = document.getElementById("chat_section");
    const chatIncidentId = document.getElementById("chat_incident_id");
    const chatMessages = document.getElementById("chat_messages");

    chatIncidentId.value = incidentId;
    chatMessages.innerHTML = "";
    let username = document.getElementById("usernameF").value;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost:8081/project2025_war_exploded/MessageServlet?incident_id=${encodeURIComponent(incidentId)}&username=${encodeURIComponent(username)}`, true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const messages = JSON.parse(xhr.responseText);
            console.log(messages);
            messages.forEach(message => {
                const messageDiv = document.createElement("div");
                messageDiv.style.marginBottom = "10px";

                if (message.sender === document.getElementById("usernameF").value) {
                    messageDiv.style.textAlign = "right";
                    messageDiv.style.color = "blue";
                    messageDiv.innerHTML = `<strong>You to ${message.recipient}::</strong> ${message.message} <br><small>${message.date_time}</small>`;
                }
                else if (message.recipient === document.getElementById("usernameF").value ||
                message.recipient==="public") {

                    messageDiv.style.textAlign = "left";
                    messageDiv.style.color = "green";
                    messageDiv.innerHTML = `<strong>${message.sender} to ${message.recipient}:</strong> ${message.message} <br><small>${message.date_time}</small>`;
                }

                chatMessages.appendChild(messageDiv);
            });
        } else {
            alert("Failed to load messages.");
        }
    };

    xhr.onerror = function () {
        console.error("Error fetching messages.");
    };

    xhr.send();

    document.getElementById("chat_section").style.display = "block";
}

/* close chat */

function closeChat() {
    const chatSection = document.getElementById("chat_section");
    chatSection.style.display = "none";
}

/* post the new message for the current incident */

document.getElementById("chat_form").addEventListener("submit", function (event) {
    event.preventDefault();

    const messageContent = document.getElementById("chat_message").value;
    const incidentId = document.getElementById("chat_incident_id").value;

    const data = {
        incident_id: incidentId,
        message: messageContent,
        sender: document.getElementById("usernameF").value,
        recipient: document.getElementById("recipient_select").value
    };

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8081/project2025_war_exploded/MessageServlet", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        if (xhr.status === 201) {
            document.getElementById("chat_message").value = "";
            openChat(incidentId); /* refresh the chat */
        } else {
            alert("Failed to send message.");
        }
    };

    xhr.onerror = function () {
        console.error("Error sending message.");
    };

    xhr.send(JSON.stringify(data));
});

/* close events */

function getCloseIncidents() {
    if (!incidentCoordinates || incidentCoordinates.length === 0) {
        console.error("No incident coordinates available. Ensure getAllIncidents() runs first.");
        return;
    }

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                const response = JSON.parse(this.responseText);
                console.log("CookieServlet Response:", response);

                const tempLat = localStorage.getItem("tempLat");
                const tempLon = localStorage.getItem("tempLon");

                if (response.lat && response.lon) {
                    let lat = parseFloat(response.lat);
                    let lon = parseFloat(response.lon);
                    console.log("Retrieved User Location:", lat, lon);

                    let destinations = incidentCoordinates.map(inc => `${inc.lat},${inc.lon}`).join(";");
                    let url = `https://trueway-matrix.p.rapidapi.com/CalculateDrivingMatrix?origins=${lat},${lon}&destinations=${destinations}`;

                    let xhr = new XMLHttpRequest();
                    xhr.open('GET', url);
                    xhr.setRequestHeader('x-rapidapi-key', '5d7e327471msh102de60bf3e4d03p1393b3jsnf62f4f5fb09f');
                    xhr.setRequestHeader('x-rapidapi-host', 'trueway-matrix.p.rapidapi.com');

                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                let distanceResponse = JSON.parse(xhr.responseText);
                                console.log("Distance Matrix Response:", distanceResponse);
                                filterAndDisplayIncidents(distanceResponse);
                            } else {
                                console.error("Error fetching distance matrix:", xhr.statusText);
                            }
                        }
                    };
                    xhr.send();
                }else if(tempLat && tempLon ){
                    let destinations = incidentCoordinates.map(inc => `${inc.lat},${inc.lon}`).join(";");
                    let url = `https://trueway-matrix.p.rapidapi.com/CalculateDrivingMatrix?origins=${tempLat},${tempLon}&destinations=${destinations}`;

                    let xhr = new XMLHttpRequest();
                    xhr.open('GET', url);
                    xhr.setRequestHeader('x-rapidapi-key', '5d7e327471msh102de60bf3e4d03p1393b3jsnf62f4f5fb09f');
                    xhr.setRequestHeader('x-rapidapi-host', 'trueway-matrix.p.rapidapi.com');

                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200) {
                                let distanceResponse = JSON.parse(xhr.responseText);
                                console.log("Distance Matrix Response:", distanceResponse);
                                filterAndDisplayIncidents(distanceResponse);
                            } else {
                                console.error("Error fetching distance matrix:", xhr.statusText);
                            }
                        }
                    };
                    xhr.send();
                }else{
                    console.error("Could not retrieve location from servlet.");
                }
            } else {
                console.error("Error retrieving location from servlet:", this.statusText);
            }
        }
    };
    xhttp.open("GET", "http://localhost:8081/project2025_war_exploded/CookieServlet", true);
    xhttp.send();
}

function getAllIncidents() {
    return new Promise((resolve, reject) => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const incidents = JSON.parse(this.responseText);
                    incidentCoordinates = incidents.map(incident => ({
                        id: incident.incident_id,
                        type: incident.incident_type,
                        description: incident.description,
                        startDateTime: incident.start_datetime,
                        address: incident.address,
                        municipality: incident.municipality,
                        prefecture: incident.prefecture,
                        lat: parseFloat(incident.lat),
                        lon: parseFloat(incident.lon)
                    }));
                    console.log("Incident Coordinates:", incidentCoordinates);
                    resolve(); // Resolve to ensure function completes before proceeding
                } else {
                    console.error("Error retrieving incidents:", this.statusText);
                    reject();
                }
            }
        };
        xhttp.open("GET", "http://localhost:8081/project2025_war_exploded/RunningIncidentsUserServlet", true);
        xhttp.send();
    });
}

function filterAndDisplayIncidents(distanceResponse) {
    const maxDistance = 30000;
    const tableBody = document.querySelector("#incidentTable tbody");

    if (!tableBody)
    {
        console.error("Incident table not found!");
        return;
    }

    tableBody.innerHTML = "";

    let foundCloseIncident = false;

    if (distanceResponse.distances && distanceResponse.distances.length > 0) {
        console.log("Filtering distances...");

        distanceResponse.distances[0].forEach((distance, index) => {
            console.log(`Incident ${incidentCoordinates[index].id} is ${distance} meters away`);

            if (distance <= maxDistance) {
                foundCloseIncident = true;
                let incident = incidentCoordinates[index];

                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${incident.id}</td>
                    <td>${incident.type}</td>
                    <td>${incident.description}</td>
                    <td>${incident.startDateTime || "N/A"}</td>
                    <td>${incident.address}</td>
                    <td>${distance} m</td>
                `;
                tableBody.appendChild(row);
            }
        });
    }

    if (!foundCloseIncident){
        let row = document.createElement("tr");
        let cell = row.insertCell(0);
        cell.colSpan = 8;
        cell.textContent = "No nearby incidents found within 30 meters.";
        cell.style.textAlign = "center";
        tableBody.appendChild(row);
    }
}

/* report a new incident as a user */

const manicipalityOptions={
    "Heraklion": [
        { text: "Ηράκλειο", value: "Δήμος Ηρακλείου" },
        { text: "Μαλεβιζίου", value: "Δήμος Μαλεβιζίου" },
        { text: "Φαιστού", value: "Δήμος Φαιστού" },
        { text: "Αρχανών", value: "Δήμος Αρχανών-Αστερουσίων" },
        { text: "Μίνωα Πεδιάδος", value: "Δήμος Μίνωα Πεδιάδος" },
        { text: "Χερσόνησος", value: "Δήμος Χερσονήσου" },
        { text: "Γόρτυνα", value: "Δήμος Γόρτυνας" },
        { text: "Βιάννου", value: "Δήμος Βιάννου" }
    ],
    "Chania": [
        { text: "Χανιά", value: "Δήμος Χανίων" },
        { text: "Πλατανιάς", value: "Δήμος Πλατανιά" },
        { text: "Αποκόρωνας", value: "Δήμος Αποκορώνου" },
        { text: "Κίσσαμος", value: "Δήμος Κισσάμου" },
        { text: "Κάντανος - Σελίνου", value: "Δήμος Καντάνου-Σελίνου" },
        { text: "Σφακιά", value: "Δήμος Σφακίων" }
    ],
    "Rethymnon": [
        { text: "Μυλοπόταμος", value: "Δήμος Μυλοποτάμου" },
        { text: "Αμάρι", value: "Δήμος Αμάριου" },
        { text: "Άγιος Βασίλειος", value: "Δήμος Αγίου Βασιλείου" },
        { text: "Ανώγεια", value: "Δήμος Ανωγείων" },
        { text: "Ρέθυμνο", value: "Δήμος Ρεθύμνης" }
    ],
    "Lasithi": [
        { text: "Λασίθι", value: "Δήμος Λασιθίου" },
        { text: "Άγιος Νικόλαος", value: "Δήμος Αγίου Νικολάου" },
        { text: "Ιεράπετρα", value: "Δήμος Ιεράπετρας" },
        { text: "Σητεία", value: "Δήμος Σητείας" },
        { text: "Οροπέδιο Λασιθίου", value: "Δήμος Οροπεδίου Λασιθίου" }
    ]
};

function updateMunicipality(){
    const prefectureSelect = document.getElementById("newPrefecture");
    const selectedPrefecture = prefectureSelect.value;

    console.log("Selected Prefecture: ", selectedPrefecture);

    /* if the selection of the prefecture changes, then the selections from
     the previous drop down must be deleted*/

    const municipalitySelect = document.getElementById("newMunicipality");
    municipalitySelect.innerHTML = '<option value="" disabled selected>Select Municipality</option>';

    if (selectedPrefecture && manicipalityOptions[selectedPrefecture]) {
        manicipalityOptions[selectedPrefecture].forEach(({ text, value }) => {

            /* dynamic creation of the new option to the manicipality drop down menu*/

            const option = document.createElement("option");
            option.value = value;
            option.textContent = text;
            municipalitySelect.appendChild(option);
        });
    }
}

document.getElementById("newIncidentForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const description = document.getElementById("newDescription").value;
    const danger = document.getElementById("newDanger").value;
    const incidentType = document.getElementById("newIncidentType").value;
    const address = document.getElementById("newAddress").value;
    const phonenumber = document.getElementById("newPhoneNumber").value;
    const municipality = document.getElementById("newMunicipality").value;
    const prefecture = document.getElementById("newPrefecture").value;

    if (!description || !danger || !incidentType || !address || !municipality || !prefecture) {
        alert("Please fill out all required fields.");
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
                    description: greekToLatin(description),
                    danger: danger,
                    incident_type: incidentType,
                    address: greekToLatin(address),
                    municipality: greekToLatin(municipality),
                    prefecture: greekToLatin(prefecture),
                    start_datetime: getFormattedDateTime(),
                    status: "submitted",
                    user_phone: phonenumber,
                    user_type: "user",
                    lat: lat,
                    lon: lon,
                    firemen: 1,
                    vehicles: 1
                };

                fetch("http://localhost:8081/project2025_war_exploded/IncidentServlet", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(incidentData),
                })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            console.log(JSON.stringify(incidentData));
                            throw new Error("Failed to create incident.");
                        }
                    })
                    .then(newIncident => {
                        console.log(newIncident);
                        alert("Incident created successfully!");
                        clearIncidentForm();
                    })
                    .catch(error => {
                        console.error("Error creating incident:", error);
                        alert("An error occurred while creating the incident.");
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

function getFormattedDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


function clearIncidentForm() {
    document.getElementById("newDescription").value = "";
    document.getElementById("newDanger").value = "low"
    document.getElementById("newIncidentType").value = "fire";
    document.getElementById("newAddress").value = "";
}
