'use strict';

var browserSync = require('browser-sync');
var connectModrewrite = require('connect-modrewrite');
var gulpUtil = require('gulp-util');
var util = require('util');

/**
 * Log a notification message.
 *
 * @param {{path:string,type:string}} event - The event to log.
 * @return {undefined}
 */
function logger(event) {
    gulpUtil.log(util.format(
        'File %s was %s, running tasks ...',
        gulpUtil.colors.cyan(event.path),
        gulpUtil.colors.green(event.type)
    ));
}

/**
 * Wraps gulp's watch function and attaches a change event listener for logging.
 *
 * @param {Array|string} watchPattern - The pattern to watch.
 * @param {Array|string} tasks - The tasks to execute, browser-sync's reload is always pushed to the end..
 * @return {watch}
 */
function watch(watchPattern, tasks) {
    if (!tasks || tasks.length === 0) {
        throw new Error('Tasks cannot be empty');
    }

    if (!util.isArray(tasks)) {
        tasks = [tasks];
    }
    tasks.push(browserSync.reload);

    gulp.watch(watchPattern, tasks).on('change', logger);

    return watch;
}

// Only available if npm dev dependencies were installed.
module.exports = function () {
    browserSync({
        notify: false,
        server: {
            baseDir: config.dist ? 'dist' : ['dev', 'src'],
            middleware: connectModrewrite(['^/([^\\.]+)$ /$1.html [NC,L]'])
        }
    });

    watch
        ('src/**/*.{gif,jpg,png,svg}', 'images')
        ('src/**/*.{ejs,md}', 'pages')
        ('src/**/*.scss', 'styles')
        ('src/**/*.js', 'scripts')
    ;
};
