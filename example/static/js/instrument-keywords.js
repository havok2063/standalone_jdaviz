const INSTRUMENT_KEYWORD_API_URL = "/viz/api/v0.1/keywords/search?filename=";
const EXPOSURE_TYPES_URL = "static/data/exposure-types.json";
const EXPOSURE_TYPE_FIELDS = ["resolution", "wavelength_coverage", "pixel_scale", "field_of_view"];
const JDAVIZ_METADATA_URL = "static/data/jdaviz_metadata.json";

class InstrumentKeywords {
    // Get section (top level) headings
    static getSectionHeadingList() {
        const headings = [];
        for (const sectionHeader in this.jdavizMetadata) {
            const title = sectionHeader.replace("_", " ");
            headings.push({ key: sectionHeader, title: title });
        }
        return headings;
    }
    // For each section, return list of subheadings.
    static getSectionSubHeadingList(sectionHeader) {
        const subHeadings = [];
        for (const sectionSubHeader in this.jdavizMetadata[sectionHeader]) {
            subHeadings.push(sectionSubHeader);
        }
        return subHeadings;
    }
    // For each section & subsection, return data to be displayed in UI as a list of records where each record contains title, name, value & units.
    static getSubSectionDataList(sectionHeader, subsectionHeader) {
        const fieldsList = this.jdavizMetadata[sectionHeader][subsectionHeader];
        const displayRecordList = [];
        var rawValue;
        var description;
        var formattedValue;
        for (const field of fieldsList) {
            try {
                rawValue = InstrumentKeywords.getValue(field);
                formattedValue = this.getFormattedValue(field, rawValue ? rawValue : "N/A");
                description = InstrumentKeywords.getDescription(field);
                displayRecordList.push({
                    name: field.parameter_name,
                    value: formattedValue,
                    description: description,
                    title: field.display_name,
                    units: field.units === "null" ? "" : field.units,
                });
            } catch (err) {
                console.log(err.message + " " + field.parameter_name + " " + rawValue);
            }
        }
        return displayRecordList;
    }
    // Get JWST InstrumentKeywords and Observation Parameters (CAOM data). Use Jdaviz metadata to improve displayablity.
    static getJwstInstrumentKeywords(calledby) {
        const self = this;
        Promise.all([
            fetch(JDAVIZ_METADATA_URL)
                .then((response) => response.json())
                .then((json) => {
                    this.jdavizMetadata = json;
                }),
            fetch(EXPOSURE_TYPES_URL)
                .then((response) => response.json())
                .then((json) => {
                    this.exposureTypes = json;
                }),
            fetch(InstrumentKeywords.getApi())
                .then((response) => {
                    if (!response.ok) {
                        throw response;
                    }
                    return response.json();
                })
                .then(function (record) {
                    if (record) {
                        if (record && typeof record === "object") {
                            self.data = record;
                        } else {
                            self.data = {};
                        }
                    } else {
                        console.log("No data found");
                        self.data = {};
                    }
                }),
            fetch(ObservationParameters.getApi(ObservationParameters.getObservationId(calledby)))
                .then((response) => response.json())
                .then((json) => {
                    // use first record only
                    ObservationParameters.observationParameters = json.data[0];
                    ObservationParameters.setObservationParameters(calledby);
                }),
        ])
            .then(function () {
                InstrumentKeywords.setExtraDataItems();
                InstrumentKeywords.setCaomObsId(calledby);
                const target = InstrumentKeywords.data["targname"];
                calledby.setTarget(target ? target : "Unknown");
                calledby.sectionHeadingList = InstrumentKeywords.getSectionHeadingList();
                calledby.dataReady = true;
            })
            .catch(function (error) {
                console.error(error);
                calledby.keyPortalData = { [error.statusText]: {} };
                calledby.portalData = { [error.statusText]: {} };
                calledby.dataReady = true;
            });
    }
    static getValue(field) {
        var rawValue;
        if (InstrumentKeywords.isCaomObsId(field)) {
            rawValue = InstrumentKeywords.data["caom_obs_id"];
        } else {
            rawValue = InstrumentKeywords.data[field.parameter_name];
            // if data is not found in InstrumentKeywords, check for it in ObservationParameters
            if (!rawValue) {
                rawValue = ObservationParameters.observationParameters[field.parameter_name];
            }
        }
        return rawValue;
    }
    // Format value according to its data type
    static getFormattedValue(field, rawValue) {
        const javascriptDates = ["gsendtim", "gsstrttm"];
        const wrappedDates = ["date_end", "date_obs", "publicReleaseDate", "ingestStartDate", "ingestCompletionDate", "date", "visitend", "vststart"];
        var formattedValue;
        switch (true) {
            case InstrumentKeywords.isModifiedJulianDate(field) && rawValue !== "N/A":
                formattedValue = Utils.formatSigFigs(rawValue, 10);
                break;
            case javascriptDates.includes(field.parameter_name):
                formattedValue = Utils.convertJavascriptDate(rawValue);
                break;
            case wrappedDates.includes(field.parameter_name):
                formattedValue = Utils.convertWrappedDate(rawValue);
                break;
            case InstrumentKeywords.isTrueFloat(field):
                formattedValue = Utils.formatSigFigs(rawValue);
                break;
            default:
                formattedValue = rawValue;
                break;
        }
        return formattedValue;
    }
    static getDescription(field) {
        // If field has link that depends on instrument, set that here.
        const expType = InstrumentKeywords.data["exp_type"];
        const linkText = InstrumentKeywords.exposureTypes[expType]["link_text"];
        if (EXPOSURE_TYPE_FIELDS.includes(field.parameter_name)) {
            return field.description.replace("See [link] for details.", linkText);
        } else {
            return Utils.stripHtmlTags(field.description, true, true);
        }
    }
    static getApi() {
        var filename = Utils.getParam("filename");
        if (filename == null) {
            const uri = Utils.getParam("uri");
            filename = FilenameParser.getFilenameFromUri(uri);
        }
        return INSTRUMENT_KEYWORD_API_URL + encodeURI(filename);
    }
    static isNirspecMos(record) {
        if (record && typeof record === "object" && record.exp_type && record.template) {
            if (
                //record.instrume.toUpperCase() === "NIRSPEC" &&
                record.exp_type.toUpperCase() === "NRS_MSASPEC" &&
                record.template.toUpperCase() === "NIRSPEC MULTIOBJECT SPECTROSCOPY"
            ) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    //use exp_type to lookup resolution, wavelength, pixel_scale & field_of_view
    static setExtraDataItems() {
        const exp_type = InstrumentKeywords.data["exp_type"];
        for (var fieldName of EXPOSURE_TYPE_FIELDS) {
            InstrumentKeywords.data[fieldName] = InstrumentKeywords.exposureTypes[exp_type][fieldName];
        }
    }
    // get obs_id from Observation Parameters (CAOM)
    // Both instrument keywords and observation parameters have an obs_id field, so we need some special code here.
    static setCaomObsId(calledby) {
        try {
            const caom_obs_id = calledby.observationParameters["obs_id"]["formattedValue"];
            InstrumentKeywords.data["caom_obs_id"] = caom_obs_id ? caom_obs_id : "Unspecified";
        } catch (exception) {
            InstrumentKeywords.data["caom_obs_id"] = "Unspecified";
        }
    }
    // Is the field the obs_id for CAOM? There is a different obs_id for instrument keywords.
    static isCaomObsId(field) {
        return field.parameter_name === "obs_id" && field.description === "Observation identifier, given by mission";
    }
    // Is the field a modified julian date?
    static isModifiedJulianDate(field) {
        return field.units === "MJD" && field.datatype === "float";
    }
    // Is the field a float but not a modified julian date?
    static isTrueFloat(field) {
        return field.units !== "MJD" && field.datatype === "float";
    }
}

//Safari requires you to define these outside the class
InstrumentKeywords.data = {};
InstrumentKeywords.exposureTypes = {};
InstrumentKeywords.jdavizMetadata = {};
