import gulp from 'gulp'
import babel from 'gulp-babel'
import terser from 'gulp-terser'
import concat from 'gulp-concat'
import htmlmin from 'gulp-htmlmin'
import autoprefixer from 'autoprefixer'
import postcss from 'gulp-postcss'
import cssnano from 'cssnano'
import pug from 'gulp-pug'
import purgecss from 'gulp-purgecss'
import imagemin from 'gulp-imagemin'
import { init as server, stream, reload } from 'browser-sync'
import plumber from 'gulp-plumber'

const cssPlugins = [cssnano(), autoprefixer()]

const sass = require('gulp-sass')(require('sass'))

const production = false

gulp.task('html-min', () => {
    return gulp
    .src('./src/*.html')
    .pipe(plumber())
    .pipe(htmlmin({
        collapseWhitespace: true,
        removeComments: true
    }))
    .pipe(gulp.dest('./dist'))
})

gulp.task('styles', () => {
    return gulp
    .src('./src/css/*.css')
    .pipe(plumber())
    .pipe(concat('styles.css'))
    .pipe(postcss(cssPlugins))
    .pipe(gulp.dest('./dist/css'))
    .pipe(stream())
})

gulp.task('babel', () => {
    return gulp
    .src('./src/js/*.js')
    .pipe(plumber())
    .pipe(concat('main.js')) // Coloca todos los archivos js en un solo archivo
    .pipe(babel()) // Si no colocamos el preset lo busca del archivo .babelrc
    .pipe(terser()) // ofusca y minifica el codigo
    .pipe(gulp.dest('./dist/js'))
})

gulp.task('views', () => {
    return gulp.src('./src/views/pages/*.pug')
    .pipe(plumber())
    .pipe(pug({
        pretty: !production
    }))
    .pipe(gulp.dest('./dist/views/pages'))
})

gulp.task('sass', () => {
    return gulp
    .src('./src/scss/styles.scss')
    .pipe(plumber())
    .pipe(sass({
        outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('./dist/scss'))
    .pipe(stream())
})

gulp.task('purgecss', () => {
    return gulp
    .src('./dist/css/styles.css')
    .pipe(plumber())
    .pipe(purgecss({
        content: ['./dist/*.html'] // Se colocan todos los archivos que tiene que analizar para comprobar si se usa un estilo
    }))
    .pipe(gulp.dest('./dist/css'))
})

gulp.task('imgmin', () => {
    return gulp.src('./src/images/*')
    .pipe(plumber())
    .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 30, progressive: true }),
            imagemin.optipng({ optimizationLevel: 1 })
    ]))
    .pipe(gulp.dest('./dist/images'))
})

gulp.task('default', () => {

    server({
        server: './dist'
    })

    gulp.watch('./src/*.html', gulp.series('html-min')).on('change', reload)
    gulp.watch('./src/css/*.css', gulp.series('styles'))
    gulp.watch('./src/js/*.js', gulp.series('babel')).on('change', reload)
    // gulp.watch('./src/views/**/*.pug', gulp.series('views')).on('change', reload)
})