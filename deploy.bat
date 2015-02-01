@ECHO OFF

REM --------------------------------------------------------------------------------------------------------------------
REM This is free and unencumbered software released into the public domain.
REM
REM Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form
REM or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
REM
REM In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all
REM copyright interest in the software to the public domain. We make this dedication for the benefit of the public at
REM large and to the detriment of our heirs and successors. We intend this dedication to be an overt act of
REM relinquishment in perpetuity of all present and future rights to this software under copyright law.
REM
REM THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
REM WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
REM BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
REM FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
REM
REM For more information, please refer to <http://unlicense.org>
REM --------------------------------------------------------------------------------------------------------------------

REM --------------------------------------------------------------------------------------------------------------------
REM Windows batch file for easy deployment (for people who do not know what a command line is).
REM
REM @author Richard Fussenegger <richard@fussenegger.info>
REM @copyright 2014 Richard Fussenegger
REM @license http://unlicense.org/ Unlicense.
REM --------------------------------------------------------------------------------------------------------------------

COLOR 07
ECHO Starting deployment, this may take several minutes ...
IF NOT EXIST "%CD%\node_modules" CMD /K "npm update"
CMD /K "%CD%\node_modules\.bin\gulp"
