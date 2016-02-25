'use strict';

var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var DEST = 'dist/';

gulp.task('default', function () {
  return gulp.src('src/DynamicMapLayerAdvanced.js')

    .pipe(rename({ basename: 'esri-leaflet-dynamic-advanced' }))
    .pipe(gulp.dest(DEST))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(DEST));
});
