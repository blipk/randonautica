import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "tns-core-modules/ui/enums";
import { MapboxMarker } from "nativescript-mapbox";
import * as utilsModule from 'tns-core-modules/utils/utils';
import * as http from "tns-core-modules/http";
import * as dialogs from "tns-core-modules/ui/dialogs";
import {ImageSource, fromFile, fromResource, fromBase64} from "tns-core-modules/image-source";

const markerPrototype = {
    //id: 0, // can be used in 'removeMarkers()'
    //lat: 0, // mandatory
    //lng: 0, // mandatory
    title: 'Location', // no popup unless set
    subtitle: 'Marker',
    // icon: 'res://cool_marker', // preferred way, otherwise use:
    //icon: 'http(s)://website/coolimage.png', // from the internet (see the note at the bottom of this readme), or:
    //iconPath: 'images/fatum-marker.png',
    //selected: true, // makes the callout show immediately when the marker is added (note: only 1 marker can be selected at a time)
    onTap: marker => console.log("Marker tapped with title: '" + marker.title + "'"),
    onCalloutTap: marker => alert("Marker callout tapped with title: '" + marker.title + "'")
};



const MapsUIHelper = {
    data() {
        return {
            userLocation: {lat: 0, lng: 0},
            userLocationMarker: {
                id: 0,
                title: "Your Location",
                subtitle: "",
                onTap: marker => console.log("Marker tapped with title: '" + marker.title + "'"),
                onCalloutTap: marker => this.userMarkerCalloutTap(marker, this)
            },
        }
    },
    methods: {
        addMarkerToMap(marker) {
            if(marker.id)   //assuming that id'd markers are unique, so remove before resetting
                this.mapBox.removeMarkers([marker.id]); 

            if (marker.lat && marker.lng)   //only set if the marker has valid co-ords
                this.mapBox.addMarkers([marker]); 
        },
        updateMarker(markerTarget, markerIn) {
            if(markerTarget == this.userLocationMarker) {
                this.mapBox.removeMarkers(0);
                this.userLocationMarker.title = "Your Location" ;
                this.userLocationMarker.subtitle = "(" + markerIn.lat + ", " + markerIn.lng +  ")";
                markerTarget = Object.assign(markerIn, this.userLocationMarker);
            } else {
                markerTarget = markerIn;
            }
            //markerTarget.update();
            this.addMarkerToMap(markerTarget);
        },
        userMarkerCalloutTap: function(marker, mainContext) {
            let dialogActions = ["Set as Fatum Generation Location", "Update Location"];
            dialogs.action({
                message: `Actions for ${marker.title} (${marker.lat}, ${marker.lng})`,
                cancelButtonText: "Cancel",
                defaultText: "Default text",
                actions: dialogActions
            }).then(function (result) {
                if (result == "Set as Fatum Generation Location") {
                    mainContext.setFatumGenerationLocation(marker);
                } else if (result == "Update Location") {
                    mainContext.getUserLocation();
                } 
                mainContext.refreshUI();
            });
        },

        createCirclePoints: function(center, radiusInMeters, points) {
            if(!points) points = 64;

            var coords = {
                latitude: center[1],
                longitude: center[0]
            };

            var km = radiusInMeters/1000;

            var ret = [];
            var distanceX = km/(111.320*Math.cos(coords.latitude*Math.PI/180));
            var distanceY = km/110.574;

            var theta, x, y;
            for(var i=0; i<points; i++) {
                theta = (i/points)*(2*Math.PI);
                x = distanceX*Math.cos(theta);
                y = distanceY*Math.sin(theta);

                ret.push({lng: coords.longitude+x, lat: coords.latitude+y});
            }
            ret.push(ret[0]);

            return ret;
        },
        
        // satellite-v9
        // satellite-streets-v11
        getStaticMap(coord, targetIndex = null, options = {style: "satellite-streets-v11", width: "250", height: "150",
                     zoom: "13", bearing: "0", pitch: "0"}, callBack) {

            var baseURI = "https://api.mapbox.com/styles/v1/mapbox/"
            var reqURI = baseURI + `${options.style}/static/${coord.lng},${coord.lat},${options.zoom},${options.bearing},${options.pitch}/${options.width}x${options.height}?access_token=${this.MAPBOX_APIKEY}`
            console.log(reqURI);
            http.getImage(reqURI).then(
                result => {
                    if (targetIndex != null) {
                        this.fatumLocationsList[targetIndex].staticMap = "data:image/png;base64," + result.toBase64String("png");
                        this.createJournalEntry(this.fatumLocationsList[targetIndex]);
                    }
                    if (callBack) callBack(result);
                },
                error => {
                    console.log("Error getting static map: " + error);
                }
            );
        },
        
    }
};



const LocationHelper = {
    data() {
        return {
            watch: null,
        }
    },
    methods: {
        openLocationExternally: function(location) {
            if (!location.type) location.type = "Selected Location";
            utilsModule.openUrl(`geo:${location.lat},${location.lng}?q=${location.lat},${location.lng}(${location.type})`);
        },

        getStraightDistance(origin, target) {
            // TODO Port the C# Math code for this to here so as to not rely on platform specific classes
            /*
                double dlon = (lon1 - lon0) * Math.PI / 180;
                double dlat = (lat1 - lat0) * Math.PI / 180;

                double a = (Math.Sin(dlat / 2) * Math.Sin(dlat / 2)) + Math.Cos(lat0 * Math.PI / 180) * Math.Cos(lat1 * Math.PI / 180) * (Math.Sin(dlon / 2) * Math.Sin(dlon / 2));
                double angle = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

                return Convert.ToInt32(angle * 6371000);
            */
           let start = new android.location.Location("custom");
           let end = new android.location.Location("custom");
           start.setLatitude(origin.lat);
           start.setLongitude(origin.lng);
           end.setLatitude(target.lat);
           end.setLongitude(target.lng);
           let distanceMeters = start.distanceTo(end) / 1000;

           return distanceMeters.toFixed(2);
        },

        getRouteDistance(origin, target, cb) {
            let distanceMatrixAPIURL = "https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&";
            distanceMatrixAPIURL += `origins=${origin.lat},${origin.lng}&destinations=${target.lat},${target.lng}&key=${this.GMAPS_APIKEY}`;

            http.getJSON(distanceMatrixAPIURL).then(
                result => {
                    target.routeDistance = result.rows[0].elements[0].distance.text;
                    target.routeDuration = result.rows[0].elements[0].duration.text;
                    
                    if (typeof cb == 'function') cb(result);
                },
                error => {
                    console.log(error);
                }
            );
        },

        fetchMyLocation(callBack) {
            geolocation
                .getCurrentLocation({
                    //desiredAccuracy: Accuracy.high,
                    desiredAccuracy: Accuracy.any,
                    maximumAge: 1,
                    timeout: 20000
                })
                .then(res => {
                    this.userLocation = {lat: res.latitude, lng: res.longitude}
                    this.updateMarker(this.userLocationMarker, this.userLocation);
                    if (callBack) callBack(this.userLocation);
                })
                .catch(e => {
                    console.log("Error getting location", e);
                });
        },
        
        trackUserLocation() {       //NOT USED
            this.watch = geolocation.watchLocation(
                res => {
                    this.userLocation = {lat: res.latitude, lng: res.longitude}
                    this.updateMarker(this.userLocationMarker, userLocation);
                },
                error => console.log(error), {
                    desiredAccuracy: Accuracy.high,
                    updateDistance: 1,
                    updateTime: 3000,
                    minimumUpdateTime: 3000
                }
            );
        },
        clearWatch() {
            geolocation.clearWatch(this.watch);
        }
    }
};

export default {
    LocationHelper,
    MapsUIHelper
};