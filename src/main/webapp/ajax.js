let isUsernameValid = false; /* initial state of valid username */
let isEmailValid = false;    /* Initial state of valid email */
let isTelephoneValid = false; /* Initial state of valid telephone */

function checkFields(field,value,errorElementId,userType){

    const errorElement = document.getElementById(errorElementId);

    if (value.length > 0) {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                const response = JSON.parse(this.responseText);
                if (response.duplicate) {
                    errorElement.textContent = ` ${field} has already taken`;
                    updateValidity(field, false);
                } else {
                    errorElement.textContent = ""; /* clear the error span */
                    updateValidity(field, true);
                }
            } else if (this.readyState === 4) {
                errorElement.textContent = "Problem at checking";
                console.error(`Error checking ${field}:`, this.statusText);
                updateValidity(field, false);
            }
            updateSubmit();
        };
        xhttp.open('GET', `http://localhost:8081/project2025_war_exploded/CheckDuplicateServlet?field=${encodeURIComponent(field)}&value=${encodeURIComponent(value)}&userType=${encodeURIComponent(userType)}`, true);
        xhttp.send();
    } else {
        errorElement.textContent = ""; /* clear the span */
        updateValidity(field, false);
        updateSubmit();
    }
}

/* submit button */
function updateSubmit() {
    const submitButton = document.getElementById("submit");
    submitButton.disabled = !(isUsernameValid && isEmailValid && isTelephoneValid);
}

/* validity of each field username,email,telephone */
function updateValidity(field,isValid){
    if(field === "username"){
        isUsernameValid = isValid;
    }else if(field === "email"){
        isEmailValid = isValid;
    }else if(field === "telephone"){
        isTelephoneValid = isValid;
    }
}

/* checking for username */
document.getElementById("username").addEventListener("input", function () {
    const userType = document.getElementById("type").value;
    checkFields("username", this.value, "usernameError",userType);
});

/* checking for email */
document.getElementById("email").addEventListener("input", function () {
    const userType = document.getElementById("type").value;
    checkFields("email", this.value, "emailError",userType);
});

/* checking for telephone */
document.getElementById("telephone").addEventListener("input", function () {
    const userType = document.getElementById("type").value;
    checkFields("telephone", this.value, "telephoneError",userType);
});

function checkAllFields(){
    const userType = document.getElementById("type").value;
    if (userType) {
        const username = document.getElementById("username").value;
        checkFields("username", username, "usernameError", userType);

        const email = document.getElementById("email").value;
        checkFields("email", email, "emailError", userType);

        const telephone = document.getElementById("telephone").value;
        checkFields("telephone", telephone, "telephoneError", userType);
    }
}


document.getElementById("type").addEventListener("change", function () {

    document.getElementById("usernameError").textContent = "";
    document.getElementById("emailError").textContent = "";
    document.getElementById("telephoneError").textContent = "";

    isUsernameValid = false;
    isEmailValid = false;
    isTelephoneValid = false;

    updateSubmit();

    checkAllFields(); /* check all fields */
});