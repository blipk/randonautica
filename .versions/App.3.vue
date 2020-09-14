<template>
    <Page class="page" actionBarHidden="true">
        <!--<ActionBar title="Home" class="action-bar" />-->


        <DockLayout stretchLastChild="true">
            <!-- Top -->
            <StackLayout dock="top" height="430">
                <GridLayout rows="auto" columns="300, *" width="100%">

                    <Mapbox row="0" col="0"
                        width="100%" height="100%"

                        :accessToken="APIKEY"
                        :latitude="userLocation.latitude"
                        :longitude="userLocation.longtitude"

                        mapStyle="traffic_day"

                        hideCompass="true"
                        zoomLevel="3"
                        showUserLocation="false"
                        disableZoom="false"
                        disableRotation="true"
                        disableScroll="false"
                        disableTilt="true"

                        @mapReady="onMapReady($event)">
                    </Mapbox>

                    <GridLayout row="0" col="1" rows="auto,auto,auto,auto,auto,auto" columns="*"
                        width="100%" height="100%">
                        <Button row="0" @tap="setMapLocation" class="btn btn-primary btn-rounded-lg">Update Location</Button>
                        <Button row="1" @tap="getAttractor" class="btn btn-primary btn-rounded-lg">Get Attractor</Button>
                        <Button row="2" @tap="getRepeller" class="btn btn-primary btn-rounded-lg">Get Repeller</Button>
                        <button row="3" @tap="getQuantumPoint" class="btn btn-primary btn-rounded-lg">Get Quantum Point</button>
                        <button row="4" @tap="getQRNGData" class="btn btn-primary btn-rounded-lg">Get Quantum Data</button>
                        <button row="5" @tap="drawRadius" class="btn btn-primary btn-rounded-lg">Draw Radius</button>
                    </GridLayout>

                </GridLayout>
            </StackLayout>
            <!-- /Top -->

            <!-- Bottom -->
            
            <StackLayout dock="bottom"> 
                <GridLayout rows="auto" columns="100%,*,100%" height="50">
                    <Slider value="1141" minValue="1000" maxValue="10000" @valueChange="updateRadius($event)" />

                    <!--
                    <Button col="0" text="Photo" @tap="onButtonTap" />
                    <TextField col="1" v-model="textFieldValue" hint="Enter message..." />
                    <Button col="2" text="Send" @tap="onButtonTap" />
                    -->
                </GridLayout>
            </StackLayout>
            <!-- /Bottom -->


            <!-- Middle -->
            <StackLayout orientation="vertical" class="m-t-30 app-bg">
                <RadListView ref="listView" for="location in fatumLocationsList">
                    <v-template>
                        <GridLayout columns="40, *, *" rows="auto, auto" class="p-l-20 app-bg">
                            <StackLayout row="0" col="0" @tap="onFatumLocationSelect(location)">
                              <Image src="~/images/attractor-marker.png" width="74%" height="74%" v-if="location.type=='Attractor'"></Image>
                              <Image src="~/images/repeller-marker.png" width="74%" height="74%" v-else-if="location.type=='Repeller'"></Image>
                            </StackLayout>
                            <StackLayout row="0" col="1" @tap="onFatumLocationSelect(location)">
                              <Label :text="location.type + ' ' + location.usertag" v-if="location.usertag!==undefined" color="#000000" />
                              <Label :text="location.type" v-else=""  />
                            </StackLayout>
                            <StackLayout row="0" col="2" @tap="onFatumLocationSelect(location)">
                              <Label :text="'Strength ' + location.strength" />
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
    import * as utils from "utils/utils";
    import RadListView from "nativescript-ui-listview/vue";
    Vue.use(RadListView);

    import MapsHelper from "./MapsHelper.js";
    import FatumHelper from "./FatumHelper.js";

    var utilsModule = require("tns-core-modules/utils/utils");
    var Toast = require("nativescript-toast");

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
              .catch(() => this.allowupdatExecution = false);
        },

        mixins: [   MapsHelper.LocationHelper, MapsHelper.MapsUIHelper, 
                    FatumHelper.QRNGHelper, FatumHelper.FatumLocationsHelper  ],

        data() {
            return {
                APIKEY: "pk.eyJ1IjoiYmxpcGs5OTkiLCJhIjoiY2p1NHJ0dmZ6MDQ4OTN6bG0zNW92NHcxaSJ9.Il5xe510vYEvH3BQPwwtuQ",
                mapBox: null,
                allowExecution: true,

                userLocation: { latitude: 0, longitude: 0 },
                fatumLocationsList: [
                    { type: "Attractor", strength: 1, latitude: 0, longitude: 0, usertag: "first" },
                    { type: "Repeller", strength: 1, latitude: 0, longitude: 0 },
                    { type: "Repeller", strength: 1, latitude: 0, longitude: 0 },
                    { type: "Repeller", strength: 1, latitude: 0, longitude: 0 },
                    { type: "Repeller", strength: 1, latitude: 0, longitude: 0 },
                    { type: "Repeller", strength: 1, latitude: 0, longitude: 0 },
                    { type: "Repeller", strength: 1, latitude: 0, longitude: 0 },
                    { type: "Repeller", strength: 1, latitude: 0, longitude: 0 },
                    { type: "Repeller", strength: 1, latitude: 0, longitude: 0 },
                    { type: "Repeller", strength: 1, latitude: 0, longitude: 0 },
                    { type: "Repeller", strength: 1, latitude: 0, longitude: 0 },
                    { type: "Repeller", strength: 1, latitude: 0, longitude: 0 },
                ],

                radius: 1000,
            };
        },

        methods: {
            onMapReady(args) {
                this.mapBox = args.map;
                this.setMapLocation();
            },
            
            setMapLocation: function() {
                this.fetchMyLocation();
                this.addMarkerToMap(this.userLocationMarker);
                console.log("User location result: " + JSON.stringify(this.userLocation));
                    
                this.mapBox.setCenter({
                    lat: this.userLocation.latitude,
                    lng: this.userLocation.longitude, 
                });
                this.mapBox.setZoomLevel({
                    level: 13.5,
                });
                /*
                this.mapBox.setViewport({
                        bounds: {
                            north: this.userLocation.latitude+0.01,
                            east: this.userLocation.longitude+0.01,
                            south: this.userLocation.latitude-0.01,
                            west: this.userLocation.longitude-0.01,
                        },
                        animated: true
                });    */            
                this.mapBox.getViewport().then(
                    function(result) {
                        console.log("Mapbox getViewport done, result: " + JSON.stringify(result));
                    }
                )

                console.log("fatum locations..")
                this.fatumLocationsList[0].longitude = this.userLocation.longitude+0.005;
                this.fatumLocationsList[0].latitude = this.userLocation.latitude+0.005;
                this.fatumLocationsList[1].longitude = this.userLocation.longitude-0.005;
                this.fatumLocationsList[1].latitude = this.userLocation.latitude-0.005;
                this.addFatumLocationsToMap();
            },

            updateRadius: function(args) {
                this.radius = args.object.value;
                var toast = Toast.makeText(this.radius.toString());
                toast.show();
            },

            getQRNGData: function() {
                console.log("Getting qrng data");
                this.reqQRNGData();
            },


            getQuantumPoint: function() {
                console.log("Button was pressed");
            },

            getAttractor: function() {
                console.log("Button was pressed");
            },

            getRepeller: function() {
                console.log("Button was pressed");
            },



            onFatumLocationSelect: function(location) {
                this.openLocationExternally(location);
                
            },

            createGeoJSONCircle: function(center, radiusInKm, points) {
                if(!points) points = 64;

                var coords = {
                    latitude: center[1],
                    longitude: center[0]
                };

                var km = radiusInKm;

                var ret = [];
                var distanceX = km/(111.320*Math.cos(coords.latitude*Math.PI/180));
                var distanceY = km/110.574;

                var theta, x, y;
                for(var i=0; i<points; i++) {
                    theta = (i/points)*(2*Math.PI);
                    x = distanceX*Math.cos(theta);
                    y = distanceY*Math.sin(theta);

                    ret.push([coords.longitude+x, coords.latitude+y]);
                }
                ret.push(ret[0]);


                return {
                    "type": "geojson",
                    "data": {
                        "type": "FeatureCollection",
                        "features": [{
                            "type": "Feature",
                            "geometry": {
                                "type": "Polygon",
                                "coordinates": [ret]
                            }
                        }]
                    }
                };
            },

            drawRadius: function() {
                console.log("Radius was pressed");
                this.mapBox.getNativeMapView().mapboxMap.removeLayer("circle");
                this.mapBox.getNativeMapView().mapboxMap.removeSource("polygon");

                var geoJSON = JSON.stringify(this.createGeoJSONCircle([this.userLocation.longitude, this.userLocation.latitude], 3))
                var sourceLayer = new com.mapbox.mapboxsdk.style.sources.GeoJsonSource("polygon", geoJSON)
                console.log(geoJSON);
                this.mapBox.getNativeMapView().mapboxMap.addSource(sourceLayer);


                var layer = new com.mapbox.mapboxsdk.style.layers.FillLayer("circle", "polygon");
                //layer.setSourceLayer(sourceLayer);

                layer.setProperties([
                    com.mapbox.mapboxsdk.style.layers.PropertyFactory.fillColor("#4286f4"),
                    com.mapbox.mapboxsdk.style.layers.PropertyFactory.fillOpacity(new java.lang.Float(0.7)),
                ]);
                this.mapBox.getNativeMapView().mapboxMap.addLayer(layer);
            },

            onButtonTap: function() {
                console.log("Button was pressed");
            },

            onItemTap: function() {
                console.log("Button was pressed");
            },
        },


    };
</script>

<style scoped lang="scss">
    // Custom styles
   
</style>
