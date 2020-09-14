<template>
    <Page class="page" actionBarHidden="true">
        <!--<ActionBar title="Home" class="action-bar" />-->


        <DockLayout stretchLastChild="true">
            <!-- Top -->
            <StackLayout dock="top" height="150">
                <GridLayout rows="auto" columns="300, *" width="100%" height="150">

                    <Mapbox row="0" col="0"
                        width="100%" height="100%"
                        :accessToken="APIKEY"
                        mapStyle="traffic_day"
                        latitude="37.7397"
                        longitude="-121.4252"
                        hideCompass="true"
                        zoomLevel="12"
                        showUserLocation="false"
                        disableZoom="false"
                        disableRotation="false"
                        disableScroll="false"
                        disableTilt="false"
                        @mapReady="onMapReady($event)">
                    </Mapbox>

                    <GridLayout row="0" col="1" rows="auto,auto,auto,auto" columns="*"
                        width="100%" height="100%">
                        <Button row="0" @tap="onItemTap">Update Location</Button>
                        <Button row="1" @tap="onItemTap">Generate Attractor</Button>
                        <Button row="2" @tap="onItemTap">Generate Repeller</Button>
                        <button row="3" @tap="onItemTap">Generate Pair</button>     
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
                        <GridLayout columns="100, *" rows="auto, auto, auto" class="p-l-20 app-bg">

                            <Label :text="messages.amount" row="0" col="0" class="h1" color="#89D5E2" />
                            <Label :text="messages.date" row="1" col="0" class="body p-l-15" />
                            <Label :text="messages.name" row="0" col="1" class="h2 p-r-20" />
                            <Label :text="messages.address" row="1" col="1" class="body p-r-20" color="#C2C8E6" />
                            <StackLayout class="hr-light m-y-20" row="2" col="1" v-if="!messages.last">
                            </StackLayout>
                            <StackLayout class="m-y-20" row="2" col="1" v-else="messages.last">
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
          onMapReady(args) {
                args.map.addMarkers([
                    {
                        lat: 37.7397,
                        lng: -121.4252,
                        title: "Tracy, CA",
                        subtitle: "Home of The Polyglot Developer!",
                        onCalloutTap: () => {
                            utils.openUrl("https://www.thepolyglotdeveloper.com");
                        }
                    }
                ]);
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
