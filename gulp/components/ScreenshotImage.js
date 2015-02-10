'use strict';

var GalleryImage = require('./GalleryImage');
var util = require('util');

function ScreenshotImage(title, page) {
    this.__type = 'screenshots';
    ScreenshotImage.super_.call(this, title, page);
}

util.inherits(ScreenshotImage, GalleryImage);

module.exports = ScreenshotImage;
