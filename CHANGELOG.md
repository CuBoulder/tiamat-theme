# CU Boulder Drupal 9+ Base Theme

All notable changes to this project will be documented in this file.

Repo : [GitHub Repository](https://github.com/CuBoulder/tiamat-theme)

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- ### Removes horizontal and advanced content sequence blocks
  [a11y, Remove] The horizontal and advanced variants of content sequence aren't properly accessible to screenreader users. This update removes them. Resolves CuBoulder/tiamat-theme#934
  
  Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/137)
---

- ### Add in base font colors for collection grid
  Resolves CuBoulder/tiamat-theme#929 and resolves CuBoulder/tiamat-theme#930.
  Adds base font colors for links and text to fix bugs related to background styles.
---

- ### Fix breadcrumbs (again)
  Removing the block is needed. It was adding extra steps that didn't need to be there.
  
  The `is not empty` need to be changed to `!= ""` because the empty check still sees arrays as content.
---

- ### Fixes a bug with links in Content Sequence blocks
  Links to Drupal routes would incorrectly display `internal:` URIs instead of public URLs. This update fixes the bug.
  
  Resolves CuBoulder/tiamat-theme#926
---

- ### Changes basic page title to enhance accessibility
  This update:
  - Adds an invisible `<h1>` at the top of every basic page for screen readers, tagged with `sr-only`.
  - Converts the existing page title from `<h1>` to `<div>` with `aria-hidden="true"`.
  
  Resolves CuBoulder/tiamat-theme#931
---

- ### Updates People List Page
  This update:
   - [a11y] Adds `aria-hidden="true"` to a person photo's link, or person photo th/td in table view. Adds alt text to the person photo.
   - [a11y] Adds `aria-live="polite"` to the region containing the list of people after a user selects an option in filters.
   - [a11y] Adds `<span class="sr-only">Loading</span>` to describe the loading icon.
   - [Change] Updates the email link in table view to only have the text "Email".
   - [Change] Updates the social media link matcher to correctly display the icon for x.com URLs, as well as support the same shortened URLs supported by our social media icons block and menu.
   - [Bug] Resolves in CSS an issue where the person photo in table view may become unusably small on mobile devices.
  
  Resolves CuBoulder/tiamat-theme#902
  Resolves CuBoulder/tiamat-theme#904
---

- ### A11y for Content Rows
  ### Content Row: Accessibility Fixes
  - Adjusts DOM order for consistent assistive readability on the `Content Row` display options and reorganizes using pure CSS where applicable
  - Adds `role="presentation" and aria-hidden="true"` to links on images so only the title link is read with assistive technologies
  
  Resolves #907 
---

- ### Adjust mobile float image size
  Closes #891 . Increases minimum floated image size to 50% on mobile and decreases the text size to 85%.
---

- ### A11y Fixes: Article List page and Article List, Article Slider, and Article Grid Blocks
  Addresses the following A11y issues on the Article List page, Article List block, Article Grid Block, Article Slider Block:
  
  ### Article List page, Article List block, Article Grid Block
  
  Changes one or both depending on the user-selected style of the block (Feature, Teaser, Grid, etc), if applicable.
  
  - Adds `role="presentation" aria-hidden="true"` to image links 
  - Adds `aria-hidden="true"` to "Read More" links
  
  ### Article Slider
  - Fixes DOM order of slider blocks to read Title first
  - Adds `aria-hidden="true"` to lower slider controls, previous + next button svgs.
  - Removes `<h3>` tags from Article card titles causing an issue with screen readers
  - Disables `auto advance`
  
  Note: The Article Slider uses [Flickity ](https://flickity.metafizzy.co/) to generate and there are currently Issues related to accessibility awaiting to be addressed on their end: https://github.com/metafizzy/flickity . We may be able to remove our A11y fixes to this custom element once these changes are approved there.
  
  Resolves #900
  Resolves #906
  Half of #908 
---

- ### Fixes error occurring when Content Grid items or social media links are linked to a Drupal route
  Resolves CuBoulder/tiamat-theme#921
---

- ### Updates Content Grid block
  This update:
  - [a11y] Removes all `<h3>` tags and replaces them with `<strong>`. Resolves CuBoulder/tiamat-theme#899
  - [a11y] Adds two items; Resolves CuBoulder/tiamat-theme#905:
    - Adds `role="presentation" aria-hidden="true"` to the image's container. 
    - Reorders image and title in the DOM such that the title comes first.
  - [Change] Refactors Content Grid block without changing its functionality:
    - Reduces the line count of `block--content-grid.html.twig`.
    - Removes several unnecessary files, including dead code templates and a totally unnecessary JavaScript method of setting the height on grid items.
---

- ### Updates Video Reveal block to not mute by default
  Resolves CuBoulder/tiamat-theme#901
---

- ### Slider Block: Bug Fixes + A11y Issues
  ### Slider Block
  Fixes various display issues surrounding the "Slider Block" including:
  - Slider Block style for the default title `<h2>` not displaying correctly
  - Some Slider - Block Style settings visibly rendering within the carousel slides
  - Resolving odd and unpredictable carousel behavior
  
  Resolves #908 
  Resolves #884 
  Resolves #858 
  Resolves #788 
---

- ### Changes `<h5>` to `<h2>` in site footer
  Resolves CuBoulder/tiamat-theme#911
---

- ### Update block--system-menu-block.html.twig
  Sister PR: https://github.com/CuBoulder/ucb_bootstrap_layouts/pull/38
  Sister PR: https://github.com/CuBoulder/tiamat10-profile/pull/119
  Sister PR: https://github.com/CuBoulder/tiamat-custom-entities/pull/135
  
  Added an if statement to not render menus if there is no content within. 
  This is needed for the new layout setup.
  This should not affect anything other than the new layout.
  
  Closes #897 
---

- ### Fixes Search page style regression
  Resolves CuBoulder/tiamat-theme#893
---

- ### Adds Wallpaper image style to hero units and video reveal
  Resolves #804.
  Sister pull requests in https://github.com/CuBoulder/tiamat10-profile/pull/114, https://github.com/CuBoulder/tiamat-custom-entities/pull/132.
  
---

- ### Newsletter: One Article or One Custom Content in a Section
  ### Newsletters
  There is a special case for if a Newsletter Section set to "Teaser" display has only one Article or one item of Section Custom Content, then it should span the full width of the web newsletter. This is only the case for a single item in a Newsletter section, odd numbered counts are still 50%. The email version of the Newsletter is unaffected.
  
  Resolves #895 
---

- ### Updates regions
  This update:
  - [Bug] Adds proper containers to above and below content, fixing incorrect margins. Resolves #819
  - [Change, Remove] Adds template for Layout Builder pages. Removes above content, breadcrumbs, sidebar, and below content regions from Layout Builder pages. Resolves #896
  - [Remove] Removes above content region from search, taxonomy, user, and 403 pages. Resolves CuBoulder/tiamat-theme#877
---

- ### Adds sortable table style changes
  This update resolves two style issues with sortable tables in Webforms. It:
  - [Bug] Corrects the display of drag icons. Resolves CuBoulder/tiamat-theme#786
  - [Change] Decreases the font size of the "Show row weights" button. Resolves CuBoulder/tiamat-theme#787
---

- ### Articles Slider: Articles without thumbnails are omitted from display
  Article Feature: Previously, Articles without thumbnails would still show up in the slider but with a broken image. This has been adjusted so these incomplete Articles are completely omitted from display and only Articles with thumbnails are shown.
  
  Resolves #881 
---

- ### Removal of all how-to files
  Sister request to https://github.com/CuBoulder/tiamat-custom-entities/pull/134.
  Removes all necessary how-to files.
---

- ### Article Feature: Adjusts spacing
  Adjusts spacing on Article Feature blocks between thumbnail and title. Fixes the secondary Article row so titles don't overlap into the next Article's thumbnail
  
  Resolves #859 
---

- ### Update hero-unit.css
  The main part of this is found in PR: https://github.com/CuBoulder/ucb_bootstrap_layouts/pull/35
  
  Added css for fixing default block style icon display It would cause the hero units to shrink like the contextual links would. This is mainly a fix for the layout builder view.
  
  Closes #840 
  Closes #777 
  Closes #745
---

- ### Delete Article Hero Unit CSS
  Removes the unused article hero unit code.
---

- ### Newsletter: Adds Optional URL to Newsletter Custom Content
  Adds the optional URL field for Newsletter Section's Custom Content.
  
  Includes:
  - `tiamat-theme` => https://github.com/CuBoulder/tiamat-theme/pull/882
  - `custom-entities` => https://github.com/CuBoulder/tiamat-custom-entities/pull/131
  
  Resolves #872 
  
  
---

- ### People Lists: Allows for more than 50 People
  Previously a maximum of 50 People were being displayed on the People List Page and the People List Block. This has been fixed to allow all People existing on a site to be pulled into these Content Types. 
  
  Resolves #830 
---

- ### Newsletter: Moves social links from Node to Newsletter term
  Resolves #867 
  
  Includes:
  - `tiamat-theme` => https://github.com/CuBoulder/tiamat-theme/pull/871
  - `custom-entities` => https://github.com/CuBoulder/tiamat-custom-entities/pull/130
---

- ### Update block--content-grid.html.twig
  Check to see if there is an image url available in `if` statements Edited the `else` to be an `elseif` for the same checks for second image_style option.
  
  These fix the missing image notice
  
  Test by creating a content grid without an image chosen, result should have no user notice in the dlog
  
  Closes #866 
  
  
---

- ### Updates Image Gallery block
  This update:
  - Changes Image Gallery block image spacing to be consistent.
  - Removes some styles that were redundant to the ones Bootstrap provides.
  
  Resolves CuBoulder/tiamat-theme#854
---

- ### Fixes error thrown by Social Media Icons block email field
  It throws a console error despite working just fine. This update removes the error.
  
  Resolves CuBoulder/tiamat-theme#862
---

- ### Adds two minor style changes
  This update:
  - [Bug] Adds missing `href` attribute to links in Expandable blocks. Resolves CuBoulder/tiamat-theme#853
  - [Change] Resets styles targeting `<abbr>` tag in Events Calendar blocks. Resolves CuBoulder/tiamat-theme#837
---

- ### Adjusts spacing between sibling blocks within a column
  Resolves #820 
---

- ### Issue Page: Section Title is now optional
  Resolves https://github.com/CuBoulder/tiamat-theme/issues/852
  
  Includes:
  - `tiamat-theme` => https://github.com/CuBoulder/tiamat-theme/pull/855
  - `custom-entities` => https://github.com/CuBoulder/tiamat-custom-entities/pull/127
---

- ### Updates Collection Grid block
  This update:
  - [Bug] Addresses item positioning for rows with two items. Resolves CuBoulder/tiamat-theme#833
  - [Bug] Addresses longer filter labels not wrapping properly. Resolves CuBoulder/tiamat-theme#822
  - [Change] Changes font sizes to match D7 Express. Resolves CuBoulder/tiamat-theme#823
  - [Bug] Removes JavaScript error for items with no body.
  
  Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/126)
---

- ### Newsletter: Social Links in Footer now PNGs
  Modifies the Social Menu in the Newsletter - Email HTML version footer to use fixed PNGs rather than SVG, ensuring compatibility across all email clients. 
  
  Resolves #828 
---

- ### Fixes button color bug; Reverts Hero Unit padding
  Resolves CuBoulder/tiamat-theme#836
---

- ### Updates Social Media Icons block and Social Media menu
  This update:
  - Refactors the Social Media Icons block and Social Media menu to both use the same macros. Un-spaghetties the template code to make it a bit more readable.
  - Improves the robustness of social media link platform detection. Only root domains are used for detection.
  - Resolves an issue causing the email link to be pushed down to a new line in the inline view.
  - Fixes a typo in Pinterest causing it to not be detected properly and show up as a generic link.
  
  Resolves CuBoulder/tiamat-theme#795
  
  Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/120)
---

- ### Forms: Required Fields indicated by a red asterisk
  Resolves #825 
---

- ### Adjusts style of Links in Content Grid - Cards
  Since Content Grids with a "Cards" layout selection always have a white background, the link colors are a consistent blue following the established white background link style, rather than adopting whatever the block background's link styles are.
  
  Resolves #776 
---

- ### Local task buttons more buttony
  Closes #749.
  Makes the anchor tags within the local tasks block larger to cover the whole button as a clickable link.
---

- ### Remove 'Rebuild Layout' Button, Bold 'Save Layout' button on Layout UI
  Resolves #811 
  
  Removes 'Rebuild Layout' button, adds bold effect to 'Save Layout' button
---

- ### Form Block: Fixes bug preventing editing in Layout Builder
  Form block was missing template markup required to allow editing in Layout Builder. This has been corrected.
  
  Resolves #789 
---

- ### Article List Block - Display Fixes
  - Fixes bug where more Articles would display than count specifies
  - Articles without thumbnails aren't indented (Teaser and Title & Thumbnail styles)
  - Adjusts alignment of thumbnails and borders to align to container (Teaser and Title & Thumbnail)
  
  Resolves #799 
---

- ### Fixes Video Reveal block video size bug
  Resolves CuBoulder/tiamat-theme#766
---

- ### Block Styles update
  Added block styles to video hero
  Fix styling errors for full width
  
  Sister PR: https://github.com/CuBoulder/tiamat-custom-entities/pull/118
  
  Closes #744 
---

- ### Styles Layout UI Buttons
  Changes the style of the Layout UI buttons to mirror the appearance of the local tasks menu, to further differentiate these from buttons placed in site content and avoid confusion
  
  Resolves #763 
---

- ### Corrects Webform button colors
  Regular buttons are light gray, while the next and submit buttons are blue.
  
  Resolves CuBoulder/tiamat-theme#757
---

- ### Updates Articles
  This update:
  - Removes margin at the top of articles with header image.
  - Moves header image caption to immediately below header image.
  - Removes options for black text or hiding the overlay on the header image, setting the white text on dark overlay as the default.
  - Updates description of the article header image text field.
  
  Resolves CuBoulder/tiamat-theme#791
  Resolves CuBoulder/tiamat-theme#790
  
  Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/117)
---

- ### Removed stray character typo on the video reveal block
  Removed the "A" hard-coded in the render of the text of the video reveal block.  
---

- ### Image caption fix for long captions
  Closes #716.
  Adds styling for dynamic sizing for images are aligned right or left.
---

- ### Article Slider: Fix with 6+ Articles
  Fixes a bug where 6+ Articles would cause the `Article Slider` to additionally repeat Articles in a long column
  
  ![image](https://github.com/CuBoulder/tiamat-theme/assets/85851903/b1a1e9f3-1ea7-484b-a11b-cd9205b3db60)
  
  Resolves #781 
---

- ### Additional Issue Fixes
  ## "Issue" Content Type Changes
  -  Fixed a bug where all Articles in a section would link to the first Article in the section
  -  Articles that do NOT have a thumbnail or a summary will no longer show the Categories
  -  Fixed bug that would sometimes cause images to break display in Title + Thumbnail renders
  -  Changed "Feature" style images to take up 100% of the available space and keep an aspect ratio consistent with other Feature images
  -  Added spacing between Cover Image and Body, as well as between the Main Menu of the site and the Node Title of "Issue" pages
  
  Resolves #772 
  
  
  
  
---

- ### Updates styling of Form page content type and Webform block
  Form fields now extend full width. Fieldset labels have also been updated to be closer to the D7 Express version. Styles moved to the global scope to also apply correctly to the Webform block placed on a basic page.
  
  Resolves CuBoulder/tiamat-theme#755
  Resolves CuBoulder/tiamat-theme#762
  Resolves CuBoulder/tiamat-theme#768
---

- ### Update style.css
  Fix to oembed video alignment
  Other styles were user error.
  Hero Unit fixes are coming in a separate Hero Unit PR
  
  Test by adding a video media embed to a text block in multi-column sections (then float in any direction)
  
  Closes #769 
---

- ### Issue Content: Bug Fixes for "Issue" (Node), Latest Issues Block
  Fixes the following bugs related to the "Issue" content type and associated blocks.
  
  ## Issue Node
  On the Issue Node - fixed visual bug for display on "Teaser" Articles with no thumbnail from displaying a broken `<img>`
  
  ## Latest Issues Block
  - Fixed bug where the "Latest Issue Block" (up to 4 Issues displayed with a button to see more)  would display a "Current Issue block" (one Issue). The template was pointed at the incorrect web component.
  - The "Latest Issue Block" adds an "Issue Archive" button below if more than 4 Issues exist on the site. Added conditional rendering to only show if an Issue Archive exists on the site.
  
  ## Issue Archive
  Needs a pathauto so the button on the Latest Issues Block works by default (only one expected per site so a similar pathauto to the Class Notes will be implemented)
  
  Includes:
  - `tiamat-theme` => https://github.com/CuBoulder/tiamat-theme/pull/773
  - `custom-entities` => https://github.com/CuBoulder/tiamat-custom-entities/pull/113
  
  Resolves #765 
---

- ### Newsletter: Display Changes + New Features
  A rather large update to the Newsletter Node, includes the following:
  
  ### New Features
  - Unpublished articles should not display in a Newsletter, and provide a yellow content warning for users in the section they are included in on the web version.
  - Newsletter Text Blocks previously had two fixed Text Blocks. This has been updated to a paragraph type with no limit.
  - Custom content no longer includes a category field.
  - Ability to add Social Media Links to the Footer area. This will use the Social Media Menu links from the site and has a simple on/off checkbox to apply.
  
  ### Display Changes
  - Adds Newsletter type title in header. This is set on the Newsletter Taxonomy.
  - 'Feature' thumbnails fixed to a 2:1 aspect ratio
  - Section headers fixed to 20px
  - Article titles fixed to 18px
  - Category links fixed to 10px, and a dark gray that is accessible with the light gray background
  - Article text should be trimmed to ~50 words plus "..." unless a summary is used
  - Teaser - style thumbnails are max of 130px but allowed to scale downwards if viewed on a smaller device
  
  Includes:
  - `tiamat-theme` => https://github.com/CuBoulder/tiamat-theme/pull/770
  - `custom-entities` => https://github.com/CuBoulder/tiamat-custom-entities/pull/112
  
  Resolves https://github.com/CuBoulder/tiamat-theme/issues/706
---

- ### content list updates
  Closes #680. 
  Reformats the content list to be readable and adds QoL changes.
---

- ### item render fix
  Needed to add `.content` to the item renders otherwise we get hit with lots of php errors because the attributes are trying to render for each item.
  
  Closes #752 
---

- ### Update layout-builder-styles.css
  Add margin replacement for content frames with background colors
  
  Sister PR: https://github.com/CuBoulder/ucb_bootstrap_layouts/pull/28
---

- ### Block Style Updates
  Fixed hero and event calendar classes showing in content 
  Fixed color layering and cascading
  Added `None` as an option for `Block Style` background color
  
  Closes #615 
  Closes #711 
  Closes #737 
  Closes #740 
  Closes #743 
  
  Related PR: https://github.com/CuBoulder/ucb_bootstrap_layouts/pull/26
  Related PR: https://github.com/CuBoulder/tiamat-custom-entities/pull/109
---

- ### Fixes missing video in otherwise empty text block
  Fixes a CSS bug which caused a video in an otherwise empty text block to go missing.
  
  Resolves CuBoulder/tiamat-theme#741
---

- ### Class Notes: Adds URL Parameter Filtering
  Adds URL Parameters to `Class Notes List` pages. Can pass dates via `startDate` and `endDate` parameters to automatically filter retrieved `Class Notes` by date published like so:
  
  
  ```
  ?startDate=2023-12-05&endDate=2024-02-06. 
  ```
  (*Would retrieve class notes published between 12/5/2023 and 2/6/2024*)
  
  - Parameters must be passed in the following formats: `YYYY-MM-DD` or `MM-DD-YYYY`
  - If you pass only a `startDate` parameter, `endDate` will default to today's date
  
  Resolves #694 
---

- ### Block styles
  Template updates for every inline block.
  Addition of block styles (bs) fields 
  
  Closes #443 
  Closes #111 
  
  Sister PR: https://github.com/CuBoulder/tiamat10-profile/pull/99
  Sister PR: https://github.com/CuBoulder/tiamat-custom-entities/pull/106
  
---

- ### Issue Display Changes
  Fixes the following on Issue Content Types:
  
  - Removes the Secondary Image field from the form and page display. Also removes the hard-coded dark gray box with the title and body in it, as users can use CKEditor5 plugins such as Box, Button, Icons, and Media Library to achieve a variety of left-side layouts. 
  - Fixes bug with Teaser view of Categories displaying improperly
  - "Read More" capitzalized via CSS instead of hard-coded
  
  Includes:
  - `tiamat-theme` => https://github.com/CuBoulder/tiamat-theme/pull/730
  - `custom-entities` => https://github.com/CuBoulder/tiamat-custom-entities/pull/107
  
  Resolves https://github.com/CuBoulder/tiamat-theme/issues/704
---

- ### Fix spirit menu style
  Closes #712.
  Small change to fix padding issue for the spirit menu style
---

- ### Mobile Footer Menu Changes
  Closes #722.
  Adds CSS changes for the footer menu to only show in the secondary menu when it is a mobile view.
---

- ### Article List Block Adjustments
  Modifies various Article List Nodes and Blocks in the following ways:
  
  ## Article List -- Page
  - Adjusts row border from 2px to 1px
  
  ## Article Grid
  - Thumbnails are now a 2/1 aspect ratio
  - Resolved bug where having count 3 and 3 articles would result a duplicated row
  
  ## Article List Block
  - Adjusts header markup to use strong `<a>` tags instead of `<h2>`'s
  
  ## Article Feature Block
  - Adjusts header markup to use stylized `<h3>`'s across all article cards
  
  Resolves https://github.com/CuBoulder/tiamat-theme/issues/718
  Resolves https://github.com/CuBoulder/tiamat-theme/issues/719
  Resolves https://github.com/CuBoulder/tiamat-theme/issues/724
  Resolves https://github.com/CuBoulder/tiamat-theme/issues/714
---

- ### Issue and Issue Archive use Media Library images
  Changes the Issue cover image field to use the Media Library images rather than the default. This change requires creating an additional consumer in `Focal Image Enable` to use un-cropped image styles from JSON:API as well as modifying the Issue Archive, Current Issue Block, and Latest Issue Block build processes to use that un-cropped image.
  
  A spinning loader was also added to the Issue Archive, and Issue Blocks prior to displaying results on page rather than flashing in. 
  
  Includes:
  - `tiamat-theme` => https://github.com/CuBoulder/tiamat-theme/pull/707
  - `tiamat-custom-entities` =>  https://github.com/CuBoulder/tiamat-custom-entities/pull/105
  - `ucb-focal-image-enable` => https://github.com/CuBoulder/ucb_focal_image_enable/pull/8
  
  Resolves [#104 ](https://github.com/CuBoulder/tiamat-custom-entities/issues/104)
---

- ### Fixes Infinite Load Article List Blocks
  Resolves #713 
  
  Should address the condition where too many Articles causing an issue with how JSON:API handles pagination and subsequent API calls in the Article List blocks
---

- ### Resolves an issue causing the category or tag icon to appear if none are visible
  Resolves CuBoulder/tiamat-theme#701 
---

- ### Updates `block--site-info.html.twig`
  CuBoulder/ucb_migration_shortcodes#15
  
  Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/49)
---

- ### Updates Taxonomy page styles
  - [Bug] Headers on Taxonomy pages are now consistent with the site setting.
  - [Change] The "Subscribe to x" link has been hidden.
  
  Resolves CuBoulder/tiamat-theme#697
---

- ### video reveal html text
  Closes #662.
  Changes necessary files to enable an html text field.
  Sister pull request in https://github.com/CuBoulder/tiamat-custom-entities/pull/100.
---

- ### Collection Grid preview change
  Helps close https://github.com/CuBoulder/tiamat-custom-entities/issues/101.
  Adds the necessary theme changes to allow for the html preview field.
---

## [20240221] - 2024-02-21

-   ### Fixes bug with floated items in Expandable Content block
    Resolves CuBoulder/tiamat-theme#682

* * *

-   ### Adds mobile menus! changes

    -   Forces menu styles off on mobile screen sizes.
    -   Adds CSS styling to the menu.
    -   Styles the "hamburger" icon.
    -   Expands all main menu child menu items. (Resolves CuBoulder/tiamat-theme#647)

    Resolves CuBoulder/tiamat-theme#653

    Sister PR in: [tiamat10-profile](https://github.com/CuBoulder/tiamat10-profile/pull/82)

* * *

-   ### Content Row: Block Changes

    Adjusts the following on the `Content Row` blocks:

    -   On the "Configure Block" modal, switched the order of the tabs so 'Row Content' is on the left and open by default and 'Row Design' is on the right and hidden
    -   Added three teaser displays: `Large Teaser`, `Large Teaser Alternate`, and `Teaser`. Previously the teaser displays available were Teaser and Teaser Alternate.
    -   The `Large Teaser` and `Large Teaser Alternate` displays use the focal image wide style images rather than square.
    -   Adjusts style of the `Teaser` display to mirror other teaser-list style elements, such as the Article List. 
    -   Adjusted style of the `Tile` style display to more closely mirror the D7 version, which achieved the tile effect with images and text alternating. 
    -   Fixes bug where internal links, such as `/homepage` would cause a WSOD when added to Row Layout Content

    Includes:

    -   `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/687>
    -   `custom-entities` => <https://github.com/CuBoulder/tiamat-custom-entities/pull/99>

    Resolves <https://github.com/CuBoulder/tiamat-theme/issues/673>
    Resolves <https://github.com/CuBoulder/tiamat-theme/issues/674>
    Resolves <https://github.com/CuBoulder/tiamat-theme/issues/675>

* * *

-   ### Issue/665
    Closes #665, #666, #668, #669, and #670. Adds the necessary bug fixes and code changes for content sequences.   

* * *

-   ### Primary Link Twitter Icon
    Fixed pull request for #683.
    Fixes twitter link icon for primary links on person page

* * *

-   ### Updated Social Media Block
    Closes #12.
    Sister pull request in custom entities at <https://github.com/CuBoulder/tiamat-custom-entities/pull/97>.

* * *

-   ### default table styles
    Adds default table styles. The issue brought up by kevin seems to be non-replicable and already solved, but should be kept as a note for future issues.

* * *

-   ### Standardizes Display of Accordion - style Elements

    Standardizes style of Accordion elements. This modifies the style of the `FAQ Page` and `Expandable Content` block in the following ways:

    -   Adjusts the `FAQ Page` to mirror the Expandable Content's style (blue text, larger type, red hover, + / - icons on toggle instead of a chevron)
    -   Removes the underlined text-decoration on `Expandable Content`'s title links

    Resolves #672 

* * *

-   ### Class Notes List Changes

    -   Adds images and adjusts the style of the `Class Notes List` page to mirror the Teaser-List display of other List-type nodes
    -   Allows for `Class Note` Content types to have multiple images (custom-entities)

    Includes:

    -   `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/657>
    -   `tiamat-custom-entities` => <https://github.com/CuBoulder/tiamat-custom-entities/pull/95>

    Resolves <https://github.com/CuBoulder/tiamat-theme/issues/206>

* * *

-   ### Removes third-party services

    Moves all associated code into the Site Configuration module.

    Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/48)

* * *

-   ### image gallery bug fix
    Closes #642.
    Quick fix to make image gallery work.

* * *

-   ### People List Page & People List Block - Bug Fixes & Edge Case Handling

    Provides the following bug fixes to the `People List Block` and the `People List Page`

    ## People List Page & People List Block

    -   Fixes a bug with internal links throwing an error. Adjusts so internal links will convert to absolute pathing, which should allow for our multi-site, single domain sites to use internal links. 
    -   No termId present on a Person causing a JavaScript error preventing a full render. Was able to cause this error with multiple people and one without any terms attached. This error was present on both `People List Page` and `People List Block`.
    -   Swaps Twitter's bird to Twitter's X... ( X 's X?)...whatever you want to call it, the bird icon is now an X icon.

    ## People List Page Only

    -   No terms existing for a taxonomy, and the `People List Page` having that taxonomy selected for `Group By` caused a white screen and no errors. Adjusted this to show an error specifying the reason for a white screen: `Grouping by ${groupBy} is requested, but taxonomy data is missing. Please adjust your page's 'Group By' setting or make sure taxonomy data exists for that term.`
    -   Terms existing for a taxonomy and `Group By` for that taxonomy selected on a `Person List Page`... but no Person has terms on that taxonomy caused the same white screen. Adjusted this to show an error specifying this white screen case: `No results found for the '${groupBy}' grouping.`

    Resolves #659 

* * *

-   ### Adds Collection Grid block fixes
    Closes #649.
    Adds the required fixes to add an indicator for single select list, fix id's showing, and make the block a web component.

* * *

-   ### Removes background colors from Content List

    Removes background colors from the Content List

    Resolves #651 

* * *

-   ### Newsletter: Minor Bug Fixes

    Adjusts the following on the Newsletter:

    -   If user elects to omit the optional image on a _Newsletter Taxonomy_, it will no longer render that img element in the header
    -   **Article Sections ( _Feature Style_ )** - For the Feature Style Article Sections, Articles without a thumbnail will check the Article for an Image uploaded as Article Content, and use that in place of a thumbnail if available. This functionality worked in the Teaser display, but there was an error that would prevent the backup image to display in the Feature Style render.

    Icon linking has been resolved by <https://github.com/CuBoulder/tiamat-theme/issues/604>

    Resolves #595 

* * *

-   ### Updates sidebar regions

    Resolves CuBoulder/tiamat-theme#633

    Sister PR in: [tiamat10-profile](https://github.com/CuBoulder/tiamat10-profile/pull/77), ~~[ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/45)~~

* * *

-   ### Class Note Enhancements

    Adjusts permissions for Class Notes, adds optional image field. Resolves <https://github.com/CuBoulder/tiamat-theme/issues/622>

    Includes:

    -   tiamat-theme => <https://github.com/CuBoulder/tiamat-theme/pull/648>
    -   tiamat-profile => <https://github.com/CuBoulder/tiamat10-profile/pull/75>
    -   custom-entities => <https://github.com/CuBoulder/tiamat-custom-entities/pull/94>

* * *

-   ### Adds Collection Grid block and Collection Item content type
    Closes #534.
    Adds the collection grid block and collection item node page

* * *

-   ### Enables list styles in full HTML, Creates Migration Library

    Using Full HTML you can create various list styles found here: <https://styleguide.colorado.edu/content/lists>
    Also creates a temporary migration library for addtl styles needed for the migration process

    Resolves #624 

* * *

-   ### FAQ Content Type

    Adds the FAQ Content Type. Resolves <https://github.com/CuBoulder/tiamat-theme/issues/620>

    Includes:

    -   tiamat-theme (issue/tiamat-theme/620) => <https://github.com/CuBoulder/tiamat-theme/pull/641>
    -   custom-entities (issue/tiamat-theme/620) => <https://github.com/CuBoulder/tiamat-custom-entities/pull/92>
    -   ucb-admin-menus (issue/tiamat-theme/620) => <https://github.com/CuBoulder/ucb_admin_menus/pull/20>

* * *

-   ### Update style.css

    Removal of layout builder styles (lots of this was gin fixing)
    Fix for Text Block title edit issue

    Sister PRs:
    <https://github.com/CuBoulder/tiamat10-profile/pull/69>
    <https://github.com/CuBoulder/ucb_bootstrap_layouts/pull/23>
    <https://github.com/CuBoulder/tiamat10-project-template/pull/30>

    Closes #638 

* * *

-   ### Claro theme mini-update
    Fixes for the `layout-container` and local-tasks css

* * *

-   ### Adds label fields for "Department" and "Job Type" on People List Pages

    Resolves CuBoulder/tiamat-theme#626

    Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/44)

* * *

-   ### Claro theme
    Updated theme files to accommodate the change to Claro.

* * *

-   ### Adds Class Note Page + Class Notes List Page

    Adds the `Class Note` Node and `Class Note List` node. A Class Note List Page lists your Class Notes and has built in filters to allow visitors to filter by year or sort by class year or date posted.

    Includes:
    `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/621>
    `tiamat-custom-entities` => <https://github.com/CuBoulder/tiamat-custom-entities/pull/91>

    Resolves <https://github.com/CuBoulder/tiamat-theme/issues/588>

* * *

-   ### Fixes accessibility issues with Article and Article List

    -   Adds alt text to Article List images.
    -   Enhances readability and fixes bugs with article title backgrounds.

    Resolves CuBoulder/tiamat-theme#616

* * *

-   ### Fixes expandable content `aria-expanded` errors
    Resolves CuBoulder/tiamat-theme#614

* * *

-   ### Updates theme-provided 403 page; removes 404 image

    -   Updates the theme-provided 403 page. This won't be visible often, as an anonymous user is redirected to the login page instead of being shown this page (CuBoulder/ucb_admin_menus#14).
    -   Removes 404 image. CuBoulder/ucb_default_content#6

    Sister PR in: [ucb_default_content](https://github.com/CuBoulder/ucb_default_content/pull/8)

* * *

-   ### Breadcrumb fix

    This render didn't need to be added to the if statement. 
    Fixed formatting as well.

    Closes #585 

* * *

-   ### Title on Homepage no longer visible

    This fixes the functionality where a title is hidden when set as the site's homepage. This was previously working before a moveable title refactor and has been corrected.

    Resolves #607 

* * *

-   ### Hero unit separation

    Hero Unit Separation

    Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/90>

    Closes #605

* * *

-   ### Form Page - Adds Body Field

    The Form Page node's body displays above the attached form.

    Resolves #599 

* * *

-   ### Events Calendar Background matches Section background color

    Adjusts the `Events Calendar` so it matches the background color of the section it is placed in, rather than being always white. Text color adjusted to white for black and dark gray section backgrounds. 

    @jcsparks - Let me know if gold section background needs some text color adjustments, I could make an override for that that makes the text a darker gray / black than the default. 

    Resolves #564 

* * *

-   ### Social Media Menu - Now Icons Only

    Social Media Menu is now icons only, fixes bug where the site name would display. Fixes spelling of 'Facebook'.

    There was a: `<span class="vertical-icon-span"> * _siteNameHere_ * </span>`  on the template that was causing the site names to appear next to the respective logo on each link in the social media menu. These spans did not appear to be used anywhere else in d10, so they were removed to resolve the issue.

    Resolves #586 

* * *

-   ### Fixes error on Newsletter pages
    Resolves CuBoulder/tiamat-theme#596

* * *

-   ### Fixes Embedded Video not displaying, if also Aligned

    Adds a custom CSS override to Embedded Videos, if also aligned via CKeditor5, in order to prevent a visual bug where they becoming hidden if floated left/right or centered on a rendered page. This bug was caused by our customized embedded video style and the default alignments (left,right,center) conflicting. 

    Resolves #561

* * *

-   ### Standardizes padding at the top of pages

    This theme update:

    -   Corrects padding at the top of pages to a standard `20px`. Resolves CuBoulder/tiamat-theme#579
    -   Cleans up some code in multiple content type templates and stylesheets.

    It may take longer to test due to the number of files changed.

* * *

-   ### Secondary Menu Updates
    Closes #551.
    Adds button functionality to secondary menu and fixes other small misalignments.

* * *

-   ### Adds Styling to Newsletters

    Adds the following switchable styles to the email version of the Newsletter: Classic, Minimal, Light-Boxed, Dark-Boxed, Simple. 

    This change also applies the selected `Newsletter` taxonomy's custom header image and footer into your email HTML. 

    For testing:

    -   Create a taxonomy for `Newsletter`-- choose a custom header image, create a footer, and select a style. 
    -   Select this taxonomy when creating a Newsletter page.
    -   After creating your page go to `Edit` and `Preview`. After selecting preview, on the right hand side change the `View Mode` dropdown to `Email: HTML`
    -   If you click the `Click to copy your Newsletter HTML` button, your email HTML will automatically be copied to clipboard, or you can select the HTML from the input. You can demo this by creating an HTML file and doing a Live Preview, or using a program like Email on Acid to test display ( although this will not show images served by localhost)

    I recommend two tabs when testing styles, one with the Email:HTML preview and one with `Edit taxonomy` term to change styles or other fields, then just refresh the Email:HTML preview. 

    Resolves #273 , Resolves #137 , Resolves #305 

* * *

## [20231212] - 2023-12-12

-   ### Issue/567

    Changes to the teaser alternate so that the image divs are displayed empty if they have no image in them.
    This is so that the teasers actually alternate properly for staggered text.

    Closes #567 

    Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/88>

* * *

-   ### Fixes Article Slider Bugs + Style Refinements

    ### Article Slider Changes

    #### Bug Fixes:

    -   Adds condition where 6 articles filtered 'good' but additional articles available (10+ which triggers JSON API pagentation), this previously failed to render.
    -   Fixes console error related to innerText (Removed old code for generating a Date and Body)

    #### Style Refinements:

    -   The thumbnail image now uses `Focal Image Wide` rather than `Focal Image Square`
    -   Spinning Loader is centered on the block

    Resolves #580 

* * *

-   ### Adds a theme setting for heading font

    The setting defaults to _Bold_ but can also be set to _Normal_. Resolves CuBoulder/tiamat-theme#516.

    Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/39)

* * *

-   ### Styles search results page

    Resolves CuBoulder/tiamat-theme#535 – A site's search page created using the [Google Programmable Search Engine](https://www.drupal.org/project/google_cse) module is now styled properly. Correct settings for the search page (may already be defaults):

    -   Display Drupal-provided search input: **✓**
    -   Display search results: **On this site (requires JavaScript)**
    -   Layout of Search Engine: **Results only**

    "Display Google watermark" is on for D7 Express and works fine here too, whether to enable it is a possible future topic of discussion.

* * *

-   ### CU Boulder Site Configuration 2.6

    This update:

    -   Moves all settings from "Pages and Search" into "General". Search settings are now advanced settings.
    -   Replaces the "Pages and search" and "Related articles" tabs with a brand new "Content types" tab. All "Related articles" settings have been moved into "Content types".
    -   Replaces the `edit ucb pages` and `configure ucb related articles` permissions with a new `edit ucb content types` permission.
    -   Moves the People List filter labels and Article date format into "Content types".
    -   Moves the GTM account setting into "General" as an advanced setting.

    CuBoulder/ucb_site_configuration#36

    Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/38), [tiamat10-profile](https://github.com/CuBoulder/tiamat10-profile/pull/53)

* * *

-   ### Enhanced Screen-Reader Text on 'Read More' links for Articles served by Article List Pages + Article Blocks

    Enhances accessibility text on the `Article List` Page and variations of `Article List Blocks` , where links to Articles were previously only 'Read More'. Screen readers will now state "Read more about &lt;Article's Title>" in these cases, providing more context to users using a screen reader.

    Resolves #570 

* * *

-   ### Corrects Article Title Background Image display issues

    Corrects styles for `Article Title Background` with Overlays (under Advanced Style Options on Article Nodes)

    Resolves #566 

* * *

-   ### Update page.html.twig

    Update for the sidebar menu hide/show.

    Closes #553 

* * *

-   ### Fixes padding on tag and category icons in articles
    Resolves CuBoulder/tiamat-theme#569

* * *

-   ### Fixes secondary menu alignment
    Fixes a bug which caused the secondary menu to be improperly aligned to the left when placed above the main navigation. Resolves CuBoulder/tiamat-theme#558

* * *

-   ### People List Filter Labels as a Global Setting

    Changes the People List `Filter 1`, `Filter 2`, and `Filter 3` custom labels to a Global Setting in Site Configuration, rather than being set per-page. These labels will be set under Configuration => Cu Boulder Site Settings => Appearance and Layout.

    Resolves #543 

    Includes:

    -   `ucb_site_configuarion` => <https://github.com/CuBoulder/ucb_site_configuration/pull/35>
    -   `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/560>
    -   `ucb_custom_entities` => 

* * *

-   ### Breadcrumbs updates

    Updates to breadcrumbs to not display breadcrumb div when there are no items in the div

    Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/86>

    Closes #549 

* * *

-   ### Completes in-content menu blocks

    This update completes in-content menu blocks (menu blocks placed outside of a navigation bar, e.g. in a sidebar) by styling them and adding the [Menu Block](https://www.drupal.org/project/menu_block) contrib module for additional options.

    Sister PR in: [tiamat10-project-template](https://github.com/CuBoulder/tiamat10-project-template/pull/25), [tiamat10-profile](https://github.com/CuBoulder/tiamat10-profile/pull/50), [ucb_admin_menus](https://github.com/CuBoulder/ucb_admin_menus/pull/13)

    Resolves CuBoulder/tiamat-theme#267
    Resolves CuBoulder/tiamat-theme#528 

* * *

-   ### Cleans up accessible menus errors
    Resolves CuBoulder/tiamat-theme#538

* * *

-   ### Adds menu styles to the user page
    Closes #525.
    Adds the menu styles to the user page.

* * *

-   ### Issue/529

    CSS edits for the changes needed after the CAAAS hand migration

    Closes #529 

* * *

-   ### Adds search frontend and settings

    This update:

    -   Adds a search modal which appears when clicking on the search icon in the top bar.
    -   Adds a new "Pages and search" tab to CU Boulder site settings (`/admin/config/cu-boulder/pages`). This tab contains settings accessible to Architect, Developer, and Site Manager:
        -   The home page setting (moved from "General").
        -   Options to enable site search, all of Colorado.edu search (default), both, or neither.
        -   Configuration for the site search label, placeholder, and URL.
    -   Renames "Appearance" to "Appearance and layout" and alters the descriptions of menu items.
    -   Adds the [Google Programmable Search Engine](https://www.drupal.org/project/google_cse) module, which allows creating custom search pages to use with site search.

    Resolves CuBoulder/tiamat-theme#266

    Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/29), [tiamat10-profile](https://github.com/CuBoulder/tiamat10-profile/pull/43), [tiamat10-project-template](https://github.com/CuBoulder/tiamat10-project-template/pull/17)

* * *

-   ### Fixes List Indicator Alignment with Left Align Images

    This change aligns the list indicators on a list element with other text elements next to a left-aligned image. 

    Previously, the float css for aligning an element left would cause visual issues with list indicators specifically, the bullet-point or numbering becoming hard to see or lost within the image. There is now condtionally applied left-spacing to rendered Ordered and Unordered list elements, when directly next to a Left Align (.align-left) image. 

    Resolves #523 

* * *

-   ### Remove Extra Markup from inserted Images

    Conditionally removes extra `<div>` elements added through Twig when there's no attributes to justify an additional `<div>` wrap of the rendered content. 

    Changes default div styling of the imageMediaStyle class to not be `display:block`, both of which caused issues with wrapping an image in an anchor tag making the entire row clickable rather than just the image.

    Resolves <https://github.com/CuBoulder/tiamat-theme/issues/522>

* * *

-   ### Add editor style options
    Closes #515.
    Adds initial styling.

* * *

-   ### Updates tiamat-theme to Font Awesome 6 compatibility
    Resolves CuBoulder/tiamat-theme#511

* * *

-   ### initial mobile menu commit
    Initial Mobile Menu commit before styling is decided

* * *

-   ### User and 404 page changes
    Closes #484.
    Adds the new implementation of the user page and stores the image for the 404 page.

* * *

-   ### Article List Block - Style Adjustments & Summary Bug Fix

    ## Article Block Bug Fix

    -   Fixes bug with article summaries not displaying if they are derived from the body content, in lieu of the `Summary` field. This bug was present across `Article List Block`, `Article Grid Block`, `Article Feature Block` and has been corrected.

    * * *

    ## Style Adjustments

    Adjusts the following styles of the `Article List Block`:

    ### All `Article List Block` Styles

    -   Thumbnail images set to 50px on mobile.
    -   Article borders set to 1px.
    -   `Link URL` is no longer a button-style link and is now a right-aligned basic link on the `Article List Block` specifically.

    ### Teaser Display

    -   Sets thumbnails to 100px, 50px on mobile.
    -   Adjusts layout to not force image above article card summary and details on single and multi column widths.

    ### Feature with Wide Photo

    -   Uses the `Focal Image Wide` thumbnail for the images in `Article List Blocks` rendered in `Feature with Wide Photo` style. This image style was not previously available via JSON API when the block was initially created.

    ### Thumbnail & Title Displays

    -   Thumbnail image 65px, 50px on mobile.
    -   Equalizes padding above and below each article card, removing padding from images.

    * * *

    Resolves #497 

* * *

-   ### favicon fix
    Closes #494.
    Quick fix to the favicon path

* * *

-   ### Update region--site-information.html.twig

    Changed class name to fix styling error.

    Closes #490 

* * *

## [20230718] - 2023-09-18

-   ### Remove FontAwesome Libraries

    Remove all Font Awesome files in preparation for global styles

    Sister PR: <https://github.com/CuBoulder/ucb_migration_shortcodes/pull/9>
    Sister PR: <https://github.com/CuBoulder/tiamat10-profile/pull/22>
    Sister PR: <https://github.com/CuBoulder/tiamat10-project-template/pull/12>

* * *

-   ### Hero unit work

    Fixed the hero unit videos to work/fit properly in the new layout builder settings. Added "Size Priority" as an option to hero units so that we can have 100vh sections. Video now uses the 100vh by default because otherwise it's crazy ugly (can be easily changed now that I've refactored some of the css)

    Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/74>

    Closes #481

* * *

-   ### Slider goes e2e in e2e sections
    Closes #476.
    Makes sliders in e2e sections to fully extend the width of the section.

* * *

-   ### Linking to Expandable content
    Closes #403.
    Enables linking to expandable content based on title of the content.

* * *

-   ### Edge-to-edge update

    Updated the templates and some css to accommodate the new edge-to-edge option

    Sister PR: <https://github.com/CuBoulder/ucb_bootstrap_layouts/pull/16>

    Closes #471 

* * *

-   ### Page title changes

    Removed page title from the basic page theme
    Created a field file for the page title so that it has the proper tags and attributes

    Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/73>

    Closes #470

* * *

-   ### Styling for taxonomy term views
    Closes #27 and #350 .
    Adds the css needed for the profile installations changes for the taxonomy views.

* * *

-   ### Change: Video Reveal Display & Autoplay

    ### Changes to Video Reveal:

    Adds play/pause functionality to video reveal block videos, automatically toggling on click when image hides/shows. Fixes overlay to fit image.

    Resolves #388 

* * *

-   ### Re-factor of Drupal Regions to more closely match D7 Express

    Added new regions to to .info
    Added new region rendering to page
    Changed where the slogan is displayed in .theme
    Added new `site-information.html.twig` for new region where slogan is displayed
    Updated `footer.html.twig` to iterate through content so that it automatically adds columns (up to 4 per row)

    I left our current machine names for items like `left_sidebar` the same but changed their display names to match the ones given by Kevin to `Sidebar First`

    We also have logic written in the page.html.twig in case two sidebars are made through the block layout. Currently the settings only allow for one though.

    I have left social media menu and footer menu as regions for the time being because I think those need to be separate for menuing purposes at the moment. 

    Sister PR: <https://github.com/CuBoulder/tiamat10-profile/pull/18>

* * *

-   ### New: Adds 'People List Block'

    ### People List Block

    A configurable and placeable block that displays a list of People, similar to the Person List Page with simpler options. Block contains options for how your block will display to users (Teaser, Grid, Name & Thumbnail, Name Only) and selectable filters by taxonomies on a Person (Department, Job Type, Filter 1, 2, 3) to curate a specific list of People ordered by Last Name.

    Includes:

    -   `tiamat-custom-entities` => `issue/tiamat-theme/466`
    -   `tiamat-theme` => `issue/tiamat-theme/466`

    Resolves <https://github.com/CuBoulder/tiamat-theme/issues/466>

* * *

-   ### Footer change
    Closes #461.
    Changes the footer to fill up whitespace.

* * *

-   ### Updates bootstrap version
    Resolves CuBoulder/tiamat-theme#463

* * *

-   ### Hides breadcrumbs on top-level pages
    Resolves CuBoulder/tiamat-theme#460

* * *

-   ### Adds Articles by Person Block to a Person Page

    Adds an Articles by Person block to the Person page, displaying the most recent 5 articles associated.

    To reveal this block, you must have a byline taxonomy term created with a reference to the Person page in the `field_author_person_page` on the term, and then use that byline term on the article's byline. If a Person does not have any articles, this block will not display.

    Resolves #345 ,  Resolves #427 

* * *

-   ### Removes image requirement from Content Row "Teaser" layouts

    This update enables the creation of Content Row blocks with image-less content and displays it correctly in the "Teasers" and "Teasers Alternate" layouts.

    Resolves CuBoulder/tiamat-theme#453

    Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/71)

* * *

-   ### Page Title on user-set default Front Page set to screen-read only

    Resolves #448 

    Sets the title of pages chosen to be the site's default front page to 'sr-only' class. Will hide the title visually but still accessible to screen readers. Currently this works only if the page is set to explicitly the default '/homepage'. 

* * *

-   ### sort alphabetically
    Closes #449.
    Small change to change the tags and categories to be sorted alphabetically.

* * *

-   ### Removes "D9" from theme name and the theme, custom entities Composer package names

    Resolves CuBoulder/tiamat-theme#435

    Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/70), [tiamat-profile](https://github.com/CuBoulder/tiamat-profile/pull/52), [tiamat10-profile](https://github.com/CuBoulder/tiamat10-profile/pull/13), [tiamat-project-template](https://github.com/CuBoulder/tiamat-project-template/pull/28), [tiamat10-project-template](https://github.com/CuBoulder/tiamat10-project-template/pull/8), [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/26)

* * *

-   ### fix for simple style menu issues
    Closes #438.
    Fixes drop shadow and margin issue in the simple menu style.

* * *

-   ### Adds visual indication of active navigation menu items
    Resolves CuBoulder/tiamat-theme#437

* * *

## [20230707] - 2023-07-07

-   ### Update for LB D10.1 style.css
    Update default layout builder styles so that things are readable and useable. These are temporary fixes until gin_lb gets an update.

* * *

-   ### Hero unit vid fix

    Fixed the padding issues for the video background

    Closes #428 

* * *

-   ### Menu Sub-Theme Styles
    Closes #330.
    Work in collaboration with siteconfiguration/#24.
    Adds 11 new menu styles to the base theme of the boulder theme.

* * *

-   ### Change: Adds 'White' background to card-styled Text Block

    Adds a White background option to card-style Text Block for the case where sections have a different colored background

    Includes:

    -   `tiamat-theme` => `issue/tiamat-theme/413`
    -   `tiamat-custom-entities` => `issue/tiamat-theme/413`

    Resolves #413 

* * *

-   ### Improves styling of the "Expandable Content" block type

    This update includes bug fixes and stylistic changes to the "Expandable Content" block type to address recent feedback.

    Resolves CuBoulder/tiamat-theme#401

    Resolves CuBoulder/tiamat-theme#402

    Resolves CuBoulder/tiamat-theme#404

    Resolves CuBoulder/tiamat-theme#405

    Resolves CuBoulder/tiamat-theme#422

* * *

-   ### bugfix when no primary link
    Closes #419 
    Quick, easy fix to the situation in which there is no primary link.

* * *

-   ### loop bug fix
    Closes #418.
    Solves an issue with looping with first != '#'.

* * *

-   ### Update block--content-grid.html.twig
    Removed justify evenly class so that content will align left as it should.

* * *

-   ### Change: Article Taxonomy term display style
    Resolves #348  - Changes Article Taxonomy term display style. Terms are no longer be all uppercase and icon flush with first term. Color changes to icons. 

* * *

-   ### Adds Link field to Events Block

    Resolves #381 - Adds a Link field to the Events Calendar Block to allow for links to additional events. 

    Includes:
    [tiamat-theme](https://github.com/CuBoulder/tiamat-theme) => [issue/tiamat-theme/381 ](https://github.com/CuBoulder/tiamat-theme/pull/411)
    [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities) => [issue/tiamat-theme/381](https://github.com/CuBoulder/tiamat-custom-entities/pull/65)

* * *

-   ### Change: Adjusts Hero Unit button spacing to 10px
    Resolves #400 

* * *

-   ### Adds right formatting, remove padding and opacity
    Closes #383 and #384.
    Adds formatting for right overlay captions, removes bottom padding for mobile design, and reduces opacity for the slider.

* * *

-   ### Hero Unit Buttons fixed for Internal Links

    Hero Unit buttons correctly link when provided internal links either by direct internal url or selected by page title within the form. 

    Resolves #407 

* * *

-   ### Change Alerts Design
    Changes the design of the CU Alert to mirror the D7 version.
    Resolves #292 

* * *

-   ### Update block--content-grid.html.twig

    Added options for 5 and 6 columns

    Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/63>

    Closes #374 

* * *

-   ### Issue/320
    Closes #320.
    Adds a primary link to the person page which is displayed in the person lists. The icons can vary between multiple different icons based on the hostname of the url.

* * *

-   ### slider bottom content fix
    Closes #385.
    Fixes issue where bottom-content sliders were having issues with animation.

* * *

-   ### Fixes Content List and Text block stale cache issues

    A Content List block may have failed to update properly after updating a referenced node. A Content List or Text block placed using Block Layout may have also failed to reflect changes made to the block's fields. This update includes a fix to prevent stale cache issues.

    Resolves CuBoulder/tiamat-theme#377

    Resolves CuBoulder/tiamat-theme#378

    Resolves CuBoulder/tiamat-theme#387

* * *

-   ### Updated feature settings

    Updated the feature option of the content rows block. Features are now a 60/40 split, width and sizing works properly. Removed the 20px bottom padding from the newer image styles update.

    Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/61>

    Closes #380 

* * *

-   ### fix spacing in image gallery
    Closes #382. 
    Removes unneeded spacing between images.

* * *

-   ### New Block Type: Article Slider

    Adds the Article Slider block. Much like the Article List page and other Article blocks, this will display a maximum of 6 articles in an interactive slider using user-provided inclusion and exclusion filters.

    Resolves #319 

    Includes:
    `tiamat-theme` => `issue/tiamat-theme/319`
    `tiamat-custom-entities` => `issue/tiamat-theme/319`

* * *

-   ### Change: Article List adds button to load more Articles for improved accessibility

    The Article List page now uses a button to address accessibility concerns when loading more Articles, instead of a scroll-based 'infinite loader'. The button only appears if additional Articles are available via JSON API

    Resolves #370 , also resolves #238

* * *

-   ### Update slider.css

    Added css to make link icon white rather than blue.

    Closes #339 

* * *

-   ### New Block Type: Article Feature

    Adds a new block type: Article Feature. The Article Feature block displays the latest Articles, with Category & Tag filters set by the user much like the Article List page. The first Article displays a large image and summary and the remaining articles displays titles and thumbnails. 

    Resolves #318 

    Includes:

    -   `tiamat-theme` => `issue/tiamat-theme/318`
    -   `tiamat-custom-entities` => `issue/tiamat-theme/318`

* * *

-   ### New Block Type: Article Grid

    Adds a new block type - Article Grid. Allows for Articles with thumbnails to be displayed in an Article List-style grid display.

    Includes:

    -   `tiamat-theme` => `issue/tiamat-theme/317`
    -   `tiamat-custom-entities` => `issue/tiamat-theme/317`

    Resolves #317 

* * *

-   ### Update slider.css

    Updated css to remove slide content misalignment
    Fixed 3:2 sizes to be 3:2 instead of 3:1

    Closes #337 
    Closes #338 

* * *

-   ### Update events-calendar.css

    Add link to event calendar widget generator into help text of builder
    Remove max-height from events calendar widget

    Closes #333 
    Closes #334 

    Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/56>

* * *

-   ### Change: Related Articles set via Global Settings

    Resolves #246 -- Related Articles paragraph now uses the Global Settings (Admin => Configuration / CU Boulder site settings / Related Articles) for Taxonomy Exclusions

    Includes:

    -   tiamat-theme `issue/246`
    -   tiamat-custom-entities `issue/tiamat-theme/246`

* * *

-   ### New Block Type: Article List Block

    Adds Article List Block - a block version of the Article List page functionality with some added display style customizations.

    Resolves #316 

    Includes:
    \-tiamat-theme => `issue/tiamat-theme-316`
    \-custom-entities => `issue/tiamat-theme-316`

* * *

-   ### Tweaks style of Article List; fixes image padding on mobile
    Resolves CuBoulder/tiamat-theme#363

* * *

-   ### Content Sequence Block
    Closes #265.
    Add the horizontal, vertical, and advanced content sequences.

* * *

-   ### Refactor to escape HTML from Article user input on Article List
    Resolves #361 -- Refactors render to use `innerText` instead of `innerHTML` to assemble list render, protecting from malicious user input

* * *

-   ### Update page.html.twig

    Fixes container sizing issues for hero units
    Fixes above content not displaying blocks if put in the section 
    Fixes left and right side bars both not showing up if both are being used

    Closes #301 
    Closes #303
    Closes #340 

* * *

-   ### Tweaks Person page image alignment and padding
    Resolves CuBoulder/tiamat-theme#354

* * *

-   ### Fixes a bug which caused improper display of special characters like ampersands on Person pages
    -   Some special characters such as `&` in _Job Title_ and _Department_ fields displayed as `&amp;` on Person pages. These characters now display properly. Resolves CuBoulder/tiamat-theme#275
    -   An error resulted from the added `core/drupalSettings` dependency. This dependency is removed.
    -   Person page schema changes: `itemprop` attributes have been move into field templates; `itemscope` moved to the higher-level `<article>` tag.
    -   Additional cleanup of the Person page template

* * *

-   ### Adds "Reset" button to People List page user filters

    -   Adds a "Reset" button which automatically appears when a non-default user filter is selected on a People List page
    -   Fixes a bug which caused broken default avatar images while previewing a People List page

    Resolves CuBoulder/tiamat-theme#312; Author @TeddyBearX

* * *

-   ### Fix hero unit and image sizing

    Added extra css class to attributes for hero unit (will need to assess for other inline blocks and blocks) Added `img` to the style.css with the `article img` because images in block layout aren't given the `article` wrapping tag which caused problems with responsive images.

    Closes #298 

* * *

-   ### Adds pronouns field to the Person page

    A pronouns text field has been added to the Person page, allowing a person's pronouns to be displayed below their name.

    Resolves CuBoulder/tiamat-theme#315

    Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/49)

* * *

-   ### Change: Uniform Display of Title & Department fields on the different People List Page display options
    Resolves #313

* * *

-   ### Change: Moves Person Photo caption on Person Page

    Closes #314 

    Moves Person's Photo caption underneath Person Photo on Person Page types. 
    Also contains : <https://github.com/CuBoulder/tiamat-theme/pull/325>

* * *

-   ### Change: Adds Address Header to Person Page

    Resolves #309 

    Add heading for Address field on Person Page, similar to the Office Hours field heading

* * *

-   ### Image Style additions
    Closes #152.
    Adds new image styles to both WYSIWYG and full html fields.

* * *

## [20230323] - 2023-03-23

-   ### Change justify-content
    Closes #155.
    Removes justify-content from both image gallery and grid content

* * *

-   ### Adds body field to people list
    Closes #279.
    Adds a summary of the body, if there is no summary field.

* * *

-   ### Changes "Order by" for Person List page

    The option "Has Job Type, Last Name" has become "Job Type, Last Name". Rather than simply checking for the existence of the _job type_, sorting is performed alphabetically by a person's first _job type_.

    Resolves CuBoulder/tiamat-theme#280; Author @TeddyBearX 
    Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/41)

    Up to date with CuBoulder/tiamat-theme#286 – merge that one first!

* * *

-   ### Person List aligns content to the left with and without image
    Closes #277.
    Quick css change to align all items to the left, regardless of whether there is an image there or not.

* * *

-   ### Footer aligns vertically
    Closes #268.
    Quick fix to align all footers to be at the top

* * *

-   ### Adds default Person image for People List Page grid renders, if no Person Image provided

    Resolves #278 -- Will use a default Person image in Grid-style renders of the People List page, if no image is provided on an included Person page.

    Includes:
    `tiamat-theme` => `change/278`

* * *

-   ### Removes the ability to turn off "Restrict choices to those selected" in People List

    The option is no longer present when creating or editing a People List page.

    Resolves CuBoulder/tiamat-theme#281

    Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/40)

* * *

-   ### Newsletter Refactor

    Partially resolves #222 - Enhances the Newsletter for more consistency with final email html generation via Twig templating engine instead of JavaScript. Should resolve issues with inconsistent displays and partial/error renders from unexpected user inputs.

    TO DO - Will address `Newsletter Type` taxonomy and Theme selection in #273 

    ### New Workflow for Newsletters

    1.  After creating your Newsletter, go to `Edit -> Preview`. 
    2.  In the top dropdown menu to select your View Mode, select `Email HTML` as your View Mode. The page will now render the Email HTML version.
    3.  Scroll to the bottom of your Email View Mode Preview for a button to automatically copy your html code to the clipboard ready to paste, as well as populate a text field with your email html.
    4.  You can now paste into your email client / Salesforce client and send.

    Includes:

    -   `tiamat-theme` => issue/222
    -   `tiamat-custom-entities` => issue/222

* * *

-   ### Adds sticky menu

    This update adds an optional "sticky menu" component to all pages on a site, enabled by visiting CU Boulder site settings → Appearance and toggling on _Show sticky menu_. The menu appears automatically when a user scrolls down passed the main website header, and only on large screen devices (at least 960 pixels wide).

    Resolves CuBoulder/tiamat-theme#247

    Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/20)

* * *

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

[Unreleased]: https://github.com/CuBoulder/tiamat-theme/compare/20240221...HEAD

[20240221]: https://github.com/CuBoulder/tiamat-theme/compare/20231212...20240221

[20231212]: https://github.com/CuBoulder/tiamat-theme/compare/20230718...20231212

[20230718]: https://github.com/CuBoulder/tiamat-theme/compare/20230707...20230718

[20230707]: https://github.com/CuBoulder/tiamat-theme/compare/20230323...20230707

[20230323]: https://github.com/CuBoulder/tiamat-theme/compare/20230307...20230323

[20230307]: https://github.com/CuBoulder/tiamat-theme/compare/20230209...20230307

[20230209]: https://github.com/CuBoulder/tiamat-theme/compare/0.20230110...20230209

[0.20230110]: https://github.com/CuBoulder/tiamat-theme/compare/0.20221109...0.20230110

[0.20221109]: https://github.com/CuBoulder/tiamat-theme/compare/fc8e434945affda25ee2d8cf5c7c659c3ff0b7f4...0.20221109
