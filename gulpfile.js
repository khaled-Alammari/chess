const 
    gulp = require('gulp'),
    prefix = require('gulp-autoprefixer'),
    sass = require('gulp-sass')(require('sass')),
    pug = require('gulp-pug'),
    concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    uglify = require('gulp-uglify');
    // babel = require('gulp-babel');


// HTML Task
gulp.task('html', function () {
    return gulp.src('./project/html/index.pug')
            .pipe(pug({pretty: true}))
            .pipe(gulp.dest('./dist'))
});

// CSS Task
gulp.task('css', function () {
    return gulp.src('./project/scss/*.scss')
            .pipe(sass({outputStyle: 'compressed'}))
            .pipe(prefix('last 2 versions'))
            .pipe(concat('style.css'))
            .pipe(gulp.dest('./dist'))
});

// JS Task
gulp.task('js', function () {
    return gulp.src('./project/js/*.js')
            // .pipe(babel())
            // .pipe(uglify())
            .pipe(gulp.dest('./dist'))
});

// Watching Task
gulp.task('watch', function () {
    livereload.listen();
    gulp.watch('project/html/**/*.pug', gulp.series('html'));
    gulp.watch('project/scss/**/*.scss', gulp.series('css'));
    gulp.watch('project/js/**/*.js', gulp.series('js'));
});