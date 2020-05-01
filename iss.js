const API = 'http://api.open-notify.org';
const ISS_NOW = "http://api.open-notify.org/iss-now.json";
const PEOPLE_IN_SPACE = "http://api.open-notify.org/astros.json";
const OVERHEAD_PASS = `http://api.open-notify.org/iss-pass.json?`;
const peopleInSpace = document.getElementById("people-in-space");
const whenHere = document.getElementById('when');

function getUserLocation(callback) {
    if('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => { 
            console.log(position.coords);
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            callback();
        });
    }

    else {
        alert("Houston, we have a problem. Can't access your location.");
    }
}

async function loadPassesOverhead() {
    getUserLocation(async () => {
        // console.log({latitude, longitude});
        const result = await fetch(OVERHEAD_PASS + `lat=${latitude}&lon=${longitude}`);
        const OVERHEAD_PASS_JSON = await result.json();
        console.log(OVERHEAD_PASS_JSON);
    });
    
}

whenHere.onclick = () => {
    loadPassesOverhead();
    // console.log("again: " + latitude);
    // console.log("again: " + longitude);
    // loadPassesOverhead();
}

var issIcon = L.icon({
    iconUrl: './assets/iss.png',
    iconSize:     [47, 50], // size of the icon
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var marker;
var markerAdded = false;

function trackSpaceStation(map, lat, lon) {
    

    if (markerAdded === false) {
        marker = L.marker([lat, lon], {icon: issIcon});
        marker.addTo(map);
        markerAdded = true;
        map.flyTo([lat, lon], 4, {
            animate: true,
            duration: 1.5
        });
    }

    else {
        marker.setLatLng([lat, lon])
    }


}

async function getPeopleInSpace() {
    const response = await fetch(PEOPLE_IN_SPACE);
    const PEOPLE_IN_SPACE_JSON = await response.json(); 
    console.log(PEOPLE_IN_SPACE_JSON);
    
    if (PEOPLE_IN_SPACE_JSON.message === "success") {
        peopleInSpace.textContent = PEOPLE_IN_SPACE_JSON.number;
        
    }

    else {
        alert("Houston, we've got a problem.");
    }
}

async function getISS(map) {
    const response = await fetch(ISS_NOW);
    const ISS_NOW_JSON = await response.json();
    // console.log(ISS_NOW_JSON);

    if (ISS_NOW_JSON.message === "success") {
        const lat = ISS_NOW_JSON.iss_position.latitude;
        const lon = ISS_NOW_JSON.iss_position.longitude;
        trackSpaceStation(map, lat, lon)
    }

    else (
        alert("Houston, we have a problem. Mayday, MAYDAY! ISS can you hear me? Can you hear me, Major Tom?")
    )
}

function initMap() {
    var map = L.map('map-container', {zoomControl: false}).setView([0, 0], 3);

    var CartoDB = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 6,
        minZoom: 3
    });

    // map.setMaxBounds(map.getBounds());

    CartoDB.addTo(map);

    getPeopleInSpace();

    setInterval(getISS, 1000, map);

    // getISS(map);
}


initMap();