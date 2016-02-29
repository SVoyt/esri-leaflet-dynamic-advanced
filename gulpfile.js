'use strict';

var gulp = require('gulp');
var wrench = require('wrench');

/**
 *  This will load all js and coffee files in the gulp directory
 *  in order to load all gulp tasks
 */
wrench.readdirSyncRecursive('./gulp').filter(function(file) {
  return (/\.(js|coffee)$/i).test(file);
}).map(function(file) {
  require('./gulp/' + file);
});


/**
 *  Default task clean temporaries directories and launch the
 *  main optimization build task
 */
gulp.task('default', ['clean'], function() {
  gulp.start('build');
});

//
//gulp.task('default', function () {
//  return gulp.src('src/DynamicMapLayerAdvanced.js')
//
//    .pipe(rename({ basename: 'esri-leaflet-dynamic-advanced' }))
//    .pipe(gulp.dest(DEST))
//    .pipe(uglify())
//    .pipe(rename({ extname: '.min.js' }))
//    .pipe(gulp.dest(DEST));
//});
