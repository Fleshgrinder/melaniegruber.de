'use strict';

/** @type {{}} Global configuration. */
global.config = require('./config.json');

/** @type {gulp.Gulp} Node gulp module. */
global.gulp = require('gulp');

/** @type {boolean} Whether `--dist` was passed or not. */
config.dist = !!process.argv.pop().match('--dist');

/** @type {string} Default destination directory. */
config.dest = config.dist ? 'dist' : 'dev';

/**
 * Log complete objects with color output to console.
 *
 * @param {Object} obj
 * @return {console}
 */
console.obj = function consoleObj(obj) {
    console.log(obj.constructor.name, require('util').inspect(obj, { colors: true, showHidden: true }));
    return console;
};

gulp.task('default', function (done) {
    require('run-sequence')(['copy', 'images', 'scripts', 'styles'], 'pages', done);
});

['copy', 'images', 'pages', 'scripts', 'styles'].forEach(function (task) {
    gulp.task(task, function (done) {
        return require('./gulp/tasks/' + task)(done);
    });
});

gulp.task('serve', ['default'], function () {
    require('./gulp/tasks/serve')();
});

['dev', 'dist'].forEach(function (task) {
    gulp.task('clean-' + task, function (done) {
        require('del')(task, done);
    });
});
