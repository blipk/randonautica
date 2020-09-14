import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "tns-core-modules/ui/enums";
import { MapboxMarker } from "nativescript-mapbox";
import * as utilsModule from 'tns-core-modules/utils/utils';
import * as http from "tns-core-modules/http";

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

const userLocationMarkerProto = {
    id: 0,
    title: "User",
    subtitle: "Location",
    onTap: marker => console.log("Marker tapped with title: '" + marker.title + "'"),
    onCalloutTap: marker => alert("Marker callout tapped with title: '" + marker.title + "'")
};

const MapsUIHelper = {
    data() {
        return {
            userLocation: {lat: 0, lng: 0},
            userLocationMarker: userLocationMarkerProto,
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
                markerTarget = Object.assign(markerIn, userLocationMarkerProto);
            } else {
                markerTarget = markerIn;
            }
            //markerTarget.update();
            this.addMarkerToMap(markerTarget);
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
        }

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
            utilsModule.openUrl(`geo:${location.lat},${location.lng}?q=${location.lat},${location.lng}(${location.type})`);
        },

        
        //will need to find an iOS solution for this
        getStraightDistance(origin, target) {
           let start = new android.location.Location("custom");
           let end = new android.location.Location("custom");
           start.setLatitude(origin.lat);
           start.setLongitude(origin.lng);
           end.setLatitude(target.lat);
           end.setLongitude(target.lng);
           let distanceMeters = start.distanceTo(end) / 1000;

           return distanceMeters.toFixed(2);
        },

        getRouteDistance(origin, target, mode="driving") { //other modes 'walking' 'bicycling' 'transit'
            let distanceMatrixAPIURL = "https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&";
            distanceMatrixAPIURL += `mode=${mode}&origins=${origin.lat},${origin.lng}&destinations=${target.lat},${target.lng}&key=${this.GMAPS_APIKEY}`;

            http.getJSON(distanceMatrixAPIURL).then(
                result => {
                    target.routeDistance = result.rows[0].elements[0].distance.text;
                    target.routeDuration = result.rows[0].elements[0].duration.text;
                    
                    this.refreshList();
                },
                error => {
                    console.log(error);
                }
            );
        },

        fetchMyLocation() {
            geolocation
                .getCurrentLocation({
                    desiredAccuracy: Accuracy.high,
                    maximumAge: 1,
                    timeout: 20000
                })
                .then(res => {
                    this.userLocation = {lat: res.latitude, lng: res.longitude}
                    this.updateMarker(this.userLocationMarker, this.userLocation);
                })
                .catch(e => {
                    console.log("Error getting location", e);
                });
        },
        
        trackUserLocation() {
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