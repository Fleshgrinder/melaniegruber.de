/* globals text */
'use strict';

/**
 * Construct new page instance.
 *
 * @constructor
 * @param {string} filePath - The file path to the markdown file.
 * @param {{}} metaInformation - The meta information extracted from the markdown files.
 */
function Page(filePath, metaInformation) {
    var next;
    var previous;

    if (!metaInformation.title || metaInformation.title.length === 0) {
        throw new InvalidArgumentError('Title is mandatory.');
    }
    if (text.containsHTML(metaInformation.title)) {
        throw new InvalidArgumentError('Title cannot contain HTML.');
    }

    if (!metaInformation.description || metaInformation.description.length === 0) {
        throw new InvalidArgumentError('Description is mandatory.');
    }
    if (metaInformation.description.length > 155) {
        throw new InvalidArgumentError('Description cannot be longer than 155 characters.');
    }
    if (text.containsHTML(metaInformation.description)) {
        throw new InvalidArgumentError('Description cannot contain HTML.');
    }

    this.__setRoute(filePath);

    Object.defineProperties(this, {
        filePath: {
            value: filePath
        },
        description: {
            value: metaInformation.description
        },
        layout: {
            value: metaInformation.layout || 'default'
        },
        next: {
            get: function () {
                return next;
            },
            set: function (value) {
                if (!(value instanceof Page)) {
                    throw new Error('Next page must be an instance of Page.');
                }
                next = value;
            }
        },
        previous: {
            get: function () {
                return previous;
            },
            set: function (value) {
                if (!(value instanceof Page)) {
                    throw new Error('Previous page must be an instance of Page.');
                }
                previous = value;
            }
        },
        route: {
            value: filePath
        },
        title: {
            value: metaInformation.title
        },
        titleSeparator: {
            value: metaInformation.titleSeparator || config.titleSeparator
        }
    });
}

/**
 * Set the page's route.
 *
 * @private
 * @param {string} route - The route to set.
 * @return {Page}
 */
Page.prototype.__setRoute = function pageSetRoute(route) {
    this.route = '/' + $.util.replaceExtension(route, '');
    return this;
};

// Export to global scope, keep a non-frozen reference for inheritance.
global.Page = Page;
