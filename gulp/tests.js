'use strict';

var path = require('path');
var gulp = require('gulp');
var karma = require('karma');
var conf = require('./conf');

gulp.task('test', function(done) {
  new karma.Server({
    configFile: path.join(__dirname, '/../karma.conf.js')
  }, function(failCount) {
    done(failCount ? new Error("Failed " + failCount + " tests.") : null);
  }).start();
});
