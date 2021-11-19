
const AVALID_L3 = ["c1d", "x1d", "x1dints", "s2d", "s3d"];
const ACURRENTLY_SUPPORTED = ["x1d", "c1d", "s2d", "s3d"];
const APRODUCT_PREFIX = "mast:JWST/product/";

// file naming convention: https://outerspace.stsci.edu/display/MASTDOCS/File+Naming+Convention
class FilenameParserNew {
    constructor(uri = null, filename = null) {
        this.uri = uri;
        this.filename = filename;
        this.file_attrs = null;
        this.obs_id = null;

        // check inputs
        if (this.uri == null && this.filename == null) {
            console.error('Either a uri or filename must be specified.');
            return;
        }

        // construct either uri or filename
        if (this.uri != null && this.filename == null) {
            this.getFilenameFromUri();
        } else if (this.uri == null && this.filename != null) {
            this.uri = PRODUCT_PREFIX + this.filename;
        }

        console.log(this.uri, this.filename);

        // extract other info from the filename
        if (this.filename !== null) {
            this.file_attrs = this.parseFilename();
            this.getObsIdFromFilename();
            this.isJdavizFile();
        }
    }

    getFilenameFromUri() {
        const list = this.uri.split("/");
        if (list.length > 1) {
            this.filename = list[list.length - 1];
            this.filename = this.filename.toLowerCase();
        }
    }

    getObsIdFromFilename() {
        // To get obs_id, remove suffix from filename

        if (this.file_attrs !== null) {
            var idx = this.filename.indexOf(this.file_attrs.producttype);
            this.obs_id = this.filename.substr(0, idx-1);
        }
    }

    isJdavizFile() {
        if (filename == null || filename == "") {
            return false;
        }
        return this.isValidL3() && this.isSupported();
    }

    parseFilename() {
        // parses the data product filename via regex and returns named capture group

        // jwst level 3 data product regex
        var regex = /^jw(?<program>\d{5})-(?<assnid>[ocar]\d{3,4})_((?<target>t\d{3})|(?<source>s\d{5}))(-epoch(?<epoch>\d))?_(?<instrument>[a-z0-9]+)_(?<optelements>[a-z0-9\-]+)_(?<producttype>[a-z0-9]+)(?<actid>-[0-9]{2})?.(?<extension>[a-z]+)/;

        // pattern match the filename
        var match = this.filename.match(regex);

        // return null or the match group
        if (match == null) {
            return match;
        } else {
            return match.groups;
        }
    }

    isValidL3() {
        if (this.file_attrs == null) {
            return false;
        }
        return AVALID_L3.includes(this.file_attrs.producttype);
    }

    isSupported() {
        if (this.file_attrs == null) {
            return false;
        }
        return ACURRENTLY_SUPPORTED.includes(this.file_attrs.producttype);
    }
}

// If running Jest tests, we need to define module.exports.
// If navigator exists, we are running in a browser and don't want to set module.exports because that
// results in an error on the console. A console error is not a big problem, but is untidy.
// FYI: navigator.userAgent tells JavaScript what browser is being used. Jest tests don't use a browser.
try {
    // const jestInJenkins   = "Mozilla/5.0 (linux) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/16.6.0";
    // const chromeUserAgent =  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36"
    // In Jest unit test framework the following throws a ReferenceError
    if (navigator.userAgent.indexOf("jsdom") >= 0) {
        //Jest in Jenkins on build server
        module.exports = FilenameParserNew;
    }
} catch (ReferenceError) {
    // Jest on command line for local developer
    module.exports = FilenameParserNew;
}
