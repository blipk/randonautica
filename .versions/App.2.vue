<template>
    <Page class="page" actionBarHidden="true">
        <!--<ActionBar title="Home" class="action-bar" />-->


        <DockLayout stretchLastChild="true">
            <!-- Top -->
            <StackLayout dock="top" height="250">
                <GridLayout rows="auto" columns="300, *" width="100%">

                    <Mapbox row="0" col="0"
                        width="100%" height="100%"
                        :accessToken="APIKEY"
                        mapStyle="traffic_day"
                        :latitude="userLocation.latitude"
                        :longitude="userLocation.longtitude"

                        hideCompass="true"
                        zoomLevel="3"
                        showUserLocation="false"
                        disableZoom="false"
                        disableRotation="true"
                        disableScroll="false"
                        disableTilt="true"
                        @mapReady="onMapReady($event)">
                    </Mapbox>

                    <GridLayout row="0" col="1" rows="auto,auto,auto,auto" columns="*"
                        width="100%" height="100%">
                        <Button row="0" @tap="setMapLocation">Update Location</Button>
                        <Button row="1" @tap="getAttractor">Generate Attractor</Button>
                        <Button row="2" @tap="getRepeller">Generate Repeller</Button>
                        <button row="3" @tap="getQRNGData">Get Quantum Data</button>     
                    </GridLayout>

                </GridLayout>
            </StackLayout>
            <!-- /Top -->

            <!-- Bottom -->
            <StackLayout dock="bottom"> 
                <GridLayout rows="auto" columns="100%,*,100%" height="50">
                    <Button col="0" text="Photo" @tap="onButtonTap" />
                    <TextField col="1" v-model="textFieldValue" hint="Enter message..." />
                    <Button col="2" text="Send" @tap="onButtonTap" />
                </GridLayout>
            </StackLayout>
            <!-- /Bottom -->


            <!-- Middle -->
            <StackLayout orientation="vertical" class="m-t-30 app-bg">
                <RadListView ref="listView" for="messages in messageList"
                    @itemTap="onItemTap" backgroundColor="#999999">
                    <v-template>
                        <GridLayout columns="*, *" rows="auto, auto" class="p-l-20 app-bg">

                            <StackLayout row="0" col="2" v-if="messages.origin === 'USER'">
                              <Label :text="messages.msg" color="#C2C8E6" />
                            </StackLayout>
                            <StackLayout row="0" col="1"  v-if="messages.origin === 'SYS'">
                              <Label :text="messages.msg" color="#C2C8E6" v-if="!messages.msg.lat" />
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

        mixins: [ MapsHelper.LocationHelper, MapsHelper.MapsUIHelper, FatumHelper.QRNGHelper  ],

        methods: {
          onMapReady(args) {
                this.mapBox = args.map;



                this.fetchMyLocation();
            },
            
            setMapLocation: function() {
                console.log("Getting user location...");
                this.fetchMyLocation();
                console.log("Setting location marker...");
                this.addMarkerToMap(this.userLocationMarker, false);
                console.log("User location result: " + JSON.stringify(this.userLocation));

                this.mapBox.setViewport({
                        bounds: {
                            north: this.userLocation.latitude+0.007,
                            east: this.userLocation.longitude+0.007,
                            south: this.userLocation.latitude-0.007,
                            west: this.userLocation.longitude-0.007,
                        },
                        animated: true
                    }
                );
                //this.mapBox.setZoomLevel({level: 5});
                
                this.mapBox.getViewport().then(
                    function(result) {
                        console.log("Mapbox getViewport done, result: " + JSON.stringify(result));
                    }
                )
            },

            getQRNGData: function() {
                console.log("Getting qrng data");
                this.reqQRNGData("4");
            },

            getAttractor: function() {
                console.log("Button was pressed");
            },

            getRepeller: function() {
                console.log("Button was pressed");
            },

            onButtonTap: function() {
                console.log("Button was pressed");
            },

            onItemTap: function() {
                console.log("Button was pressed");
            },
        },


        data() {
            return {
                APIKEY: "pk.eyJ1IjoiYmxpcGs5OTkiLCJhIjoiY2p1NHJ0dmZ6MDQ4OTN6bG0zNW92NHcxaSJ9.Il5xe510vYEvH3BQPwwtuQ",


                atrractors: [{ latitude: 0, longitude: 0 }],
                repellers: [{ latitude: 0, longitude: 0 }],
                userLocation: { latitude: 0, longitude: 0 },
                mapBox: null,
                allowExecution: true,

                messageList: [
                    { origin: "SYS ", msg: "Generate strength 9.99"},
                    { origin: "USER ", msg: "text message log example"},
                    { origin: "USER ", msg: "text message log example"},
                    { origin: "USER ", msg: "photo"},
                    { origin: "SYS", msg: {lat: 37.7397, long:-121.4252}},
                    { origin: "USER ", msg: "text message log example"},
                    { origin: "USER ", msg: "text message log example"},
                    { origin: "USER ", msg: "text message log example"},
                    { origin: "USER ", msg: "text message log example"},
                    { origin: "USER ", msg: "text message log example"},
                    { origin: "USER ", msg: "text message log example"},
                    { origin: "USER ", msg: "text message log example"},
                    { origin: "USER ", msg: "text message log example"},
                    { origin: "USER ", msg: "text message log example"},
                    { origin: "USER ", msg: "text message log example"},
                    { origin: "USER ", msg: "text message log example"},
                    { origin: "USER ", msg: "text message log example"},
                ]
            };
        }
    };
</script>

<style scoped lang="scss">
    // Custom styles
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
