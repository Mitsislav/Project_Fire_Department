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
    const prefectureSelect = document.getElementById("prefecture");
    const selectedPrefecture = prefectureSelect.value;

    console.log("Selected Prefecture: ", selectedPrefecture);

    /* if the selection of the prefecture changes, then the selections from
     the previous drop down must be deleted*/

    const municipalitySelect = document.getElementById("municipality");
    municipalitySelect.innerHTML = '<option value="" disabled selected>Επιλέξτε Δήμο</option>';

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