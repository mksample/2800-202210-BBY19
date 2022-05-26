"use strict";

const defaultLat = 49.2827;
const defaultLon = -123.1207;
const defaultZoom = 11;

function initMap(initLat, initLon, zoom, elementID, clickable, geolocation, setMarker, latElementID, lonElementID) {
    // Init map
    let map = new google.maps.Map(document.getElementById(elementID), {
        center: {
            lat: initLat ? parseFloat(initLat) : defaultLat,
            lng: initLon ? parseFloat(initLon) : defaultLon
        },
        zoom: zoom ? zoom : defaultZoom
    });

    // Geolocation init
    if (geolocation) {
        // Create info window
        let infoWindow = new google.maps.InfoWindow();
        let locationButton = document.createElement("input");

        // Create custom button
        locationButton.type = "button";
        locationButton.value = "Get Location";
        locationButton.id = "reportIncidentLocationButton";

        // Add button
        locationButton.classList.add("custom-map-control-button");
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);

        // Add event listener to button
        locationButton.addEventListener("click", () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };

                        infoWindow.setPosition(pos);
                        infoWindow.setContent(
                            "Location Recorded"
                        );
                        infoWindow.open(map);

                        document.getElementById(latElementID).value = pos.lat;
                        document.getElementById(lonElementID).value = pos.lng;
                        map.setCenter(pos);
                    },
                    () => {
                        handleLocationError(map, true, infoWindow, map.getCenter());
                    }
                );
            } else {
                handleLocationError(map, false, infoWindow, map.getCenter());
            }
        });
    }

    // Clickable marker init
    if (clickable) {
        // Create marker object
        let marker;
        if (setMarker) {
            marker = new google.maps.Marker({
                position: {
                    lat: parseFloat(initLat),
                    lng: parseFloat(initLon)
                },
                map
            });
        } else {
            marker = new google.maps.Marker();
        }

        // Add listener for clicking
        map.addListener("click", (mapsMouseEvent) => {
            // Close the current Marker.
            marker.setMap(null);

            // Create a new Marker.
            marker = new google.maps.Marker({
                position: mapsMouseEvent.latLng,
                map,
                title: "Incident Location",
            });

            // Update position
            document.getElementById(latElementID).value = mapsMouseEvent.latLng.lat();
            document.getElementById(lonElementID).value = mapsMouseEvent.latLng.lng();
        });
    }
}

function initDisplayMap(initLat, initLon, zoom, elementID) {
    initLat = parseFloat(initLat);
    initLon = parseFloat(initLon);
    
    // Init map
    let map = new google.maps.Map(document.getElementById(elementID), {
        center: {
            lat: initLat ? initLat : defaultLat,
            lng: initLon ? initLon : defaultLon
        },
        zoom: zoom ? zoom : defaultZoom
    });

    // Create marker object
    let marker = new google.maps.Marker({
        position: {
            lat: initLat,
            lng: initLon
        },
        map
    });
}

function handleLocationError(map, browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation ?
            "Error: The Geolocation service failed." :
            "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
}
