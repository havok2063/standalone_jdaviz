const ENUM_SHOW_STATE = Object.freeze({ SEARCH: 0, MESSAGE: 1, RESULTS: 2 });
const FIELD_LOCATOR_REGEX = /([a-zA-Z0-9]*(?=[-_]))/g;

var app = new Vue({
    vuetify: new Vuetify({
        icons: {
            iconfont: "md",
        },
        theme: {
            dark: true,
            themes: {
                dark: {
                    primary: "#ffffff",
                },
            },
        },
    }),
    el: "#app",
    delimiters: ["[[", "]]"], // switch delimiters so we can mix Vue and Jinja templating
    data() {
        return {
            show: ENUM_SHOW_STATE.MESSAGE,
            message: "",
            search: "",
            searchBarText: "",
            previousSearchBarText: "init",
            spectra: [],
            headers: [
                { text: "View in", value: "actions", sortable: false },
                { text: "File Name", value: "filename" },
                { text: "Description", value: "description" },
                { text: "Instrument", value: "instrument" },
                { text: "Filter", value: "filter" },
                { text: "Grating", value: "grating" },
                { text: "MOS", value: "mos" },
                { text: "Data Product Type", value: "dataproduct_type" },
                { text: "Calib Level", value: "calib_level" },
                { text: "Product Type", value: "productType" },
                { text: "Product Group Description", value: "productGroupDescription" },
                { text: "Product SubGroup Description", value: "productSubGroupDescription" },
            ],
            footerProps: {
                "items-per-page-options": [50, 100, 250, 500, 1000],
            },
            showJdavizLogo: false,
        };
    },

    mounted() {
        this.getDataUri();
        if (this.searchBarText === "") {
            this.message = "URI not specified";
        }
    },
    methods: {
        getDataUri() {
            const uri = Utils.getParam("uri");
            if (uri) {
                this.searchBarText = uri;
                this.show = ENUM_SHOW_STATE.MESSAGE;
                this.message = "Searching...";
                this.getItems();
            } else {
                this.show = ENUM_SHOW_STATE.SEARCH;
            }
        },
        getItems() {
            this.spectra = [];
            axios
                .get(this.getApiUrl())
                .then((json) => {
                    const key = Object.keys(json.data)[0];
                    const dataProductsList = json.data[key];
                    if (dataProductsList.length === 0) {
                        this.message = "No data found";
                        this.show = ENUM_SHOW_STATE.MESSAGE;
                    } else {
                        var record;
                        var parsedFields;
                        var buttonLabel;
                        var mos;
                        for (var index = 0; index < dataProductsList.length; index++) {
                            record = dataProductsList[index];
                            if (record.productFilename.endsWith(".fits")) {
                                mos = this.getNirspecMos(record);
                                buttonLabel = this.getButtonLabel(record.productFilename);
                                parsedFields = this.parseInstrumentFilterGrating(record.productFilename);
                                this.spectra.push({
                                    label: buttonLabel.label,
                                    cssClass: buttonLabel.cssClass,
                                    instrument: parsedFields.instrument,
                                    filter: parsedFields.filter,
                                    grating: parsedFields.grating,
                                    mos: mos,
                                    filename: record.productFilename,
                                    description: record.description,
                                    dataproduct_type: record.dataproduct_type,
                                    calib_level: record.calib_level,
                                    productType: record.productType,
                                    productGroupDescription: record.productGroupDescription,
                                    productSubGroupDescription: record.productSubGroupDescription,
                                });
                            }
                        }
                        this.show = ENUM_SHOW_STATE.RESULTS;
                    }
                })
                .catch((error) => {
                    let errorObject = JSON.parse(JSON.stringify(error.response));
                    console.error(errorObject);
                    /*
                    if (errorObject.statusText) {
                        this.message = errorObject.statusText;
                    } else {
                        this.message = errorObject.data;
                    }
                    */
                    if (errorObject.statusText === "Internal Server Error") {
                        this.message = "Internal server error/Kerberos ticket expired.";
                    } else {
                        this.message = this.parseError(errorObject.data);
                    }
                    this.show = ENUM_SHOW_STATE.MESSAGE;
                });
        },
        getApiUrl() {
            const API_URL = "/viz/api/v0.1/products/?level=3&uri=";
            return API_URL + this.searchBarText;
        },
        addPrefix() {
            const prefix = "mast:JWST/product/";
            if (!this.searchBarText.toUpperCase().startsWith(prefix.toUpperCase())) {
                this.searchBarText = prefix + this.searchBarText;
            }
        },
        onChangeSearchText() {
            if (this.previousSearchBarText != this.searchBarText) {
                this.addPrefix();
                this.message = "Searching...";
                this.show = ENUM_SHOW_STATE.MESSAGE;
                this.getItems();
                this.previousSearchBarText = this.searchBarText;
            }
        },
        parseError(errorMessage) {
            const errStarts = ["<title>400: ", "<title>500: "];
            for (var err in errStarts) {
                if (errorMessage.toLowerCase().includes(errStarts[err])) {
                    const found = errorMessage.toLowerCase().indexOf(errStarts[err]);
                    const start = found + errStarts[err].length;
                    const searchForEnd = "</title>";
                    const end = errorMessage.toLowerCase().indexOf(searchForEnd);
                    return errorMessage.substring(start, end);
                }
            }
            return errorMessage;
        },
        //get "View In" button label and CSS class for icon
        getButtonLabel(filename) {
            var buttonLabel = { label: "File not supported for viewing", cssClass: "icon-generic" };
            if (filename == null || filename == "") {
                return buttonLabel;
            }
            filename = filename.toLowerCase();
            const suffixLabelMap = [
                { suffix: "c1d.fits", label: "View in SpecViz", cssClass: "icon-spec" },
                { suffix: "x1d.fits", label: "View in SpecViz", cssClass: "icon-spec" },
                { suffix: "x1dints.fits", label: "View in SpecViz", cssClass: "icon-spec" },
                { suffix: "s2d.fits", label: "View in SpecViz2d", cssClass: "icon-specviz2d" },
                { suffix: "s3d.fits", label: "View in CubeViz", cssClass: "icon-cube" },
            ];
            for (var map of suffixLabelMap) {
                if (filename.match(map.suffix)) {
                    buttonLabel = { label: map.label, cssClass: map.cssClass };
                    break;
                }
            }
            return buttonLabel;
        },

        parseInstrumentFilterGrating(filename) {
            const fields = filename.match(FIELD_LOCATOR_REGEX);
            const ret = { instrument: "", filter: "", grating: "" };
            if (fields.length > 10) {
                ret.instrument = fields[6].toUpperCase();
                ret.filter = fields[8].toUpperCase();
                ret.grating = fields[10].toUpperCase();
            }
            return ret;
        },
        getNirspecMos(record) {
            //The Multi-Object Spectroscopy (MOS) column is meant to indicate if the file is a NIRSPEC MSA observation.
            //We can identify these files using a combination of the INSTRUME and EXP_TYPE keywords in the header of the file.
            //Or the TEMPLATE keyword.
            const filename = record.productFilename;
            const parsedFields = this.parseInstrumentFilterGrating(filename);
            if (parsedFields.instrument === "NIRSPEC" && filename.toUpperCase().match("S2D.FITS")) {
                return InstrumentKeywords.isNirspecMos(record);
            } else {
                return false;
            }
        },
        gotoSpectra(item) {
            if (item.mos) {
                this.displayPopupDialog(item.filename);
            } else {
                window.open("/viz/jwst/spectra?filename=" + item.filename, "_blank");
            }
        },
        displayPopupDialog(filename) {
            /* swal is sweetAlert which is a custom popup dialog */
            swal("This file is part of a NIRSPEC MOS observation and has an associated x1d file. ", {
                buttons: {
                    cancel: {
                        text: "X",
                        value: null,
                        visible: true,
                        className: "custom-cancel",
                        closeModal: true,
                    },
                    oneFile: {
                        text: "View only this file",
                        value: 1,
                    },
                    twoFiles: {
                        text: "View this file with its paired x1d file",
                        value: 2,
                    },
                },
            }).then((value) => {
                switch (value) {
                    case 1:
                        window.open("/viz/jwst/spectra?filename=" + filename, "_blank");
                        break;
                    case 2:
                        const paired_file = filename.replace("s2d", "x1d");
                        const params = "?filename=" + filename + "&paired_file=" + paired_file;
                        window.open("/viz/jwst/spectra" + params, "_blank");
                        break;
                    case "cancel":
                    default:
                        console.log("cancel");
                }
            });
        },
        getObsId(inputStr) {
            return FilenameParser.getObsId(inputStr);
        },
        getPortalURL(filename) {
            obsID = FilenameParser.getObsId(filename);
            let host = window.location.hostname.split(".")[0];
            // Build the Portal URL for the given observation ID and return it
            const coamVersion = MASHUP_ENV[host].service;
            const readableUrl =
                '/portal_jwst/Mashup/Clients/Mast/Portal.html?searchQuery={"service":"CAOMBYOBS","inputText":"' +
                obsID +
                '","paramsService":"Mast.Caom.SearchByObsID.' +
                coamVersion +
                '","title":"Observation IDs: ' +
                obsID +
                '","columns":"*","caomVersion":"' +
                coamVersion +
                '"}';
            return "https://" + MASHUP_ENV[host].domain + encodeURI(readableUrl);
        },
    },
});
