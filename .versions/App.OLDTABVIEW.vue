<template>

    <Page class="page" actionBarHidden="true" @loaded="pageLoaded">
    
        <!--<ActionBar title="Home" class="action-bar" />-->
    <TabView id="mainTabView" :selectedIndex="mainTabIndex" @selectedIndexChange="mainTabIndexChanged" 
            class="mainTabView" iosIconRenderingMode="alwaysOriginal" 
            androidOffscreenTabLimit="3" androidTabsPosition="bottom">
    
        <TabViewItem title="Deixis" iconSource="~/images/penrose.png">
        <DockLayout stretchLastChild="true">
            <!-- Top -->
            <StackLayout dock="top" height="430">
                <GridLayout rows="auto, 380, auto" columns="*">
                    <GridLayout row="0" column="0" rows="auto" columns="*">
                        <Label row="0" column="0" text="This area will be for user gameplay profile"   color="#000080"/>
                    </GridLayout>

                     <AbsoluteLayout row="1" col="0">
                         <GridLayout top="135" left="182" background="transparent" style="z-index: 1;">
                         <ActivityIndicator top="135" left="182" style="z-index: 1;"
                            :busy="processingFatumReq" :busyChange="voidEvent" color="purple"></ActivityIndicator>
                        <Progress value="50" maxValue="100" @valueChange="voidEvent" />
                         </GridLayout>

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

                            @mapReady="onMapReady">
                        </Mapbox>

                        <GridLayout top="4" left="3"  rows="auto,auto,auto,auto,auto,auto,auto" columns="*">
                            <Button row="0" @tap="getUserLocation" class="locButton btn btn-primary btn-rounded-lg" style="margin: 1">Set Location</Button>
                        </GridLayout>

                        <GridLayout top="4" id="fatumButtons" @layoutChanged="repositionComponent($event, [-0.0001, 0], true)" rows="auto,auto,auto,auto,auto,auto,auto" columns="*">
                            <button row="1" @tap="reqFatumTask('getpseudo')" :isEnabled="!processingFatumReq"  class="fbutton btn btn-primary btn-rounded-lg">Pseudo Point</button>
                            <button row="2" @tap="reqFatumTask('getquantum')" :isEnabled="!processingFatumReq" class="fbutton btn btn-primary btn-rounded-lg">Qntum Point</button>
                            <Button row="3" @tap="reqFatumTask('getattractor')" :isEnabled="!processingFatumReq" class="fbutton btn btn-primary btn-rounded-lg">Attractor</Button>
                            <Button row="4" @tap="reqFatumTask('getvoid')" :isEnabled="!processingFatumReq" class="fbutton btn btn-primary btn-rounded-lg">Void</Button>
                            <button row="5" @tap="reqFatumTask('getpair')" :isEnabled="!processingFatumReq" class="fbutton btn btn-primary btn-rounded-lg">Pair</button>
                            <!--<button row="6" @tap="getQRNGData" class="fbutton btn btn-primary btn-rounded-lg">QRNG Data</button>-->
                        </GridLayout>
                    </AbsoluteLayout>


                    <StackLayout row="2" col="0" VerticalAlignment="bottom"> 
                        <GridLayout rows="auto" columns="*, 100%">
                            <Slider col="0" :value="this.radius" minValue="1000" maxValue="10000" @valueChange="updateRadius" />
                            <TextField #radiusTxtBox col="1"
                                :text='radius' 
                                secure="false"
                                keyboardType="number"
                                returnKeyType="done" 
                                autocorrect="false"
                                maxLength="5"
                                @returnPress="checkRadiusInput"
                                class="input input-border"></TextField>
                                <!-- @textChange="checkRadiusInput"
                                @focus="checkRadiusInput" 
                                @blur="checkRadiusInput" -->
                        </GridLayout>
                    </StackLayout>
                </GridLayout>
            </StackLayout>
            <!-- /Top -->

            <!-- Bottom -->
            <StackLayout dock="bottom"> 
                <GridLayout rows="auto" columns="auto,*,auto" height="50">
                    <Button col="0" text="" class="camera-button" @tap="voidEvent" />
                    <TextField col="1" v-model="textFieldValue" hint="Enter message for log..." />
                    <Button col="2" text="Send" @tap="$routeToModal('TestDialog')" /> 
                </GridLayout>
            </StackLayout>
            <!-- /Bottom -->


            <!-- Middle -->
            <StackLayout orientation="vertical">

            </StackLayout>
            <!-- /Middle -->
        </DockLayout>
        
        </TabViewItem>

        <TabViewItem class="fi" :title="String.fromCharCode(0xe907) + ' Journals'" iconSource="~/images/penrose.png">
        </TabViewItem>


        <TabViewItem title="Theory" iconSource="~/images/penrose.png">
            <DockLayout stretchLastChild="true">
                <PDFView :src="FAQPDF" @onLoad="voidEvent"></PDFView>
            </DockLayout>
        </TabViewItem>
        
    </TabView>
    

    </Page>
</template>


<script>
    import Vue from "nativescript-vue";
    import * as permissions from 'nativescript-permissions'
    import * as platform from 'platform'
    import * as utils from "utils/utils";
    import RadListView from "nativescript-ui-listview/vue";
    import * as styleprops from "ui/styling/style-properties";
    Vue.use(RadListView);

    import MapsHelper from "./MapsHelper.js";
    import FatumHelper from "./FatumHelper.js";

    import { Color } from "tns-core-modules/color";
    import * as Toast from 'nativescript-toast';
    import * as platformModule from "tns-core-modules/platform";

    import * as View from "tns-core-modules/ui/core/view";
    import { EventData } from 'tns-core-modules/data/observable';

    import { knownFolders, Folder, File, path } from "tns-core-modules/file-system";

    import Dialog from './Dialog'; //TO DO start externalizing components

    export default {
        created: function() {
            this.appFolder = knownFolders.currentApp();
            this.FAQPDF = path.normalize(this.appFolder.path + this.FAQPDF);
            
            /*
            var outArr = [];
            this.appFolder.getEntities().then((entities) => {
                // entities is array with the document's files and folders.
                entities.forEach((entity) => {
                    console.log(entity.path);
                    outArr.push({
                            name: entity.name,
                            path: entity.path,
                            lastModified: entity.lastModified.toString()
                        });
                });
            }).catch((err) => { console.log(err.stack); });
            */

            this.screenScale = platformModule.screen.mainScreen.scale;
            this.screenWidth = platformModule.screen.mainScreen.heightDIPs / this.screenScale;
            this.screenHeight = platformModule.screen.mainScreen.widthDIPs / this.screenScale;
            console.log("SCREEN: " + this.screenWidth + "x" + this.screenHeight + ":" + this.screenScale);

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
                appFolder: null,
                FAQPDF: "/resources/FAQ.pdf",
                screenWidth: null, screenHeight: null, screenScale: null,
                MAPBOX_APIKEY: "pk.eyJ1IjoiYmxpcGs5OTkiLCJhIjoiY2p1NHJ0dmZ6MDQ4OTN6bG0zNW92NHcxaSJ9.Il5xe510vYEvH3BQPwwtuQ",
                GMAPS_APIKEY: "AIzaSyAqu-2C-XwLeZd6WBviXF0jcDKLR1YXgso",
                mapBox: null,
                allowExecution: true,

                page: null,
                mainTabIndex: 0,
                journalTabIndex: 0,
                
                radius: 1141,
                //PageTest: TestPage,
            };
        },



        computed: {        },
        components: {     }, //TO DO start externalizing components

        methods: {
            voidEvent() {
                return;
            },
            // General UI
            pageLoaded(args) {
                console.log("PAGE LOAD")
                this.page = args.object;

                var buttons = View.getViewById(this.page, "fatumButtons");
 
                /*buttons.on("layoutChanged", (e) => {
                    console.log("TEST EVENT");
                    console.log(buttons.getActualSize())
                });
                
                
                buttons.addEventListener("layoutChanged", function() {
                    console.log("AAAA");
                    console.log(buttons.getActualSize())
                }, this);*/
                //buttons.layoutChanged = function() { console.log("AAAA") };
                
            },
            tabIndexChanged: function(args) {
                args.selectedIndex = args.value;
                console.log('Current tab index: ' + args.selectedIndex);
            },
            mainTabIndexChanged: function(args) {
                this.mainTabIndex = args.value;
            },
            journalTabIndexChanged: function(args) {
                this.journalTabIndex = args.value;
            },
            onMapReady: function(args) {
                this.mapBox = args.map;
                this.getUserLocation();
            },
            refreshUI() {
                var mainTabView = View.getViewById(this.page, "mainTabView");
                var journalTabView = View.getViewById(this.page, "journalTabView");
                mainTabView.selectedIndex = this.mainTabIndex;
                journalTabView.selectedIndex = this.journalTabIndexChanged;
                this.page.getViewById('pointListView').refresh();
            },
            colorCompute: function (prop) {
                return prop ? '#777777' : '#000000';
            },
            repositionComponent: function(prop, percentOffset = [-0.0001, 5], parentAbsolute = false) { //W, H
                let component = prop.object;

                let maxWidth = 0;
                let maxHeight = 0;
                if (component.getChildrenCount !== undefined) {
                    for(let i = 0; i < component.getChildrenCount(); i++) {
                        let child = component.getChildAt(i);
                        let childWidth = parseFloat(child.getActualSize().width);
                        let childHeight = parseFloat(child.getActualSize().height);
                        if (childWidth > maxWidth) maxWidth = childWidth;
                        maxHeight += childHeight;
                    }
                } else {
                    maxWidth = component.getActualSize().width
                    maxHeight = component.getActualSize().height
                }

                // Check if negative value given i.e. moving from right
                // And invert the percentage if given a negative
                percentOffset[0] === Math.abs(percentOffset[0]) ? 
                    percentOffset[0] = percentOffset[0]/100 :
                    percentOffset[0] = Math.abs((Math.abs(percentOffset[0])-100) / 100 );
                
                percentOffset[1] === Math.abs(percentOffset[1]) ?
                    percentOffset[1] = percentOffset[0]/100 :
                    percentOffset[1] = Math.abs((Math.abs(percentOffset[1])-100) / 100 );

                let translateFromLeft = this.screenWidth*percentOffset[0] + maxWidth/2*percentOffset[0];
                let translateFromTop = this.screenHeight*percentOffset[1] + maxHeight*percentOffset[1];
                
                if (parentAbsolute) {
                    component.left = translateFromLeft; //.top and .left for absolute views or can use translateX/Y
                    component.top = translateFromTop; 
                } else {
                    component.translateX = translateFromLeft;
                    component10.translateY = translateFromTop;
                }
            },
            


            // Fatum algorithm
            getQRNGData: function() {width
                // Will feed this to the server or local app in later revision
                this.reqQRNGData();
            },

            reqFatumTask: function(taskName) {
                this.reqTaskByName(taskName, `${this.fatumGenerationPointLocation.lat},${this.fatumGenerationPointLocation.lng}`, this.radius.toString(), this.validateFatumResponse);
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
                    inputValue = 1000;width
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
    .locationList {
        font-size: 14;
        color: #000;
    }
    .tc { text-align: center; }
    .tr { text-align: right; }
    .vc { vertical-align: center; }
    .hc { horizontal-align:center; }
    .camera-button {
        background-color: rgba(0, 0, 0, 0);
        background-image: url("~/images/compact-camera.png");
        background-repeat: no-repeat;
        margin: 2;
        background-position: 50% 50%;
        background-size: 60 60;
        width: 23;
    }
    .fbutton {
        margin: 1;
        font-family: FontAwesome;
        font-size: 11pt;
        color: white;
        background-color: purple;
    }
    .fbutton:disabled {
        background-color: lightslategray;
        opacity: 0.4;
    }
    .locButton {
        font-family: FontAwesome;
        font-size: 11pt;
    }
    .mainTabView {
        font-size: 9pt;
        tab-text-color: lightslategray;
        selected-tab-text-color: white;
        tab-background-color: black;
        android-selected-tab-highlight-color: purple;
    }
    .mainTabViewItem {
        font-size: 64;
    }
    .journalTabView {
        font-family: 'Roboto';
        font-size: 16;
    }
    .journalTabViewItem {
        font-family: 'Roboto';
        font-size: 16;
    }
    .fs {
        font-family: 'Roboto';
    }
</style>
