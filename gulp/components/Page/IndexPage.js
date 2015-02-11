'use strict';

var Page = require('./Page');
var util = require('util');

/**
 * Construct new index page instance.
 *
 * @constructor
 * @param {File} file
 * @param {{}} data
 * @param {ProjectPage[]} projects
 */
function IndexPage(file, data, projects) {
    data.index = true;
    data.route = '/';

    IndexPage.super_.call(this, file, data);

    Object.defineProperty(this, 'projects', {
        enumerable: true,
        value: projects
    });
}

util.inherits(IndexPage, Page);

module.exports = IndexPage;
