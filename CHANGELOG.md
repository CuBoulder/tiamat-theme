# CU Boulder Drupal 9+ Base Theme

All notable changes to this project will be documented in this file.

Repo : [GitHub Repository](https://github.com/CuBoulder/tiamat-theme)

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- ### Article List Formatting Changes and Updates
  - Reduce size of thumbnail image to 100px by 100px
  - Normalize date format to (Mon. DD, YYYY)
  - Trim summary length
  - Adjust padding and spacing 
  - Adjust the Read more link to be uppercase 
  - Add divider to the bottom of each article as a border-bottom
  
  Closes #199 
---

- ### Fix for center-align images placed via CKEditor
  Images were left-aligned even when specified to be centered when placed from the media library via the CKEditor interface.  
  
  Captions are not being honored either, however this seems to be an issue with CKEditor 5 and the Drupal Media Library.  Should be fixed in a future version of Drupal : (see : https://www.drupal.org/project/drupal/issues/3246385 ) 
  
  Closes : #205 
---

- ### Advanced Style Options for Articles: Title Background Image
  Adds Advanced Styling options for Articles - including an optional Title Background Image, which replaces the default header with a full-width image holding the Article title. Also included is the ability to customize text color and a toggle to automatically add a light or dark overlay for better readability depending on your image.
  
  Resolves #154 
  
  Change Includes:
  - `tiamat-custom-entities` => issue/154
  - `tiamat-theme` => issue/154
---

- ### Publications Bundle
  Includes the following additions included in the Publication Bundle, resolves #168.
  
  ### New Content Types:
  - Issue: create an Issue consisting of selected Articles to user-defined sections. Each section has its own display options of how articles within it should display. Includes a body field and cover art.
  
  - Issue Archive: a gallery linking to created Issues, newest first.
  
  ### Updated Content Types:
  - Article - adds 'Appears in Issue' form selector to choose which Issue this Article appears in under the Article edit process. Will display this selected link to the Issue under Categories and Tags.
  
  ### New Block Types (Basic Page):
  - Current Issue block: this block displays the current issue cover art and links to the current Issue.
  - Latest Issue block: this block displays four of the latest issues and provides a link to to the Archives List page. You must have four or more issues for the archives link to appear on the block.
  - Category Cloud block: this block will display all category taxonomy terms. Each term is linked to its category list page. This is a nice block to use as a search block.
  - Tag Cloud block: this block will display all tag taxonomy terms. Each term is linked to its tag list page. This is a nice block to use as a search block.
  
  Notes for testing:
  - Must manually setup the url on the Issue Archive as `/issue/archive` for the Latest Issues Block to link.
  - Includes branches `issue/168` on `tiamat-custom-entities`
---

## [0.20230110] - 2023-01-10

## [0.20221109] - 2022-11-09

[Unreleased]: https://github.com/CuBoulder/tiamat-theme/compare/0.20230110...HEAD

[0.20230110]: https://github.com/CuBoulder/tiamat-theme/compare/0.20221109...0.20230110

[0.20221109]: https://github.com/CuBoulder/tiamat-theme/compare/fc8e434945affda25ee2d8cf5c7c659c3ff0b7f4...0.20221109
