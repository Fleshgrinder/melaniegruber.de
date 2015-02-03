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
(function (window, document, undefined) {
    'use strict';

    // Best solution until CSS4 media query hover support is available.
    if ('ontouchstart' in document.documentElement) {
        document.documentElement.classList.remove('hover');
        document.documentElement.classList.add('no-hover');
    }

    // The first header is always the page's header.
    var header = document.getElementsByClassName('header').item(0);

    // Capture focus events on all elements for compensation of the fixed header in case of keyboard focus.
    document.body.addEventListener('focus', function (event) {
        var headerStyles = window.getComputedStyle(header);

        // Only react if the element is not part of the header itself and the header needs to be fixed (of course).
        if (!header.contains(event.target) && headerStyles.position === 'fixed') {
            var targetStyles = window.getComputedStyle(event.target);

            // No need to do anything if the element itself is absolute or fixed.
            if (!targetStyles.position.match(/(absolute|fixed)/) && document.documentElement.scrollTop === event.target.offsetTop) {
                // We add another twenty pixel for some white space between the focused element and the header itself.
                document.documentElement.scrollTop -= parseInt(headerStyles.height) + 20;
            }
        }
    }, true);

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

        // Normalize request full-screen methods and properties if non-standard.
        if (!document.fullscreenEnabled) {
            var normalizeMap = [
                ['mozRequestFullScreen', 'mozCancelFullScreen', 'mozFullScreenElement'],
                ['msRequestFullscreen', 'msExitFullscreen', 'msFullscreenElement'],
                ['webkitRequestFullscreen', 'webkitExitFullscreen', 'webkitFullscreenElement'],
                ['webkitRequestFullScreen', 'webkitCancelFullScreen', 'webkitCurrentFullScreenElement']
            ];

            for (var i = 0; i < normalizeMap.length; ++i) {
                // It is sufficient to check for the request method.
                if (normalizeMap[i][0] in Element.prototype) {
                    // We can simply store references to the other methods.
                    Element.prototype.requestFullscreen = Element.prototype[normalizeMap[i][0]];
                    Document.prototype.exitFullscreen   = Document.prototype[normalizeMap[i][1]];

                    // A property is of course quite different, but we can easily define a new one.
                    Object.defineProperties(document, {
                        fullscreenElement: {
                            enumerable: true,
                            get: function () {
                                return document[normalizeMap[i][2]];
                            }
                        }
                    });

                    // Break out of the loop and we're done normalizing.
                    break;
                }
            }
        }

        document.getElementById('full-screen-close').addEventListener('click', function (event) {
            event.preventDefault();
            document.exitFullscreen();
        }, false);

        /**
         * The HTML element which wraps the full-screen content.
         * @type {HTMLElement}
         */
        var fullScreenElement = document.getElementById('full-screen');

        /**
         * The anchor to move to the previous full-screen image.
         * @type {*}
         */
        var fullScreenPrevious = document.getElementById('full-screen-previous');

        /**
         * The position of the current full-screen image within all images.
         * @type {HTMLElement}
         */
        var fullScreenCurrent = document.getElementById('full-screen-current');

        /**
         * The total amount of available full-screen images.
         * @type {*}
         */
        var fullScreenTotal = document.getElementById('full-screen-total');
        if (fullScreenTotal) {
            fullScreenTotal = parseInt(fullScreenTotal.innerHTML);
        }

        /**
         * The anchor to move to the next full-screen image.
         * @type {*}
         */
        var fullScreenNext = document.getElementById('full-screen-next');

        /**
         * Update the full-screen navigation.
         * @type {Function}
         * @param {Number} index - The current full-screen image's index.
         * @return {Number} The index.
         */
        var fullScreenUpdateNavigation = function (index) {
            fullScreenCurrent.innerHTML = index + 1;

            if ((fullScreenPrevious = index - 1) < 0) {
                fullScreenPrevious = fullScreenTotal - 1;
            }

            if ((fullScreenNext = index + 1) >= fullScreenTotal) {
                fullScreenNext = 0;
            }

            return index;
        };

        /**
         * Array containing all full-screen images.
         * @type {HTMLElement[]}
         */
        var fullScreenImages = [];

        /**
         * The full-screen image.
         *
         * Note that this is actually a div element with a background image inline style. This is because we have to
         * make sure that the image retains its aspect ratio.
         *
         * @type {HTMLElement}
         */
        var fullScreenImage;

        /**
         * The next full-screen image
         *
         * Used if we are already in full-screen and need to handle both (the current and the next) at the same time.
         * Note that this variable has three different states which have different meanings:
         *
         * 1. The variable is `undefined`: **no** navigation and **no** transition is in progress.
         * 2. The variable is `null`: **no** navigation in progress, but waiting for transition to complete.
         * 3. The variable contains the next image: Navigation and/or transition in progress.
         *
         * Using three states allows us to block user input during navigation and transitions effectively. This means in
         * effect that a user can even stay on a key and advance through the whole gallery in no time without any
         * glitches or broken transitions.
         *
         * @type {HTMLElement|null|undefined}
         */
        var fullScreenImageNext;

        /**
         * Hides the full-screen image by adding the hidden class and removing the loaded class.
         * @type {Function}
         * @return {HTMLElement}
         */
        var fullScreenImageHide = function () {
            this.classList.add('hidden');
            this.classList.remove('loaded');

            return this;
        };

        /**
         * Shows the full-screen image by removing the hidden class and adding the loaded class.
         * @type {Function}
         * @return {HTMLElement}
         */
        var fullScreenImageShow = function () {
            this.classList.remove('hidden');

            // The small timeout is necessary for the CSS transition; IE11 seems to require 20 ms.
            window.setTimeout(this.classList.add.bind(this.classList, 'loaded'), 20);

            return this;
        };

        /**
         * Applies the loaded class to the full-screen image.
         * @type {Function}
         * @return {HTMLElement}
         */
        var fullScreenImageOnLoad = function () {
            this.wrapper.style.backgroundImage = 'url(' + this.src + ')';

            if (this.wrapper !== fullScreenImageNext) {
                this.wrapper.classList.add('loaded');
            }

            return this.wrapper;
        };

        /**
         * Create new full-screen image.
         * @param {HTMLAnchorElement} mediaElement - The image's anchor.
         * @return {HTMLElement} The newly created image.
         */
        var fullScreenImageCreate = function (mediaElement) {
            var image    = new Image();
            image.onload = fullScreenImageOnLoad;

            var fullScreenImage             = document.createElement('div');
            fullScreenImage.className       = 'full-screen-image';
            fullScreenImage.onload          = fullScreenImageOnLoad;
            fullScreenImage.hide            = fullScreenImageHide;
            fullScreenImage.show            = fullScreenImageShow;
            fullScreenImage.style.maxWidth  = mediaElement.dataset.width + 'px';
            fullScreenImage.style.maxHeight = mediaElement.dataset.height + 'px';

            image.wrapper = fullScreenImage;
            image.src     = mediaElement.href;

            // Cache and return the newly created image.
            fullScreenImages[mediaElement.dataset.index] = fullScreenImage;

            return fullScreenImage;
        };

        /**
         * Go to arbitrary index when full-screen is already enabled.
         * @type {Function}
         * @param {Number} index - The index to advance to.
         * @return {undefined}
         */
        var fullScreenImageAdvance = function (index) {
            // Ignore repeated requests to advance if we are still advancing, note that NULL means we are waiting for
            // the loaded transition to end.
            if (fullScreenImageNext !== undefined) {
                return;
            }

            if (index in fullScreenImages) {
                fullScreenImageNext = fullScreenImages[index];
            } else {
                fullScreenImageNext = fullScreenImageCreate(document.getElementById('media-element-' + index));
            }

            fullScreenUpdateNavigation(index);
            fullScreenImage.classList.remove('loaded');
        };

        if (fullScreenPrevious && fullScreenNext) {
            fullScreenPrevious.addEventListener('click', function (event) {
                event.preventDefault();
                fullScreenImageAdvance(fullScreenPrevious);
            }, false);

            fullScreenNext.addEventListener('click', function (event) {
                event.preventDefault();
                fullScreenImageAdvance(fullScreenNext);
            }, false);

            window.addEventListener('keydown', function (event) {
                // Make sure that we are actually in full-screen mode and not currently advancing.
                if (document.fullscreenElement !== null) {
                    // Arrow Key Left
                    if (event.keyCode === 37) {
                        fullScreenImageAdvance(fullScreenPrevious);
                    }
                    // Arrow Key Right
                    else if (event.keyCode === 39) {
                        fullScreenImageAdvance(fullScreenNext);
                    }
                }
            });
        }

        /**
         * Observer for transition end event.
         * @return {undefined}
         */
        var fullScreenImageTransitionEnd = function () {
            // NULL means that we already exchanged the full-screen image but wait for its fade-in transition to
            // complete. We need to exchange the NULL with UNDEFINED since we just received the transition end event for
            // the fade-in transition. This releases the lock which prevents additional advances (either via click or
            // keys).
            if (fullScreenImageNext === null) {
                fullScreenImageNext = undefined;
            }
            // Only continue if we actually have a next full-screen (not NULL and not UNDEFINED) which we can show.
            else if (fullScreenImageNext) {
                fullScreenImage.hide();

                fullScreenImage = fullScreenImageNext;
                fullScreenImageNext = null;

                while (!fullScreenImage.style.backgroundImage) {
                    // Block while the image is not loaded; the image might already be loaded, since we started to load
                    // it right away or it was already part of the DOM.
                }

                fullScreenElement.appendChild(fullScreenImage);
                fullScreenImage.show();
            }
        };

        // We want to support older Webkit browsers as well, we can ignore other event types for this.
        fullScreenElement.addEventListener('transitionend', fullScreenImageTransitionEnd, false);
        fullScreenElement.addEventListener('webkitTransitionEnd', fullScreenImageTransitionEnd, false);

        // Apply click handler to the gallery wrapper and use event delegation to trigger displaying of images in full-
        // screen.
        gallery.addEventListener('click', function (event) {
            var mediaElement = event.target;

            // The event's actual source might be nested several times until the desired anchor containing the desired
            // data is found. We really do not know, since it depends on the image's type (e.g. SVG vs. JPG).
            while (mediaElement.tagName !== 'A') {
                if (!(mediaElement = mediaElement.parentNode)) {
                    return; // Bail if no parent node exists.
                }
            }

            // Only continue if the anchor we found actually is a media-element.
            if (mediaElement.classList.contains('media-element')) {
                event.preventDefault();

                // Reuse the existing image in the DOM.
                if (mediaElement.dataset.index in fullScreenImages) {
                    // Just display the desired image if everything is already full prepared.
                    if (fullScreenImage === fullScreenImages[mediaElement.dataset.index]) {
                        fullScreenElement.requestFullscreen();
                        return;
                    }

                    // This is the previous full-screen image which we want to hide. No need for an if at this point
                    // because we must have a previous image if we have already cached something.
                    fullScreenImage.hide();

                    // Get the desired image from the storage and show it to the user.
                    fullScreenImage = fullScreenImages[mediaElement.dataset.index];
                    fullScreenImage.show();
                } else {
                    // This is the previous full-screen image which we want to hide.
                    if (fullScreenImage) {
                        fullScreenImage.hide();
                    }

                    // Export the returned image to the current scope.
                    fullScreenImage = fullScreenImageCreate(mediaElement);
                    fullScreenElement.appendChild(fullScreenImage);
                }

                fullScreenUpdateNavigation(parseInt(mediaElement.dataset.index));
                fullScreenElement.requestFullscreen();
            }
        }, false);
    }

})(window, window.document);
