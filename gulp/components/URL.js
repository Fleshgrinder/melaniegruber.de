'use strict';

var crypto = require('crypto');
var fs = require('fs');
var glob = require('glob');
var path = require('path');
var util = require('util');

var cacheBusters = {};

/**
 * Validate passed path.
 *
 * @function
 * @param {*} path - The path to validate.
 * @return {URL} Itself for chaining.
 * @throws {string} The validated path.
 */
function validatePath(path) {
    if (path == null) {
        // Both, null and undefined, are printed as is in JavaScript; make sure this will not happen.
        throw new TypeError('Path argument cannot be null nor undefined.');
    }

    if (path !== '' && path.substring(0, 1) !== '/') {
        // An empty path is no problem, since it links to the homepage, but anything else has to start with a slash.
        // Note that it is not added automatically, since the missing slash is an indicator for other problems in
        // the code (which should be fixed).
        throw new TypeError(util.format('Paths must start with a slash: %s', path));
    }

    return path;
}

/**
 * Generate absolute URL.
 *
 * @function
 * @param {string} path - Web accessible path to generate absolute URL for.
 * @return {string} The absolute URL for the given path.
 */
module.exports.absolute = function (path) {
    return config.uri.scheme + '://' + config.uri.authority + validatePath(path);
};

/**
 * Get asset path with cache buster appended.
 *
 * @function
 * @param {string} webPath - Web accessible path to the asset.
 * @param {string} [pattern] - Pattern to generate the cache buster from, defaults to path.
 * @return {string} The asset's path with the cache buster appended.
 */
module.exports.asset = function (webPath, pattern) {
    webPath = validatePath(webPath);

    if (config.dist) {
        pattern = pattern || path.resolve('src' + webPath);

        if (!(pattern in cacheBusters)) {
            // There must be at least a single character which needs expansion, otherwise directly access the file.
            if (pattern.match(/\*/)) {
                cacheBusters[pattern] = '';
                glob.sync(pattern).forEach(function (path) {
                    cacheBusters[pattern] += fs.readFileSync(path, { encoding: 'utf8' });
                });
            } else {
                cacheBusters[pattern] = fs.readFileSync(pattern, { encoding: 'utf8' });
            }

            cacheBusters[pattern] = encodeURIComponent(crypto.createHash('md5')
                    .update(cacheBusters[pattern])
                    .digest('base64')
                    // Remove trailing equal signs, we do not need them for proper cache busting.
                    .replace(/=*$/, '')
            );
        }

        return webPath + '?' + cacheBusters[pattern];
    }

    return webPath;
};
