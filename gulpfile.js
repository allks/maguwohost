const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');

function sync() {
  browserSync.init({
    server: { baseDir: 'app/' },
    notify: false,
    online: true,
  })
}

function scripts() {
  return src([
    'app/js/app.js',
    'app/js/app2.js',
  ])
  .pipe(concat('app.min.js'))
  .pipe(uglify())
  .pipe(dest('app/js/'))
  .pipe(browserSync.stream())
}

function styles() {
  return src('app/scss/main.scss')
  .pipe(scss())
  .pipe(concat('app.min.css'))
  .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
  .pipe(cleanCss(({ level: { 1: { specialComments: 0 }}})))
  .pipe(dest('app/css/'))
  .pipe(browserSync.stream())
}

function images() {
  return src('app/images/src/**/*')
  .pipe(newer('app/images/dest'))
  .pipe(imagemin())
  .pipe(dest('app/images/dest/'))
}

function cleanImg() {
  return del('app/images/dest/**/*', { force: true })
}

function cleanDist() {
  return del('dist/**/*', { force: true })
}

function buildCopy() {
  return src([
    'app/css/**/*.min.css',
    'app/js/**/*.min.js',
    'app/images/dest/**/*',
    'app/**/*.html',
  ], { base: 'app' })
  .pipe(dest('dist'));
}

function startWatch() {
  watch('app/**/*.html').on('change', browserSync.reload);
  watch('app/**/*.scss', styles);
  watch([
    'app/**/*.js',
    '!app/**/*.min.js',
  ], scripts);
  watch('app/images/src/**/*', images);
}

exports.sync = sync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.cleanImg = cleanImg;
exports.build = series(cleanDist, styles, scripts, images, buildCopy);

exports.default = parallel(styles, scripts, sync, startWatch);