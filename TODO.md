# TODO
* Keyboard `:focus` does not seem to work correctly anymore, investigate.
* Split SCSS into more components (CSSO merges all rules, keep things that belong together together while not worrying
  about duplicated rules or something).
* Share SCSS configuration with EJS.
* Recreate the ImageTaskRunner to resize from big to small, better quality, and optimize all images after it is finished
  with the resizing of them.
* Optimize full-screen images for various resolutions.
* Optimize critical rendering path by only showing the header and loading the missing CSSs via JavaScript.
* Ajaxify everything with nice animations between page loads and request simple JSON files instead of full HTML.
* Test with mobile devices, already tested:
    * ~~Firefox Mobile (Android)~~
    * ~~Google Chrome (Android)~~
* Test with Apple devices.
* See TODOs in source code!
* Write a wrapper module for FrontMatter and EJS which has a hook, or extend gulp-front-matter with such a hook.
* It is a shame that I ended up requiring inline styles for the full-size image gallery. There is definitely a way to
  solve it without the inline styles. Find it!
