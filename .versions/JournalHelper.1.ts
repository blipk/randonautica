import { knownFolders, Folder, File, path } from "tns-core-modules/file-system";

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
    //id: 0,
    createdTime: 0, //used for ordering and unique ID
    type: "", //Artefact || Structure || Relic || Anything
    linkedLocations: [], //Coords
    text: "",   //Associated Chat message
    image: "", //base64 image
};

const locationPrototype = {
    id: 0,
    createdTime: 0, //unix timestamp
    journalItemId: 0,
    coords: [],
    fatumData: {},
    astroData: {},
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

            journalHTMLDisplayFileName: "/assets/Journal.html",
            journalHTMLDisplayFilePath: null,
        }
    },

    created: function() {
        this.appFolder = knownFolders.currentApp();

        this.journalFilePath = path.normalize(this.appFolder.path + this.journalFileName);
        this.journalHTMLDisplayFilePath = path.normalize(this.appFolder.path + this.journalHTMLDisplayFileName);

        if (!File.exists(this.journalFilePath)) {
            this.journalObject = this.JournalPrototype;
            this.journalObject.createdTime = Date.now();
            this.saveJournalFile();
        } else {
            this.readJournalFile();
        }
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

        convertJournalObjectToHTMLDisplay: function() {
            if (this.journalObject == null) this.readJournalFile();
            if (this.journalObject == null) return;


        },

        addJournalEntry: function() {

            this.journalObject.items.push();
        },

    }

}

export default {
    JournalCreatorHelper,
};