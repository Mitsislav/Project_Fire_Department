/* function to verify my location */

function invalidAddress(){
    
    /* retrieve the values of the fields we need */

    const country = document.getElementById("country").value;
    const prefecture = document.getElementById("prefecture").value;
    const municipality = document.getElementById("municipality").value;
    const address = document.getElementById("address").value;
 
    /* we make the api url based on the values */

    //const apiUrl = `http://localhost/assignment2/proxy.php?street=${encodeURIComponent(address)}&city=${encodeURIComponent(municipality)}&state=${encodeURIComponent(prefecture)}&country=${encodeURIComponent(country)}&addressdetails=1&accept-language=en&limit=1`;
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
        locationStatus.textContent = "Fill all the fields!";
        locationStatus.style.color = "red";
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
                    const lat = location.lat;
                    const lon = location.lon;

                    localStorage.setItem("latitude",lat);
                    localStorage.setItem("longitude",lon);

                    console.log("Latitude:", lat);
                    console.log("Longitude:", lon);
                    console.log("displayName:", displayName);

                    /* if does not include crete then return and print the follow message */

                    if (!displayName.toLowerCase().includes("crete")){
                        location.style.color="red";
                        location.textContent="the service is only available in Crete at the moment";
                        return;
                    }

                    /* show the map botton to appear the map*/
                    
                    const showMapBtn = document.getElementById("MapBtn");
                    showMapBtn.style.display = "block"; 
                    
                    
                    showMapBtn.onclick = function() {
                        //showMap(lat, lon); 
                        let mapID="mapContainer";
                        const map=createMap(lat, lon, mapID);
                        addMarker(map, lat, lon);
                    };
                    

                    locationStatus.textContent = "The address is valid!";
                    locationStatus.style.color = "green";
                } else {
                    
                    /* hide the botton for map appearance and also the map */

                    document.getElementById("MapBtn").style.display="none";
                    document.getElementById("mapContainer").style.display="none";

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
        locationStatus.textContent = "Error sending request.";
    }

}


const verifyLocationBtn = document.getElementById("verifyLocation");
verifyLocationBtn.addEventListener("click", function() {
    invalidAddress(); 
});

/* */

/* creation of the map */

let currentMap = null;

function createMap(lat, lon, mapID){

    /* zoom level of the map*/

    let zoomLevel=15;

    let mapContainer = document.getElementById(mapID);
    
    if(currentMap){
        currentMap.getView().setCenter(ol.proj.fromLonLat([lon, lat]));
        currentMap.getView().setZoom(zoomLevel); 
        return currentMap; 
    }

    if (mapContainer._ol_map) {
        mapContainer._ol_map.setTarget(null); /* delete the previous map */
    }

    mapContainer.style.display = "block";

    /* create a new map */
    const map = new ol.Map({
        target: mapID,
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM() 
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([lon, lat]), /* zoom to these specific cords */
            zoom: zoomLevel /* add the zoom level */
        })
    });

    markerLayer=
    currentMap=map;
    /* return the initialized map*/
    return map;
}

/* add marker to the map */

let currentMarker = null;

function addMarker(map, lat, lon) {
    
    if (currentMarker) {
        currentMarker.getSource().clear(); 
    }

    /* create a new marker */
    const markerLayer = new ol.layer.Vector({
        source: new ol.source.Vector()
    });
    
    /* create the mark */
    const marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
    });
    
    
    markerLayer.getSource().addFeature(marker);
    
    currentMarker=markerLayer;

    map.addLayer(markerLayer);
}

