'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del']
});

gulp.task('js-min', function() {
  return gulp.src(path.join(conf.paths.src, '/**/*.js'))
    .pipe($.rename({basename: conf.names.main}))
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
    .pipe($.size({title: path.join(conf.paths.dist, '/'), showFiles: true}))
    .pipe($.uglify()).on('error', conf.errorHandler('Uglify'))
    .pipe($.rename({extname: '.min.js'}))
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
    .pipe($.size({title: path.join(conf.paths.dist, '/'), showFiles: true}));
});

gulp.task('clean', function() {
  return $.del(path.join(conf.paths.dist, '/'));
});

gulp.task('build', ['js-min']);
