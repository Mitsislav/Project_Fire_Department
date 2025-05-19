let initialIncidentIds = new Set(); // Stores incident IDs already displayed
let storedNotifications = []; // Stores notifications dynamically

let VolunteerName = null;

document.addEventListener("DOMContentLoaded", function () {
    getUserDataFromServer1()
        .then(username => {
            VolunteerName = username;
            console.log("VolunteerName loaded:", VolunteerName);

            // Κάλεσε τις συναρτήσεις που εξαρτώνται από το VolunteerName
            fetchIncidents(true); // Αρχική φόρτωση των incidents
            fetchHistoryIncidents(); // Αρχική φόρτωση ιστορικών
            setInterval(fetchIncidents, 15000); // Επαναφόρτωση κάθε 15 δευτερόλεπτα
        })
        .catch(error => {
            console.error("Error fetching VolunteerName:", error);
            alert("Error loading volunteer data. Please log in again.");
        });
});

// Συνάρτηση που επιστρέφει Promise για το VolunteerName
function getUserDataFromServer1() {
    return new Promise((resolve, reject) => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    const response = JSON.parse(this.responseText);
                    if (response.loggedIn && response.data) {
                        const userData = JSON.parse(decodeURIComponent(response.data));
                        resolve(userData.username); // Επιστροφή του username
                    } else {
                        reject("User not logged in.");
                    }
                } else {
                    reject(`Error fetching user data: ${this.status}`);
                }
            }
        };
        xhttp.open("GET", "http://localhost:8081/project2025_war_exploded/CookieVolunteerServlet", true);
        xhttp.send();
    });
}

function getUserDataFromServer(callback) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4)
        {
            if (this.status === 200)
            {
                const response = JSON.parse(this.responseText);
                if (response.loggedIn){
                    callback(response.data); /*
                    console.log(response.data);
                    const userData = JSON.parse(decodeURIComponent(response.data));
                    const username = userData.username;
                    VolunteerName=username;
                    console.log(VolunteerName);*/
                }else
                    alert("User not logged in. Please log in again.");
            }
            else
                alert("Error fetching user data from server.");
        }
    };
    xhttp.open("GET", "http://localhost:8081/project2025_war_exploded/CookieVolunteerServlet", true);
    xhttp.send();
}

function fetchIncidents(isInitialLoad = false) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            const incidents = JSON.parse(this.responseText);

            if (isInitialLoad) {
                // Store existing incident IDs on first load and populate the table
                incidents.forEach(incident => initialIncidentIds.add(incident.incident_id.toString()));
                populateIncidentTable(incidents);
            } else {
                checkForNewIncidents(incidents);
            }
        }
    };
    xhttp.open("GET", "http://localhost:8081/project2025_war_exploded/RunningIncidentsServlet", true);
    xhttp.send();
}

function fetchHistoryIncidents() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            const historyIncidents = JSON.parse(this.responseText);
            populateHistoryTable(historyIncidents);
        }
    };
    xhttp.open("GET", "http://localhost:8081/project2025_war_exploded/HistoryIncidentsServlet", true);
    xhttp.send();
}

function checkForNewIncidents(incidents) {
    const newIncidents = incidents.filter(incident => !initialIncidentIds.has(incident.incident_id.toString()));

    if (newIncidents.length > 0) {
        sendNewIncidentNotifications(newIncidents); // Notify only truly new incidents
        populateIncidentTable(newIncidents); // Append new incidents to the table
        newIncidents.forEach(incident => initialIncidentIds.add(incident.incident_id.toString()));
    }
}

function sendNewIncidentNotifications(newIncidents) {
    newIncidents.forEach(incident => {
        const notificationMsg = `New Incident: ${incident.incident_type} at ${incident.address}`;
        storedNotifications.push(notificationMsg);
        displayNotification(notificationMsg);
    });
}


function displayNotification(message) {
    const notificationList = document.getElementById("notificationList");
    const notificationCount = document.getElementById("notificationCount");

    // Remove "No new notifications" if it exists
    if (notificationList.children.length === 1 && notificationList.children[0].textContent === "No new notifications") {
        notificationList.innerHTML = "";
    }

    const li = document.createElement("li");
    li.textContent = message;
    notificationList.appendChild(li);

    let currentCount = parseInt(notificationCount.textContent, 10) || 0;
    notificationCount.textContent = currentCount + 1;
}

// Call fetchIncidents every 15 seconds
setInterval(fetchIncidents, 15000);

function populateIncidentTable(incidents) {
    const tableBody = document.querySelector("table tbody");

    // Clear table only on first load
    if (tableBody.children.length === 0) {
        tableBody.innerHTML = "";
    }

    incidents.forEach(incident => {
        // Prevent duplicates
        if (!document.getElementById(`incident-${incident.incident_id}`)) {
            const row = document.createElement("tr");
            row.id = `incident-${incident.incident_id}`;
            row.innerHTML = `
                <td>${incident.incident_id}</td>
                <td>${incident.incident_type}</td>
                <td>${incident.description}</td>
                <td>${incident.user_phone}</td>
                <td>${incident.address}</td>
                <td>${incident.municipality}</td>
                <td>${incident.prefecture}</td>
                <td>${incident.start_datetime}</td>
                <td>${incident.danger}</td>
                <td>
                    <button class="participate-btn" onclick="participateInIncident('${incident.incident_id}')">Participate</button>
                </td>
            `;
            tableBody.appendChild(row);
        }
    });

}


function populateHistoryTable(historyIncidents) {
    const tableBody = document.querySelector("#historyTable tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    historyIncidents.forEach(incident => {
        if (!document.getElementById(`history-incident-${incident.incident_id}`)) {
            const row = document.createElement("tr");
            row.id = `history-incident-${incident.incident_id}`;
            row.innerHTML = `
                <td>${incident.incident_id}</td>
                <td>${incident.incident_type}</td>
                <td>${incident.description}</td>
                <td>${incident.user_phone}</td>
                <td>${incident.address}</td>
                <td>${incident.municipality}</td>
                <td>${incident.prefecture}</td>
                <td>${incident.start_datetime}</td>
                <td>${incident.danger}</td>
                <td>
                    <button class="send-message-btn" data-id="${incident.incident_id}">Message</button>
                </td>
            `;
            tableBody.appendChild(row);
        }
    });

    const messageButtons = document.querySelectorAll(".send-message-btn");
    messageButtons.forEach(button => {
        button.addEventListener("click",function (){
            const incidentId = this.getAttribute("data-id");
            openVolunteerChat(incidentId);
        })
    });
}

/* messages for volunteer */

function openVolunteerChat(incidentId){

    const volunteerChatSection = document.getElementById("volunteer_chat_section");
    const volunteerChatIncidentId = document.getElementById("volunteer_chat_incident_id");
    const volunteerChatMessages = document.getElementById("volunteer_chat_messages");

    volunteerChatIncidentId.value = incidentId;
    let username=VolunteerName;
    volunteerChatMessages.innerHTML = "";

    // Fetch messages for the incident
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `http://localhost:8081/project2025_war_exploded/MessageServlet?incident_id=${encodeURIComponent(incidentId)}&username=${encodeURIComponent(username)}`, true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            const messages = JSON.parse(xhr.responseText);
            messages.forEach(message => {
                const messageDiv = document.createElement("div");
                messageDiv.style.marginBottom="10px";

                if(message.sender === username){
                    messageDiv.style.textAlign = "right";
                    messageDiv.style.color = "blue";
                    messageDiv.innerHTML = `
                        <strong>You to ${message.recipient}:</strong> ${message.message} 
                        <br><small>${message.date_time}</small>`;
                }
                else if(message.recipient === "public" || message.recipient === "volunteer" || message.recipient===VolunteerName) {
                    messageDiv.style.textAlign = "left";
                    messageDiv.style.color = "green";
                    messageDiv.innerHTML = `
                        <strong>${message.sender} to ${message.recipient}:</strong> ${message.message} 
                        <br><small>${message.date_time}</small>`;
                }

                volunteerChatMessages.appendChild(messageDiv);

            });
        } else {
            alert("Failed to load messages.");
        }
    };

    xhr.onerror = function () {
        console.error("Error fetching messages.");
    };

    xhr.send();

    volunteerChatSection.style.display = "block";

}

/* close admin chat */

function closeVolunteerChat() {
    const volunteerChatSection = document.getElementById("volunteer_chat_section");
    volunteerChatSection.style.display = "none";
}

/* post new message for the current incident */


document.getElementById("volunteer_chat_form").addEventListener("submit", function (event) {
    event.preventDefault();

    const messageContent = document.getElementById("volunteer_chat_message").value;
    const incidentId = document.getElementById("volunteer_chat_incident_id").value;

    const data = {
        incident_id: incidentId,
        message: messageContent,
        sender: VolunteerName,
        recipient: document.getElementById("recipient_select").value
    };

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8081/project2025_war_exploded/MessageServlet", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        if (xhr.status === 201) {
            document.getElementById("volunteer_chat_message").value = "";
            openVolunteerChat(incidentId); /* refresh the chat */
        } else {
            alert("Failed to send message.");
        }
    };

    xhr.onerror = function () {
        console.error("Error sending message.");
    };

    xhr.send(JSON.stringify(data));
});



function participateInIncident(incidentId) {
    getUserDataFromServer(function(volunteerData) {
        const decodedData = JSON.parse(decodeURIComponent(volunteerData));
        const volunteerUsername = decodedData.username || "unknown";

        // Check participation status before sending request
        const checkRequestXhttp = new XMLHttpRequest();
        checkRequestXhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                let response = JSON.parse(this.responseText);
                console.log("Response from CheckParticipants:", response); // Debugging

                if (!Array.isArray(response)) {
                    response = []; // Default to empty array
                }

                if (response.length > 0) {
                    alert("You have already sent a participation request for this incident.");
                    return;  // Stop here if request already exists
                }

                // Call the function to send participation request
                sendParticipationRequest(volunteerUsername, decodedData.volunteer_type, incidentId);
            }
        };

        checkRequestXhttp.open("GET", `http://localhost:8081/project2025_war_exploded/CheckParticipantsServlet?volunteer_username=${encodeURIComponent(volunteerUsername)}&incident_id=${incidentId}`, true);
        checkRequestXhttp.send();
    });
}

function redirectToLogin()
{
    window.location.href = "loginVolunteer.html?showUpdateForm=true";
}

document.getElementById("logout").addEventListener("click", function () {
    // Send request to backend to clear cookies
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            alert("Successfully logged out.");

            // Delete the cookie on the client-side
            document.cookie = "volunteerData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;

            // Reload the page to ensure the login form appears
            window.location.href = "loginVolunteer.html";
        }
    };
    xhttp.open("POST", "http://localhost:8081/project2025_war_exploded/CookieVolunteerServlet", true);
    xhttp.send();
});

function sendParticipationRequest(volunteerUsername, volunteerType, incidentId)
{
    const requestData = {
        volunteer_username: volunteerUsername,
        incident_id: parseInt(incidentId, 10),
        volunteer_type: volunteerType,
        status: "requested",
        success: false,
        comment: null
    };

    const sendRequestXhttp = new XMLHttpRequest();
    sendRequestXhttp.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status === 200) {
                const response = JSON.parse(this.responseText);
                alert(response.message);

                // Disable the button upon successful request
                const button = document.getElementById(`btn-${incidentId}`);
                if (button) {
                    button.outerHTML = `<span class="request-sent">Request Sent</span>`;
                }
            } else {
                alert("Error submitting request.");
            }
        }
    };

    sendRequestXhttp.open("POST", "http://localhost:8081/project2025_war_exploded/ParticipantsServlet", true);
    sendRequestXhttp.setRequestHeader("Content-Type", "application/json");
    sendRequestXhttp.send(JSON.stringify(requestData));
}

document.addEventListener("DOMContentLoaded", function () {
    const notificationBtn = document.getElementById("notificationBtn");
    const notificationPanel = document.getElementById("notificationPanel");
    const notificationList = document.getElementById("notificationList");
    const notificationCount = document.getElementById("notificationCount");

    // Toggle Notification Panel
    notificationBtn.addEventListener("click", function () {
        notificationPanel.classList.toggle("active");

        if (notificationPanel.classList.contains("active")) {
            fetchNotifications();
        }
    });

    function fetchNotifications() {
        const notificationList = document.getElementById("notificationList");
        const notificationCount = document.getElementById("notificationCount");

        // Clear existing notifications
        notificationList.innerHTML = "";

        if (storedNotifications.length > 0) {
            storedNotifications.forEach(notification => {
                const li = document.createElement("li");
                li.textContent = notification;
                notificationList.appendChild(li);
            });

            notificationCount.textContent = storedNotifications.length;
        } else {
            notificationList.innerHTML = "<li>No new notifications</li>";
            notificationCount.textContent = "0";
        }
    }

    // Poll for new notifications every 15 seconds
    setInterval(fetchNotifications, 15000);
});
