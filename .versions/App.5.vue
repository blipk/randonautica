<template>
    <Page class="page" actionBarHidden="true" @loaded="pageLoaded($event)">
        <!--<ActionBar title="Home" class="action-bar" />-->


        <DockLayout stretchLastChild="true">
            <!-- Top -->
            <StackLayout dock="top" height="430">
                <GridLayout rows="400, 50" columns="*, 110%">
                     <AbsoluteLayout row="0" col="0" colSpan="2">
                        <Mapbox 
                            top="0" left="0"
                            width="100%" height="100%"
                            
                            v-if="allowExecution"
                            :accessToken="MAPBOX_APIKEY"
                            :latitude="userLocationMarker.lat"
                            :longitude="userLocationMarker.lng"

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
                        

                        <GridLayout top="0" left="310%"  rows="auto,auto,auto,auto,auto,auto,auto" columns="*">
                            <Button row="0" @tap="getUserLocation" class="btn btn-primary btn-rounded-lg" style="margin: 1">My Location</Button>
                            <button row="1" @tap="reqFatumTask('getpseudo')" class="btn btn-primary btn-rounded-lg" style="margin: 1">Psuedo Point</button>
                            <button row="2" @tap="reqFatumTask('getquantum')" class="btn btn-primary btn-rounded-lg" style="margin: 1">Qntum Point</button>
                            <Button row="3" @tap="reqFatumTask('getattractor')" class="btn btn-primary btn-rounded-lg" style="margin: 1">Attractor</Button>
                            <Button row="4" @tap="reqFatumTask('getvoid')" class="btn btn-primary btn-rounded-lg" style="margin: 1">Void</Button>
                            <button row="5" @tap="reqFatumTask('getpair')" class="btn btn-primary btn-rounded-lg" style="margin: 1">Pair</button>
                            <!--<button row="6" @tap="getQRNGData" class="btn btn-primary btn-rounded-lg" style="margin: 3">QRNG Data</button>-->
                        </GridLayout>
                    </AbsoluteLayout>
                    <!--
                    <Mapbox row="0" col="0"
                        width="100%" height="100%"
                        v-if="allowExecution"
                        :accessToken="MAPBOX_APIKEY"
                        :latitude="userLocationMarker.lat"
                        :longitude="userLocationMarker.lng"

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

                    <GridLayout row="0" col="1" rows="auto,auto,auto,auto,auto,auto,auto" columns="*">
                        <Button row="0" @tap="getUserLocation" class="btn btn-primary btn-rounded-lg">Update Location</Button>
                        <button row="1" @tap="reqFatumTask('getpseudo')" class="btn btn-primary btn-rounded-lg">Psuedo Point</button>
                        <button row="2" @tap="reqFatumTask('getquantum')" class="btn btn-primary btn-rounded-lg">Qntum Point</button>
                        <Button row="3" @tap="reqFatumTask('getattractor')" class="btn btn-primary btn-rounded-lg">Attractor</Button>
                        <Button row="4" @tap="reqFatumTask('getvoid')" class="btn btn-primary btn-rounded-lg">Void</Button>
                        <button row="5" @tap="reqFatumTask('getpair')" class="btn btn-primary btn-rounded-lg">Pair</button>
                        <button row="6" @tap="getQRNGData" class="btn btn-primary btn-rounded-lg">QRNG Data</button>
                    </GridLayout>
                    -->
                    <StackLayout row="1" col="0" colSpan="2"> 
                        <GridLayout rows="auto" columns="*, 100%">
                            <Slider col="0" :value="this.radius" minValue="1000" maxValue="10000" @valueChange="updateRadius($event)" />
                            <TextField #radiusTxtBox col="1"
                                :text='radius' 
                                secure="false"
                                keyboardType="number"
                                returnKeyType="done" 
                                autocorrect="false"
                                maxLength="5"
                                @returnPress="checkRadiusInput($event)"
                                class="input input-border"></TextField>
                                <!-- @textChange="checkRadiusInput($event)"
                                @focus="checkRadiusInput($event)" 
                                @blur="checkRadiusInput($event)" -->
                        </GridLayout>
                    </StackLayout>
                </GridLayout>
            </StackLayout>
            <!-- /Top -->

            <!-- Bottom -->
            
            <StackLayout dock="bottom"> 
                <GridLayout rows="auto" columns="100%,*,100%" height="50">
                    <!--
                    <Button col="0" text="Photo" @tap="onLogPhoto" />
                    <TextField col="1" v-model="textFieldValue" hint="Enter message for log..." />
                    <Button col="2" text="Send" @tap="onLogCommit" />
                    -->
                </GridLayout>
            </StackLayout>
            <!-- /Bottom -->


            <!-- Middle -->
            <StackLayout orientation="vertical">
                <RadListView id="pointListView" for="location in fatumLocationsList">
                    <v-template>
                        <GridLayout columns="40, *, *, *" rows="auto" class="p-l-20 app-bg">
                            <StackLayout row="0" col="0" @tap="onFatumLocationSelect(location)">
                              <Image src="~/images/attractor-marker.png" width="74%" height="74%" v-if="location.type=='Attractor'"></Image>
                              <Image src="~/images/repeller-marker.png" width="74%" height="74%" v-else-if="location.type=='Repeller'"></Image>
                            </StackLayout>
                            <StackLayout row="0" col="1" @tap="onFatumLocationSelect(location)">
                              <Label :text="location.type + ' (' + location.usertag + ')'" v-if="location.usertag" :color="colorCompute(location.hiddenMarker)" />
                              <Label :text="location.type" v-else=""  :color="colorCompute(location.hiddenMarker)"/>
                            </StackLayout>
                            <StackLayout row="0" col="2" @tap="onFatumLocationSelect(location)">
                              <Label :text="'Strength ' + location.strength" :color="colorCompute(location.hiddenMarker)"/>
                            </StackLayout>
                            <StackLayout row="0" col="3" @tap="onFatumLocationSelect(location)">
                              <!--<Label :text="'Distance ' + getLocationDistanceFromUser(location)"/>-->
                              <Label :text="'Distance ' + location.distance + 'm'" :color="colorCompute(location.hiddenMarker)"/>
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

    import { Color } from "tns-core-modules/color";
    import * as Toast from 'nativescript-toast';

    var dialogs = require("tns-core-modules/ui/dialogs");

    export default {
        created: function() {
          if (platform.isIOS) { /* dont run the android permissions routine for iOS */
              this.allowExecution = true;
              return;
          }
          let permissionsNeeded = [
              android.Manifest.permission.ACCESS_FINE_LOCATION,
              android.Manifest.permission.ACCESS_COARSE_LOCATION
          ];
          permissions
              .requestPermissions(permissionsNeeded, "Location")
              .then(() => this.allowExecution = true)
              .catch(() => this.allowExecution = false);
        },

        mixins: [   MapsHelper.LocationHelper, MapsHelper.MapsUIHelper, 
                    FatumHelper.QRNGHelper, FatumHelper.FatumLocationsHelper, FatumHelper.FatumAlgorithmHelper  ],

        data() {
            return {
                MAPBOX_APIKEY: "pk.eyJ1IjoiYmxpcGs5OTkiLCJhIjoiY2p1NHJ0dmZ6MDQ4OTN6bG0zNW92NHcxaSJ9.Il5xe510vYEvH3BQPwwtuQ",
                GMAPS_APIKEY: "AIzaSyAqu-2C-XwLeZd6WBviXF0jcDKLR1YXgso",
                mapBox: null,
                allowExecution: true,
                page: null,
                radius: 1141,
            };
        },

        computed: {        },

        methods: {
            // General UI
            pageLoaded(args) {
                this.page = args.object;
            },
            onMapReady(args) {
                this.mapBox = args.map;
                this.getUserLocation();
            },
            refreshList(){
                this.page.getViewById('pointListView').refresh();
            },
            colorCompute: function (prop) {
                return prop ? '#777777' : '#000000';
            },
            


            // Fatum algorithm
            getQRNGData: function() {
                // Will feed this to the server or local app in later revision
                this.reqQRNGData();
            },

            reqFatumTask: function(taskName) {
                this.reqTaskByName(taskName, `${this.fatumGenerationPointLocation.lat},${this.fatumGenerationPointLocation.lng}`, this.radius.toString(), this.validateFatumResponse);
            },
            validateFatumResponse: function(result) {
                if (result.success == true) {
                    result.generatedLocations.forEach(function(generatedLocation, i) {
                        this.fatumLocationsList.push({
                            type: this.FatumLocationType.properties[Object.values(generatedLocation.type)[0]+1].name,
                            lat: generatedLocation.position.lat,
                            lng: generatedLocation.position.lng,
                            strength: generatedLocation.strength.toFixed(2),
                            distance: generatedLocation.distance,
                            radius: generatedLocation.radius,
                        });
                        this.refreshFatumLocationsOnMap();
                    }, this);
                } else {

                }
            },
            onFatumLocationSelect: function(location) {
                this.markerCalloutTapFunction(this.fatumLocationsMarkers[this.fatumLocationsList.indexOf(location)], this);
            },

            mapTest: function() {
                //this.mapBox.getNativeMapView().mapboxMap.MapView
            },


            // Mapping functions
            getUserLocation: function() {
                this.fetchMyLocation(this.processUserLocation);
            },
            processUserLocation: function() {
                this.setFatumGenerationLocation(this.userLocation);
                this.updateRadius();
                this.refreshFatumLocationsOnMap();
            },
            checkRadiusInput: function(args) {
                let inputValue = parseInt(args.object.text)
                if (inputValue > 10000) {
                    inputValue = 10000;
                } else if (inputValue < 1000) {
                    inputValue = 1000;
                }
                args.object.text = inputValue
                this.updateRadius(args);
            },
            updateRadius: function(args) {
                if (args) this.radius = args.object.value || parseInt(args.object.text);
                var toast = Toast.makeText(this.radius.toString()).show();
                this.drawRadius(this.fatumGenerationPointLocation, this.radius);
            },
            drawRadius: function(location, radius) {
                this.mapBox.removePolygons([1]);
                var circlePoints = this.createCirclePoints([location.lng, location.lat], radius)
                this.mapBox.addPolygon({
                        id: 1, // optional, can be used in 'removePolygons'
                        fillColor: new Color("blue"),
                        fillOpacity: 0.07,

                        // stroke-related properties are only effective on iOS
                        strokeColor: new Color("black"),
                        strokeWidth: 12,
                        strokeOpacity: 1,

                        points: circlePoints
                })
                .then(result => console.log("Mapbox addPolygon done"))
                .catch(error => console.log("Mapbox addPolygon error: " + error));

                this.mapBox.setViewport({
                    animated: true,
                    bounds: {
                        north: circlePoints[0].lat+(this.radius/100000),
                        east: circlePoints[15].lng+(this.radius/100000),
                        south: circlePoints[31].lat-(this.radius/100000),
                        west: circlePoints[47].lng-(this.radius/100000),
                    }
                });

                return circlePoints;
            },
            getLocationDistanceFromUser: function(location) {
                console.log("Getting location distance");
                //this.getRouteDistance(this.userLocation, location);
                //return location.routeDistance;
                return this.getStraightDistance(this.userLocation, location);
            },
        },


    };
</script>

<style scoped lang="scss">
    // Custom styles
   
</style>
