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
# Linux shell script for easy deployment (for people who do not know what a command line is).
#
# AUTHOR: Richard Fussenegger <richard@fussenegger.info>
# COPYRIGHT: Copyright (c) 2014-15 Richard Fussenegger
# LICENSE: http://unlicense.org/ PD
# ----------------------------------------------------------------------------------------------------------------------

printf -- 'Starting deployment, this may take several minutes ...\n'

if [ ! -d ./node_modules ]
then
    sudo apt-get install --yes -- build-essentials libjpeg-dev libpng-dev
    sudo npm update npm --global
    [ $(command -v gulp) = '' ] && sudo npm install gulp --global
    npm update
fi

gulp
