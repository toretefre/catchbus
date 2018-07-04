const now = new Date();

const resultText = document.getElementById("resultText");
// Array containing closest public transport stations
let closestStops = [];
// Array containing closest city bike racks
let closestRacks = [];
// Defines how many nearby stops to locate:
const numberOfStops = 5;
const maxDistanceinMeters = 1000;
const enturendpoint = "https://api.entur.org/journeyplanner/2.0/index/graphql";


window.addEventListener('load', function() {
    console.log("Document loaded, asking for Geolocation!");
    getPosition();
});


// Getting position HTML5 way
function getPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(savePosition);
    }
    else {
        setTimeout(function(){
            console.log("Geolocation failed / not supported, redirecting!");
            resultText.innerHTML = "Vi klarar ikkje hente posisjonen din, sender deg til en-tur.no";
        }, 4000);
        window.location.replace("https://en-tur.no");
    }
}


// Storing position, HTML5 way
function savePosition(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    localStorage.setItem("latitude", lat);
    localStorage.setItem("longitude", lon);
    getNearestStops();
    getAllCityBikesTrondheim();
}


// Connects to Entur API to find nearby stations based on coordinates
function getNearestStops() {
    const latitude = localStorage.getItem("latitude");
    const longitude = localStorage.getItem("longitude");
    console.log("getNearestStops called with coords " + latitude + ", " + longitude);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.entur.org/api/geocoder/1.1/reverse?point.lat=" +
        latitude + "&point.lon=" + longitude +
        "&lang=en&size=" + numberOfStops + "&layers=venue");
    xhr.setRequestHeader("ET-Client-Name", "https://github.com/toretefre/catchbus");
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            parseStationData(xhr.response);
        }
    }
}


// Parses JSON station data received from Entur into Javascript objects
function parseStationData(jsonToParse) {
    let parsedJSON = JSON.parse(jsonToParse);
    for (let i = 0; i < parsedJSON["features"].length; i++) {

        let category = parsedJSON["features"][i]["properties"]["category"];
        // Multimodal stops
        if (parsedJSON["features"][i]["properties"]["category"].length > 1) {
            category = "multimodal"
        }
        let stopName = parsedJSON["features"][i]["properties"]["name"];
        let stopID = getStopID(parsedJSON["features"][i]["properties"]["id"]);
        let distance = (parsedJSON["features"][i]["properties"]["distance"])*1000;
        let latitude = parsedJSON["features"][i]["geometry"]["coordinates"][1];
        let longitude = parsedJSON["features"][i]["geometry"]["coordinates"][0];
        let nextDepartures = getNextDepartures(stopID);

        closestStops.push([category, stopName, stopID, distance, latitude, longitude, nextDepartures]);
    }
    console.log(closestStops);
    display(closestStops, closestRacks);
}


// Connects with Trondheim City Bikes API to fetch all city bike racks
function getAllCityBikesTrondheim() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://gbfs.urbansharing.com/trondheim/station_information.json");
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            parseCityBikeRacksTrondheim(xhr.response);
        }
    }
}

// Gets availability of city bikes
function getCityBikeStatusTrondheim() {
    console.log("getCityBikeStatusTrondheim called!");
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://gbfs.urbansharing.com/trondheim/station_status.json");
    xhr.send();
    console.log("Requested system status Trondheim City Bikes!");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            parseCityBikeStatusTrondheim(xhr.response);
        }
    }
}

// parses city bike status
function parseCityBikeStatusTrondheim(jsonToParse) {
    let parsedJSON = JSON.parse(jsonToParse);
    console.log("System status JSON parsed! Updating rack list");
    const numberOfRacks = parsedJSON["data"]["stations"].length;
    for (let i = 0; i < numberOfRacks; i++) {
        let rackID = parsedJSON["data"]["stations"][i]["station_id"];
        let bikes = parsedJSON["data"]["stations"][i]["num_bikes_available"];
        let freeDocks = parsedJSON["data"]["stations"][i]["num_docks_available"];
        let open = parsedJSON["data"]["stations"][i]["is_renting"];

        closestRacks.push([rackID, bikes, freeDocks, open]);
    }
}


// Parses received JSON about city bike racks
function parseCityBikeRacksTrondheim(jsonToParse) {
    let parsedJSON = JSON.parse(jsonToParse);
    console.log("Rack JSON parsed! List of closest racks:");
    const numberOfRacks = parsedJSON["data"]["stations"].length;
    for (let i = 0; i < numberOfRacks; i++) {
        let rackID = parsedJSON["data"]["stations"][i]["station_id"];
        let rackName = parsedJSON["data"]["stations"][i]["name"];
        let rackAddress = parsedJSON["data"]["stations"][i]["address"];
        let rackCapacity = parsedJSON["data"]["stations"][i]["capacity"];
        let rackLat = parsedJSON["data"]["stations"][i]["lat"];
        let rackLon = parsedJSON["data"]["stations"][i]["lon"];
        let distance = parseInt(getDistanceBetweenCoords(rackLat, rackLon, localStorage.getItem("latitude"), localStorage.getItem("longitude")));
        // -1 value is to be replaced with number of available bikes in rack
        closestRacks.push([rackID, rackName, rackAddress, distance, rackCapacity, rackLat, rackLon, -1]);
    }
    console.log(closestRacks);
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

// Used to calculate distance to nearest city bikes
function getDistanceBetweenCoords(lat1, lon1, lat2, lon2) {
    const earthRadiusKm = 6371;

    function degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }
    let dLat = degreesToRadians(lat2 - lat1);
    let dLon = degreesToRadians(lon2 - lon1);

    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);

    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return ((earthRadiusKm * c) * 1000).toFixed(0);
}


// Translates digit representation into form of transportation
function getMode(mode) {
    // City bike racks are recognized by ID
    if (Number.isInteger(mode)) {
        return "Bysykkel";
    }
    mode += "";
    switch (mode) {
        case "onstreetBus":
            return "Buss";
        case "railStation":
            return "Tog";
        case "metroStation":
            return "Undergrunnsbane";
        case "busStation":
            return "Bussterminal";
        case "coachStation":
            return "Bussterminal";
        case "onstreetTram":
            return "Trikk";
        case "tramStation":
            return "Trikk";
        case "harbourPort":
            return "Båt";
        case "ferryPort":
            return "Ferje";
        case "ferryStop":
            return "Ferje";
        case "lift":
            return "Heis";
        case "airport":
            return "Flyplass";
        case "multimodal":
            return "Knutepunkt";
        default:
            return "Anna";
    }
}


function getNextDepartures(stopID) {
    function addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

    function correctMonth(i) {
        return i+1;
    }

    const hours = addZero(now.getHours());
    const minutes = addZero(now.getMinutes());
    const seconds = addZero(now.getSeconds());
    const day = addZero(now.getDate());
    const month = addZero(correctMonth(now.getMonth()));
    const year = now.getFullYear();

    const startTime = year + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":" + seconds + "+0200";

    fetch(enturendpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ET-Client-Name': 'https://github.com/toretefre/catchbus'
        },
        body: JSON.stringify({ query: `
        {
            stopPlace(id: "NSR:StopPlace:` + stopID + `") {
                id
                name
                estimatedCalls(startTime:"` + startTime + `" timeRange: 86400, numberOfDepartures: 10, omitNonBoarding:true) {
                    realtime
                    aimedDepartureTime
                    expectedDepartureTime
                    forBoarding
                    destinationDisplay {
                        frontText
                    }
                    serviceJourney {
                        journeyPattern {
                            line {
                                publicCode
                                operator {
                                    id
                                }
                                id
                                name
                                transportMode
                            }
                        }
                    }
                }
            }
        }
        `}),
    })
    .then(res => res.json())
    .then(res => console.log(res.data));
}


// Changes the HTML when data is sorted and ready
function display(closestStops, closestRacks) {
    let closest = closestStops.concat(closestRacks);
    // Sorts ascending based on distance from user
    closest.sort((a, b) => (a[3] - b[3]));
    // Removes things further away than const maxDistanceinMeters
    for (let i = 0; i < closest.length; i++) {
        if (closest[i][3] > maxDistanceinMeters) {
            closest.splice(i);
            break;
        }
        closest.splice(numberOfStops);
    }
    console.log("Liste som skal displayast:");
    console.log(closest);
    for (let i = 0; i < closest.length; i++) {
        // If integer, which means city bike rack
        if (closest[i][0] === parseInt(closest[i][0], 10)) {
            getAvailabilityForCityBikeRack(closest[i][0]);
            continue;
        }
        // Else, which means random public transport station
        getNextDepartureForStop(closest[i][2]);
    }
    let stopsTable = "<table><th>Haldeplass</th><th>Transportmiddel</th><th>Avstand</th>";
    for (let i = 0; i < closest.length; i++) {
        stopsTable +=
            "<tr><td>" + getStationName(closest[i][1]) +
            "</td><td>" + getMode(closest[i][0]) +
            "</td><td>" + getDistance(closest[i][3]) + "</td></tr>";
    }
    resultText.innerHTML = stopsTable;
    console.log("Displaying finished!");
}


function getNextDepartureForStop(stopID) {
    console.log("Departure asked for stopID: " + stopID);
    return -1;
}


function getAvailabilityForCityBikeRack(rackID) {
    console.log("Availability asked for rackID: " + rackID);
    return -1;
}

function getStationName(station) {
    return station;
}


// Removes NSR:StopID:
function getStopID(IdString) {
    return (IdString.slice(14));
}


function getDistance(distance) {
    return distance + " meter";
}