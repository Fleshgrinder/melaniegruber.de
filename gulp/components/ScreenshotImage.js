'use strict';

var GalleryImage = require('./GalleryImage');
var util = require('util');

/**
 * Construct new screenshot image instance.
 *
 * @constructor
 * @param {string} imageTitle
 * @param {string} pageRoute
 */
function ScreenshotImage(imageTitle, pageRoute) {
    ScreenshotImage.super_.call(this, imageTitle, pageRoute);
}

util.inherits(ScreenshotImage, GalleryImage);

/**
 * @inheritDoc
 */
ScreenshotImage.prototype.getType = function () {
    return 'screenshots';
};

module.exports = ScreenshotImage;
