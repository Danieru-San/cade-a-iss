const API = 'http://api.open-notify.org';
const ISS_NOW = "http://api.open-notify.org/iss-now.json";
const PEOPLE_IN_SPACE = "http://api.open-notify.org/astros.json";
const OVERHEAD_PASS = `http://api.open-notify.org/iss-pass.json?`;
const peopleInSpace = document.getElementById("people-in-space");
const whenHere = document.getElementById('when');
const astronautsGallery = document.getElementById('gallery');
const backToMap = document.getElementById('back-to-map');
var map; // Leaflet map
var issLat;
var issLon;

backToMap.onclick = () => {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}


function getUserLocation(callback) {
    if('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => { 
            // console.log(position.coords);
            callback(position.coords.latitude, position.coords.longitude);
        });
    }

    else {
        alert("Houston, we have a problem. Can't access your location.");
    }
}

async function calculatePasses() {
    getUserLocation(async () => {
        const result = await fetch('/test');
    });
}

function isVisible(time) {
    let hourOfDay = time.getHours();

    if (hourOfDay > 5 && hourOfDay < 18) {
        return "<span class='notVisible'>" + time.toLocaleDateString() + ": " + time.toLocaleTimeString() + " (not visible) </span><br>";
    }

    else {
        return "<b>" + time.toLocaleDateString() + ": " + time.toLocaleTimeString() + "<span class='isVisible'> (visible!)</span></b><br>";
    }
}

/* -------- When user clicks 'When can I see it?' button -------- */
whenHere.onclick = () => {
    getUserLocation(async (userLat, userLon) => {
        // After getting user location, get ISS passes from API:
        const result = await fetch(`/iss/passes/${userLat}/${userLon}`);
        const issPasses = await result.json();
        
        // Add marker with user location:
        const userMarker = L.marker([userLat, userLon]);
        userMarker.addTo(map);
        
        // Repositions the map
        map.flyTo([userLat, userLon], 6, {
            animate: true,
            duration: 1
        });

        let passes = ``;
        (issPasses.response).map(pass => {
            var date = new Date(pass.risetime * 1000);
            console.log(date.toLocaleDateString(), date.toLocaleTimeString());
            passes += isVisible(date);
            
        })

        userMarker.bindPopup(`
            <b>The ISS will be right above your head at...</b><br>
            ${passes}
        `).openPopup();

        console.log(passes);

        
        // console.log(issPasses);
        
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
    
    // TODO: create API to automate updating process and replace hard-coded information
    const astronautsList_response = await fetch('./astronauts.json');
    const astronautsList = await astronautsList_response.json();

    (crew.people).map((astronaut) => {
        let pic;
        let age;
        let nationality;
        let emoji = '';

        const thisAstro = astronautsList.filter(e => e.name === astronaut.name)[0];
        pic = thisAstro.path;
        age = thisAstro.age;
        nationality = thisAstro.nationality;

        if (nationality === "American") {
            emoji = 'United States 🇺🇸';
        }

        else if (nationality === "Russian") {
            emoji = 'Russia 🇷🇺';
        }

        var additionalHTML = 
        `
        <div class="astronaut">
            <div class="astronaut-picture">
                <img src=${pic} alt="astronaut"> 
            </div>
        
            <div class="astronaut-info">
                <div class="astronaut-name"><b>${astronaut.name}</b></div>
                <div class="astronaut-age">${age} years old</div>
                <div class="astronaut-nationality">${emoji} </div>
            </div>
        </div>
        `;

        astronautsGallery.innerHTML += additionalHTML
    })

}

async function getISS(map) {
    const response = await fetch('/iss/position');
    const issPosition = await response.json();
        issLat = issPosition.latitude;
        issLon = issPosition.longitude;
        drawStation(map, issLat, issLon)
}

function initMap() {
    map = L.map('map-container', {zoomControl: false, worldCopyJump: true}).setView([0, 0], 3);

    var CartoDB = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 6,
        minZoom: 3,
    });

    // map.setMaxBounds(map.getBounds());

    CartoDB.addTo(map);

    getPeopleInSpace();

    setInterval(getISS, 1000, map);

    // getISS(map);
}


initMap();