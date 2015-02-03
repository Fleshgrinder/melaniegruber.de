#!/bin/sh

#! ---------------------------------------------------------------------------------------------------------------------
# This is free and unencumbered software released into the public domain.
#
# Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form
# or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
#
# In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright
# interest in the software to the public domain. We make this dedication for the benefit of the public at large and to
# the detriment of our heirs and successors. We intend this dedication to be an overt act of relinquishment in
# perpetuity of all present and future rights to this software under copyright law.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
# WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#
# For more information, please refer to <http://unlicense.org/>
# ----------------------------------------------------------------------------------------------------------------------

# ----------------------------------------------------------------------------------------------------------------------
# Because npm pretty much always fails to install the dependencies.
#
# @author Richard Fussenegger <richard@fussenegger.info>
# @copyright 2014-15 Richard Fussenegger
# @license http://unlicense.org/ PD
# ----------------------------------------------------------------------------------------------------------------------

npm update npm --global
npm update concurrent-transform
npm update del
npm update ejs
npm update glob
npm update gulp
npm update gulp-autoprefixer
npm update gulp-cached
npm update gulp-csso
npm update gulp-front-matter
npm update gulp-gzip
npm update gulp-html-minifier
npm update gulp-ignore
npm update gulp-load-plugins
npm update gulp-markdown
npm update gulp-multi-renderer
npm update gulp-rename
npm update gulp-sass
npm update gulp-tap
npm update gulp-uglify
npm update gulp-util
npm update gulp-webp
npm update image-size
npm update imagemin-mozjpeg
npm update imagemin-pngquant
npm update lazypipe
npm update merge
npm update merge-stream
npm update require-dir
npm update run-sequence
# Most problematic modules must come last.
npm update gulp-zopfli
npm update gulp-image-resize
npm update gulp-imagemin
