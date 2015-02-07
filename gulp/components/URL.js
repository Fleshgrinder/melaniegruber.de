'use strict';

/**
 * Construct new URL instance.
 *
 * @constructor
 */
function URL() {
    if (config.dist) {
        this.__cacheBusters = {};
    }
}

URL.prototype = {

    /**
     * Validate passed path.
     *
     * @private
     * @method
     * @param {*} path - The path to validate.
     * @return {URL} Itself for chaining.
     * @throws {string} The validated path.
     */
    __validatePath: function urlValidatePath(path) {
        if (path == null) {
            // Both, null and undefined, are printed as is in JavaScript; make sure this will not happen.
            throw new Error('Path argument cannot be null nor undefined.');
        }

        if (path !== '' && path.substring(0, 1) !== '/') {
            // An empty path is no problem, since it links to the homepage, but anything else has to start with a slash.
            // Note that it is not added automatically, since the missing slash is an indicator for other problems in
            // the code (which should be fixed).
            throw new Error('Paths must start with a slash.');
        }

        return path;
    },

    /**
     * Generate absolute URL.
     *
     * @method
     * @param {string} path - Web accessible path to generate absolute URL for.
     * @return {string} The absolute URL for the given path.
     */
    absolute: function urlAbsolute(path) {
        return config.uri.scheme + '://' + config.uri.authority + this.__validatePath(path);
    },

    /**
     * Get asset path with cache buster appended.
     *
     * @param {string} path - Web accessible path to the asset.
     * @param {string} [pattern] - Pattern to generate the cache buster from, defaults to path.
     * @return {string} The asset's path with the cache buster appended.
     */
    asset: function urlAsset(path, pattern) {
        path = this.__validatePath(path);

        if (config.dist) {
            var self = this;

            pattern = 'src' + pattern || path;

            if (!(pattern in this.__cacheBusters)) {
                this.__cacheBusters[pattern] = '';

                // This method is called in EJS which cannot deal with asynchronous methods.
                $.glob.sync(pattern).forEach(function (filePath) {
                    self.__cacheBusters[pattern] += $.fs.readFileSync(filePath, { encoding: 'utf8' });
                });

                this.__cacheBusters[pattern] = $.crypto.createHash('md5')
                    .update(this.__cacheBusters[pattern])
                    .digest('base64')
                    // Remove trailing equal signs, we do not need them for proper cache busting.
                    .replace(/=*$/, '')
                    // Everything else needs encoding because these characters have a special meaning in a URL.
                    .replace(/\+/g, '%2B')
                    .replace(/\//g, '%2F')
                    .replace(/=/g, '%3D');
            }

            return path + '?' + this.__cacheBusters[pattern];
        }

        return path;
    }

};

// Export instance to global scope.
global.url = new URL();
