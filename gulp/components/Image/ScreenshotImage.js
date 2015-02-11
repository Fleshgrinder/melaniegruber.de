'use strict';

var GalleryImage = require('./GalleryImage');
var util = require('util');

/**
 * Construct new screenshot image instance.
 *
 * @constructor
 * @param {string} title
 * @param {Page} page
 */
function ScreenshotImage(title, page) {
    ScreenshotImage.super_.call(this, title, page);
}

util.inherits(ScreenshotImage, GalleryImage);

/**
 * @inheritDoc
 */
ScreenshotImage.prototype.getType = function () {
    return 'screenshots';
};

module.exports = ScreenshotImage;
