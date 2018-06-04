# Open FIRST Resources
This is the build repository for [openfirstresources.org](https://www.openfirstresources.org). It includes the `core` bundle.

## Building the Site
To build the site you will need to have NPM installed. You can run a production build using `npm run build` or start a continuous development build and server by running `npm start`.

## Build Process

| Build Step | Description |
| --- | --- |
| Initialize Metadata | Load Metalsmith metadata from `config.yml` (which should contain `bundles`, `productionBaseURL`, and `developmentBaseURL`). Also, set `metadata.devBuild` and `metadata.baseURL` depending on whether this is a development build. |
| Validate Bundles | Remove any files that are not part of a bundles specified in `metadata.bundles` and exit if no files belong to a specified bundle. |
| Metafiles | Using `metalsmith-metafiles`, put any data specified in `<path>.meta.yml` files into corresponding `<path>` files and delete the `<path>.meta.yml` files. If a corresponding `<path>` file for a `<path>.meta.yml` file does not exist, error. |
| Override Files | Iterate through the files in bundle order. If the file specifes a `override` key with a path that is within a bundle that has already been iterated through or is the current bundle, set `files[path]` to the file with an additional `overrideOriginalPath` value and an `overriden` array containing the overriden versions of the files in most original-first (lastest to be overriden-last) order. If the file specifes a `override` key with a path that is within a bundle that is yet to be iterated through, or is not specified, error.
| Clean Types | If set, downcase every file's `type`. If `type` is set but not included in the list below, error. If `type` is unset, set to `undefined`. |
| Set Output Paths | `contentOutputPath`, `pageOutputPath`, and `pageURLPath` are set for every file based on the table below. |
| Index Terms | Iterate through files with `type` set to `term` in bundle order. Create a `metadata.terms` object containing an entry for the downcased `termName` attribute if set and entries for every downcased string contained in `termAliases` if set all of which point to the file's path. If both `termName` and `termAliases` are unset, warn to console. If `metadata.terms.<term>` is overriden, log to console and suggest overriding files instead.
| Render | Render files, potentially with nunjucks, based on the table below. |

## Supported Resource Types

| Name | Resource Type | Description | Build Details |
| --- | --- | --- | --- |
| Undefined | `undefined` | This is the type given to any file that does not specify a type. | `pageOutputPath` and `pageURLPath` are unset if set. If unset, `contentOutputPath` is set to source path (after overrides). File contents are rendered to `contentOutputPath` without modification unless `noOutput` evaluates to `true`. |
| Page | `page` | A simple, static page on the site. Not recommended for pretty much anything except some stuff in the `core` bundle. | `contentOutputPath` is unset if set. If unset, `pageURLPath` is set to the file's path with the last file extension removed (if there is one to remove). If unset, `pageOutputPath` is set to `pageURLPath` followed by `.html`. The contents are rendered with nunjucks to `pageOutputPath`. |
| Index | `index` | An ordered navigation page to access other resources. | `contentOutputPath` is unset if set. If unset, `pageURLPath` is set to the file's path with the last file extension removed (if there is one to remove). If unset, `pageOutputPath` is set to `pageURLPath` followed by `.html`. The contents are rendered with nunjucks to `pageOutputPath`. |
| Document | `document` | A page of hierarchically organized content sections. | `contentOutputPath` is unset if set. If unset, `pageURLPath` is set to the file's path with the last file extension removed (if there is one to remove). If unset, `pageOutputPath` is set to `pageURLPath` followed by `.html`. The contents are rendered with nunjucks to `pageOutputPath`. |
| Term | `term` | Jargon. Description page can be linked to from other content (with a tooltip) easily. | `contentOutputPath` is unset if set. If unset, `pageURLPath` is set to the file's path with the last file extension removed (if there is one to remove). If unset, `pageOutputPath` is set to `pageURLPath` followed by `.html`. The contents are rendered with nunjucks to `pageOutputPath`. |
| Image | `image` | An image, with an accompanying page to display it and give information about it. | If unset, `contentOutputPath` is set to the file's path. If unset, `pageURLPath` is set to the file's path with the last file extension removed (if there is one to remove). If unset, `pageOutputPath` is set to `pageURLPath` followed by `.html`. File contents are rendered to `contentOutputPath` without modification and `core/image.njk` is rendered to `pageOutputPath`. |
| Video | `video` | A video, with an accompanying page to display it and give information about it. | If unset, `contentOutputPath` is set to the file's path. If unset, `pageURLPath` is set to the file's path with the last file extension removed (if there is one to remove). If unset, `pageOutputPath` is set to `pageURLPath` followed by `.html`. File contents are rendered to `contentOutputPath` without modification and `core/video.njk` is rendered to `pageOutputPath`. |
