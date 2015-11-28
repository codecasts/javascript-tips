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

var args = require('yargs')
    .default('production', false)
    .alias('p', 'production')
    .argv;

gulp.task('sass', function () {
  var isProduction = args.production;

  gulp.src('./source/sass/**/*.scss')
    .pipe(gulpif(!isProduction, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(isProduction, minifyCss()))
    .pipe(gulpif(!args.production, sourcemaps.write()))
    .pipe(gulp.dest('./assets/css'));
});

gulp.task('javascript', function () {
  var isProduction = args.production;
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './source/js/main.js',
    debug: !isProduction
  });

  return b.bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(gulpif(!isProduction, sourcemaps.init({loadMaps: true})))
    .pipe(gulpif(isProduction, uglify()))
      .on('error', gutil.log)
    .pipe(gulpif(!isProduction, sourcemaps.write()))
    .pipe(gulp.dest('./assets/js/'));
});

gulp.task('webserver', function() {
  gulp.src('.')
    .pipe(server({
      livereload: true,
      open: true,
      defaultFile: 'index.html'
    }));
});


gulp.task('watch', ['webserver'], function () {
  gulp.watch('./source/**/*.scss', ['sass']);
});

gulp.task('default', ['sass', 'javascript']);
