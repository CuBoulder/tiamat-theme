# CU Boulder Drupal 9+ Base Theme

All notable changes to this project will be documented in this file.

Repo : [GitHub Repository](https://github.com/CuBoulder/tiamat-theme)

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- ### Adds default Person image for People List Page grid renders, if no Person Image provided
  Resolves #278 -- Will use a default Person image in Grid-style renders of the People List page, if no image is provided on an included Person page.
  
  Includes:
  `tiamat-theme` => `change/278`
---

- ### Removes the ability to turn off "Restrict choices to those selected" in People List
  The option is no longer present when creating or editing a People List page.
  
  Resolves CuBoulder/tiamat-theme#281
  
  Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/40)
---

- ### Newsletter Refactor
  Partially resolves #222 - Enhances the Newsletter for more consistency with final email html generation via Twig templating engine instead of JavaScript. Should resolve issues with inconsistent displays and partial/error renders from unexpected user inputs.
  
  TO DO - Will address `Newsletter Type` taxonomy and Theme selection in #273 
  
  ### New Workflow for Newsletters
  
  1.  After creating your Newsletter, go to `Edit -> Preview`. 
  2.  In the top dropdown menu to select your View Mode, select `Email HTML` as your View Mode. The page will now render the Email HTML version.
  3.  Scroll to the bottom of your Email View Mode Preview for a button to automatically copy your html code to the clipboard ready to paste, as well as populate a text field with your email html.
  4. You can now paste into your email client / Salesforce client and send.
  
  
  Includes:
  - `tiamat-theme` => issue/222
  - `tiamat-custom-entities` => issue/222
---

- ### Adds sticky menu
  This update adds an optional "sticky menu" component to all pages on a site, enabled by visiting CU Boulder site settings → Appearance and toggling on _Show sticky menu_. The menu appears automatically when a user scrolls down passed the main website header, and only on large screen devices (at least 960 pixels wide).
  
  Resolves CuBoulder/tiamat-theme#247
  
  Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/20)
---

## [20230307] - 2023-03-07

-   ### Updated people list formatting
    Adds better formatting to  person list.
    Closes #219 

* * *

-   ### Adds "Advanced" appearance settings and custom site logos; modifies contact info settings

    This update:

    -   Adds an _Advanced_ view at the bottom of the _Appearance_ settings, collapsed by default and visible only to those with the _Edit advanced site settings_ permission.
    -   Moves all theme settings previously restricted to Drupal's default theme settings into the _Advanced_ view.
    -   Adds site-specific custom logos (resolves CuBoulder/tiamat-theme#264) and places the settings for custom logos into the _Advanced_ view:
        -   Custom logo requires _white text on dark header_ and _dark text on white header_ variants.
        -   An image can be uploaded or a path can be manually specified for each.
        -   ~~A scale can be specified, which defaults to _2x_ (Retina) but also allows _1x_ (standard) or _3x_ (enhanced Retina)~~.
    -   Assigns the _Architect_ and _Developer_ user roles the _Edit advanced site settings_ permission.
    -   Replaces address fields with general field and WYSIWYG editor in site contact info; removes colons from site contact info footer (resolves CuBoulder/tiamat-theme#269)

    Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/19), [tiamat-profile](https://github.com/CuBoulder/tiamat-profile/pull/34)

* * *

-   ### Enables block type templates to work properly with blocks added using either Layout Builder or Block Layout
    Resolves CuBoulder/tiamat-theme#225

* * *

-   ### Hidden Terms: Categories and Tags recieve form option to toggle display for admin-only taxonomies

    Category and Tag taxonomies receive the form option for them to be hidden from public view, but the terms are still available for administration.

    -   Articles tagged with a private term can still be used to group those articles within Article Lists.
    -   Private terms are NOT used in the Related Articles block - private taxonomies do not affect an Articles 'related-ness' scores
    -   Private terms will not display in the Category/Tag link section on Articles

    Resolves #217 

    Change Includes:

    -   `tiamat-theme` => `issue/217`
    -   `tiamat-custom-entities` => `issue/217`

* * *

## [20230209] - 2023-02-09

-   ### Article List Formatting Changes and Updates

    -   Reduce size of thumbnail image to 100px by 100px
    -   Normalize date format to (Mon. DD, YYYY)
    -   Trim summary length
    -   Adjust padding and spacing 
    -   Adjust the Read more link to be uppercase 
    -   Add divider to the bottom of each article as a border-bottom

    Closes #199 

* * *

-   ### Fix for center-align images placed via CKEditor

    Images were left-aligned even when specified to be centered when placed from the media library via the CKEditor interface.  

    Captions are not being honored either, however this seems to be an issue with CKEditor 5 and the Drupal Media Library.  Should be fixed in a future version of Drupal : (see : <https://www.drupal.org/project/drupal/issues/3246385> ) 

    Closes : #205 

* * *

-   ### Advanced Style Options for Articles: Title Background Image

    Adds Advanced Styling options for Articles - including an optional Title Background Image, which replaces the default header with a full-width image holding the Article title. Also included is the ability to customize text color and a toggle to automatically add a light or dark overlay for better readability depending on your image.

    Resolves #154 

    Change Includes:

    -   `tiamat-custom-entities` => issue/154
    -   `tiamat-theme` => issue/154

* * *

-   ### Publications Bundle

    Includes the following additions included in the Publication Bundle, resolves #168.

    ### New Content Types:

    -   Issue: create an Issue consisting of selected Articles to user-defined sections. Each section has its own display options of how articles within it should display. Includes a body field and cover art.

    -   Issue Archive: a gallery linking to created Issues, newest first.

    ### Updated Content Types:

    -   Article - adds 'Appears in Issue' form selector to choose which Issue this Article appears in under the Article edit process. Will display this selected link to the Issue under Categories and Tags.

    ### New Block Types (Basic Page):

    -   Current Issue block: this block displays the current issue cover art and links to the current Issue.
    -   Latest Issue block: this block displays four of the latest issues and provides a link to to the Archives List page. You must have four or more issues for the archives link to appear on the block.
    -   Category Cloud block: this block will display all category taxonomy terms. Each term is linked to its category list page. This is a nice block to use as a search block.
    -   Tag Cloud block: this block will display all tag taxonomy terms. Each term is linked to its tag list page. This is a nice block to use as a search block.

    Notes for testing:

    -   Must manually setup the url on the Issue Archive as `/issue/archive` for the Latest Issues Block to link.
    -   Includes branches `issue/168` on `tiamat-custom-entities`

* * *

## [0.20230110] - 2023-01-10

## [0.20221109] - 2022-11-09

[Unreleased]: https://github.com/CuBoulder/tiamat-theme/compare/20230307...HEAD

[20230307]: https://github.com/CuBoulder/tiamat-theme/compare/20230209...20230307

[20230209]: https://github.com/CuBoulder/tiamat-theme/compare/0.20230110...20230209

[0.20230110]: https://github.com/CuBoulder/tiamat-theme/compare/0.20221109...0.20230110

[0.20221109]: https://github.com/CuBoulder/tiamat-theme/compare/fc8e434945affda25ee2d8cf5c7c659c3ff0b7f4...0.20221109
