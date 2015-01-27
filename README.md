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
> TODO: Explain steps for creating a new project after system is finalized.

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
vimeo:
   - A YAML list of Vimeo URLs that should be rendered on the project's page (defaults to empty list).
work:
   - A YAML list of the work (jobs/responsibilities) done on the project (defaults to empty list).
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
