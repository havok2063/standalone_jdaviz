const TIMEOUT_MILLISECS = 1000;
const PRODUCT_PREFIX = "mast:JWST/product/";
const SECTION_HEADINGS_URL = "static/data/group_metadata.json";

var app = new Vue({
    vuetify: new Vuetify({
        icons: {
            iconfont: "md",
        },
        theme: { disable: true },
    }),
    el: "#app",
    delimiters: ["[[", "]]"], // switch delimiters so we can mix Vue and Jinja templating
    computed: {
        voilaUrl() {
            var url;
            if (window.location.hostname === "localhost") {
                url = "http://localhost:" + this.voilaPort;
            } else {
                url = window.location.protocol + "//" + window.location.hostname + "/voila";
            }
            return url;
        },
        dataReady() {
            this.dataReady;
        },
    },
    data() {
        return {
            voilaPort: "8000",
            drawer: false,
            title: "Voilà embed",
            target: "Unknown",
            show_source: false,
            debug: false,
            filename: 'jw00668-o007_s00582_nirspec_f070lp-g140m_x1d.fits',
            dataUrl: 'mast:JWST/product/jw00668-o007_s00582_nirspec_f070lp-g140m_x1d.fits',
            anon: "{{ whoami.anon }}" == "True",
            pairedUrl: null,
            paired_file: null,
            observationParameters: {},
            dataReady: false,
            voilaConnection: true,
            searchBarText: "",
            previousSearchBarText: "init",
            message: "",
            showJdavizLogo: true,
            headers: [
                { text: "Title", value: "title", width: "30%" },
                { text: "Name", value: "name", width: "20%" },
                { text: "Value", value: "value", width: "30%" },
                { text: "Units", value: "units", width: "20%" },
            ],
            showLeftPanel: true,
            spectraColumns: 8,
            sectionHeadingList: [],
            sectionHeadingDescriptions: [],
            subSectionHeadingDescriptions: [],
            // At page startup open Basic Info and all three of its subheadings
            openExpansionPanels: [0], // Open Basic Info
            openSubPanels: [[0, 1, 2], [], []], //size should be sectionHeadingList.length
        };
    },
    created() {
        // called when Vue is created.  We send a request to the jwst/spectra notebook to trigger a "change
        // event" and pass the target name parameter to the notebook.  TO DO: replace target name code
        // with data product filename from Portal.

        this.setTarget(Utils.getParam("targname"));
        //this.getFilename();
        //this.getPairedFile();
        //this.getDataUri();
        //this.getPairedUri();
        try {
            InstrumentKeywords.getJwstInstrumentKeywords(this);
        } catch (exception) {
            console.error("Unable to get Instrument Keywords" + exception);
        }

        try {
            this.setSubSectionHeadingDescriptions();
        } catch (exception) {
            console.error("Unable to get subsection heading descriptions" + exception);
        }

        // check if local attribute is set
        islocal = this.getLocal();
        this.debug = Utils.getParam("debug");

        // check file validity
        this.fileSupported = FilenameParser.isJdavizFile(this.filename);
        this.validL3 = FilenameParser.isValidL3(this.filename);
        this.currentlySupported = FilenameParser.isSupported(this.filename);

        // send a request to the notebook.  see on_event("change") and update_data_handler function
        // in jwst/spectra notebook.
        this.checkServer(this.voilaUrl, TIMEOUT_MILLISECS);
        if (this.fileSupported && this.voilaConnection) {
            requestWidget({
                voilaUrl: this.voilaUrl,
                notebook: "jdaviz_jwst.ipynb",
                mountId: "jdaviz",
            }).then((sevent) => {
                sevent.send({
                    event: "load",
                    data: {
                        uri: this.dataUrl,
                        paired_uri: this.pairedUrl,
                        host: window.location.hostname,
                        local: islocal,
                        obs_params: this.observationParameters,
                    },
                });
            });
        }
    },
    methods: {
        getLocal() {
            // get the local query parameter.  Only used for triggering loading of local test data
            const local = Utils.getParam("local");
            return local;
        },
        setTarget(target) {
            if (this.target === "" || "not specified") {
                this.target = target;
            } else {
                this.target = "not specified";
            }
        },
        getFilename() {
            var filename = Utils.getParam("filename");
            if (filename == null) {
                const uri = Utils.getParam("uri");
                filename = FilenameParser.getFilenameFromUri(uri);
            }
            if (filename) {
                this.filename = filename;
            } else {
                this.filename = "not specified";
            }
            this.filename = this.filename.toLowerCase();
        },
        getPairedFile() {
            /// function to retrieve a paired file url parameter.  This is for NIRSPEC MSA pairs of
            /// exposures, s2d and x1d files.
            var paired_file = Utils.getParam("paired_file");
            if (paired_file == null) {
                const paired_uri = Utils.getParam("paired_uri");
                if (paired_uri != null) {
                    paired_file = FilenameParser.getFilenameFromUri(paired_uri);
                    paired_file = paired_file.toLowerCase();
                }
            }
            this.paired_file = paired_file;
        },
        getDataUri() {
            const uri = Utils.getParam("uri");
            if (uri) {
                this.dataUrl = uri;
            } else {
                if (this.filename) {
                    this.dataUrl = PRODUCT_PREFIX + this.filename;
                } else {
                    this.dataUrl = "not specified";
                }
            }
            this.dataUrl = this.dataUrl.toLowerCase();
            this.searchBarText = this.dataUrl;
        },

        getPairedUri() {
            /// function to extract or create a paired URI from a paired filename.
            const paired_uri = Utils.getParam("paired_uri");
            if (paired_uri) {
                this.pairedUrl = paired_uri.toLowerCase();
            } else {
                if (this.paired_file) {
                    this.pairedUrl = PRODUCT_PREFIX + this.paired_file;
                    this.pairedUrl = this.pairedUrl.toLowerCase();
                } else {
                    this.pairedUrl = null;
                }
            }
        },
        checkServer(url, timeout) {
            const controller = new AbortController();
            const signal = controller.signal;
            const options = { mode: "no-cors", signal };
            return fetch(url, options)
                .then(
                    setTimeout(() => {
                        controller.abort();
                    }, timeout)
                )
                .then((response) => {
                    console.log("Check server response:", response.statusText);
                    this.voilaConnection = true;
                })
                .catch((error) => {
                    console.error("Check server error:", error.message);
                    this.voilaConnection = false;
                });
        },

        onClickSearchText() {
            if (this.previousSearchBarText != this.searchBarText) {
                this.previousSearchBarText = this.searchBarText;
                var uri;
                if (this.searchBarText.toUpperCase().startsWith(PRODUCT_PREFIX.toUpperCase())) {
                    uri = this.searchBarText;
                } else {
                    uri = PRODUCT_PREFIX + this.searchBarText;
                }
                window.open("/viz/jwst/?uri=" + uri, "_self");
            }
        },
        onExpand() {
            this.showLeftPanel = true;
            this.spectraColumns = 8;
        },
        onCollapse() {
            this.showLeftPanel = false;
            this.spectraColumns = 12;
        },
        getSectionSubHeadingList(sectionHeader) {
            return InstrumentKeywords.getSectionSubHeadingList(sectionHeader);
        },
        getSubSectionDataList(sectionHeader, subHead) {
            return InstrumentKeywords.getSubSectionDataList(sectionHeader, subHead);
        },
        // read group_metadata.json file to set heading and subheading descriptions which are displayed as tooltips
        setSubSectionHeadingDescriptions() {
            fetch(SECTION_HEADINGS_URL)
                .then((response) => response.json())
                .then((json) => {
                    // transform headings to an arra and subheadings to a 2D array
                    const headingsList = [];
                    const subheadingsTable = [];
                    for (const heading in json) {
                        headingsList.push(json[heading]["description"]);
                        const subheadingsList = [];
                        for (const subheading in json[heading]["groups"]) {
                            subheadingsList.push(json[heading]["groups"][subheading]["description"]);
                        }
                        subheadingsTable.push(subheadingsList);
                    }
                    this.sectionHeadingDescriptions = headingsList;
                    this.subSectionHeadingDescriptions = subheadingsTable;
                });
        },
    },
});
