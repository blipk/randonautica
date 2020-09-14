import { knownFolders, Folder, File, path } from "tns-core-modules/file-system";
import * as camera from "nativescript-camera";
import { Image } from "tns-core-modules/ui/image";
import {ImageSource, fromFile, fromResource, fromBase64, fromAsset} from "tns-core-modules/image-source";
import * as imagepicker from "nativescript-imagepicker";

/*
const UserPrototype = {
    id: 0,
    name: "Jove",
    createdTime: 0, //unix time
    journals: [], //Usually just one
    journeys: [], //Excerpts
}
*/


const JournalPrototype = {
    id: 0,
    name: "Journal",
    createdTime: 0, //unix time
    userId: 0,  //associated UID
    items: [], //JournalItems
};

const JournalItemPrototype = {
    createdTime: 0, //used for ordering and unique ID
    type: "", // A title/type for the object (Artefact || Structure || Relic || Anything)
    data: "",   //Text message, Base64 Image, or Location Object
};

/*//This will be an excerpt of journal
const JourneyPrototype = {
    id: 0,
    name: "First Fatum Trip",
    createdTime: 0, //unixTimestamp
    startTime: 0,
    endTime: 0,
    journalItemExclusions: [] //list of JournalItem timestamps to exclude
};
*/

const JournalCreatorHelper = {
    data() {
        return {
            watch: null,
            appFolder: null,
            journalFileName: "/saves/journal.json",
            journalFilePath: null,
            journalObject: null,

            journalHTMLSourceFileName: "/assets/JournalDefault.html",
            journalHTMLSourceFilePath: null,
            journalHTMLDisplayFileName: "/assets/Journal.html",
            journalHTMLDisplayFilePath: null,
        }
    },

    created: function() {
        this.appFolder = knownFolders.currentApp();

        this.journalFilePath = path.normalize(this.appFolder.path + this.journalFileName);
        this.journalHTMLDisplayFilePath = path.normalize(this.appFolder.path + this.journalHTMLDisplayFileName);
        this.journalHTMLSourceFilePath = path.normalize(this.appFolder.path + this.journalHTMLSourceFileName);

        if (!File.exists(this.journalFilePath)) {
            this.journalObject = {
                id: 0,
                name: "Journal",
                createdTime: Date.now(),
                userId: 0,
                items: [],
            };
            this.saveJournalFile();
            this.updateJournalHTML();
        } else {
            this.readJournalFile();
            this.updateJournalHTML();
        }

        //REMOVE IN PROD
        this.journalObject = {
            id: 0,
            name: "Journal",
            createdTime: Date.now(),
            userId: 0,
            items: [],
        };
        this.saveJournalFile();
        this.updateJournalHTML();
    },

    methods: {
        readJournalFile: function() {
            if (!File.exists(this.journalFilePath))
                return;

            let journalFile = File.fromPath(this.journalFilePath)
            journalFile.readText().then((res) => {
                this.journalObject = JSON.parse(res);
            }).catch((err) => {
                console.log(err.stack);
            });

        },
        saveJournalFile: function() {
            let journalFile = File.fromPath(this.journalFilePath)
            journalFile.writeText(JSON.stringify(this.journalObject)).then((res) => {
                //success
            }).catch((err) => {
                console.log(err.stack);
            });
        },

        updateJournalHTML: function() {
            if (this.journalObject == null) this.readJournalFile();
            if (this.journalObject == null) return;


            let journalHTMLSourceFile = File.fromPath(this.journalHTMLSourceFilePath);
            let journalHTMLDisplayFile = File.fromPath(this.journalHTMLDisplayFilePath);
        
            let outputUpdate = "";
            console.log(this.journalHTMLDisplayFilePath)
            journalHTMLSourceFile.readText().then((res) => {
                //console.log(res)
                let insertIndex = res.indexOf('<script>');

                let start = res.slice(0, insertIndex) + '<script>';
                //let insert = JSON.stringify(this.journalObject).replace(/"/g, "'");
                let middle = "let journalObject = " + JSON.stringify(this.journalObject) + ";";
                let end = res.slice(insertIndex + 9)
                
                outputUpdate = start + middle + end;

                //console.log(res.split(String.fromCharCode(92)).join(String.fromCharCode(92,92)))
                journalHTMLDisplayFile.writeText(outputUpdate).then((res) => {
                
                    //success
                }).catch((err) => {
                    console.log(err.stack);
                });

                this.reloadJournal();
            }).catch((err) => {
                console.log(err.stack);
            });
            
        },

        addJournalEntry: function(JournalItem, keepTime = true) {
            if (!keepTime || !JournalItem.createdTime) JournalItem.createdTime = Date.now();
            this.journalObject.items.push(JournalItem);

            this.updateJournalHTML();
        },

        createJournalEntry: function(inData, inType = "") {//data = string | base64 image | fatumLocation Object
            let entry = {
                createdTime: Date.now(),
                type: inType,
                data: inData,
            };
            this.addJournalEntry(entry);
        },

        reqCamera: function() {
            let isAvailable = camera.isAvailable(); 

            if (!isAvailable) return;

            let that = this;
            camera.requestPermissions().then(
                function success() {
                    that.takePicture();
                }, 
                function failure() {
                // permission request rejected
                // ... tell the user ...
                }
            );
        },
        takePicture: function() {
            camera.takePicture({saveToGallery: true}).then((imageAsset) => {
                console.log("Result is an image asset instance");
                var imageSource = new ImageSource();
                imageSource.fromAsset(imageAsset);
                this.createJournalEntry("data:image/png;base64," + imageSource.toBase64String("png"));
            }).catch((err) => {
                console.log("Error -> " + err.message);
            });
        },
        
        choosePicture: function() {
            let context = imagepicker.create({
                mode: "single" // use "multiple" for multiple selection
            });
            
            let that = this;
            context.authorize().then(function() {
                return context.present();
            }).then(function(selection) {
                selection.forEach(function(selected) {
                    let imageAsset = selected;
                    let imageSource = new ImageSource();
                    imageSource.fromAsset(imageAsset);
                    that.createJournalEntry("data:image/png;base64," + imageSource.toBase64String("png"));
                    // process the selected image
                });
            }).catch(function (e) {
                // process error
            });
        },
    }
}

export default {
    JournalCreatorHelper,
};