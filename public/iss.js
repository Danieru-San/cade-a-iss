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

async function calculatePasses() {
    getUserLocation(async () => {
        // console.log({latitude, longitude});
        // const result = await fetch(OVERHEAD_PASS + `lat=${latitude}&lon=${longitude}`);
        // const OVERHEAD_PASS_JSON = await result.json();
        // console.log(OVERHEAD_PASS_JSON);
        
        // const options = {
        //     method: 'GET',
        //     // mode: 'cors',
        //     // credentials: 'same-origin',
        //     // headers: {
        //     //     "Content-Type": "application/json",
        //     //     "Access-Control-Allow-Origin": "*",
        //     // },
        // }
    
        // fetch(`./iss_passes/lat/:${latitude}/lon/:${longitude}`, options);
        // calculatePasses();
        const result = await fetch('/test');
    });
}

whenHere.onclick = () => {
    getUserLocation(async () => {
        // console.log("got here");
        const result = await fetch(`/iss/passes/${latitude}/${longitude}`);
        // TODO
        console.log(await result.json());
    });
}

var issIcon = L.icon({
    iconUrl: './assets/iss.png',
    iconSize:     [47, 50], // size of the icon
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var marker;
var markerAdded = false;

function drawStation(map, lat, lon) {
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
    const response = await fetch('/iss/crew');
    const crew = await response.json(); 
    console.log(crew);
    
    peopleInSpace.textContent = crew.number;        
}

async function getISS(map) {
    const response = await fetch('/iss/position');
    const issPosition = await response.json();
        const lat = issPosition.latitude;
        const lon = issPosition.longitude;
        drawStation(map, lat, lon)
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