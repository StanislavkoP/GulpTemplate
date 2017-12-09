'use strict';

var gulp = require('gulp'),
	pug = require('gulp-pug'),
	sass = require('gulp-sass'),
	csso = require('gulp-csso'),
	del = require('del'),
	tinypng = require('gulp-tinypng'),
	svgSprite = require('gulp-svg-sprite'),
	uglifyjs = require('gulp-uglifyjs'),
	rsp = require('remove-svg-properties').stream,
	svgmin = require('gulp-svgmin'),
	cheerio = require('gulp-cheerio'),
	csscomb = require('gulp-csscomb'),
	cache = require('gulp-cache'),
	replace = require('gulp-replace'),
	notify = require('gulp-notify'),
	sourcemaps = require('gulp-sourcemaps'),
	autoprefixer = require('gulp-autoprefixer'),
	browserSync = require('browser-sync').create(),
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

gulp.task('libsJS:dev', () => {
	return gulp.src(['node_modules/svg4everybody/dist/svg4everybody.min.js'])
		.pipe(concat('libs.min.js'))
		.pipe(gulp.dest('./build/static/js/'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('libsJS:build', () => {
	return gulp.src(['node_modules/svg4everybody/dist/svg4everybody.min.js'])
		.pipe(concat('libs.min.js'))
		.pipe(uglifyjs())
		.pipe(gulp.dest('./build/static/js/'));
});

gulp.task('js:copy', () => {
	return gulp.src(['./dev/static/js/*.js',
					'!./dev/static/js/libs.min.js'])
		.pipe(gulp.dest('./build/static/js/'))
		.pipe(browserSync.reload({
			stream: true
		}));
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
	return gulp.src('./dev/static/sass/main.sass')
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
	return gulp.src('./dev/static/sass/main.sass')
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
gulp.task('img:dev', () => {
	return gulp.src('./dev/static/img/**/*.{png,jpg,gif}')
		.pipe(gulp.dest('./build/static/img/'));
});

gulp.task('img:build', () => {
	return gulp.src('./dev/static/img/**/*.{png,jpg,gif}')
		.pipe(tinypng(qdY7M4kp20__KDKiEpQclOAAYrOtOPTE))
		.pipe(gulp.dest('./build/static/img/'));
});


gulp.task('svg:copy', () => {
	return gulp.src('./dev/static/img/general/*.svg')
		.pipe(gulp.dest('./build/static/img/general/'));
});

// --------------------------------------------------------Работа с SVG

gulp.task('svg', () => {
	return gulp.src('./dev/static/img/svg/*.svg')
		.pipe(svgmin({
			js2svg: {
				pretty: true
			}
		}))
		.pipe(rsp.remove({
			properties: ['fill','stroke']
		}))
		.pipe(replace('&gt;', '>'))
		.pipe(svgSprite({
			mode: {
				symbol: {
					sprite: "sprite.svg"
				}
			}
		}))
		.pipe(gulp.dest('./build/static/img/svg/'));
});

// --------------------------------------------------------Watcher

gulp.task('watch', function () {
	gulp.watch('./dev/pug/**/*.pug', gulp.series('pug'));
	gulp.watch('./dev/static/sass/**/*.sass', gulp.series('styles:dev'));
	gulp.watch('./dev/static/img/svg/*.svg', gulp.series('svg'));
	gulp.watch('./dev/static/js/**/*.js', gulp.series('libsJS:dev', 'js:copy'));
	gulp.watch(['./dev/static/img/general/**/*.{png,jpg,gif}',
				 './dev/static/img/content/**/*.{png,jpg,gif}'], gulp.series('img:dev'));
});

gulp.task('clean', function() {
	return del([
		'./build'
	]);
});

gulp.task('dev', gulp.series(
    'clean',
    gulp.parallel('styles:dev', 'pug', 'libsJS:dev', 'js:copy', 'svg', 'img:dev', 'fonts','svg:copy')));

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('styles:build', 'pug', 'libsJS:build', 'js:copy', 'svg', 'img:build', 'fonts','svg:copy')));

gulp.task('default', gulp.series(
    'dev',
    gulp.parallel(
        'watch',
        'serve'
    )
));