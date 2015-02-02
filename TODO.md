# TODO
* Next/previous for gallery images.
* Work in Progress (WIP) badge.
* Test with mobile devices.
* Test with Apple devices.
* Prepare animated GIFs in all sizes, resizing destroys animation:
    * 300
    * 450
    * 600
    * 900
    * 1200
    * 1800
* [Facebook URL Debugger](https://developers.facebook.com/tools/debug/)
* Write a wrapper module for FrontMatter and EJS which has a hook, or extend gulp-front-matter with such a hook.
* gulp-cache is disabled during builds because the following error is emitted:
```
Possibly unhandled Error: No path specified! Can not get relative.
    at File.Object.defineProperty.get (d:\Projects\melaniegruber.de\www\node_modules\gulp\node_modules\vinyl-fs\node_modules\vinyl\index.js:153:27)
    at DestroyableTransform.saveFile [as _transform] (d:\Projects\melaniegruber.de\www\node_modules\gulp\node_modules\vinyl-fs\lib\dest\index.js:36:48)
    at DestroyableTransform.Transform._read (d:\Projects\melaniegruber.de\www\node_modules\gulp\node_modules\vinyl-fs\node_modules\through2\node_modules\readable-stream\lib\_stream_transform.js:184:10)
    at DestroyableTransform.Transform._write (d:\Projects\melaniegruber.de\www\node_modules\gulp\node_modules\vinyl-fs\node_modules\through2\node_modules\readable-stream\lib\_stream_transform.js:172:12)
    at doWrite (d:\Projects\melaniegruber.de\www\node_modules\gulp\node_modules\vinyl-fs\node_modules\through2\node_modules\readable-stream\lib\_stream_writable.js:237:10)
    at writeOrBuffer (d:\Projects\melaniegruber.de\www\node_modules\gulp\node_modules\vinyl-fs\node_modules\through2\node_modules\readable-stream\lib\_stream_writable.js:227:5)
    at DestroyableTransform.Writable.write (d:\Projects\melaniegruber.de\www\node_modules\gulp\node_modules\vinyl-fs\node_modules\through2\node_modules\readable-stream\lib\_stream_writable.js:194:11)
    at Stream.ondata (stream.js:51:26)
    at Stream.emit (events.js:95:17)
    at queueData (d:\Projects\melaniegruber.de\www\node_modules\gulp-cache\node_modules\map-stream\index.js:43:21)
    at next (d:\Projects\melaniegruber.de\www\node_modules\gulp-cache\node_modules\map-stream\index.js:71:7)
    at d:\Projects\melaniegruber.de\www\node_modules\gulp-cache\node_modules\map-stream\index.js:85:7
    at d:\Projects\melaniegruber.de\www\node_modules\gulp-cache\index.js:85:13
    at tryCatcher (d:\Projects\melaniegruber.de\www\node_modules\gulp-cache\node_modules\bluebird\js\main\util.js:24:31)
    at Promise._settlePromiseFromHandler (d:\Projects\melaniegruber.de\www\node_modules\gulp-cache\node_modules\bluebird\js\main\promise.js:475:31)
    at Promise._settlePromiseAt (d:\Projects\melaniegruber.de\www\node_modules\gulp-cache\node_modules\bluebird\js\main\promise.js:554:18)
```
