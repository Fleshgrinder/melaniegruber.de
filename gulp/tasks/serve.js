'use strict';

/**
 * Log a notification message.
 *
 * @param {{path:string,type:string}} event - The event to log.
 * @return {undefined}
 */
function gulpTaskServeWatchLogger(event) {
    $.util.log('File ' + $.util.colors.cyan(event.path) + ' was ' + $.util.colors.green(event.type) + ', running tasks ...');
}

/**
 * Wraps gulp's watch function and attaches a change event listener for logging.
 *
 * @param {Array|string} watch - The pattern to watch.
 * @param {Array|string} tasks - The tasks to execute, browser-sync's reload is always pushed to the end..
 * @return {gulpTaskServeWatch}
 */
function gulpTaskServeWatch(watch, tasks) {
    if (!tasks || tasks.length === 0) {
        throw new Error('Tasks cannot be empty');
    }

    if (!util.isArray(tasks)) {
        tasks = [tasks];
    }
    tasks.push($.browserSync.reload)

    gulp.watch(watch, tasks).on('change', gulpTaskServeWatchLogger);

    return gulpTaskServeWatch;
}

// Only available if npm dev dependencies were installed.
gulp.task('serve', ['default'], function gulpTaskServe() {
    $.browserSync({
        notify: false,
        server: {
            baseDir: config.dist ? 'dist' : ['dev', 'src'],
            middleware: $.connectModrewrite(['^/([^\\.]+)$ /$1.html [NC,L]'])
        }
    });

    gulpTaskServeWatch
        ('src/**/*.{gif,jpg,png,svg}', 'images')
        ('src/**/*.{ejs,md}', 'pages')
        ('src/**/*.scss', 'styles')
        ('src/**/*.js', 'scripts')
    ;
});
