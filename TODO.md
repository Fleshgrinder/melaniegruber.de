# TODO
* Keyboard `:focus` does not seem to work correctly anymore (correction of scroll top value), investigate.
* Only display the logo and load CSS via JavaScript, once the whole page has loaded, fade in the content. This fixes the
  _render blocking_ warning from Google PageSpeed Insights.
* Split SCSS into more components (CSSO merges all rules, keep things that belong together together while not worrying
  about duplicated rules or something).
* Recreate the ImageTaskRunner to resize from big to small, better quality, and optimize all images after it is finished
  with the resizing of them.
* Optimize full-screen images for various resolutions. Listen to the _load_ event of the picture element and let the
  browser choose the right image for the device.
* Use position fixed to create the full-screen view of the images if the _fullscreen API_ is not available.
* Ajaxify everything with nice animations between page loads and request simple JSON files instead of full HTML.
* It is a shame that I ended up requiring inline styles for the full-size image gallery. There is definitely a way to
  solve it without the inline styles. Find it!
* Find a better solution for the slide-in menu on mobile devices. Google PageSpeed Insights thinks that there is
  visible content outside of the viewport. Which is actually true, but the effect we want.

* Remove the second image tags within the picture elements as soon as the support for the sizes attribute is widely
  available across browsers. This may take years, so this TODO item is here to stay.
