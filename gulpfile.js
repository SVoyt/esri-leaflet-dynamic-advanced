'use strict';


/**
 *  Config
 */
var conf = {
  paths: {
    src: 'src',
    dist: 'dist',
    tests: 'spec'
  },
  names: {
    main: 'esri-leaflet-dynamic-advanced'
  }
};


/**
 *  Modules
 */
var path = require('path');
var karma = require('karma');
var gulp = require('gulp');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var del = require('del');


/**
 *  Build tasks
 */
gulp.task('default', ['clean'], function() {
  gulp.start('test and build');
});

gulp.task('clean', function() {
  return del(path.join(conf.paths.dist, '/'));
});

gulp.task('build', function() {
  return gulp.src(path.join(conf.paths.src, '/**/*.js'))
    .pipe(rename({basename: conf.names.main}))
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
    .pipe(uglify()).on('error', errorHandler('Uglify'))
    .pipe(rename({extname: '.min.js'}))
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});


/**
 *  Test tasks
 */
gulp.task('test and build', ['build'], function(done) {
  new karma.Server({
    configFile: path.join(__dirname, '/karma.conf.js')
  }, function(failCount) {
    done(failCount ? new Error("Failed " + failCount + " tests.") : null);
  }).start();
});


/**
 *  Common implementation for an error handler of a Gulp plugin
 */
function errorHandler(title) {
  return function(err) {
    gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
    this.emit('end');
  };
}
