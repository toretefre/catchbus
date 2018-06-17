var resultText = document.getElementById("resultText");
var closestStops = [];

// Executed when document is loaded
$( document ).ready(function() {
    console.log( "Document loaded, polling for position..." );
    navigator.geolocation.getCurrentPosition(function(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        console.log("Position found, calling getNearestStops with coords " + latitude + ", " + longitude);
        getNearestStops(latitude, longitude);
    });
});

// Changes the HTML when data is ready
function showLocation() {
    console.log("showLocation called!");
    // Constructing test data
    var mode = 1;
    var routeNumber = 5;
    var destination = "Dragvoll";
    var now = new Date();
    // test purposes
    var minutesToNextDeparture = 1;
    var departureTime = new Date(now.getTime() + minutesToNextDeparture * 60000);
    var departure = [mode, routeNumber, destination, departureTime];
    
    resultText.innerHTML =  "<span>" + findMode(departure[0]) + " " + departure[1] + " mot " + departure[2] + " " +
                            timeUntilDeparture(departure[3], now) + "</span>";

    console.log("showLocation finished!");
}

// Defines how many nearby stops to locate:
var numberOfStops = 2;
// Defines what kind of stations to locate, onstreetBus is only bus
var mode = "onstreetBus";


// Connects with Entur-API to find nearby stations based on coordinates
function getNearestStops(latitude, longitude) {
    var xhr = new XMLHttpRequest();
    console.log("getNearestStops called with coords " + latitude + ", " + longitude);
    xhr.open("GET", "https://api.entur.org/api/geocoder/1.1/reverse?point.lat=" +
            latitude + "&point.lon=" + longitude +
            "&lang=en&size=" + numberOfStops + "&layers=venue&category=" + mode);
    xhr.setRequestHeader("Content-Type", "text/json");
    xhr.send();
    console.log("XMLHttpRequest to find the " + numberOfStops + " closest stops sent!");
    xhr.onreadystatechange = function () {
        if(xhr.readyState === 4 && xhr.status === 200) {
            console.log("XMLHttpRequest returned the following JSON with status code 200:");
            parseJSONData(xhr.response);
            showLocation();
        }
    }
}


// Parses JSON station data received from Entur into Javascript objects
function parseJSONData(jsonToParse) {
    console.log("Raw JSON: " + jsonToParse);
    var parsedJSON = JSON.parse(jsonToParse);
    console.log("JSON parsed! List of IDs:");
    for (var id in parsedJSON) {
        if (parsedJSON.hasOwnProperty(id)) {
            var stopName = "";
            var stopID = -1;
            var distance = -1;
            var latitude = -1;
            var longitude = -1;
            console.log(id);
            closestStops.push([stopName, stopID, distance, latitude, longitude]);
        }
    }
    console.log("Array containg closest stops: " + closestStops);
}


// Translates minutes until departure to readable text
function timeUntilDeparture(departureTime, now) {
    var minutesUntil = (departureTime.getTime() - now.getTime()) / 60000;

    switch (minutesUntil) {
        case 0:
            return "er rett rundt hjørnet!";
        case 1:
            return "kjem om ett minutt.";
        case 2:
            return "kjem om to minutt.";
        case 3:
            return "kjem om tre minutt.";
        case 4:
            return "kjem om fire minutt.";
        case 5:
            return "kjem om fem minutt.";
        default:
            return "kjem " + departureTime;
    }
}

// Translates digit representation into form of transportation
function findMode(mode) {
    switch (mode) {
        case 0:
            return "Gå";
        case 1:
            return "Buss";
        case 2:
            return "Trikk";
        case 3:
            return "Tog";
    }
}