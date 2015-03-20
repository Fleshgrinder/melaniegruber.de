'use strict';

var IndexTile = require('./../Image/IndexTile');
var Page = require('./Page');
var ProgramIcon = require('./../Image/ProgramIcon');
var ScreenshotImage = require('./../Image/ScreenshotImage');
var util = require('util');

/**
 * Construct new project page instance.
 *
 * @constructor
 * @param {File} file - The file path to the markdown file.
 * @param {{}} data - The meta information extracted from the markdown files.
 */
function ProjectPage(file, data) {
    var dateParts = file.path.match(/projects(?:\/|\\)((\d{4})(?:-\d{1,2}){0,2})--/);
    var next;
    var previous;
    var programIcons;
    var screenshots;
    var self = this;
    var year = parseInt(dateParts[2], 10);

    data.layout = 'project';
    ProjectPage.super_.call(this, file, data);

    Object.defineProperties(this, {
        date: {
            enumerable: true,
            value: dateParts[1]
        },
        indexTile: {
            enumerable: true,
            value: new IndexTile(this)
        },
        isWorkInProgress: {
            enumerable: true,
            value: 'wip' in data ? data.wip : year > new Date().getFullYear()
        },
        next: {
            enumerable: true,
            get: function () {
                return next;
            },
            set: function (value) {
                if (!(value instanceof ProjectPage)) {
                    throw new TypeError('Next project page must be an instance of ProjectPage.');
                }
                next = value;
            }
        },
        previous: {
            enumerable: true,
            get: function () {
                return previous;
            },
            set: function (value) {
                if (!(value instanceof ProjectPage)) {
                    throw new TypeError('Previous project page must be an instance of ProjectPage.');
                }
                previous = value;
            }
        },
        programs: {
            enumerable: true,
            value: !!data.programs
        },
        screenshots: {
            enumerable: true,
            value: !!data.screenshots
        },
        type: {
            enumerable: true,
            value: data.type
        },
        vimeo: {
            enumerable: true,
            value: data.vimeo
        },
        work: {
            enumerable: true,
            value: data.work
        },
        year: {
            enumerable: true,
            value: year
        }
    });

    file.path = normalizePagePath(file.path);

    /**
     * Get the project's program icons.
     *
     * @method
     * @return {ProgramIcon[]}
     */
    this.getProgramIcons = function () {
        if (!programIcons && self.programs) {
            programIcons = [];
            for (var i = 0, l = data.programs.length; i < l; ++i) {
                programIcons.push(new ProgramIcon(data.programs[i]));
            }
        }

        return programIcons || [];
    };

    /**
     * Get the project's screenshots.
     *
     * @method
     * @return {GalleryImage[]}
     */
    this.getScreenshots = function () {
        if (!screenshots && self.screenshots) {
            screenshots = [];
            for (var i = 0, l = data.screenshots.length; i < l; ++i) {
                screenshots.push(new ScreenshotImage(data.screenshots[i], self));
            }
        }

        return screenshots || [];
    };
}

util.inherits(ProjectPage, Page);

/**
 * @inheritDoc
 */
ProjectPage.prototype.__getImage = function () {
    return this.indexTile.src(this.indexTile.width / 2);
};

/**
 * Normalize project image path.
 *
 * @param {string} path - The image path to normalize.
 * @return {string} The normalized image path.
 */
function normalizeImagePath(path) {
    return path.replace(/(\/|\\)projects(?:\/|\\)\d{4}(?:-\d{1,2}){0,2}--/, '$1images$1');
}

/**
 * Normalize project page path.
 *
 * @param {string} path - The page path to normalize.
 * @return {string} The normalized page path.
 */
function normalizePagePath(path) {
    return path.replace(/(?:\/|\\)projects(?:\/|\\)\d{4}(?:-\d{1,2}){0,2}--[^\/\\]+/, '');
}

module.exports = ProjectPage;
module.exports.normalizeImagePath = normalizeImagePath;
module.exports.normalizePagePath = normalizePagePath;
