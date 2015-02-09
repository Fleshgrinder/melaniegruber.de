'use strict';

/**
 * Transform arbitrary string to filename.
 *
 * @function
 * @param {string} string
 * @return {string}
 */
module.exports.toFilename = function (string) {
    return String(string).toLowerCase().replace(/ +/g, '-').replace(/[^\w-]/g, '');
};

/**
 * Check if text contains HTML tags.
 *
 * @function
 * @param {string} string
 * @return {boolean}
 */
module.exports.containsHTML = function (string) {
    return !!String(string).match(/<[a-z][\s\S]*>/i);
};

/**
 * Decode HTML tags.
 *
 * @function
 * @param {string} string
 * @return {string}
 */
module.exports.decodeHTML = function (string) {
    // TODO: http://phpjs.org/functions/html_entity_decode/
    return string;
};

/**
 * Encode HTML tags.
 *
 * @function
 * @param {string} string
 * @return {string}
 */
module.exports.encodeHTML = function (string) {
    // TODO: http://phpjs.org/functions/htmlentities/
    return string;
};
