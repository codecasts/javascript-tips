var gulp = require('gulp');
var sass = require('gulp-sass');
var server = require('gulp-server-livereload');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var minifyCss = require('gulp-minify-css');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var path = require('path');

var _ = require('lodash');

var args = require('yargs')
  .default('production', false)
  .alias('p', 'production')
  .argv;

var notify = (function() {

  var realNotify = require("gulp-notify");
  var notifyLinterReporter = require('gulp-notify-linter-reporters');
  var parseOptions = function(_options) {
    var options = {
      title: 'Javascript Tips @ Codecats',
      icon: path.join(__dirname, 'codecasts-logo.png')
    };

    if (_.isObject(_options)) {
      _.merge(options, _options);
    } else {
      options.message = _options;
    }

    return options;
  };
  var onError = function(_options) {
    return realNotify.onError(_options);
  };
  var instanse = function() {

  };

  instanse.prototype.show = function(_options) {
    return realNotify(parseOptions(_options));
  };

  instanse.prototype.onError = function(_options) {
    return realNotify.onError(parseOptions(_options));
  };

  instanse.prototype.onLinterError = function() {
    return notifyLinterReporter();
  };

  return new instanse();
})();

// TASKS
gulp.task('sass', function() {
  var isProduction = args.production;

  gulp.src('./source/sass/**/*.scss')
    .pipe(gulpif(!isProduction, sourcemaps.init()))
    .pipe(sass())
    .on('error', notify.onError({
      title: "Browserify Error",
      message: "<%= error.message %>"
    }))
    .pipe(gulpif(isProduction, minifyCss()))
    .pipe(gulpif(!args.production, sourcemaps.write()))
    .pipe(gulp.dest('./assets/css'))
    .pipe(notify.show("SASS Compiled"));
});

gulp.task('javascript', ['jshint'], function() {
  var isProduction = args.production;

  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './source/js/main.js',
    debug: !isProduction
  });

  return b.bundle()
    .on('error', notify.onError({
      title: "Browserify Error",
      message: "<%= error.message %>"
    }))
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(gulpif(!isProduction, sourcemaps.init({
      loadMaps: true
    })))
    .pipe(gulpif(isProduction, uglify()))
    .pipe(gulpif(!isProduction, sourcemaps.write()))
    .pipe(gulp.dest('./assets/js/'))
    .pipe(notify.show('Browserify Compiled'));
});

gulp.task('webserver', function() {
  gulp.src('.')
    .pipe(server({
      livereload: true,
      open: true,
      defaultFile: 'index.html'
    }));
});

gulp.task('jshint', function() {

  return gulp.src('./source/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(notify.onLinterError());
});

gulp.task('watch', ['webserver'], function() {
  gulp.watch('./source/**/*.scss', ['sass']);
  gulp.watch('./source/**/*.js', ['javascript']);
});

gulp.task('default', ['sass', 'javascript']);
