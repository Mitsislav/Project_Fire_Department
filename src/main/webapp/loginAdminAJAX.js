/* login as an admin */

document.getElementById("login").addEventListener("click",function (event){
    event.preventDefault();

    /* getting values from form input fields */
    const password = document.getElementById("password").value;

    /* getting the document field from the error login */
    const errorElement = document.getElementById("loginError");

    if(password.length > 0){
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function (){
            if(this.readyState === 4 && this.status === 200){
                const response = JSON.parse(this.responseText);
                if(response.success){
                    /* user is logged in now and needs to hide the login section and appear the logged one */
                    document.getElementById("admin_login_section").style.display = "none";
                    document.getElementById("admin_logged_section").style.display = "block";

                    /* show the information of the admin */
                    document.getElementById("usernameF").value = response.username;
                    document.getElementById("passwordF").value = response.password;

                }else{
                    errorElement.textContent = "Invalid password.";
                }
            }else if (this.readyState === 4){
                errorElement.textContent = "Error during login. Please try again.";
                console.error(`Error checking login:`, this.statusText);
            }
        };
        xhttp.open("GET", `http://localhost:8081/project2025_war_exploded/LoginAdmin?password=${encodeURIComponent(password)}`, true);
        xhttp.send();
    }else{
        errorElement.textContent = "Please fill in both username and password.";
    }
})

/* update the admin password */

document.getElementById("update").addEventListener("click", function (event){
    event.preventDefault();

    /* check if html patterns are valid and correct */

    const form = document.getElementById("profileAdmin");

    if (!form.checkValidity()) {
        alert("Fill out all fields correctly!");
        form.reportValidity();
        return;
    }

    /* taking the new data from the update form */
    const data={
        username: document.getElementById("usernameF").value,
        password: document.getElementById("passwordF").value
    };
    /* stringify them */
    const jsonData = JSON.stringify(data);

    /* and post them to the server through the LoginServlet */
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8081/project2025_war_exploded/LoginAdmin", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
                alert(response.message);
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

/* load dynamically the incidents */

document.addEventListener("DOMContentLoaded", function () {
    // Fetch incidents on page load
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:8081/project2025_war_exploded/IncidentServlet", true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const incidents = JSON.parse(xhr.responseText);
            console.log(incidents);
            displayIncidents(incidents);
            displayRequestedParticipates();
            displayAcceptedParticipates();

            google.charts.load('current', { packages: ['corechart'] });
            google.charts.setOnLoadCallback(drawCharts);

        } else {
            console.error("Error fetching incidents: " + xhr.statusText);
        }
    };

    xhr.send();
});

/* to display the incidents at the incident table */
let globalIncidents = [];
function displayIncidents(incidents) {
    globalIncidents=incidents;

    const tableBody = document.querySelector("#incidents_table tbody");
    tableBody.innerHTML = "";

    incidents.forEach(incident => {
        const row = document.createElement("tr");
        row.setAttribute("data-id", incident.incident_id);

        row.innerHTML = `
            <td>${incident.incident_id}</td>
            <td><input type="text" id="description_${incident.incident_id}" value="${incident.description}" /></td>
            <td>${incident.start_datetime}</td>
            <td>${incident.end_datetime || "N/A"}</td>
            <td><input type="text" id="danger_${incident.incident_id}" value="${incident.danger}" /></td>
            <td><input type="number" id="firemen_${incident.incident_id}" value="${incident.firemen}" /></td>
            <td><input type="number" id="vehicles_${incident.incident_id}" value="${incident.vehicles}" /></td>
            <td>${incident.incident_type}</td>
            <td id="status_cell_${incident.incident_id}">${incident.status}</td>
            <td><input type="text" id="finalResult_${incident.incident_id}" value="${incident.finalResult}" /></td>
            <td>
                <button class="delete-btn" data-id="${incident.incident_id}">Delete</button><br><br>
                <button class="update-incident-btn" data-id="${incident.incident_id}">Update</button><br><br>
                <button class="send-message-btn" data-id="${incident.incident_id}">Message</button>
            </td>
            <td>
                <select id="status_${incident.incident_id}">
                    <option value="submitted" ${incident.status === "submitted" ? "selected" : ""}>Submitted</option>
                    <option value="running" ${incident.status === "running" ? "selected" : ""}>Running</option>
                    <option value="fake" ${incident.status === "fake" ? "selected" : ""}>Fake</option>
                    <option value="finished" ${incident.status === "finished" ? "selected" : ""}>Finished</option>
                </select>
            </td>
        `;

        tableBody.appendChild(row);
    });

    /* update buttons */

    const changeStatusButtons = document.querySelectorAll(".update-incident-btn");
    changeStatusButtons.forEach(button => {
        button.addEventListener("click", function () {
            const incidentId = this.getAttribute("data-id");
            changeIncidentInfo(incidentId);
        });
    });

    /* delete buttons  */

    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach(button => {
        button.addEventListener("click", function () {
            const incidentId = this.getAttribute("data-id");
            deleteIncident(incidentId);
        });
    });

    /* message chat */

    const messageButtons = document.querySelectorAll(".send-message-btn");
    messageButtons.forEach(button => {
        button.addEventListener("click",function (){
            const incidentId = this.getAttribute("data-id");
            openAdminChat(incidentId);
        })
    });
}

/* change the incident status of one specific incident based on id */
function changeIncidentInfo(incidentId) {
    const description = document.getElementById(`description_${incidentId}`).value;
    const danger = document.getElementById(`danger_${incidentId}`).value;
    const firemen = document.getElementById(`firemen_${incidentId}`).value;
    const vehicles = document.getElementById(`vehicles_${incidentId}`).value;
    const status = document.getElementById(`status_${incidentId}`).value;
    const finalResult = document.getElementById(`finalResult_${incidentId}`).value;

    /* taking the current status of the field */

    const Cell = document.querySelector(`#status_cell_${incidentId}`);
    const currentStatus = Cell ? Cell.textContent : null;

    /* preparing the json*/

    const data = {
        incident_id: incidentId,
        description: description,
        danger: danger,
        firemen: firemen,
        vehicles: vehicles,
        status: status,
        finalResult: finalResult
    };

    /* calculating start and end date time */

    if(currentStatus === "submitted" && status === "running") {
        data.start_datetime = getFormattedDateTime();
    }else if (currentStatus === "running" && status === "finished") {
        data.end_datetime = getFormattedDateTime();
    }else if ( status === "fake"){
        data.start_datetime=null;
        data.end_datetime=null;
    }

    if (status === "finished") {
        updateAlsoParticipantsStatus(incidentId, function () {
            displayAcceptedParticipates();
        });
    }

    console.log(data);

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", "http://localhost:8081/project2025_war_exploded/IncidentServlet", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        if (xhr.status === 200) {
            alert("Incident's Information updated successfully!");

            /* updating the table */

            const row = document.querySelector(`tr[data-id="${incidentId}"]`);
            if (!row) {
                console.error(`Row with incident_id ${incidentId} not found.`);
                return;
            }

            row.querySelector(`#description_${incidentId}`).value = description;
            row.querySelector(`#danger_${incidentId}`).value = danger;
            row.querySelector(`#firemen_${incidentId}`).value = firemen;
            row.querySelector(`#vehicles_${incidentId}`).value = vehicles;
            row.querySelector(`#finalResult_${incidentId}`).value = finalResult;

            const statusCell = document.querySelector(`#status_cell_${incidentId}`);
            if (statusCell) {
                statusCell.textContent = status;
            } else {
                console.error(`Status cell for incident_id ${incidentId} not found.`);
            }

            /* update the start and end datetime */

            if (status === "running" && data.start_datetime) {
                row.querySelector("td:nth-child(3)").textContent = data.start_datetime;
            } else if (status === "finished" && data.end_datetime) {
                row.querySelector("td:nth-child(4)").textContent = data.end_datetime;
            }else if(status === "fake" || status === "submitted"){
                row.querySelector("td:nth-child(4)").textContent = "N/A";
                row.querySelector("td:nth-child(3)").textContent = "N/A";
            }

        } else {
            alert("Failed to update incident information.");
        }
    };

    xhr.onerror = function () {
        console.error("Error updating incident info.");
    };

    xhr.send(JSON.stringify(data));
}

/* update the status of the participants if new Status = finished */

function updateAlsoParticipantsStatus(incidentId,callback) {

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8081/project2025_war_exploded/AdminParticipantsServlet", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            console.log(response.message);
            if (callback) callback();
        } else {
            alert("Error updating participants.");
        }
    };

    xhr.onerror = function () {
        alert("Request failed.");
    };

    const data = JSON.stringify({
        incident_id: incidentId,
        status: "finished"
    });

    xhr.send(data);

}


/* delete the incident */

function deleteIncident(incidentId) {
    if (!confirm("Are you sure you want to delete this incident?")) return;

    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", `http://localhost:8081/project2025_war_exploded/IncidentServlet?incident_id=${incidentId}`, true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            alert("Incident deleted successfully!");
            const row = document.querySelector(`tr[data-id="${incidentId}"]`);
            if (row) {
                row.remove();
            } else {
                console.error(`Row with incident_id ${incidentId} not found.`);
            }
        } else {
            alert("Failed to delete incident.");
        }
    };

    xhr.onerror = function () {
        console.error("Error deleting incident.");
    };

    xhr.send();
}

/* return the desired format of the date */

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

/* create new incident from the admin */

document.getElementById("createIncident").addEventListener("click", function (event) {
    event.preventDefault();

    const description = document.getElementById("newDescription").value;
    const danger = document.getElementById("newDanger").value;
    const firemen = document.getElementById("newFiremen").value;
    const vehicles = document.getElementById("newVehicles").value;
    const incidentType = document.getElementById("newIncidentType").value;
    const address = document.getElementById("newAddress").value;
    const phonenumber = document.getElementById("newPhoneNumber").value;

    if (!description || !danger || !firemen || !vehicles || !incidentType || !address) {
        alert("Please fill out all required fields.");
        return;
    }

    const data = {
        description: greekToLatin(description),
        danger: danger,
        firemen: firemen,
        vehicles: vehicles,
        incident_type: incidentType,
        address: greekToLatin(address),
        municipality: greekToLatin(municipality),
        prefecture: greekToLatin(prefecture),
        start_datetime: getFormattedDateTime(),
        status: "running",
        user_phone: phonenumber,
        user_type: "admin",
        lat: lat,
        lon: lon
    };

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8081/project2025_war_exploded/IncidentServlet", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        if (xhr.status === 201) {
            const newIncident = JSON.parse(xhr.responseText);

            console.log(newIncident);
            alert("Incident created successfully!");
            addIncidentToTable(newIncident);
            clearIncidentForm();
        } else {
            alert("Failed to create incident: " + xhr.responseText);
        }
    };

    xhr.onerror = function () {
        console.error("Error creating incident.");
    };

    xhr.send(JSON.stringify(data));
});

/* valid address to set lat and lon */

let lat; let lon; let address; let municipality; let prefecture;

function invalidAddress(){

    /* retrieve the values of the fields we need */

    const country = document.getElementById("newCountry").value;
    prefecture = document.getElementById("newPrefecture").value;
    municipality = document.getElementById("newMunicipality").value;
    address = document.getElementById("newAddress").value;

    /* we make the api url based on the values */

    const apiUrl = `https://nominatim.openstreetmap.org/search?street=${encodeURIComponent(address)}&city=${encodeURIComponent(municipality)}&state=${encodeURIComponent(prefecture)}&country=${encodeURIComponent(country)}&format=json&addressdetails=1&accept-language=en&limit=1`;


    /* printing at console for ensurance */

    console.log("Country:", country);
    console.log("Prefecture:", prefecture);
    console.log("Municipality:", municipality);
    console.log("Street Address:", address);

    /* initialize a new request to the api server */

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    /* if the user has not filled in any of the fields, then he does,
     then displays an appropriate message and returns */

    if (!country || !prefecture || !municipality || !address) {
        document.getElementById("locationStatus").textContent = "Fill all the fields!";
        document.getElementById("locationStatus").style.color = "red";
        return;
    }

    xhr.open('GET', apiUrl, true);
    xhr.setRequestHeader('x-rapidapi-key', '98c38865efmshc953a2770699764p105460jsnd61597546dca');
    xhr.setRequestHeader('x-rapidapi-host', 'forward-reverse-geocoding.p.rapidapi.com');


    xhr.onreadystatechange = function () {

        if (xhr.readyState === XMLHttpRequest.DONE) {
            const locationStatus = document.getElementById("locationStatus");

            if (xhr.status === 200) {

                /* Parses the JSON response and checks if it has any results. */

                const response = JSON.parse(xhr.responseText);
                console.log("API Response:", response);

                /* ensure that the response from api is valid and response has at least one element (location) */

                if (response && response.length > 0) {

                    const location = response[0];
                    const displayName = location.display_name;
                    lat = location.lat;
                    lon = location.lon;


                    console.log("Latitude:", lat);
                    console.log("Longitude:", lon);
                    console.log("displayName:", displayName);

                    /* show the map botton to appear the map*/

                    locationStatus.textContent = "The address is valid!";
                    locationStatus.style.color = "green";
                } else {

                    locationStatus.textContent = "The address is not valid!";
                    locationStatus.style.color = "red";
                }
            } else {
                document.getElementById("addressValidMessage").textContent = "Error verifying address. Please try again.";
                locationStatus.textContent = `Error verifying address. Status: ${xhr.status}`;
                locationStatus.style.color = "red";
            }
        }
    };

    /* request to the specified apiUrl, when executed  this sends the HTTP request to the server */

    try {
        xhr.send();
        console.log("Request sent to API:", apiUrl);
    } catch (error) {
        console.error("Request Error:", error);
        document.getElementById("locationStatus").textContent = "Error sending request.";
    }

}

const verifyLocationBtn = document.getElementById("verifyLocation");
verifyLocationBtn.addEventListener("click", function() {
    invalidAddress();
});

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


/* clear the current create incident form */

function clearIncidentForm() {
    document.getElementById("newDescription").value = "";
    document.getElementById("newDanger").value = "low";
    document.getElementById("newFiremen").value = "";
    document.getElementById("newVehicles").value = "";
    document.getElementById("newIncidentType").value = "fire";
    document.getElementById("newAddress").value = "";
}

/* add new incident */

function addIncidentToTable(incident) {
    const tableBody = document.querySelector("#incidents_table tbody");

    const row = document.createElement("tr");
    row.setAttribute("data-id", incident.incident_id);

    row.innerHTML = `
        <td>${incident.incident_id}</td>
        <td><input type="text" id="description_${incident.incident_id}" value="${incident.description}" /></td>
        <td>${incident.start_datetime}</td>
        <td>${incident.end_datetime || "N/A"}</td>
        <td><input type="text" id="danger_${incident.incident_id}" value="${incident.danger}" /></td>
        <td><input type="number" id="firemen_${incident.incident_id}" value="${incident.firemen}" /></td>
        <td><input type="number" id="vehicles_${incident.incident_id}" value="${incident.vehicles}" /></td>
        <td>${incident.incident_type}</td>
        <td id="status_cell_${incident.incident_id}">${incident.status}</td>
        <td><input type="text" id="finalResult_${incident.incident_id}" value="${incident.finalResult || "N/A"}" /></td>
        <td>
            <button class="delete-btn" data-id="${incident.incident_id}">Delete</button><br><br>
            <button class="update-incident-btn" data-id="${incident.incident_id}">Update</button><br><br>
            <button class="send-message-btn" data-id="${incident.incident_id}">Message</button>
        </td>
        <td>
            <select id="status_${incident.incident_id}">
                <option value="submitted" ${incident.status === "submitted" ? "selected" : ""}>Submitted</option>
                <option value="running" ${incident.status === "running" ? "selected" : ""}>Running</option>
                <option value="fake" ${incident.status === "fake" ? "selected" : ""}>Fake</option>
                <option value="finished" ${incident.status === "finished" ? "selected" : ""}>Finished</option>
            </select>
        </td>
    `;

    tableBody.appendChild(row);

    /* Add event listeners to the new row's buttons */
    const updateButton = row.querySelector(".update-incident-btn");
    updateButton.addEventListener("click", function () {
        const incidentId = this.getAttribute("data-id");
        changeIncidentInfo(incidentId);
    });

    const deleteButton = row.querySelector(".delete-btn");
    deleteButton.addEventListener("click", function () {
        const incidentId = this.getAttribute("data-id");
        deleteIncident(incidentId);
    });

    const sendMessage = row.querySelector(".send-message-btn");
    sendMessage.addEventListener("click", function () {
        const incidentId = this.getAttribute("data-id");
        openAdminChat(incidentId);
    });

}

/* admin messages */

function openAdminChat(incidentId){

    const adminChatSection = document.getElementById("admin_chat_section");
    const adminChatIncidentId = document.getElementById("admin_chat_incident_id");
    const adminChatMessages = document.getElementById("admin_chat_messages");

    adminChatIncidentId.value = incidentId;
    let username="admin";
    adminChatMessages.innerHTML = "";

    // Fetch messages for the incident
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost:8081/project2025_war_exploded/MessageServlet?incident_id=${encodeURIComponent(incidentId)}&username=${encodeURIComponent(username)}`, true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const messages = JSON.parse(xhr.responseText);
            messages.forEach(message => {
                const messageDiv = document.createElement("div");
                messageDiv.style.marginBottom="10px";

                if(message.sender === "admin"){
                    messageDiv.style.textAlign = "right";
                    messageDiv.style.color = "blue";
                    messageDiv.innerHTML = `
                    <strong>Admin to ${message.recipient}:</strong> ${message.message} 
                    <br><small>${message.date_time}</small>`;
                }
                else {
                    messageDiv.style.textAlign = "left";
                    messageDiv.style.color = "green";
                    messageDiv.innerHTML = `
                    <strong>${message.sender} to ${message.recipient}:</strong> ${message.message} 
                    <br><small>${message.date_time}</small>`;
                }

                adminChatMessages.appendChild(messageDiv);

            });
        } else {
            alert("Failed to load messages.");
        }
    };

    xhr.onerror = function () {
        console.error("Error fetching messages.");
    };

    xhr.send();

    adminChatSection.style.display = "block";

}

/* close admin chat */

function closeAdminChat(){
    const adminChatSection = document.getElementById("admin_chat_section");
    adminChatSection.style.display = "none";
}

/* post new message for the current incident */


document.getElementById("admin_chat_form").addEventListener("submit", function (event) {
    event.preventDefault();

    const messageContent = document.getElementById("admin_chat_message").value;
    const incidentId = document.getElementById("admin_chat_incident_id").value;

    const data = {
        incident_id: incidentId,
        message: messageContent,
        sender: "admin",
        recipient: document.getElementById("recipient_select").value
    };

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8081/project2025_war_exploded/MessageServlet", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        if (xhr.status === 201) {
            document.getElementById("admin_chat_message").value = "";
            openAdminChat(incidentId); /* refresh the chat */
        } else {
            alert("Failed to send message.");
        }
    };

    xhr.onerror = function () {
        console.error("Error sending message.");
    };

    xhr.send(JSON.stringify(data));
});

/* Participates */

function displayRequestedParticipates(){

    console.log("Function displayRequestedParticipates called");

    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:8081/project2025_war_exploded/AdminParticipantsServlet?status=requested", true);

    xhr.onload = function () {
        console.log("Status: ", xhr.status);

        if (xhr.status === 200) {
            const participants = JSON.parse(xhr.responseText);

            const tableBody = document.querySelector("#requested_participants_table tbody");
            if (!tableBody) {
                console.error("Table body not found!");
                return;
            }

            tableBody.innerHTML = "";

            participants.forEach(participant => {

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${participant.participant_id}</td>
                    <td>${participant.incident_id}</td>
                    <td>${participant.volunteer_username || "N/A"}</td>
                    <td>${participant.volunteer_type || "N/A"}</td>
                    <td>
                        <button class="btn btn-success btn-sm" onclick="acceptParticipant(${participant.participant_id}, '${participant.volunteer_type}', ${participant.incident_id})">Accept</button>
                        <button class="btn btn-danger btn-sm" onclick="rejectParticipant(${participant.participant_id})">Reject</button>
                    </td>
                `;

                tableBody.appendChild(row);
            });
        } else {
            console.error("Failed to load requested participants. Status: ", xhr.status);
            alert("Failed to load requested participants.");
        }
    };

    xhr.onerror = function () {
        console.error("Error during the request.");
        alert("Error fetching requested participants.");
    };

    xhr.send();
}

function displayAcceptedParticipates(){

    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:8081/project2025_war_exploded/AdminParticipantsServlet?status=accepted", true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const participants = JSON.parse(xhr.responseText);
            console.log(participants);
            const tableBody = document.querySelector("#accepted_participants_table tbody");
            tableBody.innerHTML = "";

            participants.forEach(participant => {
                const row = document.createElement("tr");
                console.log(participant.comment);
                row.innerHTML = `
                            <td>${participant.participant_id}</td>
                            <td>${participant.incident_id}</td>
                            <td>${participant.volunteer_username}</td>
                            <td>${participant.volunteer_type}</td>
                            <td>${participant.comment || "N/A"}</td>
                            <td><input type="text" class="form-control" id="comment-${participant.participant_id}" value="${participant.comment || ''}" /></td>
                            <td>
                                <button class="update-comment-btn" onclick="updateComment(${participant.participant_id})">Update Comment</button>
                            </td>
                        `;
                tableBody.appendChild(row);
            });
        } else {
            alert("Failed to load accepted participants.");
        }
    };

    xhr.onerror = function () {
        console.error("Error loading accepted participants.");
    };

    xhr.send();

}

/* leitoyrgies gia accept h reject */

function acceptParticipant(participantId) {
    const data = {
        participant_id: participantId,
        status: "accepted"
    };

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", `http://localhost:8081/project2025_war_exploded/AdminParticipantsServlet`, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        if (xhr.status === 200) {
            alert("Participant accepted successfully!");

            displayRequestedParticipates();
            displayAcceptedParticipates();
            loadIncidents();
        } else {
            alert("Failed to accept participant. Status: " + xhr.status);
        }
    };

    xhr.onerror = function () {
        console.error("Error accepting participant.");
    };

    xhr.send(JSON.stringify(data));
}

function rejectParticipant(participantId) {
    const data = {
        participant_id: participantId,
        status: "rejected"
    };

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", `http://localhost:8081/project2025_war_exploded/AdminParticipantsServlet`, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        if (xhr.status === 200) {
            alert("Participant rejected successfully!");

            displayRequestedParticipates();
            displayAcceptedParticipates();
            loadIncidents();
        } else {
            alert("Failed to reject participant. Status: " + xhr.status);
        }
    };

    xhr.onerror = function () {
        console.error("Error rejecting participant.");
    };

    xhr.send(JSON.stringify(data));
}

function loadIncidents(){
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:8081/project2025_war_exploded/IncidentServlet", true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const incidents = JSON.parse(xhr.responseText);
            console.log(incidents);
            displayIncidents(incidents);
        } else {
            console.error("Error fetching incidents: " + xhr.statusText);
        }
    };

    xhr.send();
}

/* to comment an accepted participant */

function updateComment(participantID){

    const commentField = document.getElementById(`comment-${participantID}`);
    if (!commentField) {
        alert("Comment field not found for participant.");
        return;
    }

    const newComment = commentField.value;

    const data = {
        participant_id: participantID,
        comment: newComment
    };
    console.log("Data being sent:", JSON.stringify(data));

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", "http://localhost:8081/project2025_war_exploded/AdminParticipantsServlet", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    // Διαχείριση της απόκρισης
    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            alert(response.message || "Comment updated successfully!");
            displayAcceptedParticipates();
        } else {
            alert(`Failed to update comment. Status: ${xhr.status}`);
        }
    };

    xhr.onerror = function () {
        console.error("Error updating comment.");
        alert("An error occurred while updating the comment.");
    };

    xhr.send(JSON.stringify(data));
}

/* google charts */

function drawCharts() {
    const charts = document.querySelectorAll(".chart-box");

    charts.forEach(chart => {
        chart.style.width = "100%";
        chart.style.height = "500px";
    });

    if (document.getElementById("chart_incidents").offsetWidth === 0) {
        console.warn("Charts are not yet visible. Retrying in 500ms...");
        setTimeout(drawCharts, 500);
        return;
    }

    fetch('http://localhost:8081/project2025_war_exploded/StatisticsServlet')
        .then(response => response.json())
        .then(data => {
            if (!data || Object.keys(data).length === 0) {
                console.error("No valid data received.");
                return;
            }

            drawIncidentChart(data.incidentsPerType);
            drawUserVolunteerChart(data.userVolunteerCount);
            drawFiremenVehiclesChar(data.resourcesUsage);
        })
        .catch(error => console.error('Error fetching statistics:', error));

}

/* 1 */
function drawIncidentChart(incidentsPerType) {
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Type');
    data.addColumn('number', 'Count');
    incidentsPerType.forEach(item => data.addRow([item.type, item.count]));

    const options = {
        title: 'Number of Incidents per Type',
        pieHole: 0.4,
    };

    const chart = new google.visualization.PieChart(document.getElementById('chart_incidents'));
    chart.draw(data, options);
}

/* 2 */
function drawUserVolunteerChart(userVolunteerCount) {
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Category');
    data.addColumn('number', 'Count');

    data.addRow(['Users', userVolunteerCount.users]);
    data.addRow(['Volunteers', userVolunteerCount.volunteers]);

    const options = {
        title: 'Number of Users and Volunteers',
        hAxis: { title: 'Category' },
        vAxis: { title: 'Count' },
        curveType: 'function',
        legend: { position: 'bottom' },
        colors: ['#4285F4'],
        pointSize: 7
    };

    const chart = new google.visualization.LineChart(document.getElementById('chart_users_volunteers'));
    chart.draw(data, options);
}

/* 3 */

function drawFiremenVehiclesChar(resourcesUsage) {
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Resource');
    data.addColumn('number', 'Count');
    resourcesUsage.forEach(item => data.addRow([item.resource, item.count]));

    const options = {
        title: 'Total Firemen & Vehicles Participated',
        hAxis: { title: 'Count', minValue: 0 },
        vAxis: { title: 'Resource' },
        bars: 'horizontal',
        legend: { position: 'none' },
        colors: ['#4285F4']
    };

    const chart = new google.visualization.BarChart(document.getElementById('chart_resources'));
    chart.draw(data, options);
}
