'use strict';

var gulp = require('gulp'),
	pug = require('gulp-pug'),
	sass = require('gulp-sass'),
	csso = require('gulp-csso'),
	del = require('del'),
	svgstore = require("gulp-svgstore"),
	imagemin = require("gulp-imagemin"),
	webp = require("gulp-webp"),
	rename = require("gulp-rename"),
	uglifyjs = require('gulp-uglifyjs'),
	csscomb = require('gulp-csscomb'),
	cache = require('gulp-cache'),
	replace = require('gulp-replace'),
	notify = require('gulp-notify'),
	sourcemaps = require('gulp-sourcemaps'),
	autoprefixer = require('gulp-autoprefixer'),
	browserSync = require('browser-sync').create(),
	del = require('del'),
	concat = require('gulp-concat');
// --------------------------------------------------------Работа с browserSync
gulp.task('serve', function() {
	browserSync.init({
		server: {
			baseDir: "./build"
		}
	})
});

// --------------------------------------------------------Работа с JavaScript
gulp.task('main-js', () => {
	return gulp.src([
		'./dev/static/js/main.js',
		])
	.pipe(concat('main.min.js'))
	.pipe(uglifyjs())
	.pipe(gulp.dest('./build/static/js/'))
});

gulp.task('js', () => {
	return del('main-js')
	return gulp.src([
		'./dev/static/js/main.min.js', // Всегда в конце
		])
	.pipe(concat('scripts.min.js'))
	.pipe(uglifyjs()) // Минимизировать весь js (на выбор)
	.pipe(gulp.dest('./build/static/js/'))
	.pipe(browserSync.reload({stream: true}));
});

// --------------------------------------------------------Работа с pug
gulp.task('pug', ()=>  {
	return gulp.src('./dev/pug/pages/*.pug')
		.pipe(pug({
			pretty: true
		}))
		.on('error', notify.onError(function(error) {
			return {
				title: 'Pug',
				message: error.message
			};
		}))
		.pipe(gulp.dest('./build/'))
		.on('end', browserSync.reload);
});
// --------------------------------------------------------Работа с sass
gulp.task('styles:build', () => {
	return gulp.src('./dev/static/sass/main.scss')
		.pipe(sass({
			'include css': true
		}))
		.pipe(autoprefixer({
			browsers: ['last 15 version']
		}))
		.pipe(csscomb())
		.pipe(csso())
		.pipe(gulp.dest('./build/static/css/'))
});

gulp.task('styles:dev', () => {
	return gulp.src('./dev/static/sass/main.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({
			'include css': true
		}))
		.on('error', notify.onError(function (error) {
			return {
				title: 'Sass',
				message: error.message
			};
		}))
		.pipe(sourcemaps.write())
		.pipe(autoprefixer({
			browsers: ['last 15 version']
		}))
		.pipe(gulp.dest('./build/static/css/'))
		.pipe(browserSync.reload({
			stream: true
		}));
});
// --------------------------------------------------------Работа со шрифтами
gulp.task('fonts', () => {
	return gulp.src('./dev/static/fonts/**/*.*')
		.pipe(gulp.dest('./build/static/fonts/'));
});
// --------------------------------------------------------Работа с картинка
gulp.task("images", () => {
	return gulp.src("./build/img/**/*{png,jpg,svg}")
	  .pipe(imagemin([
		imagemin.optipng({optimizationLevel: 3}),
		imagemin.jpegtran({progressive: true}),
		imagemin.svgo()
	  ]))
	  .pipe(gulp.dest("./build/img"))
  });

gulp.task("webp", () => {
return gulp.src("./build/img/**/*.{png,jpg}")
	.pipe(webp({quality: 90}))
	.pipe(gulp.dest("./build/static/img"));
});

// --------------------------------------------------------Работа с SVG

gulp.task('sprite', () => {
	return gulp.src('./dev/static/img/svg/inline-*.svg')
	.pipe(svgstore({
		inlineSvg: true
	  }))
	  .pipe(rename("sprite.svg"))
		.pipe(gulp.dest('./build/static/img/svg/'));
});

// --------------------------------------------------------Watcher

gulp.task('watch', () => {
	gulp.watch('./dev/pug/**/*.pug', gulp.series('pug'));
	gulp.watch('./dev/static/sass/**/*.scss', gulp.series('styles:dev'));
	gulp.watch('./dev/static/img/svg/*.svg', gulp.series('sprite'));
	gulp.watch('./dev/static/js/**/*.js', gulp.series('js'));
	gulp.watch(['./dev/static/img/general/**/*.{png,jpg,svg}',
				 './dev/static/img/content/**/*.{png,jpg,svg}'], gulp.series('images'));
});

gulp.task('clean', () => {
	return del([
		'./build'
	]);
});

gulp.task('dev', gulp.series(
    'clean',
    gulp.parallel('styles:dev', 'pug', 'js', 'sprite', 'images','webp', 'fonts')));

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('styles:build', 'pug', 'js', 'sprite', 'images','webp', 'fonts')));

gulp.task('default', gulp.series(
    'dev',
    gulp.parallel(
        'watch',
        'serve'
    )
));