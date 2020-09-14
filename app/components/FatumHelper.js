import * as http from "tns-core-modules/http";
import * as dialogs from "tns-core-modules/ui/dialogs";
import {ImageSource, fromFile, fromResource, fromBase64} from "tns-core-modules/image-source";

const FatumAlgorithmHelper = {
    data() {
        return {
            FatumAPIURLBase: "http://fatum.blipk.xyz:7777/api/tasks",
            fresult: null,
            processingFatumReq: {getpseudo: false, getquantum: false, getattractor: false, getvoid: false, getpair: false}
        }
    },
    methods: {
        reqTaskByName(taskName, origin, radius, callBack) {
            let fatumAPIURL = `${this.FatumAPIURLBase}/${taskName}/${origin}/${radius}`;
            this.processingFatumReq[taskName] = true;
            console.log(fatumAPIURL);
            http.getJSON(fatumAPIURL).then(
                result => {
                    this.fresult = result;
                    if (this.fresult.success == true) {
                        console.log("Fatum Algorithm Request Result: " + JSON.stringify(this.fresult));
                    } else {
                        this.fresult.success = false; // In case of null return from call
                    }
                    if (callBack) callBack(this.fresult);
                    this.validateFatumResponse(this.fresult);
                    this.processingFatumReq[taskName]= false;
                },
                error => {
                    console.log("Algo Request Error" + error);
                    this.processingFatumReq[taskName] = false;
                }
            );
        },
        validateFatumResponse: function(result) {
            if (result.success == true) {
                result.generatedLocations.forEach(function(generatedLocation, i) {
                    console.log("adding location");
                    this.fatumLocationsList.push({
                        type: this.FatumLocationType.properties[Object.values(generatedLocation.type)[0]+1].name,
                        lat: generatedLocation.position.lat,
                        lng: generatedLocation.position.lng,
                        strength: generatedLocation.strength.toFixed(2),
                        distance: generatedLocation.distance,
                        radius: generatedLocation.radius.toFixed(2),
                    });

                    //if (this.targetLocations[0] == undefined) 
                        this.targetLocations[0] = this.fatumLocationsList[this.fatumLocationsList.length-1];

                    this.getRandomWords(this.fatumLocationsList.length-1);
                    this.getStaticMap(generatedLocation.position, this.fatumLocationsList.length-1);
                }, this);
            } else {

            }

            return;
        },

        getRandomWords(index = null, words = {"a": "35", "n": "60"}) { 
            /*
            levels: 10, 20, 35, 50, 60, 70, 95
            a - adjective
            n - noun
            t - transitive verb
            i - intransitive verb
            e - adverb
            z - interjection
            s - preposition
            */
           
            let reqData = 
            `Pos1=${Object.keys(words)[0]||''}&Level1=${Object.values(words)[0]||''}&Pos2=${Object.keys(words)[1]||''}&Level2=${Object.values(words)[1]||''}&Pos3=${Object.keys(words)[2]||''}&Level3=${Object.values(words)[2]||''}&Pos4=${Object.keys(words)[3]||''}&Level4=${Object.values(words)[3]||''}`
            
            http.request({
                    url: "http://watchout4snakes.com/wo4snakes/Random/RandomPhrase",
                    method: "POST",
                    headers: { 
                        "Accept": "*/*",
                        "Accept-Encoding": "gzip, deflate",
                        "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
                        "Content-Length": reqData.length,
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "Host": "watchout4snakes.com",
                        "Origin": "http://watchout4snakes.com",
                        "Referer": "http://watchout4snakes.com/wo4snakes/Random/RandomPhrase",
                     },
                    content: reqData
                }
            ).then(
                result => {
                    console.log(result.content.toString())
                    if (index != null) {
                        this.fatumLocationsList[index].usertag = result.content.toString().replace(/\b\w/g, l => l.toUpperCase())
                        this.refreshFatumLocationsOnMap();
                    }
                }, error => {
                    console.log("Request Error in getting random word" + error);
                }
            );
        },
    }
};

const QRNGHelper = {
    data() {
        return {
            type: "uint8",
            length: "128",
            qresult: null,
        }
    },
    methods: {
        reqQRNGData(reqLength, callBack) {
            this.success = false;
            if (reqLength)
                this.length = reqLength;

            let qrngAPIURL = `https://qrng.anu.edu.au/API/jsonI.php?length=${this.length}&type=${this.type}`;
            http.getJSON(qrngAPIURL).then(
                result => {
                    this.qresult = result;
                    if (this.qresult.success == true) {
                        console.log("Quantum Random Data: " + JSON.stringify(this.qresult.data));
                    } else {
                        this.qresult.success = false; // In case of null return from call
                    }
                    if (callBack) callBack(this.qresult);
                },
                error => {
                    console.log(error);
                }
            );

        }
    }
};

const FatumLocationsHelper = {
    data() {
        return {
            // Javascript treats 0 as special in conditionals so we start this enum at index 1
            // However the server starts at 0, have to be mindful
            FatumLocationType: {
                PseudoRandom: 1,
                QuantumRandom: 2,
                Attractor: 3,
                Void: 4,
                properties: {
                    1: {name: "Pseudo Random", value: 1, code: "PR"},
                    2: {name: "Quantum Random", value: 2, code: "QR"},
                    3: {name: "Attractor", value: 3, code: "AP"},
                    4: {name: "Void", value: 4, code: "VP"}
                  }
            },

            fatumMarkerIdOffeset: 7,    // Allow for 7 unique markers. Currently for userlocation and fatumgenerationpoint

            fatumGenerationPointLocation: {
                lat: 0, lng: 0,
            },
            fatumGenerationPointMarker: {
                id: 1,   //this is the id we use for fatum marker
                iconPath: 'images/penrose.png',
                title: "Fatum Generation Point",
            },

            fatumLocationsMarkers: [],
            fatumLocationsList: [
                //{ type: "Attractor", strength: 1, lat: 0, lng: 0, usertag: "first", hiddenMarker: false},
            ],
            radius: 1000,
        }
    },
    methods: {
        markerTapFunction: function(marker, mainContext) {
        },

        markerCalloutTapFunction: function(marker, mainContext) {
            let toggleOption;
            let itemIndex = marker.id - mainContext.fatumMarkerIdOffeset;
            
            // This shouldn't happen
            if (typeof mainContext.fatumLocationsList[itemIndex] == undefined) return;

            mainContext.fatumLocationsList[itemIndex].hiddenMarker ?
                toggleOption = "Reveal Marker on Map" :
                toggleOption = "Hide Marker on Map"
            
            let dialogActions = ["Set as Fatum Generation Location", 
                                 "Set as Target Location",
                                 "Set Tag", "Delete", 
                                "Center Map on Location", toggleOption, "Open in External Maps"];
            dialogs.action({
                message: `Actions for ${marker.title} (${marker.lat}, ${marker.lng})`,
                cancelButtonText: "Cancel",
                defaultText: "Default text",
                actions: dialogActions
            }).then(function (result) {
                if (result == "Set as Fatum Generation Location") {
                    mainContext.setFatumGenerationLocation(marker);
                } else if(result == "Set as Target Location"){
                    mainContext.targetLocations[0] = mainContext.fatumLocationsList[itemIndex];
                } else if(result == toggleOption){
                    mainContext.fatumLocationsList[itemIndex].hiddenMarker ?
                        mainContext.fatumLocationsList[itemIndex].hiddenMarker = false :
                        mainContext.fatumLocationsList[itemIndex].hiddenMarker = true;
                } else if(result == "Delete") {
                    if (mainContext.fatumLocationsList[itemIndex] == mainContext.targetLocations[0])
                        mainContext.targetLocations.splice(0, 1);
                    
                    mainContext.fatumLocationsList.splice(itemIndex, 1);
                    mainContext.fatumLocationsMarkers.splice(itemIndex, 1);
                } else if(result == "Center Map on Location") {
                    mainContext.mainTabIndex = 0; 
                    mainContext.mapBox.setCenter({
                        lat: marker.lat,
                        lng: marker.lng, 
                    });
                    mainContext.mapBox.setZoomLevel({
                        level: 17.2,
                    });
                } else if(result == "Open in External Maps"){
                    mainContext.openLocationExternally(marker);
                } else if(result == "Set Tag"){
                    dialogs.prompt({
                        title: "Set Tag for:",
                        message:  `${marker.title} (${marker.lat}, ${marker.lng})`,
                        okButtonText: "Accept",
                        cancelButtonText: "Cancel",
                        neutralButtonText: "Remove tag",
                        defaultText: mainContext.fatumLocationsList[itemIndex].usertag ?
                                     mainContext.fatumLocationsList[itemIndex].usertag :
                                     "Portal to underworld.",
                        inputType: dialogs.inputType.text
                    }).then(function (r) {
                        if (r.result) {
                            mainContext.fatumLocationsList[itemIndex].usertag = r.text;
                        } else if (r.result === undefined) {
                            mainContext.fatumLocationsList[itemIndex].usertag = "";
                        }
                        mainContext.refreshFatumLocationsOnMap();
                    });
                } else if(result == ""){
                    
                }
                
                mainContext.refreshFatumLocationsOnMap();
                //mainContext.refreshUI();
            })
        },

        refreshFatumLocationsOnMap() {
            // Remove old markers and empty array
            for (let i = this.fatumMarkerIdOffeset; i < this.fatumLocationsMarkers.length+this.fatumMarkerIdOffeset+1; i++) { 
                this.mapBox.removeMarkers([i]);
            }; this.fatumLocationsMarkers = [];

            // Refresh new markers
            this.fatumLocationsList.forEach(function(fatumLocation, i) {
                let tmpMarker = {
                    id:  i+this.fatumMarkerIdOffeset,  //start at higher index to allow for other unique markers
                    lng:  fatumLocation.lng,
                    lat:  fatumLocation.lat,
                    title:  fatumLocation.usertag ? fatumLocation.usertag + ' (' + fatumLocation.type + ')' : fatumLocation.type,
                    subtitle: "Distance " + fatumLocation.distance,
                    type: fatumLocation.type,
                    onTap: marker => this.markerTapFunction(marker, this),
                    onCalloutTap: marker => this.markerCalloutTapFunction(marker, this)
                };
                tmpMarker.iconPath = (
                    fatumLocation.type === 'Attractor' ? 'images/drawable-ldpi/attractor1.png' :
                    fatumLocation.type === 'Void' ? 'images/drawable-ldpi/void1.png' :
                    fatumLocation.type.includes('Pseudo') ? 'images/drawable-ldpi/pseudo1.png' :
                    fatumLocation.type.includes('Quantum') ? 'images/drawable-ldpi/quantum1.png' : ''
                );
                if (parseFloat(fatumLocation.strength) > 0)
                    tmpMarker.subtitle += "\r\nStrength " + fatumLocation.strength;
                if (parseFloat(fatumLocation.radius) > 0)
                    tmpMarker.subtitle += "\r\nRadius " + fatumLocation.radius;

                this.fatumLocationsMarkers.push(tmpMarker);

                if (!fatumLocation.hiddenMarker) this.addMarkerToMap(this.fatumLocationsMarkers[i]);
            }, this);

            this.refreshUI();
        },
        setFatumGenerationLocation(location) {
            this.fatumGenerationPointLocation.lng = location.lng;
            this.fatumGenerationPointLocation.lat = location.lat;

            this.fatumGenerationPointMarker = Object.assign(this.fatumGenerationPointLocation, this.fatumGenerationPointMarker);
            this.fatumGenerationPointMarker.subtitle = "Strength ";
            this.fatumGenerationPointMarker.id = 1;

            this.addMarkerToMap(this.fatumGenerationPointMarker);
            this.updateRadius();
        }
    }
};


export default {
    QRNGHelper,
    FatumLocationsHelper,
    FatumAlgorithmHelper
};