<template>
    <Page class="page" actionBarHidden="true">
        <!--<ActionBar title="Home" class="action-bar" />-->


        <DockLayout stretchLastChild="true">
            <!-- Top -->
            <StackLayout dock="top" height="150">
                <GridLayout rows="auto" columns="300, *" width="100%" height="150">

                    <MapView row="0" col="0"
                        width="100%"
                        height="100%"
                        :zoom="zoom"
                        :latitude="origin.latitude"
                        :longitude="origin.longitude"
                        v-if="allowExecution"
                        @mapReady="mapReady"
                        @coordinateLongPress="locationSelected"
                    />

                    <GridLayout row="0" col="1" rows="auto,auto,auto,auto" columns="*"
                        width="100%" height="100%">
                        <Button row="0" @tap="getDirections">Get Directions</Button>
                        <Button row="1" @tap="clearRoute">Clear Route</Button>
                        <Button row="2" @tap="startJourney">Start Journey</Button>
                        <button row="3" @tap="endJourney">End Journey</button>     
                    </GridLayout>

                </GridLayout>
            </StackLayout>
            <!-- /Top -->

            <!-- Bottom -->
            <StackLayout dock="bottom">
                <TextView  :text="journeyDetails" editable="false"/>
                <!--
                <GridLayout rows="auto" columns="100%,*,100%" height="50">
                    <Button col="0" text="Photo" @tap="onButtonTap" />
                    <TextField col="1" v-model="textFieldValue" hint="Enter message..." />
                    <Button col="2" text="Send" @tap="onButtonTap" />
                </GridLayout>
                -->
            </StackLayout>
            <!-- /Bottom -->


            <!-- Middle -->
            <StackLayout orientation="vertical" class="m-t-30 app-bg">
                <RadListView ref="listView" for="messages in messageList"
                    @itemTap="onItemTap" backgroundColor="#999999">
                    <v-template>
                        <GridLayout columns="100, *" rows="auto, auto, auto" class="p-l-20 app-bg">

                            <Label :text="messages.amount" row="0" col="0" class="h1" color="#89D5E2" />
                            <Label :text="messages.date" row="1" col="0" class="body p-l-15" />
                            <Label :text="messages.name" row="0" col="1" class="h2 p-r-20" />
                            <Label :text="messages.address" row="1" col="1" class="body p-r-20" color="#C2C8E6" />
                            <StackLayout class="hr-light m-y-20" row="2" col="1" v-if="!messages.last">
                            </StackLayout>
                            <StackLayout class="m-y-20" row="2" col="1" v-else>
                            </StackLayout>
                        </GridLayout>
                    </v-template>
                </RadListView>
            </StackLayout>
            <!-- /Middle -->
        </DockLayout>

    </Page>
</template>


<script>
    import Vue from "nativescript-vue";
    
    import * as permissions from 'nativescript-permissions'
    import * as platform from 'platform'

    import RadListView from "nativescript-ui-listview/vue";
    Vue.use(RadListView);
    
    import MapsHelper from "./MapsHelper.js";

    //const geoLocation = require("nativescript-geolocation");

    export default {
        created: function() {
        /* dont run the android permissions routine for iOS */
        if (platform.isIOS) {
            this.allowExecution = true;
            return;
        }
        /* list of permissions needed */
        let permissionsNeeded = [
            android.Manifest.permission.ACCESS_FINE_LOCATION,
            android.Manifest.permission.ACCESS_COARSE_LOCATION
        ];
        /* showing up permissions dialog */
        permissions
            .requestPermissions(permissionsNeeded, "Location")
            .then(() => this.allowExecution = true)
            .catch(() => this.allowExecution = false);
        },

        methods: {
            onButtonTap: function() {
                console.log("Button was pressed");
            },

            onItemTap: function() {
                console.log("Button was pressed");
            },

            mapReady(args) {
                /* get the mapView instance */
                this.mapView = args.object;

                /* ios map center bug fix 
                setTimeout(() => {
                    this.mapView.height = {
                    unit: this.mapView.height.unit,
                    value: this.mapView.height.value + 0.0004
                    };
                }, 100); */

                /* turn on my location button on map */
                this.enableMyLocationButton(true);
                /* add destination marker to map */
                this.addMarkerToMap(this.destinationMarker, true);
                /* add my location marker to map (which will point to our location when journey starts) - visibility hidden  */
                this.addMarkerToMap(this.myLocationMarker, false);
                /* set map origin coordinates to present device location */
                this.fetchMyLocation();
            },
            locationSelected(args) {
                /* get coordinates of the point where user long pressed */
                let lat = args.position.latitude;
                let lng = args.position.longitude;
                /* set the obtained coordinates as destination coordinates */
                this.destination.latitude = lat;
                this.destination.longitude = lng;
                /* move the destination marker to the same coordinates */
                this.setMarker(this.destinationMarker, lat, lng);
            },
            getDirections() {
                /* hit Directions API - as origin and destination coordinates are set */
                this.hitDirectionsAPI().then(response => {
                    /* draw route from encoded polyline points */
                    this.drawRoute(response.encodedPolylinePoints);
                    
                    /* if jouney started, don't adjust the camera */
                    if (this.journeyStarted)
                    return;

                    /* adjust camera to bring route into view */
                    this.getRouteInView(
                        response.northEastBounds,
                        response.southWestBounds
                    );
                });
            },
            clearRoute() {
                /* remove route drawn between locations on map */
                this.mapView.removeAllPolylines();
            },
            startJourney() {
                /* hide my location indicator and button */
                this.enableMyLocationButton(false);
                /* un-hide my location marker */
                this.myLocationMarker.visible = true;
                /* update journey details */
                this.journeyStarted = true;
                this.journeyDetails = "Journey started...";
                /* start watching for location changes and update the map and journey details accordingly */
                this.watchLocationAndUpdateJourney();
            },
            endJourney() {
                /* stop watching for location changes */
                this.clearWatch();
                /* remove the route drawn on map */
                this.clearRoute();
                /* hide my location marker  */
                this.myLocationMarker.visible = false;
                /* bring back my location button on screen */
                this.enableMyLocationButton(true);
                /* update journey details */
                this.journeyStarted = false;
                this.journeyDetails = "Destination Reached.";
            }
        },

        mixins: [ MapsHelper.MapsUIHelper, MapsHelper.DirectionsAPIHelper, MapsHelper.DistanceMatrixAPIHelper, MapsHelper.LocationHelper ],

        data() {
            return {
                APIKEY: "AIzaSyAqu-2C-XwLeZd6WBviXF0jcDKLR1YXgso",

                origin: { latitude: 0, longitude: 0 },
                destination: { latitude: 0, longitude: 0 },
                journeyDetails: "Journey: Not started yet!",
                allowExecution: false,
                journeyStarted: false,
                mapView: null,
                zoom: 17,

                messageList: [
                    { name: "Pharmacy", address: "Market str.", amount: "$24", date: "2h ago"},
                    { name: "AppleStore ", address: "300 Post Street ", amount: "$124 ", date: "3 h ago "},
                    { name: "Starbucks ", address: "Market str.", amount: "$9", date: "4h ago"},
                    { name: "TraNativeScriptfer to John Mayer", address: "", amount: "$17", date: "4h ago"},
                    { name: "Pharmacy", address: "Market str.", amount: "$24", date: "2h ago" },
                    { name: "Apple Store", address: "300 Post Street", amount: "$124", date: "3h ago" },
                    { name: "Starbucks", address: "Market str.", amount: "$9", date: "4h ago" },
                    { name: "TraNativeScriptferto John Mayer ", address: "", amount: "$17 ", date: "4 h ago ",
                        last: true}
                ]
            };
        }
    };
</script>

<style scoped lang="scss">
    // Start custom common variables
    @import '../app-variables';
    // End custom common variables

    // Custom styles
    .fa {
        color: $accent-dark;
    }

    .info {
        font-size: 20;
    }

        .home-panel {
        vertical-align: center;
        font-size: 20;
        margin: 15;
    }

    .description-label {
        margin-bottom: 15;
    }
</style>
