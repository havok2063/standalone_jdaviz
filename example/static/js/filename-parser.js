//const VALID_SUFFIXES = ["_c1d.fits", "_x1d.fits", "_x1dints.fits", "_s2d.fits", "_s3d.fits"];
const VALID_L3 = ["c1d", "x1d", "x1dints", "s2d", "s3d"];
const CURRENTLY_SUPPORTED = ["x1d", "c1d", "s2d", "s3d"];

// file naming convention: https://outerspace.stsci.edu/display/MASTDOCS/File+Naming+Convention
class FilenameParser {

    static getFilenameFromUri(uri) {
        // class method to get a URI from a filename
        const list = uri.split("/");
        var filename = null;
        if (list.length > 1) {
            filename = list[list.length - 1];
        }
        return filename;
    }
    static getObsIdFromFilename(filename) {
        // class method to extract observation id from filename (remove suffix)
        filename = filename.toLowerCase();
        var obs_id = null;

        // extract the product type and use it to extract obs_id substring
        var match = this.parseFilename(filename);
        if (match !== null) {
            var idx = filename.indexOf(match.producttype);
            obs_id = filename.substr(0, idx-1);
        }
        return obs_id;
    }

    static isJdavizFile(filename) {
        // class method to check is file a valid L3 file and supported by Jdaviz
        if (filename == null || filename == "") {
            return false;
        }
        filename = filename.toLowerCase();
        return this.isValidL3(filename) && this.isSupported(filename);
    }

    static parseFilename(filename) {
        // class method to parse the data product filename via regex and returns named capture group

        filename = filename.toLowerCase();

        // jwst level 3 data product regex
        var regex = /^jw(?<program>\d{5})-(?<assnid>[ocar]\d{3,4})_((?<target>t\d{3})|(?<source>s\d{5}))(-epoch(?<epoch>\d))?_(?<instrument>[a-z0-9]+)_(?<optelements>[a-z0-9\-]+)_(?<producttype>[a-z0-9]+)(?<actid>-[0-9]{2})?.(?<extension>[a-z]+)/;

        // pattern match the filename
        var match = filename.match(regex);

        // return null or the match group
        if (match == null) {
            return match;
        } else {
            return match.groups;
        }
    }

    static isValidL3(filename) {
        // class method to check if a file is valid L3 JWST data product

        var match = this.parseFilename(filename);
        if (match == null) {
            return false;
        }
        return VALID_L3.includes(match.producttype);
    }

    static isSupported(filename) {
        // class method to check if a file is currently supported in Jdaviz
        var match = this.parseFilename(filename);
        if (match == null) {
            return false;
        }
        return CURRENTLY_SUPPORTED.includes(match.producttype);
    }
    // Use this if you don't know if inputStr is a URI or a filename
    static getObsId(inputStr) {
        // Check if incoming inputStr is a URI
        var filename;
        if (inputStr.includes("/")) {
            filename = FilenameParser.getFilenameFromUri(inputStr);
        } else {
            filename = inputStr;
        }
        // get obsid from inputStr
        var obsID;
        if (filename.toLowerCase().includes(".fits")) {
            obsID = FilenameParser.getObsIdFromFilename(filename);
        } else {
            obsID = filename;
        }
        return obsID;
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
        module.exports = FilenameParser;
    }
} catch (ReferenceError) {
    // Jest on command line for local developer
    module.exports = FilenameParser;
}
