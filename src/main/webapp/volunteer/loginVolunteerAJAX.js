let lat;
let lon;

document.getElementById("register").addEventListener("click", function () {
    window.location.href = "../index.html";
});

/* submit the login page */
document.getElementById("login").addEventListener("click",function (event) {
    event.preventDefault();

    /* getting values from form input fields */
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    /* getting the document field from the error login */
    const errorElement = document.getElementById("loginError");

    if(username.length > 0 && password.length > 0){
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function ()
        {
            if(this.readyState === 4 && this.status === 200)
            {
                const response = JSON.parse(this.responseText);
                if(response.success)
                {
                    window.location.href = "volunteer_incidents.html";

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
                    document.getElementById("volunteer_type").value = response.volunteer_type;
                    document.getElementById("height").value = response.height;
                    document.getElementById("weight").value = response.weight;

                    lat = response.lat;
                    lon = response.lon;
                }else{
                    errorElement.textContent = "Invalid username or password.";
                }
            }else if (this.readyState === 4){
                errorElement.textContent = "Error during login. Please try again.";
                console.error(`Error checking login:`, this.statusText);
            }
        };
        xhttp.open("GET", `http://localhost:8081/project2025_war_exploded/LoginVolunteerServlet?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, true);
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

document.getElementById("update").addEventListener("click", function (event) {
    event.preventDefault();

    const form = document.getElementById("profileForm");

    if (!form.checkValidity()) {
        alert("Fill out all fields correctly!");
        form.reportValidity();
        return;
    }

    const address = greekToLatin(document.getElementById("addressF").value);

    // First, retrieve `volunteer_id` from CookieVolunteerServlet
    getVolunteerIdFromServer(function (volunteer_id) {
        if (!volunteer_id)
        {
            alert("Error: Volunteer ID not found. Please log in again.");
            return;
        }

        // Now, retrieve lat/lon from the new address
        getLatLonFromAddress(address, function (lat, lon) {
            if (!lat || !lon) {
                alert("Error: Unable to retrieve location for the given address.");
                return;
            }

            const data = {
                volunteer_id: volunteer_id,
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
                lon: lon,
                volunteer_type: document.getElementById("volunteer_type").value,
                height: document.getElementById("height").value,
                weight: document.getElementById("weight").value
            };

            const jsonData = JSON.stringify(data);

            const xhr = new XMLHttpRequest();
            xhr.open("POST", "http://localhost:8081/project2025_war_exploded/LoginVolunteerServlet", true);
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
    });
});

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

    /* appear the login section again */
    document.getElementById("login_section").style.display = "block";

});

/* Cookie Handling */
document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const showUpdateForm = urlParams.get('showUpdateForm'); // Get the parameter

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ()
    {
        if (this.readyState === 4 && this.status === 200)
        {
            const response = JSON.parse(this.responseText);

            if (response.loggedIn)
            {
                if (showUpdateForm === "true")
                {
                    document.getElementById("logged_section").style.display = "block";
                    document.getElementById("login_section").style.display = "none";
                }
                else
                    window.location.href = "volunteer_incidents.html";

                const volunteerData = JSON.parse(decodeURIComponent(response.data)) || {}; // Properly parse the JSON string


                /* Populate user data */
                document.getElementById("usernameF").value = volunteerData.username;
                document.getElementById("firstnameF").value = volunteerData.firstname;
                document.getElementById("lastnameF").value = volunteerData.lastname;
                document.getElementById("emailF").value = volunteerData.email;
                document.getElementById("passwordF").value = volunteerData.password;
                document.getElementById("birthdateF").value = volunteerData.birthdate;
                document.getElementById("genderF").value = volunteerData.gender;
                document.getElementById("afmF").value = volunteerData.afm;
                document.getElementById("countryF").value = volunteerData.country;
                document.getElementById("addressF").value = volunteerData.address;
                document.getElementById("municipalityF").value = volunteerData.municipality;
                document.getElementById("prefectureF").value = volunteerData.prefecture;
                document.getElementById("jobF").value = volunteerData.job;
                document.getElementById("telephoneF").value = volunteerData.telephone;
            }
            else
            {
                document.getElementById("login_section").style.display = "block";
                document.getElementById("logged_section").style.display = "none";
            }
        }
    };
    xhttp.open("GET", "http://localhost:8081/project2025_war_exploded/CookieVolunteerServlet", true);
    xhttp.send();
});


/* deleting cookie at log out */

document.getElementById("logout").addEventListener("click", function (){
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            const response = JSON.parse(this.responseText);
            if (response.success)
                window.location.href = "volunteer_incidents.html";
        }
    };
    xhttp.open("POST", "http://localhost:8081/project2025_war_exploded/CookieVolunteerServlet", true);
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

document.getElementById("logout").addEventListener("click", function () {
    // Send request to backend to clear cookies
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            alert("Successfully logged out.");
            console.log("Miaou");
            // Delete the cookie on the client-side
            document.cookie = "volunteerData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;

            // Reload the page to ensure the login form appears
            window.location.href = "loginVolunteer.html";
        }
    };
    xhttp.open("POST", "http://localhost:8081/project2025_war_exploded/CookieVolunteerServlet", true);
    xhttp.send();
});

function getVolunteerIdFromServer(callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:8081/project2025_war_exploded/CookieVolunteerServlet", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);

            if (response.loggedIn && response.data) {
                try {
                    const volunteerData = JSON.parse(decodeURIComponent(response.data));
                    callback(volunteerData.volunteer_id);
                } catch (error) {
                    console.error("Error parsing volunteerData:", error);
                    callback(null);
                }
            } else {
                console.warn("Volunteer not logged in or missing data!");
                callback(null);
            }
        } else {
            console.error("Failed to fetch volunteerData. Server response:", xhr.status);
            callback(null);
        }
    };

    xhr.onerror = function () {
        console.error("Error while making request to CookieVolunteerServlet");
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
                console.error("Error parsing geocoding response:", error);
                callback(null, null);
            }
        } else {
            console.error("Geocoding request failed with status:", xhr.status);
            callback(null, null);
        }
    };

    xhr.onerror = function () {
        console.error("Geocoding request error.");
        callback(null, null);
    };

    xhr.send();
}