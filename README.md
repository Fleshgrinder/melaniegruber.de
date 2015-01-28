# melaniegruber.de
Static portfolio website of my girlfriend Melanie.

## Install
Note that steps 2. and 3. are not necessary but recommended.

1. Install latest [Node.js](https://nodejs.org/).
2. Install [Python v2.7.3](http://www.python.org/download/releases/2.7.3#download) for [node-gyp](https://github.com/TooTallNate/node-gyp).
3. Install [Microsoft Visual Studio C++ 2012/13 Express](http://go.microsoft.com/?linkid=9816758) for node-gyp.
4. Install [ImageMagick](http://www.imagemagick.org/script/binary-releases.php) for image resizing (ensure that it is
   added to your `PATH`).
5. Create a `config.json` file containing (S)FTP credentials, have a look at `config.dist.json` for examples.

## Usage
### Creating a Project
Details of the various components a project is made of are explained in subsequent sections, this is a fast overview of
the actions which are necessary to create a new project:

1. Check out the repository to your local computer.
2. Create the new project's markdown file in `/src/projects/%project-name%.md`.
    * *NOTE:* The `%project-name%` is the actual name of the project with special characters removed and spaces replaced
      with dashes. This means in effect that `My Awesome Project’s Name` translates to `/src/projects/my-awesome-projects-name.md`.
3. Enter the meta information and project text in the file, according to the available features (see subsequent sections).
4. Create a new directory for the project's images: `/src/images/%project-name%`
5. Create the project's tile image for the index page at `/src/images/%project-name%/tile.jpg`.
6. Create a gallery `/src/images/%project-name%/gallery` and/or screenshots `/src/images/%project-name%/screenshots`.
7. Execute the deploy script for your platform.

If you have problems, ask Richard.

#### Meta Information
Each Markdown file supports various meta information—the projects support even more—which is explained in detail here.
The meta information is given in [YAML](http://www.yaml.org/) in the header of each Markdown file enclosed between three
dashes (`---`) like in the following example:

```markdown
---

meta: information

---

Markdown content of the file …
```

The following meta information is **required** in every Markdown file:

```yaml
title: The title of the web page.
```

The following meta information may be included in any Markdown file (note that many have default values):

```yaml
description: Short description of the page's content (defaults to "").
gallery:
    - A YAML list of gallery image names that should be displayed on the page (defaults to empty list and has no effect on the index page).
layout: The name of the layout that should be used for rendering (defaults to "default").
route: The route to the page that will be used in the URL (auto-generated based on filename).
subtitle: The subtitle of the page (defaults to "Melanie Gruber").
titleSeparator: The character that should be used to separate the title from the subtitle (defaults to " | ").
typeof: The schema.org type of the actual webpage (defaults to "WebPage" and for projects to "ItemPage").
```

The following meta information is only supported by projects and may be included:

```yaml
date: The date when the project was finished given as ISO 8601 date string (defaults to "").
programs:
   - A YAML list that contains all programs which where used to create the project (defaults to empty list).
screenshots:
   - A YAML list of screenshot image names that should be rendered on the project's page (defaults to empty list).
vimeo:
   - A YAML list of Vimeo IDs that should be rendered on the project's page (defaults to empty list).
work:
   - A YAML list of the work (jobs/responsibilities) done on the project (defaults to empty list).
```

##### Gallery and Screenshots
The gallery and screenshot images lists in the YAML parts are pretty powerful, which needs further explanation.

```yaml
title: Project Name
gallery:
    - My awesome gallery image
```

Will translate to the following path for the full-size image:

```
/src/images/project-name/gallery/my-awesome-gallery-image.jpg
```

Note that the image's name is always lowercase and that the casing of the name in the YAML part does not matter at all.
Special characters like apostrophes are simply dropped from the name, e.g.:

```yaml
title: Project’s Name
gallery:
    - My awesome gallery’s image
```

```
/src/images/projects-name/gallery/my-awesome-gallerys-image.jpg
```

The images are displayed in 16:9 and automatically cropped to their center if they don't fit the aspect ratio. It is
possible to overwrite this behavior for the displayed gallery or screenshot tile by creating another image with the very
same name with `-tile` appended. This image will be used for the tile instead of the automatically cropped tile.

```
/src/images/project-name/gallery/my-awesome-gallery-image.jpg
/src/images/project-name/gallery/my-awesome-gallery-image-tile.jpg
```

The first image is the full-size image—as always—the second image overwrites the automatically generated tile image.

##### Videos (Vimeo)
Currently only [Vimeo](https://vimeo.com) videos are supported. The list in the YAML configuration therefore contains
only Vimeo-Video-IDs (with an optional time index appended, see the [Vimeo FAQ for more details on this feature]
(http://vimeo.com/help/faq/sharing-videos/share-features#can-i-link-viewers-to-a-specific-part-of-my-video)).

```yaml
vimeo:
    - 01234
    - 56789#t=1m2s
```

##### Programs
The following is a list of supported program strings that might be used in the programs list of projects. Note that 
programs which are not listed here have no icon to display. Also note that the string must be exactly as written here 
(with the exception of the case) because otherwise the associated icon cannot be found.  

* Adobe Acrobat Pro
* Adobe After Effects
* Adobe Dreamweaver
* Adobe Flash Professional
* Adobe Illustrator
* Adobe InDesign
* Adobe Lightroom
* Adobe Muse
* Adobe Photoshop
* Adobe Premiere Pro
* Adobe SpeedGrade
* Autodesk 3ds Max
* Autodesk Maya
* Autodesk Mental Ray
* Autodesk Mudbox
* Unity
* V-Ray

### Deployment
[Software deployment](https://en.wikipedia.org/wiki/Software_deployment) refers to *making the software available* and 
is the final step to get everything online. Be sure that you followed the instructions in [Install](#install) and then 
double-click the `deploy.bat` file on Windows or execute the `deploy.sh` script on Unix systems.

## License
### Third-Party Content
> All third-party content (e.g. trademarks, logos) are the property of their respective owners.

The SVG social media icons are from the [Picons Social](https://picons.me/download-social.php) icon set.

### Media Files
> Copyright © 2014 Melanie Gruber, all rights reserved.

### Source Code
> This is free and unencumbered software released into the public domain.
> 
> For more information, please refer to <http://unlicense.org>
