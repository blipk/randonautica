<template>

    <Page class="page" id="main-page" actionBarHidden="true" @loaded="pageLoaded">
    
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
                        <!--
                            <Label row="0" column="0" text="This area will be for user gameplay profile"   color="#000080"/>
                            -->
                    </GridLayout>

                     <AbsoluteLayout row="1" col="0">
                         <GridLayout top="135" left="182" background="transparent" style="z-index: 1;">
                         <ActivityIndicator top="135" left="182" style="z-index: 1;"
                            :busy="Object.values(processingFatumReq).some((val) => {return val == true;})" :busyChange="voidEvent" color="purple"></ActivityIndicator>
                        <!--
                            <Progress value="50" maxValue="100" @valueChange="voidEvent" />
                            -->
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

                        <GridLayout top="4" left="35"  rows="auto,auto,auto,auto,auto,auto,auto" columns="*">
                            <Button row="0" @tap="getUserLocation" class="location-button"></Button>
                            <Label class="fi location-button-label" text="location" />
                        </GridLayout>

                        <GridLayout top="1" left="1"  rows="auto,auto,auto,auto,auto,auto,auto" columns="*">
                            <Button col="0" text="" class="generate-button" @tap="toggleGenerationOptions" />
                        </GridLayout>

                        <GridLayout top="34" id="generationOptionsView" style="visibility: collapsed;"
                        rows="auto,auto,auto,auto,auto,auto,auto" columns="*"
                        @layoutChanged="/*repositionComponent($event, [0, 500], true)*/" >
                            <button row="1" @tap="reqFatumTask('getpseudo')" :isEnabled="!processingFatumReq['getpseudo']"  class="fbutton btn btn-primary btn-rounded-lg">Pseudo Point</button>
                            <button row="2" @tap="reqFatumTask('getquantum')" :isEnabled="!processingFatumReq['getquantum']" class="fbutton btn btn-primary btn-rounded-lg">Qntum Point</button>
                            <Button row="3" @tap="reqFatumTask('getattractor')" :isEnabled="!processingFatumReq['getattractor']" class="fbutton btn btn-primary btn-rounded-lg">Attractor</Button>
                            <Button row="4" @tap="reqFatumTask('getvoid')" :isEnabled="!processingFatumReq['getvoid']" class="fbutton btn btn-primary btn-rounded-lg">Void</Button>
                            <button row="5" @tap="reqFatumTask('getpair')" :isEnabled="!processingFatumReq['getpair']" class="fbutton btn btn-primary btn-rounded-lg">Pair</button>
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
                    <Button col="0" text="" class="attachment-button" @tap="attachmentJournalEntry($event)" />
                    <Label col="0" class="fi attachment-button-label" text="attachment" />

                    <TextField col="1" v-model="journalEntryText" hint="Add journal entry..." 
                    returnKeyType="send" textChange="voidEvent" returnPress="voidEvent"
                    focus="voidEvent" blur="voidEvent"/>
                    <Button col="2" text="Send" class="btn btn-primary btn-rounded-lg" @tap="submitJournalEntry" /> 
                </GridLayout>
            </StackLayout>
            <!-- /Bottom -->


            <!-- Middle -->
            <StackLayout orientation="vertical">
                <RadListView id="targetLocationView" for="targetLocation in targetLocations">
                    <v-template> 
                        <GridLayout columns="* , 120" rows="auto, auto, auto" class="targetLocation"
                        @tap="onFatumLocationSelect(targetLocation)">
                            <FlexboxLayout row="0" col="0" colSpan="2" class="vc tl locationHeader">
                                <Label :text="targetLocation.usertag" />
                            </FlexboxLayout>
                            
                            <FlexboxLayout row="0" col="1" class="tc vc hc">
                                <Label :text="targetLocation.strength" v-if="targetLocation.strength>0" class="locationStrength"/>
                            </FlexboxLayout>

                            <FlexboxLayout row="1" col="0" class="fi">
                                <Image src="~/images/attractor1.png" width="5%" height="5%" v-if="targetLocation.type=='Attractor'"></Image>
                                <Image src="~/images/void1.png" width="5%" height="5%" v-else-if="targetLocation.type=='Void'"></Image>
                                <Image src="~/images/pseudo1.png" width="5%" height="5%" v-else-if="targetLocation.type.includes('Pseudo')"></Image>
                                <Image src="~/images/quantum1.png" width="5%" height="5%" v-else-if="targetLocation.type.includes('Quantum')"></Image>
                                <Label :text="targetLocation.type + ' '" style=""/>
                            </FlexboxLayout>

                            <FlexboxLayout row="1" col="1" colSpan="2" class="fi tc vc hc" justify-content="center">
                                <!--<Label :text="'Distance ' + getLocationDistanceFromUser(location)"/>-->
                                <Label :text="String.fromCharCode(0xe949) + ' ' + targetLocation.distance + 'm '" class=""/>

                                <Label :text="String.fromCharCode(0xea56) + ' ' + targetLocation.radius + 'm'" v-if="targetLocation.radius>0" class=""/>
                            </FlexboxLayout>
                        </GridLayout>
                    </v-template>
                </RadListView>
            </StackLayout>
            <!-- /Middle -->
        </DockLayout>
        
        </TabViewItem>

        <TabViewItem class="" title="Locations" iconSource="~/images/penrose.png">
            <StackLayout>                   
                <RadListView id="pointListView" for="location in fatumLocationsList">
                    <v-template>
                        <GridLayout columns="* , 150" rows="auto, auto, auto" class="locationList" @tap="onFatumLocationSelect(location)">
                            <FlexboxLayout row="0" col="0" colSpan="2" class="vc tl locationHeader">
                                <Label :text="location.usertag" />
                            </FlexboxLayout>
                            
                            <FlexboxLayout row="0" col="1" class="tc vc hc">
                                <Label :text="location.strength" v-if="location.strength>0" class="locationStrength"/>
                            </FlexboxLayout>

                            <FlexboxLayout row="1" col="0" class="fi">
                                <Image src="~/images/attractor1.png" width="5%" height="5%" v-if="location.type=='Attractor'"></Image>
                                <Image src="~/images/void1.png" width="5%" height="5%" v-else-if="location.type=='Void'"></Image>
                                <Image src="~/images/pseudo1.png" width="5%" height="5%" v-else-if="location.type.includes('Pseudo')"></Image>
                                <Image src="~/images/quantum1.png" width="5%" height="5%" v-else-if="location.type.includes('Quantum')"></Image>
                                <Label :text="location.type + ' '" style=""/>
                            </FlexboxLayout>

                            <FlexboxLayout row="1" col="1" colSpan="2" class="fi tc vc hc" justify-content="center">
                                <!--<Label :text="'Distance ' + getLocationDistanceFromUser(location)"/>-->
                                <Label :text="String.fromCharCode(0xe949) + ' ' + location.distance + 'm '" class=""/>

                                <Label :text="String.fromCharCode(0xea56) + ' ' + location.radius + 'm'" v-if="location.radius>0" class=""/>
                            </FlexboxLayout>

                            <StackLayout class="hr-light m-t-10 m-b-10" row="3" col="0" colSpan="2"></StackLayout>
                        </GridLayout>
                        
                    </v-template>
                            
                </RadListView>
            </StackLayout>
        </TabViewItem>

        <TabViewItem title="Journals" iconSource="~/images/penrose.png">
            <DockLayout stretchLastChild="true">
                <StackLayout dock="top">
                    <WebView height="92%" id="journalWebView" src="~/assets/Journal.html" @loadStarted="loadJournal" @loadFinished="voidEvent"/>
                </StackLayout>

                <StackLayout dock="bottom" >
                    <GridLayout rows="auto" columns="auto,*,auto" height="50">
                        <Button col="0" text="" class="attachment-button" @tap="attachmentJournalEntry($event)" />
                        <Label col="0" class="fi attachment-button-label" text="attachment" />

                        <TextField col="1" v-model="journalEntryText" hint="Add journal entry..." 
                        returnKeyType="send" textChange="voidEvent" returnPress="voidEvent"
                        focus="voidEvent" blur="voidEvent"/>
                        <Button col="2" text="Send" class="btn btn-primary btn-rounded-lg" @tap="submitJournalEntry" /> 
                    </GridLayout>
                </StackLayout>

                <StackLayout orientation="vertical">
                </StackLayout>
            </DockLayout>
        </TabViewItem>

        <TabViewItem title="Theory" iconSource="~/images/penrose.png">
            <DockLayout stretchLastChild="true">
                <PDFView :src="FAQPDF" @onLoad="voidEvent"
                @load="voidEvent" :key="PDFjumperKey"></PDFView>
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
    import * as frame from 'ui/frame';
    import RadListView from "nativescript-ui-listview/vue";
    import * as styleprops from "ui/styling/style-properties";
    import * as enums from "ui/enums";
    Vue.use(RadListView);

    import MapsHelper from "./MapsHelper.js";
    import FatumHelper from "./FatumHelper.js";
    import JournalHelper from "./JournalHelper.ts";

    import { Color } from "tns-core-modules/color";
    import * as Toast from 'nativescript-toast';
    import * as platformModule from "tns-core-modules/platform";
    import { Menu } from "nativescript-menu";

    import * as View from "tns-core-modules/ui/core/view";
    import { EventData } from 'tns-core-modules/data/observable';

    import { knownFolders, Folder, File, path } from "tns-core-modules/file-system";

    import Dialog from './Dialog'; //TO DO start externalizing components

    export default {
        created: function() {
            this.appFolder = knownFolders.currentApp();
            this.FAQPDF = path.normalize(this.appFolder.path + this.FAQPDF);
            
            this.screenScale = platformModule.screen.mainScreen.scale;
            this.screenWidth = platformModule.screen.mainScreen.heightDIPs / this.screenScale;
            this.screenHeight = platformModule.screen.mainScreen.widthDIPs / this.screenScale;

            if (platform.isIOS) { /* dont run the android permissions routine for iOS */
                this.allowExecution = true;
                return;
            }
            let permissionsNeeded = [
                //android.Manifest.permission.ACCESS_FINE_LOCATION,         //GPS is better
                android.Manifest.permission.ACCESS_COARSE_LOCATION
            ];
            permissions
                .requestPermissions(permissionsNeeded, "Location")
                .then(() => this.allowExecution = true)
                .catch(() => this.allowExecution = false);
        },

        mixins: [   MapsHelper.LocationHelper, MapsHelper.MapsUIHelper, 
                    FatumHelper.QRNGHelper, FatumHelper.FatumLocationsHelper, FatumHelper.FatumAlgorithmHelper, 
                    JournalHelper.JournalCreatorHelper ],

        data() {
            return {
                appFolder: null,
                FAQPDF: "/resources/FAQ.pdf",
                PDFjumperKey: null,
                screenWidth: null, screenHeight: null, screenScale: null,
                MAPBOX_APIKEY: "pk.eyJ1IjoiYmxpcGs5OTkiLCJhIjoiY2p1NHJ0dmZ6MDQ4OTN6bG0zNW92NHcxaSJ9.Il5xe510vYEvH3BQPwwtuQ",
                GMAPS_APIKEY: "AIzaSyAqu-2C-XwLeZd6WBviXF0jcDKLR1YXgso",
                mapBox: null,
                allowExecution: true,

                targetLocations: [],

                page: null,
                mainFrame: null,
                mainTabIndex: 0,
                journalTabIndex: 0,

                journalEntryText: "",
                
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
                this.mainFrame = frame.topmost();
            },
            /*
            endPDFLoading: function() {
                this.PDFjumperKey = Date.now();
            },
            */
            tabIndexChanged: function(args) {
                args.selectedIndex = args.value;
                console.log('Current tab index: ' + args.selectedIndex);
            },
            mainTabIndexChanged: function(args) {
                if (args.value == 2) this.reloadJournal(args.object);
                this.mainTabIndex = args.value;
            },
            loadJournal: function(parent) {
                console.log("initial journal load");
            },
            reloadJournal: function(parent) {
                let journalWebView = View.getViewById(this.page, "journalWebView");
                journalWebView.reload();
                console.log("reloading journal");
            },
            submitJournalEntry: function() {
                this.createJournalEntry(this.journalEntryText);
                this.journalEntryText = "";
            },
            attachmentJournalEntry: function(args) {
                let viewObj = args.object;

                Menu.popup({
                    view: viewObj,
                    actions: ["Camera", "Gallery"]
                }).then(action => {
                    //alert(action.id + " - " + action.title);
                    if (action.id == 0) {
                        this.reqCamera();
                    } else if (action.id == 1) {
                        this.choosePicture();
                    }
                }).catch(console.log);
            },
            toggleGenerationOptions: function() {                
                let generationOptionsView = View.getViewById(this.page, "generationOptionsView");
                generationOptionsView.visibility == enums.Visibility.visible ? 
                    generationOptionsView.visibility = enums.Visibility.collapse : generationOptionsView.visibility = enums.Visibility.visible;
            },


            onMapReady: function(args) {
                this.mapBox = args.map;
                this.mapBox.setOnMapClickListener((point) => { this.onMapClick(point) });
                this.mapBox.setOnMapLongClickListener((point) => { this.onMapLongClick(point) });
                this.getUserLocation();
            },
            onMapClick: function(point) {
                console.log("Map clicked at latitude: " + point.lat + ", longitude: " + point.lng);
            },
            onMapLongClick: function(point) {
                console.log("Map longpressed at latitude: " + point.lat + ", longitude: " + point.lng);
                Menu.popup({
                    view: this.mapBox,
                    actions: ["Set as Generation Location", "Zoom map here", "Open Selection in External Maps"]
                }).then(action => {
                    //alert(action.id + " - " + action.title);
                    if (action.id == 0) {
                        this.setFatumGenerationLocation(point);
                    } else if (action.id == 1) {
                        this.mapBox.setCenter({
                            lat: point.lat,
                            lng: point.lng, 
                        });
                        this.mapBox.setZoomLevel({
                            level: 17.2,
                        });
                    } else if (action.id == 2) {
                        this.openLocationExternally(point);
                    } else if (action.id == 3) { // TODO: Add Marker Here
                    
                    }
                }).catch(console.log);
            },
            refreshUI() {
                var mainTabView = View.getViewById(this.page, "mainTabView");
                mainTabView.selectedIndex = this.mainTabIndex;
                
                var targetLocationView = View.getViewById(this.page, "targetLocationView");
                targetLocationView.refresh();
                
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
                this.reqTaskByName(taskName, `${this.fatumGenerationPointLocation.lat},${this.fatumGenerationPointLocation.lng}`, this.radius.toString());
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
                .then(result => console.log("Mapbox addPolygon done:" + result))
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
                //this.getRouteDistance(this.userLocation, location, () => {this.refreshList();});
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
        padding-left: 4;
    }
    .targetLocation {
        font-size: 14;
        color: #000;
        padding: 5;
        margin: 5;
        border-width: 5px;
        border-color: lightblue;
        border-radius: 7;
    }
    .locationHeader {
        font-size: 23;
        color: #434;
        padding-bottom: 3;
    }
    .locationStrength {
        background-color: transparent;
        border-color: lightblue;
        background-color: lightblue;
        color: invert(lightblue);
        font-size: 16;
        font-weight: bold;
        border-radius: 19;
        min-width: 64;
    }
    .tc { text-align: center; }
    .tl { text-align: left; horizontal-align: left; }
    .tr { text-align: right; horizontal-align: right;}
    .vc { vertical-align: center; }
    .hc { horizontal-align:center; }
    .attachment-button {
        background-color: rgba(0, 0, 0, 0);
        background-image: none;
        width: 26;
        height: 26;
    }
    .attachment-button-label {
        font-size: 24;
        vertical-align: center;
        horizontal-align:center;
        text-align: center;
    }
    .generate-button {
        background-color: rgba(0, 0, 0, 0);
        background-image: url("~/images/pair1.png");
        background-repeat: no-repeat;
        margin: 0;
        background-position: 50% 50%;
        background-size: 64 64;
        width: 32;
        height: 32;
    }
    .location-button {
        background-color: rgba(0, 0, 0, 0);
        background-image: none;
        width: 26;
        height: 26;
    }
    .location-button-label {
        font-size: 24;
        vertical-align: center;
        horizontal-align:center;
        text-align: center;
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
