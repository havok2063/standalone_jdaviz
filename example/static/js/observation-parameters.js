// this is a mapping between domain host and Mashup API CAOM JWST service
const MASHUP_ENV = {
    mast: { service: "JwstOps", domain: "mast.stsci.edu" },
    masttest: { service: "JwstTest2", domain: "masttest.stsci.edu" },
    mastdev: { service: "JwstTest2", domain: "mastdev.stsci.edu" },
    localhost: { service: "JwstTest2", domain: "masttest.stsci.edu" },
};

const CAOM_REQUEST_TEMPLATE = {
    service: "",
    format: "json",
    pagesize: 1,
    timeout: 60,
    removenullcolumns: false,
    data: null,
    params: {
        columns: "*",
        timestamp: "2019-10-04T13:26:20",
        ajaxParams: { method: "POST", url: "../../Mashup.asmx/invoke" },
        cacheBreaker: "23a4ece6-4b4a-46d1-a308-159c5ea7e20c",
    },
    clearcache: false,
    page: 1,
};
class ObservationParameters {
    // Populate calledby.observationParameters with CAOM data
    // TODO: Investigate a better way to do this.
    // This is almost obsolete but it still needed because calledby.observationParameters needs to be populated to pass data
    // to the notebook in voila.
    static setObservationParameters(calledby) {
        if (this.observationParameters) {
            for (const sectionHeader in InstrumentKeywords.jdavizMetadata) {
                for (const subHead in InstrumentKeywords.jdavizMetadata[sectionHeader]) {
                    const fieldsList = InstrumentKeywords.jdavizMetadata[sectionHeader][subHead];
                    var rawValue;
                    var formattedValue;
                    var descr;
                    for (const field of fieldsList) {
                        try {
                            rawValue = this.observationParameters[field.parameter_name];
                            formattedValue = this.getFormattedValue(field, rawValue ? rawValue : "N/A");
                            descr = field.description;
                            calledby.observationParameters[field.parameter_name] = { formattedValue, descr };
                        } catch (err) {
                            console.error(err.message + " " + field.parameter_name + " " + rawValue);
                        }
                    }
                }
            }
        } else {
            const message = "No data found for Obs ID: " + ObservationParameters.getObservationId(calledby);
            console.error(message);
            calledby.observationParameters[message] = {};
        }
    }
    static getObservationId(calledby) {
        const obs_id = Utils.getParam("obs_id");
        if (obs_id) {
            return obs_id;
        } else {
            var filename = Utils.getParam("filename");
            if (filename == null) {
                const uri = Utils.getParam("uri");
                filename = FilenameParser.getFilenameFromUri(uri);
            }
            return FilenameParser.getObsIdFromFilename(filename);
        }
    }
    static getApi(obs_id) {
        const caom_request = CAOM_REQUEST_TEMPLATE;
        // adjust the Mashup service based on host domain
        const host = window.location.hostname.split(".")[0];
        caom_request.service = "Mast.Caom.Filtered." + MASHUP_ENV[host].service;
        const base = "https://" + MASHUP_ENV[host].domain;

        // add the specific observation ID to the filter
        if (obs_id) {
            caom_request.params.filters = [{ paramName: "obs_id", values: [obs_id] }];
            return base + "/portal/Mashup/Mashup.asmx/invoke?request=" + encodeURI(JSON.stringify(caom_request));
        } else {
            throw "obs_id must be provided";
        }
    }
    static getFormattedValue(field, rawValue) {
        const MODIFIED_JULIAN_DATES = ["t_min", "t_max", "t_obs_release"];
        // RA and Dec fields should be formatted to specified number of significant digits
        const RA_DEC_LIST = ["s_dec", "s_ra"];
        var formattedValue;
        switch (true) {
            case MODIFIED_JULIAN_DATES.includes(field.parameter_name):
                formattedValue = Utils.convertMjDate(rawValue) + " MJD: " + Utils.formatSigFigs(rawValue, 10);
                break;
            case RA_DEC_LIST.includes(field.parameter_name):
                formattedValue = Utils.formatSigFigs(rawValue);
                break;
            default:
                formattedValue = rawValue;
        }
        return formattedValue;
    }
    //not currently used. May be useful in the future.
    static getObservationParametersByFile(filename) {
        filename = "jw93135334001_02102_00001_mirifushort_s3d.fits";
        //jw00736-o039_t001_miri_ch1-long_s3d.fits
        const url = "https://mastdev.stsci.edu/portal/caom/observation/checkfile/" + filename;
        fetch(url, {
            headers: {
                "X-ASB-AUTH": "703B1FB0-915F-4B34-91F4-D4E4A78106C2",
                mode: "no-cors",
                credentials: "include", // include, *same-origin, omit
            },
        })
            .then((response) => response.json())
            .then((data) => console.log(data));
    }
}
//Safari requires you to define these outside the class
ObservationParameters.observationParameters = {};
