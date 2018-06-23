const resultText = document.getElementById("resultText");
// Array containing closest public transport stations
let closestStops = [];
// Array containing closest city bike racks
let closestRacks = [];
// Defines how many nearby stops to locate:
const numberOfStops = 4;
// Defines what kind of stations to locate, onstreetBus is only bus
const mode = "onstreetBus";


// Executed when document is loaded
$(document).ready(function () {
    console.log("Document loaded, polling for position...");
    getAllCityBikesTrondheim();
    navigator.geolocation.getCurrentPosition(function (position) {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        console.log("Position found, calling getNearestStops with coords " + latitude + ", " + longitude);
        getNearestStops(latitude, longitude);
    });
});

// Changes the HTML when data is ready
function showLocation(closestStops) {
    console.log("showLocation called!");
    let stopsTable = "<table><th>Haldeplass</th><th>Transportmiddel</th><th>StoppID</th><th>Avstand</th>";
    for (let i = 0; i < closestStops.length; i++) {
        stopsTable +=
            "<tr><td>" + getStationName(closestStops[i][1]) +
            "</td><td>" + getMode(closestStops[i][0]) +
            "</td><td>" + getStopID(closestStops[i][2]) +
            "</td><td>" + getDistance(closestStops[i][3]) + "</td></tr>";
    }
    resultText.innerHTML = stopsTable;
    console.log("showLocation finished!");
}


// Connects with Entur-API to find nearby stations based on coordinates
function getNearestStops(latitude, longitude) {
    console.log("getNearestStops called with coords " + latitude + ", " + longitude);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.entur.org/api/geocoder/1.1/reverse?point.lat=" +
        latitude + "&point.lon=" + longitude +
        "&lang=en&size=" + numberOfStops + "&layers=venue&category=" + mode);
    xhr.setRequestHeader("ET-Client-Name", "https://github.com/toretefre/catchbus");
    xhr.send();
    console.log("XMLHttpRequest to find the " + numberOfStops + " closest stops sent!");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("XMLHttpRequest returned the following JSON with status code 200:");
            parseStationData(xhr.response);
            showLocation(closestStops);
        }
    }
}


function getAllCityBikesTrondheim() {
    console.log("getAllCityBikesStationsTrondheim called");
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://gbfs.urbansharing.com/trondheim/station_information.json");
    xhr.send();
    console.log("XMLHttpRequest to find all Trondheim citybike stations sent");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("JSON containing city bike racks received:");
            parseCityBikeRacksTrondheim(xhr.response);
        }
    }
}


function parseCityBikeRacksTrondheim(jsonToParse) {
    let parsedJSON = JSON.parse(jsonToParse);
    console.log("Rack JSON parsed! List of closest racks:");
    for (let i = 0; i < 10; i++) {
        let rackID = parsedJSON["data"]["stations"][i]["station_id"];
        let rackName = parsedJSON["data"]["stations"][i]["name"];
        let rackCapacity = parsedJSON["data"]["stations"][i]["capacity"];
        let rackAddress = parsedJSON["data"]["stations"][i]["address"];
        let rackLat = parsedJSON["data"]["stations"][i]["lon"];
        let rackLon = parsedJSON["data"]["stations"][i]["lat"];

        closestRacks.push([rackID, rackName, rackCapacity, rackAddress, rackLat, rackLon]);
    }
    console.log(closestRacks);
}


// Parses JSON station data received from Entur into Javascript objects
function parseStationData(jsonToParse) {
    let parsedJSON = JSON.parse(jsonToParse);
    console.log("Station JSON parsed! List of closest stations:");
    for (let i = 0; i < numberOfStops; i++) {
        let category = parsedJSON["features"][i]["properties"]["category"];
        let stopName = parsedJSON["features"][i]["properties"]["name"];
        let stopID = parsedJSON["features"][i]["properties"]["id"];
        let distance = parsedJSON["features"][i]["properties"]["distance"];
        let latitude = parsedJSON["features"][i]["geometry"]["coordinates"][1];
        let longitude = parsedJSON["features"][i]["geometry"]["coordinates"][0];
        closestStops.push([category, stopName, stopID, distance, latitude, longitude]);
    }
    console.log(closestStops);
}


function getNextDepartures(stopID) {
    console.log("getNextDepartures called for " + stopID);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.entur.org/journeyplanner/2.0/index/graphql");
    xhr.setRequestHeader("ET-Client-Name", "https://github.com/toretefre/catchbus");
    xhr.send();
    console.log("XMLHttpRequest to find next departures sent!");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("")
        }
    }
}


// Translates minutes until departure to readable text
function timeUntilDeparture(departureTime, now) {
    let minutesUntil = (departureTime.getTime() - now.getTime()) / 60000;

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
function getMode(mode) {
    mode += "";
    switch (mode) {
        case "onstreetBus":
            return "Buss";
        default:
            return "Usikker";
    }
}

function getStationName(station) {
    return station;
}


function getStopID(IdString) {
    return (IdString.slice(14));
}


function getDistance(distance) {
    return (distance * 1000 + " meter");
}