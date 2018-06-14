---
title: Build Process
type: document
description: An overview of the steps that the Open FIRST Resources uses to convert content files into a site.
termName: metalsmith
sections:
- intro:
    title: Introduction
    subsections:
    - subsection:
        title: Subsection!
        fromFile: open-first-resources/build_system/test.md
        sectionAlias: synopsis
- file_types:
    title: Types of Files
- bundles:
    title: Bundles
- data:
    title: Data and Metadata
- build_types:
    title: Types of OFR Builds
- build_steps:
    title: Build Steps Overview
- resource_types:
    title: Types of OFR Resources
---
{% set intro %}
The build system for the Open FIRST Resources fundamentally just converts a folder full of files (mostly Markdown files) into another folder full of files (mostly HTML), but the process by which it does that can get a little complicated. OFR's build system is written in javascript and is entirely orchestrated by Metalsmith, an open source static site generator. The build process consists of Metalsmith reading in the source files, running a number of (mostly custom) plugins that interact with the build files and Metalsmith's metadata, and then Metalsmith saving the resulting files. First, some background about the build process, followed by an overview of each build step and a list of supported resource types.
{% endset %}

{% set subsection %}
Some sub content!
{% endset %}

{% set file_types %}
As alluded to above, we differentiate between three different types of files—source files, build files, and output files:

| Type| Folder | Description |
| --- | --- | --- |
| Source Files | `bundles/` | Source files are actual files in the file system, organized into 'bundles' of resources. This includes files in the `core` and `open-first-resources` bundles and any other files included thorugh other bundles. These files must be within a bundle's folder. |
| Build Files | n/a | Build files are the 'files' used within Metalsmith and its plugins. Build files are stored within a `files` javascript object, with the file's 'path' as keys that point to other objects that contain information about the file. What build files exist, what properties they have, and the values of their properties change throughout the build process, but, generally, they contain a `contents` property and any properties specified in a source file's frontmatter or metafile. All build files are forced to have paths under a bundle folder after the `Validate Bundles` build step up until the `Render Files` build step. |
| Output Files | `build/` | Metalsmith saves the contents of the build files after the `Render Files` build step, creating output files; they are real files in the file system and generally get served by either a local server (development builds), Github Pages (an option for teams that don't want to set up Netlify), or Netlify (what [the site](https://www.openfirstresources.org) is currently using). |
{% endset %}

{% set bundles %}
_Bundles_ are the fundamental unit of content for OFR. Any folder (that contains files) within the `bundles` folder of an OFR build project is considered a bundle, though it also needs to be specified in the build project's `config.yml`. The `bundles` property within `config.yml` specifies an order that bundles should be processed in, allowing for bundles to interact with each other in a defined sequence. The OFR build project currently includes two bundles: `core`, which contains nunjucks templates, static files, and some pages, and `open-first-resources`, which includes resources on OFR itself.
{% endset %}

{% set data %}
Data and metadata needs to be secified throughout OFR and it is consistently done using YAML, a "human friendly data serialization standard". `config.yml` contains some initial configuration values for the build process, frontmatter (sections at the top of source files enclosed by `---`s) specifies metadata for source files, and metafiles (source files ending in `.meta.yml`) are an alternative to frontmatter, mostly for binary files (like images).
{% endset %}

{% set build_types %}
The two types of OFR builds are `production` and `development` builds. These builds are started by calling the `build` function in `build.js` with either `false` or `true` respectively. They can also be started from the command line with `npm run build` or `npm start` respectively. Production builds simply process source files into output files whereas development builds also start a local server, watch the source files for changes causing a site rebuild, and inject `LiveReload` scripts into output files, causing the page to be reloaded if the site is rebuilt. The two kinds of builds also use a different base URL (specified in `config.yml`) for links, corresponding to whether they are accessible online (e.g. `https://openfirstresources.org/`) or locally (e.g. `http://localhost:8080/`).
{% endset %}

{% set build_steps %}
This is a chronological list of the steps preformed after metalsmith reads in source files and before it generates output files. Each step directly corresponds to a plugin added to Metalsmith in `build.js`.

| Build Step | Description |
| --- | --- |
| Normalize Paths | Replace any `\`s in file paths to be `/`s. |
| Initialize Metadata | Load Metalsmith metadata from `config.yml` (which should contain `bundles`, `productionBaseURL`, and `developmentBaseURL`). Also, set `metadata.devBuild` and `metadata.baseURL` depending on whether this is a development build. |
| Validate Bundles | Remove any files that are not part of a bundles specified in `metadata.bundles` and exit if no files belong to a specified bundle. |
| Apply Metafiles | Put any data specified in `<path>.meta.yml` files into corresponding `<path>` files and delete the `<path>.meta.yml` files. If a corresponding `<path>` file for a `<path>.meta.yml` file does not exist, error. |
| Override Files | Iterate through the files in bundle order. If the file specifes a `override` key with a path that is within a bundle that has already been iterated through or is the current bundle, set `files[path]` to the file with an additional `overrideOriginalPath` value and an `overriden` array containing the overriden versions of the files in most original-first (lastest to be overriden-last) order. If the file specifes a `override` key with a path that is within a bundle that is yet to be iterated through, or is not specified, error.
| Clean Types | If set, downcase every file's `type`. If `type` is set but not included in the list below, error. If `type` is unset, set to `undefined`. |
| Set Output Paths | `contentOutputPath`, `pageOutputPath`, and `pageURLPath` are set for every file based on the table below. |
| Index Terms | Iterate through files with `type` set to `term` in bundle order. Create a `metadata.terms` object containing an entry for the downcased `termName` attribute if set and entries for every downcased string contained in `termAliases` if set all of which point to the file's path. If both `termName` and `termAliases` are unset, warn to console. If `metadata.terms.<term>` is overriden, log to console and suggest overriding files instead.
| Render | Render a template for the file, potentially with nunjucks, based on the table below. |
{% endset %}

{% set resource_types %}
OFR only supports the following resource types:

| Name | Resource Type | Description | Build Details |
| --- | --- | --- | --- |
| Undefined | `undefined` | This is the type given to any file that does not specify a type. | `pageOutputPath` and `pageURLPath` are unset if set. If unset, `contentOutputPath` is set to source path (after overrides). File contents are rendered to `contentOutputPath` without modification unless `noOutput` evaluates to `true`. |
| Page | `page` | A simple, static page on the site. Not recommended for pretty much anything except some stuff in the `core` bundle. | `contentOutputPath` is unset if set. If unset, `pageURLPath` is set to the file's path with the last file extension removed (if there is one to remove). If unset, `pageOutputPath` is set to `pageURLPath` followed by `.html`. A nunjucks template will be rendered to `pageOutputPath` with the context of the file's data (e.g. frontmatter + `contents`) in a addition to `contentPath` being set to the file's path, `site.files` containing all of the metalsmith files, and `site.metadata` containing the metalsmith metadata. The template rendered will be `core/templates/page.njk` by default, the value contained in `template` if specified, or the file itself if `noExternalTemplate` is evaluates to `true`. |
| Index | `index` | An ordered navigation page to access other resources. | `contentOutputPath` is unset if set. If unset, `pageURLPath` is set to the file's path with the last file extension removed (if there is one to remove). If unset, `pageOutputPath` is set to `pageURLPath` followed by `.html`. A nunjucks template will be rendered to `pageOutputPath` with the context of the file's data (e.g. frontmatter + `contents`) in a addition to `contentPath` being set to the file's path, `site.files` containing all of the metalsmith files, and `site.metadata` containing the metalsmith metadata. The template rendered will be `core/templates/index.njk` by default, the value contained in `template` if specified, or the file itself if `noExternalTemplate` is evaluates to `true`. |
| Document | `document` | A page of hierarchically organized content sections. | `contentOutputPath` is unset if set. If unset, `pageURLPath` is set to the file's path with the last file extension removed (if there is one to remove). If unset, `pageOutputPath` is set to `pageURLPath` followed by `.html`. A nunjucks template will be rendered to `pageOutputPath` with the context of the file's data (e.g. frontmatter + `contents`) in a addition to `contentPath` being set to the file's path, `site.files` containing all of the metalsmith files, and `site.metadata` containing the metalsmith metadata. The template rendered will be `core/templates/document.njk` by default, the value contained in `template` if specified, or the file itself if `noExternalTemplate` is evaluates to `true`. |
| Term | `term` | Jargon. Description page can be linked to from other content (with a tooltip) easily. | `contentOutputPath` is unset if set. If unset, `pageURLPath` is set to the file's path with the last file extension removed (if there is one to remove). If unset, `pageOutputPath` is set to `pageURLPath` followed by `.html`. A nunjucks template will be rendered to `pageOutputPath` with the context of the file's data (e.g. frontmatter + `contents`) in a addition to `contentPath` being set to the file's path, `site.files` containing all of the metalsmith files, and `site.metadata` containing the metalsmith metadata. The template rendered will be `core/templates/term.njk` by default, the value contained in `template` if specified, or the file itself if `noExternalTemplate` is evaluates to `true`. |
| Image | `image` | An image, with an accompanying page to display it and give information about it. | If unset, `contentOutputPath` is set to the file's path. If unset, `pageURLPath` is set to the file's path with the last file extension removed (if there is one to remove). If unset, `pageOutputPath` is set to `pageURLPath` followed by `.html`. File contents are rendered to `contentOutputPath` without modification. A nunjucks template will be rendered to `pageOutputPath` with the context of the file's data (e.g. frontmatter + `contents`) in a addition to `contentPath` being set to the file's path, `site.files` containing all of the metalsmith files, and `site.metadata` containing the metalsmith metadata. The template rendered will be `core/templates/image.njk` by default, the value contained in `template` if specified, or the file itself if `noExternalTemplate` is evaluates to `true`. |
| Video | `video` | A video, with an accompanying page to display it and give information about it. | If unset, `contentOutputPath` is set to the file's path. If unset, `pageURLPath` is set to the file's path with the last file extension removed (if there is one to remove). If unset, `pageOutputPath` is set to `pageURLPath` followed by `.html`. File contents are rendered to `contentOutputPath` without modification. A nunjucks template will be rendered to `pageOutputPath` with the context of the file's data (e.g. frontmatter + `contents`) in a addition to `path` being set to the file's path, `site.files` containing all of the metalsmith files, and `site.metadata` containing the metalsmith metadata. The template rendered will be `core/templates/video.njk` by default, the value contained in `template` if specified, or the file itself if `noExternalTemplate` is evaluates to `true`. |
{% endset %}