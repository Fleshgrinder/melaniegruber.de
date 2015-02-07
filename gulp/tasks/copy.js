'use strict';

gulp.task('copy', function gulpTaskCopy() {
    if (config.dist) {
        return gulp.src(['src/*.{ico,txt,xml}', 'src/downloads/**/*', 'src/fonts/**/*.{woff,woff2}'], { base: 'src/' })
            .pipe($.plumber())
            .pipe($.changed(config.dest))
            .pipe(gulp.dest(config.dest))
            .pipe($.ignore.include(function (vinyl) {
                return $.path.extname(vinyl.path).match(/(?:ico|txt|xml)/);
            }))
            .pipe($.compress())
            .pipe(gulp.dest(config.dest));
    }
});
