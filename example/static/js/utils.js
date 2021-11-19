const DEFAULT_PRECISION = 6;

class Utils {
    // convert modified Julian date
    static convertMjDate(mjData) {
        const originMJD = -3506716800000;
        const date = new Date(mjData * 86400000 + originMJD);
        return date.toISOString().slice(0, 19).replace("T", " ");
    }
    // convert JavaScript date
    static convertJavascriptDate(jsDate) {
        if (typeof jsDate === "string") {
            jsDate = parseInt(jsDate);
        }
        const date = new Date(jsDate);
        return date.toISOString().slice(0, 19).replace("T", " ");
    } // convert wrapped date
    static convertWrappedDate(wrappedDate) {
        if (typeof wrappedDate === "string" && wrappedDate.startsWith("/Date(")) {
            const dateAsInt = parseInt(wrappedDate.substring(6));
            const date = new Date(dateAsInt);
            return date.toISOString().slice(0, 19).replace("T", " ");
        } else {
            return wrappedDate;
        }
    }
    //get URL parameter
    static getParam(param) {
        var url = new URL(window.location.href);
        return url.searchParams.get(param);
    }
    //remove any HTML tags from a string
    static stripHtmlTags(str, preserveSpace = false, addSeparator = false) {
        if (str === null || str === "") {
            return false;
        } else {
            str = str.toString();
        }
        if (preserveSpace) {
            // for every <, put in an extra space so that when HTML tags are removed, white space is preserved.
            str = str.replace(/(<)/g, " <");
        }
        if (addSeparator) {
            // for every <li>, put in a vertical bar so that when HTML tags are removed, a separator is preserved.
            str = str.replace(/(\<li\>)/gi, "<li>| ");
        }
        // Regular expression to identify HTML tags in the input string, replacing the identified HTML tag with an empty string.
        return str.replace(/(<([^>]+)>)/gi, "");
    }
    static jsonToFormData(data) {
        const formData = new FormData();
        Utils.buildFormData(formData, data);
        return formData;
    }
    static buildFormData(formData, data, parentKey) {
        if (data && typeof data === "object" && !(data instanceof Date) && !(data instanceof File)) {
            Object.keys(data).forEach((key) => {
                Utils.buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
            });
        } else {
            const value = data == null ? "" : data;
            formData.append(parentKey, value);
        }
    }
    //If value is a string that can be parsed to a float, format to specified number of significant figures
    static formatSigFigs(value, precision = DEFAULT_PRECISION) {
        try {
            return Number.parseFloat(value).toPrecision(precision);
        } catch (exception) {
            //if this cannot be parsed as a float, return the original value
            return value;
        }
    }
}
