/* jshint browser:true */

/*!
 * This is free and unencumbered software released into the public domain.
 *
 * Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form
 * or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
 *
 * In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright
 * interest in the software to the public domain. We make this dedication for the benefit of the public at large and to
 * the detriment of our heirs and successors. We intend this dedication to be an overt act of relinquishment in
 * perpetuity of all present and future rights to this software under copyright law.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * For more information, please refer to <http://unlicense.org/>
 */

/**
 * Main JavaScript file.
 *
 * @author Richard Fussenegger <richard@fussenegger.info>
 * @copyright 2014 Richard Fussenegger
 * @license http://unlicense.org/ Unlicense.
 */
(function (window, document) {
    'use strict';

    // Best solution until CSS4 media query hover support is available.
    if ('ontouchstart' in document.documentElement) {
        document.documentElement.classList.remove('hover');
        document.documentElement.classList.add('no-hover');
    }

    /**
     * The page's navigation menu.
     * @type {Element}
     */
    var menu;

    /**
     * Click event callback for the page's navigation menu toggles.
     * @param {Event} event - The click event.
     */
    function toggleMenu(event) {
        event.preventDefault();

        // Use the cached menu or select the menu from the DOM.
        menu = menu || document.querySelector('.menu');

        // Actual animation is handled via CSS.
        menu.classList.toggle('open');
    }

    // Apply click event listener to the menu open and close toggle elements.
    [].forEach.call(document.getElementsByClassName('menu-toggle'), function (element) {
        element.addEventListener('click', toggleMenu, false);
    });

    /**
     * All iframes in the DOM.
     * @type {NodeList}
     */
    var iframes = document.getElementsByTagName('iframe');

    // Only continue if we have at least one iframe. We are not setting the src attribute of the iframes to avoid
    // blocking of the main render thread of the page.
    if (iframes) {
        [].forEach.call(iframes, function (element) {
            element.src = element.dataset.src;
        });
    }

    /**
     * The gallery wrapper element.
     * @type {HTMLElement}
     */
    var gallery = document.getElementById('gallery');

    // Only continue if we have a gallery wrapper element and fullscreen API support.
    if (gallery && (document.fullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitFullscreenEnabled || document.webkitFullScreenEnabled)) {
        /**
         * Hash containing all full-screen elements.
         * @type {Object}
         */
        var fullScreenElements = {};

        /**
         * Request full-screen for the given target of the anchor.
         * @param {HTMLElement} element - The source `.media-element` anchor.
         */
        var requestFullscreen = function (element) {
            /**
             * The element to display in full-screen.
             * @type {null|HTMLElement}
             */
            var fullScreenElement = null;

            // Use cached element if available.
            if (element.dataset.id in fullScreenElements) {
                fullScreenElement = fullScreenElements[element.dataset.id];
            } else {
                // Create the image from the anchor's target.
                var fullScreenImage = new Image();
                fullScreenImage.alt = '';
                fullScreenImage.src = element.href;

                // Create a wrapping element for hiding the element in the default DOM.
                fullScreenElement = document.createElement('div');
                fullScreenElement.id = element.dataset.id;
                fullScreenElement.className = 'sr-only';
                fullScreenElement.appendChild(fullScreenImage);

                // Add the element to the caching hash ...
                fullScreenElements[element.dataset.id] = fullScreenElement;

                // ... as well as to the DOM for displaying.
                document.body.appendChild(fullScreenElement);
            }

            // Not pretty, but necessary, request full-screen display of the image.
            // Standard (Opera Presto only as of now).
            if (fullScreenElement.requestFullscreen) {
                fullScreenElement.requestFullscreen();
            }
            // Firefox (note the upper-case s).
            else if (fullScreenElement.mozRequestFullScreen) {
                fullScreenElement.mozRequestFullScreen();
            }
            // Microsoft.
            else if (fullScreenElement.msRequestFullscreen) {
                fullScreenElement.msRequestFullscreen();
            }
            // Chrome and Opera (Blink).
            else if (fullScreenElement.webkitRequestFullscreen) {
                fullScreenElement.webkitRequestFullscreen();
            }
            // Safari and Chrome (WebKit).
            else if (fullScreenElement.webkitRequestFullScreen) {
                fullScreenElement.webkitRequestFullScreen();
            }
        };

        // Apply click handler to the gallery wrapper and use event delegation to trigger displaying of images in full-
        // screen.
        gallery.addEventListener('click', function (event) {
            var mediaElement = event.target;
            while (mediaElement.tagName !== 'A') {
                mediaElement = mediaElement.parentNode;
            }
            if (mediaElement.classList.contains('media-element')) {
                event.preventDefault();
                requestFullscreen(mediaElement);
            }
        }, false);
    }

})(window, window.document);
