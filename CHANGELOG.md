# CU Boulder Drupal 10+ Base Theme

All notable changes to this project will be documented in this file.

Repo : [GitHub Repository](https://github.com/CuBoulder/tiamat-theme)

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [20250312] - 2025-03-12

- ### Newsletter: Dark Boxed email's Article sections in Outlook on PC have no background

  Due to how Microsoft Outlook on Windows 10/11 uses a custom render engine based on Microsoft Word instead of anything standardized, the `Dark-Box` style of email was hard to read and would come through with missing backgrounds. This has been adjusted to conditionally render wrapping elements to help try to enforce background.

  Resolves #1608 

* * *

- ### D11 version bump
  D11 version bump

* * *

- ### Background color addition

  Add white background color to content sequence cards so they aren't transparent on background images.

  Resolves #1611 

* * *

## [20250226] - 2025-02-26

- ### Newsletter: Fixes pathing and size of images within Newsletter Content Blocks

  Previously images placed in the Newsletter Blocks `Newsletter Block Text` section would show up in the Email HTML with relative pathing and no fixed style sizes, resulting in very broken images. This has been corrected so images should render at full-width of their section at both options -- one Block at full width OR multiple Blocks side by side. 

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1605>

* * *

- ### Update style.css

  Klaro override style needed for brand color.

  Resolves #331

  Sister PR: <https://github.com/CuBoulder/tiamat10-project-template/pull/75>
  Sister PR: <https://github.com/CuBoulder/tiamat10-profile/pull/263>

* * *

## [20250219] - 2025-02-19

- ### Remove stray JS that breaks forms
  Think this is the culprit behind broken forms -- need to test to see what config we enabled just to work around this issue-casuing bit of code can stay and what can go from `profile`

* * *

## [20240212] - 2025-02-12

- ### New Article Paragraph

  Added new paragraph template for secondary article content.

  Updated css on articles so that content isn't justified and aligned for everything, just blockquotes

  Resolves #1597 

  Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/200>

* * *

## [20250205] - 2025-02-05

- ### Adds the Bluesky logos to Newsletter Social Media options, adds files

  This enables the Newsletter to include Bluesky links in the Social Media area of the footer with the proper Bluesky Logo. Adds in a black and a white bluesky logo pngs.

  Helps resolves <https://github.com/CuBoulder/tiamat-theme/issues/1587>

* * *

- ### Update menu--social-media-menu.html.twig

  Add bluesky as an option to the social media menus

  Resolves #1587 

  Sister PR: <https://github.com/CuBoulder/tiamat-libraries/pull/7>

* * *

- ### Aggregators will only display error messages to Authenticated Users

  Previously Aggregator/ API-driven content would show various Error messaging to reflect Content-Aggregator blocks failure to display results, such as No Results found, API errors, overly aggressive filtering, etc. intended to prompt site-editors to take action and intervene to fix the content to display properly. These errors would show indiscriminately of a user's role. 

  This has been adjusted so Anonymous users don't see the Error messaging and only show it to Authenticated users. This includes pages such as the Article List Page, the People List Page as well as blocks such as Article aggregator blocks, People List block, taxonomy clouds, and more. 

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1392>

* * *

## [20250129] - 2025-01-29

- ### People Lists: Fix short body fields not displaying. Refines Alphabetical sorting of lists
  - On the People List Page and People List Block, previously Person pages with a short body field would not show that in these aggregator displays due to a logic bug which would only trigger if the Person page returned had to generate a summary, in cases where the body was too long. This would lead to short Person page body fields not displaying. This bug has been corrected. Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1572>
  - Previously on the People List Page  if the People were sorted by Last Name but some People shared a Last Name, it would display them in order of creation. This has been corrected so that it will sort by Last Name, and then First Name in cases of shared last names. Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1573>

* * *

- ### Adjusting weights for CSS files and removing weights from JS libraries

  Additional work to get the CSS files loading the proper order after the 10.4 update.  

  Among other issues will resolve #1577 

* * *

- ### Update boulder_base.libraries.yml

  Updated the weights in libraries to work properly in `10.4.1`

  Main problems we've seen so far were regions not being ordered properly which messed up the menus and font colors on backgrounds. This should solve those problems.

  This will need some testing. On my dev environment it looks like all my blocks and regions are appearing correctly now. 
  I don't know if this is still a stop-gap for `D11` or not? I didn't think the weights were supposed to work this way but this seems to have done it.

  Resolves #1579 
  Resolves #1578
  Resolves #1577
  Resolves #1576

* * *

- ### Update block--events-calendar.html.twig

  Switching the block container to a web component name to handle the block being stripped from columns before loading content.

  Sister PR: <https://github.com/CuBoulder/ucb_bootstrap_layouts/pull/71>

  Resolves #1574 

* * *

- ### Update ucb-brand-bar.css

  Updated padding to be `0!important` for the brand bar to avoid styleguide interference.

  Resolves #1570 

* * *

- ### #1567 Events Calendar: Allow Mini Calendar + List option

  Previously the Events Calendar block would only allow the "List" type Widget as configured by `https://calendar.colorado.edu/help/widget` and would not correctly display the "Mini Calendar + List" widget option -- which adds an interactive mini calendar to the Events Calendar block. 

  This has been corrected so both 'Widget Types' will work with the block.

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1567>

* * *

## [20250121] - 2025-01-21

- ### #1562 - Mega Menu: fix Button color being over-written

  CU Buttons placed in a Mega Menu could have their text color overwritten to the default link blue due to overly aggressive css rules. This has been corrected so menu links retain their intended colors and Buttons receive their expected styles

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1562>

* * *

- ### Newsletter: Re-add domain to Article Thumbnails (Wide and Teaser) referenced in a Newsletter

  We changed how Newsletter Article images are referenced for better generation on multi-site domains in particular. With this change the primary (www.colorado.edu) domain was dropped. This has been re-added. 

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1561>

* * *

## [20250115] - 2025-01-15

- ### Newsletters: Fixes Absolute Pathing, Allows buttons in intro text

  Resolves #1552 

* * *

- ### Newsletter List Block: fixes pathing of linked Newsletters

  Previously the Newsletter List Block would just use the path returned via the API, which presented an issue on multisite. This has been corrected

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1556>

* * *

- ### Homepage Mobile Menu fix
  Resolves #1496.
  Adds the mobile menu toggle when the header is removed on the homepage.

* * *

- ### Removes unused include templates and settings

  This update removes the unused includes and settings originally intended for the CU Boulder homepage secondary and footer menus. They have instead built these out using the appropriate mechanisms available in Web Express and don't need custom code to support it.

  Resolves CuBoulder/tiamat-theme#1537

  Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/77)

* * *

- ### Newsletter List Block: Adds loader and error message handling

  Previously there was no spinning loader element on the Newsletter Archive, which could present a blank screen for an uncomfortable amount of time with no feedback. This had been added, along with proper error handling for No Results, API errors, etc. 

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1506>

  ## Troubleshooting Issue Archive Pages

  If your Newsletter List Block is not correctly linking to the Newsletter Archive of the type you've selected, this is likely due to the creation of the term before the automatic page was created. You will need to edit the term and scroll to the bottom and select `General automatic URL Alias` which will let the pathauto module take over, and link your Block to the Archive correctly. 

  <img width="758" alt="Screenshot 2024-12-11 at 3 12 25 PM" src="https://github.com/user-attachments/assets/f8f7de60-a630-41e5-a955-28747739c730" />

* * *

- ### Related Articles: Will Not Include Self
  Fixes an issue with v2 of the Related Articles block where it could include itself in Related display.
  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1549>

* * *

- ### Remove all menu hashes
  Resolves #1536
  Removes all mentions to menus and the functionality of a hash being added to menus.

* * *

## [20241211] - 2024-12-11

- ### Sidebar menu theme styles

  Styles applied when the light gray sidebar menu style option is picked in the theme configuration. Styles override basic options with new css file.

  Sister PR: <https://github.com/CuBoulder/ucb_site_configuration/pull/75>

  Resolves Issue #1513 

* * *

- ### Resolve URL Hash for mega menus
  Resolves #1536.
  Changes the functionality of the hash set function to only affect menus that are not mega menus.

* * *

- ### Related Articles: Refactors block for better relatedness scoring, faster generation

  Previously the Related Articles block could produce results that were older than expected while more recent related Articles could be missing. The block has been completely reworked to use a modern Web Component style of the other Article List blocks we've developed as well as produce better and more recent Article matches by picking through a pool of the most 50 semi-related to find the top 3.

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1526>

* * *

- ### Adds Article Syndication "read more" article list

  This update adds the Article Syndication "read more" article list, for use with the Campus News block. The article list is automatically created on sites using the CU Boulder Article Syndication module (if it doesn't already exist) and aliased to `/syndicate`. It allows URL parameters to specify category, audience, and unit filters.

  [new] CuBoulder/ucb_article_syndication#3

  Sister PR in: [ucb_article_syndication](https://github.com/CuBoulder/ucb_article_syndication/pull/6)

* * *

- ### Article Lists: Hides Dates, Decodes Special Characters in Titles of Taxonomy Term Pages

  If an Article has it's date set to 'Hide' this update will hide the date on `Category` and `Tag` Taxonomy pages as well as on the `Article List Page` and `Article List Block` displays that show the date (Teaser, Feature)

  Additionally fixes the display of special characters on Taxonomy term pages from not decoding correctly.

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1465>
  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1429>
  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1509>

  Profile -> <https://github.com/CuBoulder/tiamat10-profile/pull/239>

* * *

- ### Mega menu Link color changes
  Resolves #1530.
  Forces the color of links in the mega menu to be blue to resolve issues of links not showing up.

* * *

- ### Newsletters: allow unpublished to show in Email HTML preview

  Previously the Email HTML of Newsletters would not display unpublished Articles. Now they will display so site-editors can verify and proof content before mailing. There is a content warning on the Node of any Articles that are unpublished. 

  Note: Articles must still be manually published before sending the email, or could result in email recipients getting broken links. 

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1517>

* * *

- ### Remove wrap from info footer
  Resolves #1525.
  Removes wrapping from the site info contact footer to remove the extra space.

* * *

## [20241204] - 2024-12-04

- ### Class Notes List: Allow WYSIWYG Class Notes to display correctly

  Previously the Class Notes List page would strip out WYSIWYG HTML from the aggregate display. This has been adjusted so that images, links, etc added to a Class Note page via WYSIWYG editor are allowed to display while malicious input is not. 

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1523>

* * *

- ### Modify Image Styles in Content Rows

  Updated content rows so that teasers are using the correct image style with the right 2:1 ratio.
  A new image style was created to support this update. 
  There was also a bug with the code in which the large teasers would display as squares if the rows were unlinked. That has been updated to show correctly as wide.

  Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/196>

  Resolves #1503 

* * *

- ### Newsletters: Bug Fixes, Layout Adjustments

  ### Bug Fixes

  - Removed the hard-coded "View on Website" link. This will link correctly to the Newsletter page it is generated from. The hard-coded link was due to a completely re-written header and was left in unintentionally from development.  
  - Added stricter styling rules to force iOS devices to show images at the proper width. Previously they would all take on the same width on iPhones only. 
  - The blue link color should now be consistent across the Newsletter, along with removing the underline link decoration. 
  - Missing images should be fixed for complex site urls, but will need to be tested in production. 

  ### Layout Fixes

  - Adjusts spacing on the top of the newsletter. Previously there could be a large gap in between the header and the content if you intentionally left out fields such as the Intro Image or Intro Text. The conditional spacing has been tightened up to include for this case.
  - Text blocks will display at full width if there is only one in the section. Previously they would only take up 50% even if there was only one

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1515>
  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1514>
  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1511>
  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1508>
  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1507>
  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1528>
  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1510>
  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1522>

* * *

- ### Article Feature: Fixes aspect ratio for Wide images

  Previously Article Feature Blocks with the Image Size set to `Wide (slider image style)` would come through as 3:2 aspect ratio rather than 16:9, which is used for the slider. 

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1501>

* * *

- ### Update ucb-brand-bar.css

  Adding consistent `max-width` and `width` to the logo's link container allows for the SVG to scale properly throughout all browsers.

  Resolves #1505 

* * *

- ### Class Notes List: special character fixes

  Previously special characters from Class Notes wouldn't escape properly, such as `&nbsp`. They are now correctly decoded.

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1518>

* * *

## [20241122] - 2024-11-22

- ### Update Homepage Footer

  Removal of the `ucb-home-link` as the `{{ content }}` generates that link properly for the homepage.

  This also means we do not hide the Site Contact Info Footer in the Block Layout. The homepage is currently configured this way so that's no worry there. When they add social media links they'll just need to make sure that it is the first item in the Site Information region to stack properly.

  Updated various links to the new ones provided by Wendy

  Resolves #1493 

* * *

- ### Newsletter: Header and Footer Changes, Major Style Adjustments, Bug Fixes

  ### Changes

  - Changes the Newsletter-type title in the header to be conditional, will only appear if there is no Newsletter taxonomy image such as a logo. Previously both the newsletter-type title AND image would always display.
  - The Newsletter date will use the published date rather than update date, so it can be modified by users.
  - Footer section is now center-aligned and has a link back to the site. Also has a border top which should better indicate content separation to readers.

  ### Style Adjustments

  - Adjusts the generation of the two-column Content Block section. Some observed bugs with this includes: on iOS specifically they would not display side by side, and on some versions of Outlook they would not align correctly. This has been adjusted with better enforcement and should resolve these specific two and other Content Block section visual issues
  - Added additional email client-style override CSS so CU brand buttons should show up in more email clients.
  - Added additional email client-style overrides to try to force and ensure brand color links. Gold links on black backgrounds and blue links on white backgrounds should display in more email clients now, instead of using the Email Client's default blue for everything
  - Added additional image styles to enforce image sizing on iOS (Feature content images, teaser content images and intro images would be forced to the same size).  This may need additional production testing to further refine if issues still present

  ### Bug Fixes

  - Removes the large empty space after the header, this was due to duplicated styles being applied. 
  - Fixes an issue where the `Simple` style footer would have a white bar and white icons where the Social links should be, resulting in invisible icons

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1486>

* * *

## [20241120] - 2024-11-20

- ### Updated menu style fixes
  Fixes some menu style issues in the shadow and highlight styles.
  Removes the gap in the highlight style and lowers the text in the shadow style.

* * *

## [20241120] - 2024-11-20

- ### Back to Black

  Change the black variable from `#222` to `#000`

  Resolves #1478 

* * *

- ### Padding for mega menu columns
  Resolves #1468
  Adds padding to the mega menu columns to prevent content overlap.

* * *

- ### Video Hero Unit Content Padding

  Adding content padding for the video hero unit to extend height more easily for users. 
  Overrides css with inline style.

  Options were added in the Design tab

  Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/193>

  Resolves #1477 

* * *

- ### Newsletters: New `Newsletter List Block` and `Newsletter Archive`.  Summary field added to Newsletter: Email

  Adds the `Newsletter List Block`, which allows aggregation of 1-10 of the most recent Newsletters of the selected type. Will link to the Newsletter Archive. 

  The Newsletter Archive isn't a content type, it is a route that will exist for any newsletters of the specified type listing them in a paginated view with the title and the summary. The summary will use either the summary field or the first piece of content's title. You can find the Newsletter Archive at  `/newsletter/<Newsletter-Type>`

  Also adds a Summary field to the Newsletter page, which will be used as a pre-header on the emails and used as a Summary on the Newsletter List Block and Newsletter Archive page. 

  This should show up after the Subject on an Email in specific clients such as Gmail, iOS, and others ( this will require prod - testing )

  Includes:

  - `theme` => <https://github.com/CuBoulder/tiamat-theme/pull/1476>
  - `profile` => <https://github.com/CuBoulder/tiamat10-profile/pull/231>
  - `custom-entities`  => <https://github.com/CuBoulder/tiamat-custom-entities/pull/192>

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1391>
  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1475>

* * *

- ### Expandable url has updates

  Series of updates to add functionality to expendables and ckeditor accordions for address bar hash updates.

  Removed the duplicate expandable block js.
  Works for expandable block's accordion/horizontal/vertical options.
  Made global so that ckeditor accordions on any page type are affected

  This does not handle nested accordions within expandable/accordion content. It doesn't need to at this moment.
  This does not affect the FAQ page's hash stuff

  Resolves #1353

* * *

## [20241118] - 2024-11-18

- ### Content List: Fixes the sidebar display's text

  Fixes text wrapping of the text on Sidebar display. Text will remain all on one row with the thumbnail image.

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1169>

* * *

- ### Adds missing regions to search pages

  Previously, some regions were missing from search pages, such as the sidebar regions. This update adds those regions to search pages to match our other pages, allowing blocks to be placed in the sidebar using block layout. This fix is needed ASAP for the homepage site.

  [bug] Resolves CuBoulder/tiamat-theme#1453

* * *

- ### Change footer to be sorted into rows
  Changes the direction of the footer to be flexed into rows instead.

* * *

## [20241113] - 2024-11-13

- ### Related Articles: fix relative path response

  Previously the Related Articles block would use the Article link provided by the JSON API response unmodified, which was relative and missing the subpath. This would lead to broken URLs on sites with subpaths. This has been corrected.

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1464>

* * *

- ### Homepage updates

  Handful of updates for the above and below content regions as well as the homepage footer style

  Sister PR: <https://github.com/CuBoulder/ucb_site_configuration/pull/71>

  Resolves #1435 

* * *

- ### Newsletter: Additional Style Fixes

  - Header issues fixed including: Campus logo too small, Website link wrong color, Newsletter title too small, and date and website link should be smaller. Email header too large. Provided correct email header from Lissa ( thanks!).   **NOTE**: Link color SHOULD have all the correct client-specific and dark/light mode overrides being applied to force brand colors... but is not guaranteed to work across all clients equally due to email HTML having zero standards between clients. 
  - Fixes spacing  between border and next articles in a series of Articles or User-content. Previously the top spacing was too small.
  - Fixes a footer issue where sometimes the background wouldn't apply and there would present white text on a white background. 
  - Fixes header images cropping oddly

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1311>
  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1450>

* * *

- ### Collection Grid Fixes
  Resolves #1439 and #1446.
  Adds a condition for the collection items to be published, and adds a condition to force the columns to always be equal length.

* * *

- ### Resolves special characters not rendering correctly in article title image captions

  This update:

  - Removes instance of `render|striptags|trim` from article title image caption template.

  [bug, severity:minor] Resolves CuBoulder/tiamat-theme#1459

* * *

- ### Latest Issue Block: fix missing site subpath

  Prevents an error in the Latest Issue Block where it would fail to fetch due to a missing subpath. This has been corrected. 

  Resolves #1462 

* * *

- ### Webform: Adjusts max width at different column widths

  Fixes issue where webform blocks placed in Sections with column width 50/50 or 33/66 were too narrow. This was due to styles applied so the form would not span the full width on a single column container. 

  Adjusted so that one column layout will continue to span the 66% of the container but smaller multi-column layouts span the entire width.

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1440>

* * *

- ### Adds spacing between items in a no-bullet list
  [change] Resolves CuBoulder/tiamat-theme#1444

* * *

## [20241030] - 2024-10-30

- ### Articles by Person: On/off toggle

  Adds an on / off toggle to make the Articles by Person block on a Person page optional.

  Includes:

  - theme => <https://github.com/CuBoulder/tiamat-theme/pull/1437>
  - custom_entities => <https://github.com/CuBoulder/tiamat-custom-entities/pull/186>

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1398>

* * *

- ### Article Grid: Replaces styled square thumbnail image with wide image

  Replaces the Article Grid Block's list of Article thumbnails with the `focal_image_wide` image style, which eliminates the need for applied CSS styles on the thumbnail verion, which was not consistent across browsers.

  Previously the block was using a CSS styled version of the `focal_image_square` because our `UCB Focal Image Enable` module, which enables access to our variety of image styles via API, did not yet have access to the wide image style at the time of the Article Grid block's development. 

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1403>

* * *

- ### Adds `clearfix` for main content region
  [bug, severity:minor] Resolves CuBoulder/tiamat-theme#1420

* * *

- ### Video Media: Fix floated video spacing, remove alignments on mobile screens

  - Adds spacing surrounding left and right aligned video media and the text.
  - On mobile screens-- left, right, and center alignments are removed and the video spans the full-width of the content. This prevents videos from becoming too small when floated and adjusts the Center-aligned videos to mirror the full-width look instead of maintaining pillarboxed 'centered' spacing on mobile.

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1433>

* * *

- ### Add conditions for person pages with no images
  Resolves #1388.
  Adds a conditional based on the images and information fields to decide on the design of the person page.

* * *

## [20241023] - 2024-10-23

- ### Remove double borders on menus
  Resolves #1408.
  Removes the double borders on menus in the above and below content regions.

* * *

- ### Make video hero vertically centered
  Resolves #1352.
  Makes the video hero more vertically centered

* * *

- ### Fixes radio button / label alignment in search modals
  [bug, severity:minor] Resolves CuBoulder/tiamat-theme#1413

* * *

- ### Accordions: Fixes Accordions containing Columns Overflow

  Fixes visual issue where inserting a Column into an Accordion would cause a horizontal scrollbar to appear within the Accordion body. 

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1421>

* * *

- ### Article List Page: Adds Reset button to Exposed Article List Filters and Minor Bug/QoL Fixes

  - Adds a Reset button to the user-accessible filters for Category and Tag on an Article List Page that will reset the component to the initial state
  - Fixes a bug that could present when clicking Apply Filters with 'All Category' and 'All Tags' selected that could bring in additional outside Terms from what the component initialized with and originally filtered on. This seemed to happen if you clicked Apply Filters right as the component loaded, but has been corrected.
  - Adds an error message for `No Results Found` if the provider returns any number of Articles with filters applied, but all those results get filtered out in the exclusion process. Previously there was not a case built for this with the new filters and a user could be presented with a blank component.

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1406>

* * *

- ### Adds missing commas and spaces between authors in article byline
  [bug, severity:minor] An issue existed where commas and spaces wouldn't be added between multiple authors in an article byline. This update resolves the issue. Resolves CuBoulder/tiamat-theme#1418

* * *

- ### Update content list teaser image sizing

  Update basic teaser max width for teasers to 100px like D7 
  Have teaser max width be 50px

  Resolves #1349

* * *

- ### Responsive menus in the below content regions

  Fixes spacing issues for blocks in above and below content.
  Also adds proper stacking for menus in different regions

  Resolves #1407

* * *

- ### Newsletter (Web Version): Fixes desktop version display

  - Corrects an issue where a certain number of `Teaser` sections and content items with images could cause the section to "break out" of the parent container and get displayed pinned to the left, due to an error in the html template that would close the section too early if specific conditions were met.
  - If there is only one content item in a Teaser section, it will take up 100% of the space. Otherwise they will fall side by side taking up 50% of the space. This not working was also partially attributed to the above error.

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1354>

* * *

- ### Article Aggregators: Adds Node ID fallback for Nodes with No Alias

  Previously there was no fallback setting on Aggregators to handle `Article` pages using `/node/#`. This could happen in situations where pathauto patterns had been turned off, and no url alias had been set. This lack of a fallback resulted in broken Article Aggregator block / page renders or broken links to these Articles. This has been corrected so both aliased and non-aliased Article pages will display with correct links for these pages across all the Content types.

  This change affects `Article List Page`, `Article List Block`, `Article Grid Block`, `Article Feature Block`, `Related Articles Block`, `Article by Person Block`, `Article Slider Block`. 

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1410>

* * *

- ### Google Translate: Adds Japanese and Tibetan language options to sites
  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1409>

* * *

## [20241017] - 2024-10-17

- ### Menu Styles for Footer and After Content regions
  Resolves #1120.
  Adds styling for the footer and after content regions for menus to be added.

* * *

- ### Updates linter workflow

  Updates the linter workflow to use the new parent workflow in action-collection.

  CuBoulder/action-collection#7

  Sister PR in: All the things

* * *

- ### Corrects minor layout problems in the site footer

  This update:

  - [bug, severity:minor] Forces Site Contact Info Footer block to occupy the full available width. Resolves CuBoulder/tiamat-theme#1394
  - [bug, severity:minor] Fixes alignment of styled blocks in the Site Information region. Resolves CuBoulder/tiamat-theme#1395

* * *

- ### Issue Fixes: "Link to Issue" on Articles tag style, Issue page images, Latest Issues Block

  ### Article Page

  The tag showing that an Article appears in an Issue (below Categories and Tags) on Article pages previously had the icon appearing differently than the Category and Tag icons due to missing CSS. This has been corrected. (You will need to link an existing Issue to an Article to test via the 'Link To Issue' tab)

  ### Issue Pages

  Previously, images placed in the footer (or anywhere else for that matter) on an Issue page were showing up at 100% sizing due to not specific enough CSS being applied to all images. This has been corrected.

  ### Latest Issues Block

  We have resized the images of Issue covers that appear in the `Latest Issue` block to a larger size, mirroring the D7 version where each card takes up 25% of the horizontal container.

  Resolves #1382 
  Resolves #1383 
  Resolves #1384 

* * *

- ### Colorbox Image Styles: Allows 'alt' tag fallback for Caption, Fixes Floats

  These changes affect `Colorbox Small - Square`, `Colorbox Small - Thumbnail`, `Colorbox Square`, and `Colorbox Small` image styles.

  1. Previously the 4 Colorbox image styles would only use a caption for the lower description of the click to zoom functionality  that appears when zoomed. We have enabled a fallback such that if no caption is added, it will use the alt tag of the image. If no alt tag exists either, it will be blank. Resolves #1393 
  2. The Colorbox Image float left and float right were not being applied due to these being 'snowflake' images using a different template to enable the click to zoom functionality. This has been corrected and should float left or right as expected. Resolves #1379 

* * *

- ### Article Aggregators: Fixes Summary Generation of handling special characters and HTML entities. Additional Article List Block Image fixes.

  ### Fixes Summary Generation Process on Article Aggregators

  Previously when an Article aggregator block had a missing `summary` field, a summary using the `body` field would be generated as a substitution it could result in HTML entities and special characters showing up incorrectly, such as `&nbsp` and `&amp`.  This has been corrected.

  This affects the following blocks: `Article List Block`, `Article Grid Block`, `Article Feature Block` as well as the `Article List Page` Content type. 

  Resolves #1386
  Resolves #1351 

  * * *

  ### Article List Blocks set to 'Feature Wide' display image corrected

  Previously `Article List Blocks` set to Feature Wide Image display had a height limitation, which would display the wide image style incorrectly. This has been adjusted to maintain proportions, mirroring D7

  Resolves #1390 

* * *

- ### Article List Page: Adds user-accessible Category and Tag filters

  Adds two new toggles to the Article List Page settings, which will expose filters on Categories and Tags for page visitors. This will allow visitors to the page to further filter Articles.

  If an Article List Page has "Include" filters set on Category and/or Tag terms, only those Included terms appear as filter options in the dropdown presented to the user. If a term is set to be hidden, that term will not appear in the exposed filter, even if it's being used to initially filter the Articles.

  Includes:

  - `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/1387>
  - `tiamat-custom-entities` => <https://github.com/CuBoulder/tiamat-custom-entities/pull/180>

  Resolves #1261 

* * *

## [20241009] - 2024-10-09

- ### Only footer menu in the mobile menu fix.
  Resolves #1336.
  Adds the ability to use footer menus while using no other menus and have them show up in the mobile menu.

* * *

- ### Related Articles: Fix base path
  Resolves #1375 

* * *

- ### Corrects padding and icon of Aggregator Feed block
  [bug, severity:minor] Resolves CuBoulder/tiamat-theme#1366

* * *

- ### Secondary menu button appearance rework
  Resolves #1367.
  Adds a new style for the buttons in the secondary menu.

* * *

- ### Remove striptags render from mega menu desc
  Resolves #1372.
  Removes the render and strip tags from the mega menu link description

* * *

- ### Mega menu changes for Description
  Resolves #1348.
  Changes the mega menu descriptions to take up the full width of its area.

* * *

- ### Sorts by job type weight instead of alphabetical in people lists
  [change] Previously, job type sorting on people lists was limited to alphabetical by job type name. This update changes job type sorting to respect the order for job types shown on the job type taxonomy page. Resolves CuBoulder/tiamat-theme#1368

* * *

- ### Fixes Slider block link color and special character rendering
  [bug, severity:minor] Resolves CuBoulder/tiamat-theme#1356

* * *

- ### Create developers-sandbox-ci.yml
  Add new workflow

* * *

- ### Fix Preview Error

  Image position needed checks for if the route was in preview or not for the proper node id.

  Resolves #1361

* * *

- ### Removes padding below article title image header and changes to margin
  [bug, severity:minor] Resolves CuBoulder/tiamat-theme#1358

* * *

## [20241002] - 2024-10-02

- ### Articles by Person Block: Fixes Infinite Spinning Load on Person Page

  In cases where a Person has over 10 Articles with their linked byline term set on the Articles, the logic on the Articles by Person block could cause an infinite spinning loader due to logic in how the block should handle pagination. This has been corrected to match the other Article aggregator build processes. 

  Resolves #1332 

* * *

- ### Replaces deprecated function call on sites with a custom logo image
  [bug, severity:moderate] An issue existed where a site would crash if it contained a custom logo. This was due to the use of a [deprecated function call removed in newer versions of Drupal](https://www.drupal.org/node/2940031). This update resolves the issue by replacing the deprecated function call with the correct call. Resolves CuBoulder/tiamat-theme#1342

* * *

- ### Fixes styling issues of social links on the person page
  [bug, severity:minor] Resolves CuBoulder/tiamat-theme#1337

* * *

- ### Adds padding below article title background on articles
  [change, minor] Resolves CuBoulder/tiamat-theme#1331

* * *

## [20240925] - 2024-09-25

- ### Video Reveal fix for floating images
  Resolves #1313.
  Adds an inline-style to the body field to resolve the issue with video reveals expanding larger than their expected size.

* * *

- ### Corrects spacing issue for checkboxes and radio buttons on webforms
  [bug] Resolves CuBoulder/tiamat-theme#1318

* * *

- ### Remove console log from video reveal
  Resolves #1334. 
  Removes the console log from the video reveal

* * *

- ### Places first name and last name on the same line to prevent trimming of the space between them
  [bug] An issue existed where a space was trimmed between the first name and last name on person pages due to the names being separated by a newline. This update resolves the issue. Resolves CuBoulder/tiamat-theme#1304

* * *

- ### People List Page: Selecting 'Group by Job Type or Department' with Filters applied to that term, only shows allowed groupings

  Previously if you had a People List Page with `Group by` set to Department or Job Type, and had filter on that term, you could possibly see groupings of people for terms not selected in the filter, if the Person pages had multiple terms.

  For example: on <https://www.colorado.edu/alc/our-people/undergraduate-advising>, the Faculty group should not show up as it is a term applied to every Person Page, but NOT included in the filters.

  This has been corrected so only the filtered groups in the `Includes` for that term show up as a Group.

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1259>

* * *

- ### Webform Block: Adds Required field indicator

  Previously the required field indicator (red asterisk) was missing from Forms added as a `Webform block` (not to be confused with Form blocks).  This has been corrected so they are visible.

  Resolves #1321 

* * *

- ### Fix for alignment of floated images with long captions

  Add proper alignment on floated images.
   Should only affect images with large amounts of caption text.

  Resolves #1314 
  Resolves #1249

* * *

- ### Remove Mega menu from Sticky menus and add default link color
  Resolves #1317 and #1316.
  Removes mega menus from the sticky menu and converts them into normal links. It also adds base default colors for links in mega menus to account for site settings.

* * *

- ### body template move

  The basic page body block wasn't being rendered at the right level. This caused it not to be editable or removable at the layout builder level. If multiple body sections were added they couldn't be deleted and a "body" title was added to each new addition.

  Closes #1280 

* * *

- ### Article Title Background Update

  Removed div displayed image and set it as a background image. Set the background image to use the `section_background` image style to avoid large image files.

  Set background positioning using new preprocess in .theme Preprocess works like it does in the layout builder sections except it will update immediately if the file image's focal point is updated.

  Updated css to reflect new changes. Removal of `absolute` positioning fixes the problem with the navigation being covered by the title. Everything should scale well now.

  Changed the top padding to be 300px vs 200px to imitate the old version's bigger title image.

  Resolves #1292 

* * *

- ### Person Page: Corrects 'Articles by Person' Section Full Name Missing Space
  Resolves #1306 

* * *

## [20240918] - 2024-09-18

- ### Separates person first and last name with space instead of newline
  [bug] Resolves CuBoulder/tiamat-theme#1304

* * *

- ### Newsletter: Major bug fixes and style adjustments

  ### Newsletter - Node

  - Centering on Newsletter pages (the page, not the email version)  was not working correctly for user-created content in Teaser, only if an image was not supplied. This has been corrected. Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1264>

  ### Newsletter -  Email Version

  #### Major Fixes

  - Articles added to newsletters were showing `&nbsp;`  as plain text in strange places that do not appear in the original articles. This has been corrected - this would happen with Articles where no summary field is provided. The `&nbsp` was caused by how we handle generating a summary to put in place of that missing field in Twig specifically and has been adjusted
  - Newsletters are limited to 600 px wide in the preview window but when sent through Marketing Cloud and opened in Windows Outlook, and always were the full width of the window, breaking formatting. This was due to how Outlook handles image styles, needs a width attribute on the element instead of css. 
  - Additional updates have been made to try to force our colors to come through despite user selected light/dark modes on their email clients. This will likely be an ongoing process to iron out how every client handles styling base elements in their own way and how each handles light/dark mode user settings differently.
  - An issue where Footer Social media link icons appear to be broken has been fixed, this is due to an error in the path. 

  #### Minor Style Fixes

  - The CU Boulder logo at the top of newsletters is extremely large in Outlook but very tiny when the same newsletter is opened on an iPhone. Same issue as above, Outlook needed specific size attributes specified in the element itself instead of handling via CSS. 

  - Newsletter text appears as Arial in the preview window, but are Times New Roman when opened on Outlook. More Outlook specific styles have been applied, again this will likely be an ongoing process to dial in settings that work across the maximum number of browsers.

  - The horizontal rules separating sections appear in the preview window but are missing when pasted to Marketing Cloud. This has been corrected, RGBA is not a valid style and it needed to be applied to a `<table>` element instead of a `<tr>` element. 

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1254>

* * *

- ### Update ucb-accordion-styles.css

  Updated specificity to fix the colors on vertical tabs. 
  Horizontal tabs seem to be working correctly.
  Normal accordions are working as intended.

  Resolves #1287 

* * *

- ### Adds the Faculty Publications block

  [new] This update adds the Faculty Publications block. Faculty Publications blocks pull results from [CU Experts](https://experts.colorado.edu/). A variety of filters are available to bring near feature-parity with the version in D7. Notable changes in this version:

  - Adds an option to detect when the block has been added to a faculty member's person page, and automatically use that person's email address for the author filter.
  - Replaces the pager with a "More publications" button which loads the next batch of publications. Results are loaded fast and no longer require a reload of the page to view.
  - Removes "Any" for number of results to prevent poor client performance. 10, 25, 50, or 100 are available options.

  Resolves CuBoulder/tiamat-theme#1146

  Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/172), [tiamat10-profile](https://github.com/CuBoulder/tiamat10-profile/pull/201)

* * *

- ### Secondary Menu Button functionality change
  Resolves #1285.
  Changes the functionality for the buttons to only show when it is the active link. This change eliminates social media buttons and adds the functionality of the no button css to non-active links.

* * *

- ### Fixes link color on alert-style text blocks
  [bug] Resolves CuBoulder/tiamat-theme#1267

* * *

- ### Update hero-unit.css

  CSS needed updating for proper targeting after changes to block styles. 
  These changes should fix the overlay for all hero units with overlays.

  Resolves #1278

* * *

- ### Corrects Social Media Icons block to not be inline
  [bug] Resolves CuBoulder/tiamat-theme#1295

* * *

- ### Video Reveal height solution
  Resolves #1204 and #1286.
  Changes the video reveal to have the image as a background images and limits the height to 160px larger than the text content.

* * *

## [20240911] - 2024-09-11

- ### Dark 3 Secondary Menu CSS change
  Resolves #1282.
  Corrects the Dark 3 menu style to have the secondary menu links be in line when the secondary menu is above.

* * *

- ### Print css to force black text
  Resolves #1276.
  Adds css to force the hero and video reveal to have black text at all times.

* * *

- ### Adds `web_express_version` theme variable
  [new] Resolves CuBoulder/tiamat-theme#1274

* * *

- ### Corrects Person node photo display on mobile

  [bug, mobile] An issue existed which sometimes caused photos on Person nodes to be too small to see on mobile devices. This update resolves the issue.

  Resolves CuBoulder/tiamat-theme#1241

* * *

- ### Styles pager on Taxonomy pages (addendum)
  This update corrects the folder structure of the previous update, Styles pager on Taxonomy pages CuBoulder/tiamat-theme#1275, and has no additional changes.

* * *

- ### Styles pager on Taxonomy pages
  [bug, change] Resolves CuBoulder/tiamat-theme#1262 

* * *

## [20240904] - 2024-09-04

- ### Mobile Menu: Adds conditional to toggle
  Resolves #1212.
  Adds a conditional to the mobile menu toggle to only appear when there is a menu on the page.

* * *

- ### Adds sidebar region to taxonomy pages
  [bug] Resolves CuBoulder/tiamat-theme#1263

* * *

- ### Related Articles Block: Refines 'Relatedness' calculations

  Refines the relatedness calculations of the `Related Articles` block. The block will now check Category matches as most relevant, tag matches, and in the event of a tie in "relatedness score" it will take the more recent Article as the more related choice.

  Previously the block almost exclusively took only the category matches under consideration and if there were none, would then check tag matches. Date was not included in these calculations and would reflect Articles in the order returned from the API.

  Resolves #1242 

  Will create a separate ticket for addressing global on/off settings, is a larger discussion that will most likely involve a custom module to re-write settings across the site. 

* * *

- ### Mobile Menu
  Closes #1231.
  Solves the problem of a split mobile menu by combining the various mobile menus into one. This should resolve the bug in all situations.

* * *

- ### Mega Menu Tablet changes
  Resolves #1238.
  Adds css to make images span the width of the text-above div, and changes the columns to be reduced to one in tablet width.

* * *

- ### Content list changes

  Resolves #1251.
  Adds the ability to add collection item pages to the content list.

  Custom Entities -> <https://github.com/CuBoulder/tiamat-custom-entities/pull/168>

* * *

- ### Article Slider: Fixes Issue with Multiple Reuseable Article Slider Blocks on the same Page

  While a rare situation, if a user happens to add two copies of a re-useable `Article Slider` block to the same page, it would cause them both to break. Similar to the other JavaScript blocks, this issue has been corrected by giving every instance of the block a Unique ID. 

  Resolves #1247 

* * *

- ### Fixes error on person pages caused by links fields

  [bug] An issue existed where certain person link URLs not beginning with a `/` may result in an error and break the display of a person page. The bug has been found in production on the Anthropology site and is a high-priority fix. This update refactors the person links field templates to use my Twig macro and resolves the issue.

  Resolves CuBoulder/tiamat-theme#1256

* * *

- ### Update Slide Size/Image

  Added three new image styles:
  Slider Ultrawide (1600x600)
  Slider Widescreen (1600:900)
  Slider 3:2 (1500:1000)

  Each style has the proper sizing dictated by Kevin
  The Slider block has been updated to have the proper names and sizes associated with them.
  The slide paragraph now has the default image style set to Original.
  The slider block template has had it's sizing logic moved to the paragraph slide template.
  The paragraph slide template uses parent logic to check what side the slider is going to be and applies the appropriate style to each image.

  Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/165>

  Closes #1240 

* * *

- ### ID generation replace

  Replacing our ID generation for these blocks so that reusable blocks don't run into errors with duplicate reusable blocks on the same page.

  This affects the video reveal, slider, image gallery video hero unit, and expandable content blocks.

  Closes #1245 
  Closes #1137

* * *

- ### Events Calendar |raw removal

  Remove `|raw` loading.
  Replace localist widget ID with randomly generated ID Strip query strings from embed input.
  Hardcode embed div and js using new ID and query parameters

  Resolves #842 

* * *

- ### Fixes CSS bug causing accordions nested inside tabbed expandable blocks to be hidden

  A CSS specificity bug existed in the expandable content block set to horizontal or vertical tab display. The bug caused accordions created using the CKEditor 5 Bootstrap Accordion plugin and nested within the content area to be unexpectedly hidden. This update resolves the issue.

  Resolves CuBoulder/tiamat-theme#1228

* * *

## [20240821] - 2024-08-21

- ### Newsletter: Missing Content - Adjusts `Newsletter Section Content` TItle Requirements

  Allows for no titles on `Newsletter Section Content` paragraphs inserted into `Newsletter Sections` on the Email HTML render.   Previously the checks could allow for content missing a title to not render, when it used the higher level Newsletter Section title as the title. 

  Resolves #1226  

* * *

- ### Secondary and Mobile Menu fixes
  Closes #1197.
  Makes the secondary and mobile footer menu to stay within a column for the mobile menu. This also disables the footer menu being able to expand in the mobile menu.

* * *

- ### Sliders: Autoplay On and Pause Functionality

  ### Slider Blocks

  This update modifies `Slider` blocks to Autoplay, advancing slides every 7 seconds. On hover, the autoplay is paused. Previously Sliders did not autoplay. 

  Resolves #1202 

* * *

- ### Mega Menus
  Closes #629.
  Adds a mega menu that can be attached as a block in a menu link.
  Entities -> <https://github.com/CuBoulder/tiamat-custom-entities/pull/157>
  Profile - > <https://github.com/CuBoulder/tiamat10-profile/pull/180>
  Template -> <https://github.com/CuBoulder/tiamat10-project-template/pull/51>

* * *

- ### Adds CU Boulder Styled Block custom module and updates block styles

  This update:

  - [new] Adds the new CU Boulder Styled Block custom module.
  - [new] Converts the Campus News block to a styled block, adding new style options to match our other blocks. CuBoulder/ucb_campus_news#6 CuBoulder/ucb_campus_news#9
  - [change] Refactors existing styled blocks to all extend the same Twig template with Twig inheritance.
  - [change] Corrects some indentation and other minor code style issues in affected block templates.

  Sister PR in: [ucb_campus_news](https://github.com/CuBoulder/ucb_campus_news/pull/10), [tiamat10-profile](https://github.com/CuBoulder/tiamat10-profile/pull/187), [tiamat10-project-template](https://github.com/CuBoulder/tiamat10-project-template/pull/55)

* * *

- ### Articles: Bylines link to their respective connected Person Pages

  ### Articles

  Adjusts the byline display so it links to the connected Person Page, using the connect page on the byline's field `Author Person Page`.

  Resolves #1220 

* * *

- ### Content List: Image size adjustment

  ### Content List Block

  Adjusts size of "Sidebar" - styled Content List Block images to be exactly 75px on desktop and 50px on mobile screen sizes. Previously there was additional width added.

  Resolves #1217 

* * *

- ### Article List Block: remove image requirement for all displays

  ### Article List Block

  Removes the Thumbnail requirement for `Article List Blocks`, which would previously filter out any Articles that do not have a thumbnail field from showing up across all displays. This change will make the block perform more like the `Article List Page` and not omit Articles missing those fields from being displayed on the final output.

  Resolves #1224 

* * *

- ### Person page: fix mobile columns

  ### Person Page

  Fixes a display issue where a Person Page would arrange back to 2 columns on a mobile display instead of 1.

  Resolves #1215 

* * *

- ### Responsive Preview: Removes admin toolbars/alerts from displaying on Responsive Preview for site editiors

  Removes admin toolbars/alerts from displaying when previewing a page using the Responsive Preview tool for site editors to preview a mobile or tablet display

  Resolves #1218 

* * *

## [20240814] - 2024-08-14

- ### Print Stylesheets
  Closes #1101.
  Adds a rudimentary print css style for all pages.

* * *

- ### Article List: Fixes Exclusion Filters

  ### Article List

  Fixes a bug with the `Article List` introduced when we refactored Article Lists to strictly enforce chronological order despite API timings. The bug would cause exclusions to throw an API Error instead of skipping processing entirely, which they had done when chronological order was not strictly enforced. 

  This has been corrected and Articles flagged with Excluded Categories / Excluded Tags are properly removed with an additional check.

  Resolves #1207 

* * *

- ### New Image Styles: Colorbox Image Styles

  ### New Image Styles

  Adds 4 new colorbox image styles: `Colorbox Small` , `Colorbox Small Square`, `Colorbox Small Thumbnail`, `Colorbox Square`. On click, these open up a modal with the full image and caption.

  Includes:

  - `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/1205>
  - `tiamat-custom-entities` => <https://github.com/CuBoulder/tiamat-custom-entities/pull/160>
  - `tiamat-profile` => <https://github.com/CuBoulder/tiamat10-profile/pull/185>

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1174>

* * *

- ### Sidebar spacing fixes

  Fixed sidebar spacing so that things vertically aligned. 

  Also solves the problem of a mobile horizontal scroll bar appearing because of the `g-0` class. 

  Changed the column sizes to match the same sizes as layout builder sidebars. 

  Finally fixed alignment of multi-column layoutbuilders + a sidebar. Though this should be a rare case, the new changes make it so all the content aligns as expected.

  To test the horizontal mobile scroll bar fix you'll need to have a block or menu in the block layout sidebar.

  Resolves #1198 

* * *

- ### Content List Block: Updates to 'Sidebar' Style

  Updates the look of the 'Sidebar' style of `Content List` Blocks to better match D7, as specified by Kevin in the ticket. Will swap the image to the left and make smaller on both desktop and mobile sizing.

  Resolves #1169 

* * *

- ### CK5: Margin Clear styles

  Adds a 'Margin Clear' style for headers and paragraphs

  Includes:
  \-`tiamat-profile` => <https://github.com/CuBoulder/tiamat10-profile/pull/182>
  \-`tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/1201>

  Resolves <https://github.com/CuBoulder/tiamat10-profile/issues/152>

* * *

- ### Fixes uneven accordion icon spacing

  An issue existed with incorrect sizing and spacing between the icon and text of an accordion item header if the text had wrapped. This update resolves the issue.

  [bug] Resolves CuBoulder/tiamat-theme#1192 

* * *

- ### Article: Article Title Background Style Adjustments

  ### Articles

  Corrects the following on Articles with an `Article Title Background` set

  - On mobile sizes, the navbar hamburger menu could become unclickable due to an Articles Title Background overlay extending too far.
  - Removes extra padding on "Dark mode" Articles with an Article Title Background image set that created an extra gap between the navbar and the image

  Resolves #1187 
  Resolves #1195 

* * *

- ### Block styles: Heading Style 'Hero' Font Family Changes

  ### Block Styles

  The heading styles `Hero` and `Hero Bold` have been adjusted to both use 'Roboto Condensed', mirroring the D7 block style versions

  Resolves #1164 

* * *

- ### Adds "University of Colorado Boulder" to the end of page titles
  This update:
  - [change] Adds "University of Colorado Boulder" to the end of page titles. It first checks if the site is already called that to prevent this text from being duplicated on the home page. Resolves CuBoulder/tiamat-theme#1188 
  - [change] Cleans up PHPCS errors in `boulder_base.theme`.

* * *

- ### Article List blocks: Chronological Order

  ### Article Aggregator Blocks

  Previously Article Aggregator Blocks (includes `Article List`, `Article Feature`, `Article Grid`, `Article Slider`) could sometimes display `Articles` out of chronological order. This issue was due to the asynchronous nature of the chained API calls, which could cause Articles that required additional processing (e.g., generating a summary from the article body) to be placed out of order after processing completed while other more field complete (but potentially chronologically earlier)  Articles "finished" before them.

  Now, all Articles are processed and appended to the page in their original order, ensuring the chronological display of articles across all Article aggregator page/blocks

  Resolves #1184 

* * *

- ### People Lists: Removing an Image breaks Lists

  ### People List Page & People List Block

  Previously in the case where you had a `People List Page` or `People List Block` and then removed an Image from the Media Library that was used as a thumbnail for a `Person` page, this would make that respective Person Page's thumbnail ID to become `'missing'` rather than a `null` value, which would cause the Person List Page to completely break unless that Person's thumbnail image is fixed.

  This has been corrected with additional checks in these rare cases. It will also use the Default Avatar in specific displays such as the Grid. 

  Resolves #1175 

* * *

- ### Slate Form: Styles Submit Button

  ### Slate Form Block

  Styles the submit button similar to the Form Block

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/1173>

  Related: <https://github.com/CuBoulder/tiamat-custom-entities/pull/156>

* * *

- ### Favicon path change
  Closes #1081.
  Changes the favicon path to be relative to the site path.

* * *

- ### Article List: Chronological Order

  ### Article List Page

  Previously an `Article List Page` could sometimes display `Articles` out of chronological order. This issue was due to the asynchronous nature of the chained API calls, which could cause `Articles` that required additional processing (e.g., generating a summary from the article body) to be placed out of order after processing completed as other earlier, more complete `Articles` "finished" before them.

  Now, all `Articles` are processed and appended to the page in their original order, ensuring the chronological display of articles. 

  Note: This did not seem to affect the other `Article List` style blocks, only the `Article List Page`

  Resolves #1176 

* * *

## [20240805] - 2024-08-05

- ### Sidebar/Title Spacing Fixes

  Sidebar and Title spacing changes are fixed so that they align. The Title's container is what is aligned properly rather than the text in most cases as the font has a line-height that adds a little more padding around the text. Kevin wants the containers aligned and less focus on aligning the text.

  Resolves #1128 
  Resolves #1129 

* * *

- ### Article Feature: fixes 'Read More' link

  ### Article Feature Block

  Fixes a template issue preventing the 'Read More' link from linking to the chosen url correctly. 

  Resolves #1163 

* * *

- ### Updates site footer links
  This update:
  - [Bug] Corrects the site link in the site contact info footer block to correctly point to the active site's home page. Resolves CuBoulder/tiamat-theme#1127
  - [Change] Changes the privacy policy link to link directly to the privacy policy. Resolves CuBoulder/tiamat-theme#1093

* * *

- ### Newsletter: Broken Images and Header Cleanup

  Resolves breaking image bug with Newsletters along with some header spacing cleanup due to template conditionals

  Resolves #1133 

* * *

- ### Updates Slider block
  This update:
  - [Bug] Ensures Slider block styles are applied only to the Slider block. Resolves CuBoulder/tiamat-theme#1148
  - [Change] Corrects indentation and code readability issues in the Slider block template and stylesheet.

* * *

## [20240725] - 2024-07-25

- ### Articles by Person: Fixes API Error and Multisite lniks issue

  ### Person Page: Article by Person block

  - Previously this block would throw an API error on multisites due to an error in the API endpoint not being adjusted for a multisite config and it would attempt to fetch a relative API path. This has been corrected. 

  - Fixes the links to add the base URL as well for correct Article linking and linking to the correct authors Articles List page for 5+ Articles.

  Resolves #1116 

* * *

- ### Intro Wide region implementation
  Closes #1126.
  This adds the intro wide region to the block layout. This will primarily be used by images and hero units for a top banner.

* * *

- ### Add overflow-wrap to email and links
  Closes #1130. 
  Adds an overflow-wrap to the email address in the person page in order to stop the email from overflowing into the content.

* * *

- ### Updates site information region
  This update:
  - [change, security] Changes HTTP to HTTPS in some links in the site footer. Resolves CuBoulder/tiamat-theme#1114
  - [change] Removes a few special characters from the HTML source and replaces them with their HTML counterparts.

* * *

- ### Video Hero Unit vimeo error fix
  Closes #1140.
  Corrects the functionality for the video hero unit for vimeo videos.

* * *

- ### Mobile Menu Error fix
  Closes #1136.
  This adds extra checks to the mobile menu to eliminate errors.

* * *

## [20240719] - 2024-07-19

- ### Column List Style for WYSIWYG
  Helps close <https://github.com/CuBoulder/tiamat10-profile/issues/155>.
  Adds the necessary css to enable the column list styles.
  Sister PR in: <https://github.com/CuBoulder/tiamat10-profile/pull/158/>.

* * *

- ### Video Hero Unit Height Updates
  Closes #1088.
  This limits the height of the video hero unit in the edge-to-edge case. This also centers all videos to make their quality higher in all cases.

* * *

- ### Remove box shadow from Dark 4
  Closes #1119.
  Removes the box shadow from the dark 4 menu style.

* * *

- ### Block Title Fixes

  Moving of the block heading style class to the proper places allows the increase based on options picked (hero/supersize) to work correctly and not become gigantic.

  Added in the correct normal/bold options if hero strong or supersize bold is chosen.

  By default the hero and supersize should not be bolded.

  Resolves #1111

* * *

## [20240711] - 2024-07-11

- ### Email Newsletter: Style Changes

  Changes the following on the Newsletter - Email HTML:

  - Newsletter Title is no longer visible
  - Special characters render correctly in titles such as `&`
  - Fixed an issue where sometimes Section Content Article or Content Thumbnails would not display
  - Adjusts alignment for more uniform display on email clients (Note: the Email HTML display on the site is a preview and may not be a 1 for 1 representation of what will display.
  - Link colors have been made to be Gold if on a dark background
  - Adjusts `h2` heading size on emails from 32px to 20px

  Resolves #1069 

* * *

- ### Updates accordion styling

  These edits were made to make our current expandable/accordion styles more generic/global so that they would affect both the expandable block and the new accordion button that Tim made.

  Resolves #1106 

* * *

- ### Redesign of person page
  Closes #1098.
  Changes the person page to match the new template provided.

* * *

- ### Add styling for webform urls
  Closes #1096.
  Adds the dark styling to urls and links.

* * *

- ### Image Gallery Masonry option changes
  Closes #1085.
  Adds a new masonry option to image galleries. Adds the masonry library from bootstrap to enable this. Users can also set a value between 2 and 5 columns.

* * *

- ### Taxonomy clouds: adds missing body field to templates

  Adds `body` fields to the "Category Cloud" and "Tag Cloud" blocks, previously this was missing from the templates resulting in no body showing up on render even if the user entered one.

  Resolves #1090 

* * *

- ### Content List: makes URLs absolute
  Resolves #1089 

* * *

- ### People Lists: Corrects API error for >50 taxonomy terms

  The `People List Page` and the `People List Block` could run into an API error if there were >50 terms on a site for "Job Type" or "Department", due to how Drupal paginates API results to maintain performance. 

  On sites with >50 terms, this would cause a partial render of the page or block, and an error message displaying **"Error retrieving people from the API endpoint. Please try again later."** due to not having the complete list of taxonomies prior to filtering/sorting of the People.

  This has been corrected to work with an unlimited number of terms.

  Resolves #1065 

* * *

- ### Fixes Links on Blocks using JSON:API

  Previously, Pages and Blocks rendering content via JSON:API would use relative pathing, which resulted in content on multi-sites to 404.

  This has been corrected on the following:

  ### Pages

  - People List Page
  - Article List page
  - Issue Archive

  ### Blocks

  - People List Block

  - Current Issue Block

  - Latest Issue Block

  - Article List Block

  - Article Feature

  - Article Grid

  - Article Slider

  - Category Cloud

  - Tag Cloud

  - Collection Block

  Resolves #1080 

* * *

- ### Removes "social share position" setting

  [Remove] Resolves CuBoulder/tiamat-theme#1073

  Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/55)

* * *

- ### Social Media Secondary and Footer Menu update
  Closes #800.
  Sister PR in <https://github.com/CuBoulder/tiamat-theme/pull/1051#issue-2344266076>.
  Adds functionality for the social media menu to be placed in the secondary menu and the footer menu areas. This will also delete the social media menu region.

* * *

- ### Heading size fixes

  Updated the block-title class position so that the title class name is getting applied at the right level.

  Previously the block-title was wrapping the h2/h3/h4/h5/h6 so that the font-size wasn't getting applied correctly.
  Example: The block title is supposed to be 200% of the main font size (16px/1rem). That was getting applied on top of the 160% of h2 instead of h2.block-title just being made 200%. So instead of 32px it was becoming 52px. Essentially we were just double increasing, 16px\*160%\*200% rather than 16x\*200%.

  With the change of positioning on the block-title class that resolves this issue. It also fixes an issue with the block-title-increase/decrease options that we didn't know we had.

  This also tightens up the vertical spacing a bit with blocks/columns

  Resolves #1050 

* * *

- ### Updated Mobile Menu Breakpoint
  Closes #1059.
  This changes the breakpoint from 600px to 576px to match bootstrap container values.

* * *

- ### Fixes Article Block Infinite Spin

  ### Article Feature, Article List Block, Article Grid Block

  Introduced a logic bug in <https://github.com/CuBoulder/tiamat-theme/issues/1044> where the various Article Blocks on sites with a large number of Articles could be prevented from rendering the returned JSON:API data, which resulting in what seems like an infinite spinning loader. This has been corrected.

  Resolves #1066 

* * *

## [20240612] - 2024-06-12

- ### Remove aggregated categories from Collection grid
  Closes #1031.
  Removes aggregated categories as it was causing issues when there were more than 50 collection item nodes.

* * *

- ### Issue/802

  Set up new vertical alignment. 
  Aimed to use the recommended bootstrap gutters across the board. 
  Also fixed horizontal alignment for the new frame colors. 
  Added `content-frame-unstyled` and `content-frame-styled` classes to help needing less names for css calls.

  Also have padding options on sections for left/right fixed so it affects the frame rather than the entire section.

  - `theme` => <https://github.com/CuBoulder/tiamat-theme/pull/1055>
  - `bootstrap_layouts` => <https://github.com/CuBoulder/ucb_bootstrap_layouts/pull/48>

  Resolves #802 
  Resolves #1033 
  Resolves #1038 
  Resolves #548 

* * *

- ### Menus: Parent page highlight in navigation, even if child page isn't enabled in menu

  Previously there were cases where the child page wouldn't highlight the parent page in menus, specifically when that child page was disabled from the menu. This has been adjusted so that the final parent element in the menu will be highlighted as active as well.

  Resolves #1032 

* * *

- ### JSON API Consumer Block bug fixes

  ### Adjusts the following blocks/page using JSON API to also provide the site's base path (for proper multisite functionality) #1044

  - Article Grid Block
  - Article Feature Block
  - Article List Block
  - Article Slider Block
  - Current Issue Block
  - Category Cloud
  - Tag Cloud
  - Article List Page
  - Issue Archive Page

  ### Adjusted Rendering Order on Article List Blocks (Article List Block, Article Grid Block, Article Feature Block) #1049

  - Previously a more complete Article could finish processing before one that needs additional calls to complete, such as one with a missing summary waiting for the Article body to finish processing (shortening, stripping elements, adding a `...` .) This could lead to an inconsistent order of Articles being displayed, despite a sort filter on the API call and the data coming back in the proper order. The `build` method on these components has been updated so that adding approved articles to the array of `final articles` (after include/exclude/fetching needed pieces/assembly/etc) are rendered in the order they are served by the API (by Date created) instead of as they come in completed.

  Also fixes bug with Article pages made without Summary content not getting the trimmed Article content correctly in the Article collection blocks/pages. This was due to a race condition and corrected with proper async/await.

  Resolves #1044 
  Resolves #1049 

* * *

- ### Content Row: Missing image maintains layout

  ### Content Row - Large Teaser Alternate

  Omitting the optional image on `Large Teaser - Alternate` style Content Row Blocks does not affect the layout. Previously the missing image would cause the text content to span the full width of available block space, rather than the intended alternating left & right staggered pattern and has been corrected.

  Resolves #1048 

* * *

- ### Google Translate: Fix style bugs

  Resolves #1042 

  - Adds Black Background / White text option
  - Removes text-indent

* * *

- ### Adds Google Translate

  Adds Google Translate functionality to the UCB Brand Bar

  Resolves #996 

* * *

- ### Frame css

  Updated frame css for section and block styles compatibility.

  - `theme` => <https://github.com/CuBoulder/tiamat-theme/pull/1037>
  - `bootstrap_layouts` => <https://github.com/CuBoulder/ucb_bootstrap_layouts/pull/47>

* * *

- ### Expandable Color Consistency

  ### Expandable Blocks (Legacy Shortcode and Expandable Content Block)

  - `Expandable` legacy shortcode style now mirrors `Expandable Content` Block
  - Horizontal inactive tabs on the `Expandable Content` block fixed to inherit color as well.  

  Includes:

  - `theme` => <https://github.com/CuBoulder/tiamat-theme/pull/1034>
  - `migration_shortcodes` => <https://github.com/CuBoulder/ucb_migration_shortcodes/pull/25>

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/767>

* * *

## [20240604] - 2024-06-04

- ### Replaces `sr-only` Bootstrap 4 class with `visually-hidden` Bootstrap 5 class
  [Bug, a11y] Resolves CuBoulder/tiamat-theme#1021 Visually hidden (screenreader) elements briefly visible on page load

* * *

- ### Block Alignments

  Made fixes to layout alignment so that blocks will always be synced.
  The main thing is that the left edge and right edge of the row content should align properly. 
  There are very slight deviations in the 3 and 4 column options but those are normal for how css handles rows more than 2 columns. (The D7 version has the same discrepancies) 

  Test by making tones of rows with different combos of frames and background colors with various different block types

  Sister PR: <https://github.com/CuBoulder/ucb_bootstrap_layouts/pull/43>

  Resolves #847 

  <img width="1355" alt="image" src="https://github.com/CuBoulder/tiamat-theme/assets/94021017/093fb2b9-9ef0-482e-8c1c-e4619e2365b0">
  <img width="1327" alt="image" src="https://github.com/CuBoulder/tiamat-theme/assets/94021017/47778b20-de74-464a-82df-fd6185093a34">
  <img width="1421" alt="image" src="https://github.com/CuBoulder/tiamat-theme/assets/94021017/9b44b5be-8a94-4b7b-b75c-50afd4c8cce1">
  <img width="1431" alt="image" src="https://github.com/CuBoulder/tiamat-theme/assets/94021017/ecf20eac-cbe2-40a4-a752-07b3b274eded">

* * *

- ### Adds visual indicator to menu links linking to unpublished content
  Resolves CuBoulder/tiamat-theme#1004

* * *

- ### Newsletter: Style Adjustments

  ### Newsletter

  - Fixes link color to default `ucb-link` color.
  - Programmatically removes `sr-only` text from Category buttons, as Outlook clients ignore css `display:none` unless set on an outermost table so the Categories row would show up as `Categories: [Example 1] [Example 2]...` on Outlook clients. Tested on email with acid.

  Resolves #849 

* * *

- ### Content Rows: Styling Adjustments and Feature Fix

  Adjusts the following styles on the "Content Row" block:

  ### Teaser Large + Teaser Large Alternate

  - Aligns image and text to top of the row on these two display types, previously the text was centered

  ### Feature

  - Feature style display are now fixed to only show 3 items

  Resolves #1009 

* * *

- ### Content List Block: A11y Changes, Unpublished Content Appearing in Lists

  ### Content List Block

  - Adds `role="presentation" aria-hidden="true"` to image links for an improved screen reader experience
  - Removes "Read More" link from `Teaser` and `Full` display
  - Hides unpublished content from appearing in Content Lists if user is not authenticated

  Resolves #1008 

* * *

- ### Collection item category filtering
  Closes #1006.
  Removes filtering by category in the build step of the collection grid.

* * *

- ### Removes padding at the bottom of Video Reveal block image
  [Bug] Resolves CuBoulder/tiamat-theme#999

* * *

- ### Refactors block style field templates

  Refactored code to use machine name rather than label value. For grabbing machine name from list fields you need to use `element['#object'].get('FIELD_NAME').value` as machine names aren't in the render array.

  These changes affects all the background style field templates. 
  Please test each background style option to make sure I didn't mislabel something.

  Resolves #1001

* * *

- ### Updates site footer

  This update:

  - [Change] Allows items in the site primary contact info in the site footer to have a bottom margin.
  - [Change] Updates the column layout of the site footer.
  - [Change] Adds margin between columns in the site footer in case they wrap on a mobile device.

  Resolves CuBoulder/tiamat-theme#985

* * *

- ### Change collection categories revision id to tid
  Closes #997.
  Changes the search from collection category revision id to tid to solve an issue in migration.

* * *

- ### Text Block: Adds Alert Block Style

  ### Text Block

  Adds a new "Alert" style to the Text Block, useful for alerts or notifications on your site.

  Includes:

  - `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/991>
  - `custom-entities` => <https://github.com/CuBoulder/tiamat-custom-entities/pull/145>

  Resolves #880 

* * *

- ### Fix Collection Grid issues.
  Closes #954. 
  Now correctly generates all collection item nodes. It also now limits collection item nodes by selected category filters as well.

* * *

- ### Video Hero: restores draggability in LB

  ### Video Hero Block

  - Restores dragability in Layout Builder.

  Includes:

  - `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/989>
  - `custom-entities` => <https://github.com/CuBoulder/tiamat-custom-entities/pull/144>

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/988>

* * *

- ### Hero Unit: Fixes Draggability in Layout Builder

  Fixes the draggability of the "Hero Unit Block" in Layout Builder. 

  Draggability requires `{{attributes}}` to be applied to the outermost container in the Twig template. This change alters the inner containers to use different methods to apply classes and styles rather than also using the `{{attributes.addClass()}}`

  Resolves #746 

* * *

- ### Person Page: Articles by Person Changes

  ### People Page Changes

  #### Articles by Person Block

  - Article card border size set to `1px`
  - Adjusts heading level of the Articles by Person block on a Person Page, from `h3` to `h2`
  - Adds a `Read More Articles by <name>` link if >5 Articles by that Person, leading to the Article List taxonomy View to show all the Articles that Person has been set as on the Article's byline field

  Resolves #961 

* * *

- ### Article Blocks: A11y fixes, External Article Handling

  ### Article List Blocks: External Article Handling ( "Article Grid Block", "Article List Block", "Article Feature Block" )

  - Adds edge case to handle Article pages displaying in the "Teaser" style `Article List Block` that may not have an Article body or summary field added, such as an external article reference with no summary added.

  #### Article Grid + Article Feature Accessibility Changes

  - Adjusts to accessibility standards for repeated links on the "Article Grid" and "Article Feature" blocks, all links other than the title have been set to `aria-hidden = "true"`. Images with links set to `role="presentation"` to prevent screen readers from repeating link information two or three times.
  - Some JavaScript code formatting, no functionality changes.

  #### CSS Fixes

  - Article Feature: The secondary Articles needed additional margin between the thumbnail and the title/link of the Article
  - Article List Block: The entire element had left/right padding preventing alignment with other blocks.

  Resolves #971 

* * *

- ### Creates Webform page template
  [Bug, Change] Resolves CuBoulder/tiamat-theme#982

* * *

- ### People List: Table style A11y and Style Changes

  Changes the following on the `People List Page`, specifically in "Table" style:

  - Makes the email field have screen reader text "Email <personsName>", rather than just "Email"
  - Fixes border style of the table

  Resolves #974
  Resolves #975 

* * *

- ### Updates Collection Grid block
  [Bug] This update fixes a bug causing the text container of a collection item to be the incorrect width. Resolves CuBoulder/tiamat-theme#958

* * *

- ### Overrides Webform template
  [a11y, Change] This update adds an `aria-live="polite"` to all webforms. Resolves CuBoulder/tiamat-theme#938

* * *

- ### Adds bug fixes for the dark 2 menu style
  [Bug] Resolves CuBoulder/tiamat-theme#973 

* * *

- ### Removes unused `sr-only` element from article lists
  This update:
  - [a11y, Remove] Removes unused `sr-only` elements from article list "read more" links. Resolves CuBoulder/tiamat-theme#932
  - [Change] Improves the readability of article list JavaScript files (no changes in functionality should be observed).

* * *

- ### Slider: "Right-side Content Overlay" styles

  ### Slider: "Right-side Content Overlay"

  Fixes some overlay issues on smaller screen sizes where the right side overlay wouldn't span the full height and longer strings of text was pushed into non-viewable areas of the slider due to a width setting. 

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/980>

* * *

- ### Slider: Right-side Content Breakpoint

  Previously the D10 breakpoint for the `Right-Side Content` style `Slider` block would stack the content under the image at a Tablet breakpoint. 

  This has been updated to stack under the image at a Mobile-sized breakpoint, while the 75% text size reduction will continue to apply earlier at the Tablet breakpoint to mirror D7.

  Resolves #917 

* * *

- ### Fixes missing padding at the top of Content Grid items
  [Bug] Resolves CuBoulder/tiamat-theme#965

* * *

- ### Fixes page title not being draggable in Layout Builder
  Resolves CuBoulder/tiamat-theme#969

* * *

- ### Fixes blocks not appearing in the Footer region
  Resolves CuBoulder/tiamat-theme#945

* * *

## [20240513] - 2024-05-13

- ### Removes white margins from Dark Mode Article

  Previously, a margin wrapper would apply white top and bottom margins to a dark mode article creating horizontal white bars surrounding content. This has been adjusted so the dark background color spans the entire article.

  Resolves #946 

* * *

- ### Title and Scroll Fix

  Fixes title coloring as well as the extended horizontal scroll bar for hero and video hero.

  Sister PR: <https://github.com/CuBoulder/ucb_bootstrap_layouts/pull/41>

  Resolves #918 

* * *

- ### Update block--video-hero-unit.html.twig

  Fixes for the title error

  Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/138>

  Resolves #874 

* * *

- ### Cleans up Collection Grid block template
  [Bug] An issue existed where one of the `<div>` elements in the Collection Grid block template wasn't closed properly. This update cleans up the template and resolves the issue. Resolves CuBoulder/tiamat-theme#948

* * *

- ### Removes horizontal and advanced content sequence blocks

  [a11y, Remove] The horizontal and advanced variants of content sequence aren't properly accessible to screenreader users. This update removes them. Resolves CuBoulder/tiamat-theme#934

  Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/137)

* * *

- ### Add in base font colors for collection grid
  Resolves CuBoulder/tiamat-theme#929 and resolves CuBoulder/tiamat-theme#930.
  Adds base font colors for links and text to fix bugs related to background styles.

* * *

- ### Fix breadcrumbs (again)

  Removing the block is needed. It was adding extra steps that didn't need to be there.

  The `is not empty` need to be changed to `!= ""` because the empty check still sees arrays as content.

* * *

- ### Fixes a bug with links in Content Sequence blocks

  Links to Drupal routes would incorrectly display `internal:` URIs instead of public URLs. This update fixes the bug.

  Resolves CuBoulder/tiamat-theme#926

* * *

- ### Changes basic page title to enhance accessibility

  This update:

  - Adds an invisible `<h1>` at the top of every basic page for screen readers, tagged with `sr-only`.
  - Converts the existing page title from `<h1>` to `<div>` with `aria-hidden="true"`.

  Resolves CuBoulder/tiamat-theme#931

* * *

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

* * *

- ### A11y for Content Rows

  ### Content Row: Accessibility Fixes

  - Adjusts DOM order for consistent assistive readability on the `Content Row` display options and reorganizes using pure CSS where applicable
  - Adds `role="presentation" and aria-hidden="true"` to links on images so only the title link is read with assistive technologies

  Resolves #907 

* * *

- ### Adjust mobile float image size
  Closes #891 . Increases minimum floated image size to 50% on mobile and decreases the text size to 85%.

* * *

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

  Note: The Article Slider uses [Flickity ](https://flickity.metafizzy.co/) to generate and there are currently Issues related to accessibility awaiting to be addressed on their end: <https://github.com/metafizzy/flickity> . We may be able to remove our A11y fixes to this custom element once these changes are approved there.

  Resolves #900
  Resolves #906
  Half of #908 

* * *

- ### Fixes error occurring when Content Grid items or social media links are linked to a Drupal route
  Resolves CuBoulder/tiamat-theme#921

* * *

- ### Updates Content Grid block
  This update:
  - [a11y] Removes all `<h3>` tags and replaces them with `<strong>`. Resolves CuBoulder/tiamat-theme#899
  - [a11y] Adds two items; Resolves CuBoulder/tiamat-theme#905:
    - Adds `role="presentation" aria-hidden="true"` to the image's container. 
    - Reorders image and title in the DOM such that the title comes first.
  - [Change] Refactors Content Grid block without changing its functionality:
    - Reduces the line count of `block--content-grid.html.twig`.
    - Removes several unnecessary files, including dead code templates and a totally unnecessary JavaScript method of setting the height on grid items.

* * *

- ### Updates Video Reveal block to not mute by default
  Resolves CuBoulder/tiamat-theme#901

* * *

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

* * *

- ### Changes `<h5>` to `<h2>` in site footer
  Resolves CuBoulder/tiamat-theme#911

* * *

- ### Update block--system-menu-block.html.twig

  Sister PR: <https://github.com/CuBoulder/ucb_bootstrap_layouts/pull/38>
  Sister PR: <https://github.com/CuBoulder/tiamat10-profile/pull/119>
  Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/135>

  Added an if statement to not render menus if there is no content within. 
  This is needed for the new layout setup.
  This should not affect anything other than the new layout.

  Closes #897 

* * *

- ### Fixes Search page style regression
  Resolves CuBoulder/tiamat-theme#893

* * *

- ### Adds Wallpaper image style to hero units and video reveal
  Resolves #804.
  Sister pull requests in <https://github.com/CuBoulder/tiamat10-profile/pull/114>, <https://github.com/CuBoulder/tiamat-custom-entities/pull/132>.

* * *

- ### Newsletter: One Article or One Custom Content in a Section

  ### Newsletters

  There is a special case for if a Newsletter Section set to "Teaser" display has only one Article or one item of Section Custom Content, then it should span the full width of the web newsletter. This is only the case for a single item in a Newsletter section, odd numbered counts are still 50%. The email version of the Newsletter is unaffected.

  Resolves #895 

* * *

- ### Updates regions
  This update:
  - [Bug] Adds proper containers to above and below content, fixing incorrect margins. Resolves #819
  - [Change, Remove] Adds template for Layout Builder pages. Removes above content, breadcrumbs, sidebar, and below content regions from Layout Builder pages. Resolves #896
  - [Remove] Removes above content region from search, taxonomy, user, and 403 pages. Resolves CuBoulder/tiamat-theme#877

* * *

- ### Adds sortable table style changes
  This update resolves two style issues with sortable tables in Webforms. It:
  - [Bug] Corrects the display of drag icons. Resolves CuBoulder/tiamat-theme#786
  - [Change] Decreases the font size of the "Show row weights" button. Resolves CuBoulder/tiamat-theme#787

* * *

- ### Articles Slider: Articles without thumbnails are omitted from display

  Article Feature: Previously, Articles without thumbnails would still show up in the slider but with a broken image. This has been adjusted so these incomplete Articles are completely omitted from display and only Articles with thumbnails are shown.

  Resolves #881 

* * *

- ### Removal of all how-to files
  Sister request to <https://github.com/CuBoulder/tiamat-custom-entities/pull/134>.
  Removes all necessary how-to files.

* * *

- ### Article Feature: Adjusts spacing

  Adjusts spacing on Article Feature blocks between thumbnail and title. Fixes the secondary Article row so titles don't overlap into the next Article's thumbnail

  Resolves #859 

* * *

- ### Update hero-unit.css

  The main part of this is found in PR: <https://github.com/CuBoulder/ucb_bootstrap_layouts/pull/35>

  Added css for fixing default block style icon display It would cause the hero units to shrink like the contextual links would. This is mainly a fix for the layout builder view.

  Closes #840 
  Closes #777 
  Closes #745

* * *

- ### Delete Article Hero Unit CSS
  Removes the unused article hero unit code.

* * *

- ### Newsletter: Adds Optional URL to Newsletter Custom Content

  Adds the optional URL field for Newsletter Section's Custom Content.

  Includes:

  - `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/882>
  - `custom-entities` => <https://github.com/CuBoulder/tiamat-custom-entities/pull/131>

  Resolves #872 

* * *

- ### People Lists: Allows for more than 50 People

  Previously a maximum of 50 People were being displayed on the People List Page and the People List Block. This has been fixed to allow all People existing on a site to be pulled into these Content Types. 

  Resolves #830 

* * *

- ### Newsletter: Moves social links from Node to Newsletter term

  Resolves #867 

  Includes:

  - `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/871>
  - `custom-entities` => <https://github.com/CuBoulder/tiamat-custom-entities/pull/130>

* * *

- ### Update block--content-grid.html.twig

  Check to see if there is an image url available in `if` statements Edited the `else` to be an `elseif` for the same checks for second image_style option.

  These fix the missing image notice

  Test by creating a content grid without an image chosen, result should have no user notice in the dlog

  Closes #866 

* * *

- ### Updates Image Gallery block

  This update:

  - Changes Image Gallery block image spacing to be consistent.
  - Removes some styles that were redundant to the ones Bootstrap provides.

  Resolves CuBoulder/tiamat-theme#854

* * *

- ### Fixes error thrown by Social Media Icons block email field

  It throws a console error despite working just fine. This update removes the error.

  Resolves CuBoulder/tiamat-theme#862

* * *

- ### Adds two minor style changes
  This update:
  - [Bug] Adds missing `href` attribute to links in Expandable blocks. Resolves CuBoulder/tiamat-theme#853
  - [Change] Resets styles targeting `<abbr>` tag in Events Calendar blocks. Resolves CuBoulder/tiamat-theme#837

* * *

- ### Adjusts spacing between sibling blocks within a column
  Resolves #820 

* * *

- ### Issue Page: Section Title is now optional

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/852>

  Includes:

  - `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/855>
  - `custom-entities` => <https://github.com/CuBoulder/tiamat-custom-entities/pull/127>

* * *

- ### Updates Collection Grid block

  This update:

  - [Bug] Addresses item positioning for rows with two items. Resolves CuBoulder/tiamat-theme#833
  - [Bug] Addresses longer filter labels not wrapping properly. Resolves CuBoulder/tiamat-theme#822
  - [Change] Changes font sizes to match D7 Express. Resolves CuBoulder/tiamat-theme#823
  - [Bug] Removes JavaScript error for items with no body.

  Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/126)

* * *

- ### Newsletter: Social Links in Footer now PNGs

  Modifies the Social Menu in the Newsletter - Email HTML version footer to use fixed PNGs rather than SVG, ensuring compatibility across all email clients. 

  Resolves #828 

* * *

- ### Fixes button color bug; Reverts Hero Unit padding
  Resolves CuBoulder/tiamat-theme#836

* * *

- ### Updates Social Media Icons block and Social Media menu

  This update:

  - Refactors the Social Media Icons block and Social Media menu to both use the same macros. Un-spaghetties the template code to make it a bit more readable.
  - Improves the robustness of social media link platform detection. Only root domains are used for detection.
  - Resolves an issue causing the email link to be pushed down to a new line in the inline view.
  - Fixes a typo in Pinterest causing it to not be detected properly and show up as a generic link.

  Resolves CuBoulder/tiamat-theme#795

  Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/120)

* * *

- ### Forms: Required Fields indicated by a red asterisk
  Resolves #825 

* * *

- ### Adjusts style of Links in Content Grid - Cards

  Since Content Grids with a "Cards" layout selection always have a white background, the link colors are a consistent blue following the established white background link style, rather than adopting whatever the block background's link styles are.

  Resolves #776 

* * *

- ### Local task buttons more buttony
  Closes #749.
  Makes the anchor tags within the local tasks block larger to cover the whole button as a clickable link.

* * *

- ### Remove 'Rebuild Layout' Button, Bold 'Save Layout' button on Layout UI

  Resolves #811 

  Removes 'Rebuild Layout' button, adds bold effect to 'Save Layout' button

* * *

- ### Form Block: Fixes bug preventing editing in Layout Builder

  Form block was missing template markup required to allow editing in Layout Builder. This has been corrected.

  Resolves #789 

* * *

- ### Article List Block - Display Fixes

  - Fixes bug where more Articles would display than count specifies
  - Articles without thumbnails aren't indented (Teaser and Title & Thumbnail styles)
  - Adjusts alignment of thumbnails and borders to align to container (Teaser and Title & Thumbnail)

  Resolves #799 

* * *

- ### Fixes Video Reveal block video size bug
  Resolves CuBoulder/tiamat-theme#766

* * *

- ### Block Styles update

  Added block styles to video hero
  Fix styling errors for full width

  Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/118>

  Closes #744 

* * *

- ### Styles Layout UI Buttons

  Changes the style of the Layout UI buttons to mirror the appearance of the local tasks menu, to further differentiate these from buttons placed in site content and avoid confusion

  Resolves #763 

* * *

- ### Corrects Webform button colors

  Regular buttons are light gray, while the next and submit buttons are blue.

  Resolves CuBoulder/tiamat-theme#757

* * *

- ### Updates Articles

  This update:

  - Removes margin at the top of articles with header image.
  - Moves header image caption to immediately below header image.
  - Removes options for black text or hiding the overlay on the header image, setting the white text on dark overlay as the default.
  - Updates description of the article header image text field.

  Resolves CuBoulder/tiamat-theme#791
  Resolves CuBoulder/tiamat-theme#790

  Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/117)

* * *

- ### Removed stray character typo on the video reveal block
  Removed the "A" hard-coded in the render of the text of the video reveal block.  

* * *

- ### Image caption fix for long captions
  Closes #716.
  Adds styling for dynamic sizing for images are aligned right or left.

* * *

- ### Article Slider: Fix with 6+ Articles

  Fixes a bug where 6+ Articles would cause the `Article Slider` to additionally repeat Articles in a long column

  ![image](https://github.com/CuBoulder/tiamat-theme/assets/85851903/b1a1e9f3-1ea7-484b-a11b-cd9205b3db60)

  Resolves #781 

* * *

- ### Additional Issue Fixes

  ## "Issue" Content Type Changes

  - Fixed a bug where all Articles in a section would link to the first Article in the section
  - Articles that do NOT have a thumbnail or a summary will no longer show the Categories
  - Fixed bug that would sometimes cause images to break display in Title + Thumbnail renders
  - Changed "Feature" style images to take up 100% of the available space and keep an aspect ratio consistent with other Feature images
  - Added spacing between Cover Image and Body, as well as between the Main Menu of the site and the Node Title of "Issue" pages

  Resolves #772 

* * *

- ### Updates styling of Form page content type and Webform block

  Form fields now extend full width. Fieldset labels have also been updated to be closer to the D7 Express version. Styles moved to the global scope to also apply correctly to the Webform block placed on a basic page.

  Resolves CuBoulder/tiamat-theme#755
  Resolves CuBoulder/tiamat-theme#762
  Resolves CuBoulder/tiamat-theme#768

* * *

- ### Update style.css

  Fix to oembed video alignment
  Other styles were user error.
  Hero Unit fixes are coming in a separate Hero Unit PR

  Test by adding a video media embed to a text block in multi-column sections (then float in any direction)

  Closes #769 

* * *

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

  - `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/773>
  - `custom-entities` => <https://github.com/CuBoulder/tiamat-custom-entities/pull/113>

  Resolves #765 

* * *

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

  - `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/770>
  - `custom-entities` => <https://github.com/CuBoulder/tiamat-custom-entities/pull/112>

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/706>

* * *

- ### content list updates
  Closes #680. 
  Reformats the content list to be readable and adds QoL changes.

* * *

- ### item render fix

  Needed to add `.content` to the item renders otherwise we get hit with lots of php errors because the attributes are trying to render for each item.

  Closes #752 

* * *

- ### Update layout-builder-styles.css

  Add margin replacement for content frames with background colors

  Sister PR: <https://github.com/CuBoulder/ucb_bootstrap_layouts/pull/28>

* * *

- ### Block Style Updates

  Fixed hero and event calendar classes showing in content 
  Fixed color layering and cascading
  Added `None` as an option for `Block Style` background color

  Closes #615 
  Closes #711 
  Closes #737 
  Closes #740 
  Closes #743 

  Related PR: <https://github.com/CuBoulder/ucb_bootstrap_layouts/pull/26>
  Related PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/109>

* * *

- ### Fixes missing video in otherwise empty text block

  Fixes a CSS bug which caused a video in an otherwise empty text block to go missing.

  Resolves CuBoulder/tiamat-theme#741

* * *

- ### Class Notes: Adds URL Parameter Filtering

  Adds URL Parameters to `Class Notes List` pages. Can pass dates via `startDate` and `endDate` parameters to automatically filter retrieved `Class Notes` by date published like so:

      ?startDate=2023-12-05&endDate=2024-02-06. 

  (_Would retrieve class notes published between 12/5/2023 and 2/6/2024_)

  - Parameters must be passed in the following formats: `YYYY-MM-DD` or `MM-DD-YYYY`
  - If you pass only a `startDate` parameter, `endDate` will default to today's date

  Resolves #694 

* * *

- ### Block styles

  Template updates for every inline block.
  Addition of block styles (bs) fields 

  Closes #443 
  Closes #111 

  Sister PR: <https://github.com/CuBoulder/tiamat10-profile/pull/99>
  Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/106>

* * *

- ### Issue Display Changes

  Fixes the following on Issue Content Types:

  - Removes the Secondary Image field from the form and page display. Also removes the hard-coded dark gray box with the title and body in it, as users can use CKEditor5 plugins such as Box, Button, Icons, and Media Library to achieve a variety of left-side layouts. 
  - Fixes bug with Teaser view of Categories displaying improperly
  - "Read More" capitzalized via CSS instead of hard-coded

  Includes:

  - `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/730>
  - `custom-entities` => <https://github.com/CuBoulder/tiamat-custom-entities/pull/107>

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/704>

* * *

- ### Fix spirit menu style
  Closes #712.
  Small change to fix padding issue for the spirit menu style

* * *

- ### Mobile Footer Menu Changes
  Closes #722.
  Adds CSS changes for the footer menu to only show in the secondary menu when it is a mobile view.

* * *

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

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/718>
  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/719>
  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/724>
  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/714>

* * *

- ### Issue and Issue Archive use Media Library images

  Changes the Issue cover image field to use the Media Library images rather than the default. This change requires creating an additional consumer in `Focal Image Enable` to use un-cropped image styles from JSON:API as well as modifying the Issue Archive, Current Issue Block, and Latest Issue Block build processes to use that un-cropped image.

  A spinning loader was also added to the Issue Archive, and Issue Blocks prior to displaying results on page rather than flashing in. 

  Includes:

  - `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/707>
  - `tiamat-custom-entities` =>  <https://github.com/CuBoulder/tiamat-custom-entities/pull/105>
  - `ucb-focal-image-enable` => <https://github.com/CuBoulder/ucb_focal_image_enable/pull/8>

  Resolves [#104 ](https://github.com/CuBoulder/tiamat-custom-entities/issues/104)

* * *

- ### Fixes Infinite Load Article List Blocks

  Resolves #713 

  Should address the condition where too many Articles causing an issue with how JSON:API handles pagination and subsequent API calls in the Article List blocks

* * *

- ### Resolves an issue causing the category or tag icon to appear if none are visible
  Resolves CuBoulder/tiamat-theme#701 

* * *

- ### Updates `block--site-info.html.twig`

  CuBoulder/ucb_migration_shortcodes#15

  Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/49)

* * *

- ### Updates Taxonomy page styles

  - [Bug] Headers on Taxonomy pages are now consistent with the site setting.
  - [Change] The "Subscribe to x" link has been hidden.

  Resolves CuBoulder/tiamat-theme#697

* * *

- ### video reveal html text
  Closes #662.
  Changes necessary files to enable an html text field.
  Sister pull request in <https://github.com/CuBoulder/tiamat-custom-entities/pull/100>.

* * *

- ### Collection Grid preview change
  Helps close <https://github.com/CuBoulder/tiamat-custom-entities/issues/101>.
  Adds the necessary theme changes to allow for the html preview field.

* * *

## [20240221] - 2024-02-21

- ### Fixes bug with floated items in Expandable Content block
  Resolves CuBoulder/tiamat-theme#682

* * *

- ### Adds mobile menus! changes

  - Forces menu styles off on mobile screen sizes.
  - Adds CSS styling to the menu.
  - Styles the "hamburger" icon.
  - Expands all main menu child menu items. (Resolves CuBoulder/tiamat-theme#647)

  Resolves CuBoulder/tiamat-theme#653

  Sister PR in: [tiamat10-profile](https://github.com/CuBoulder/tiamat10-profile/pull/82)

* * *

- ### Content Row: Block Changes

  Adjusts the following on the `Content Row` blocks:

  - On the "Configure Block" modal, switched the order of the tabs so 'Row Content' is on the left and open by default and 'Row Design' is on the right and hidden
  - Added three teaser displays: `Large Teaser`, `Large Teaser Alternate`, and `Teaser`. Previously the teaser displays available were Teaser and Teaser Alternate.
  - The `Large Teaser` and `Large Teaser Alternate` displays use the focal image wide style images rather than square.
  - Adjusts style of the `Teaser` display to mirror other teaser-list style elements, such as the Article List. 
  - Adjusted style of the `Tile` style display to more closely mirror the D7 version, which achieved the tile effect with images and text alternating. 
  - Fixes bug where internal links, such as `/homepage` would cause a WSOD when added to Row Layout Content

  Includes:

  - `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/687>
  - `custom-entities` => <https://github.com/CuBoulder/tiamat-custom-entities/pull/99>

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/673>
  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/674>
  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/675>

* * *

- ### Issue/665
  Closes #665, #666, #668, #669, and #670. Adds the necessary bug fixes and code changes for content sequences.   

* * *

- ### Primary Link Twitter Icon
  Fixed pull request for #683.
  Fixes twitter link icon for primary links on person page

* * *

- ### Updated Social Media Block
  Closes #12.
  Sister pull request in custom entities at <https://github.com/CuBoulder/tiamat-custom-entities/pull/97>.

* * *

- ### default table styles
  Adds default table styles. The issue brought up by kevin seems to be non-replicable and already solved, but should be kept as a note for future issues.

* * *

- ### Standardizes Display of Accordion - style Elements

  Standardizes style of Accordion elements. This modifies the style of the `FAQ Page` and `Expandable Content` block in the following ways:

  - Adjusts the `FAQ Page` to mirror the Expandable Content's style (blue text, larger type, red hover, + / - icons on toggle instead of a chevron)
  - Removes the underlined text-decoration on `Expandable Content`'s title links

  Resolves #672 

* * *

- ### Class Notes List Changes

  - Adds images and adjusts the style of the `Class Notes List` page to mirror the Teaser-List display of other List-type nodes
  - Allows for `Class Note` Content types to have multiple images (custom-entities)

  Includes:

  - `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/657>
  - `tiamat-custom-entities` => <https://github.com/CuBoulder/tiamat-custom-entities/pull/95>

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/206>

* * *

- ### Removes third-party services

  Moves all associated code into the Site Configuration module.

  Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/48)

* * *

- ### image gallery bug fix
  Closes #642.
  Quick fix to make image gallery work.

* * *

- ### People List Page & People List Block - Bug Fixes & Edge Case Handling

  Provides the following bug fixes to the `People List Block` and the `People List Page`

  ## People List Page & People List Block

  - Fixes a bug with internal links throwing an error. Adjusts so internal links will convert to absolute pathing, which should allow for our multi-site, single domain sites to use internal links. 
  - No termId present on a Person causing a JavaScript error preventing a full render. Was able to cause this error with multiple people and one without any terms attached. This error was present on both `People List Page` and `People List Block`.
  - Swaps Twitter's bird to Twitter's X... ( X 's X?)...whatever you want to call it, the bird icon is now an X icon.

  ## People List Page Only

  - No terms existing for a taxonomy, and the `People List Page` having that taxonomy selected for `Group By` caused a white screen and no errors. Adjusted this to show an error specifying the reason for a white screen: `Grouping by ${groupBy} is requested, but taxonomy data is missing. Please adjust your page's 'Group By' setting or make sure taxonomy data exists for that term.`
  - Terms existing for a taxonomy and `Group By` for that taxonomy selected on a `Person List Page`... but no Person has terms on that taxonomy caused the same white screen. Adjusted this to show an error specifying this white screen case: `No results found for the '${groupBy}' grouping.`

  Resolves #659 

* * *

- ### Adds Collection Grid block fixes
  Closes #649.
  Adds the required fixes to add an indicator for single select list, fix id's showing, and make the block a web component.

* * *

- ### Removes background colors from Content List

  Removes background colors from the Content List

  Resolves #651 

* * *

- ### Newsletter: Minor Bug Fixes

  Adjusts the following on the Newsletter:

  - If user elects to omit the optional image on a _Newsletter Taxonomy_, it will no longer render that img element in the header
  - **Article Sections ( _Feature Style_ )** - For the Feature Style Article Sections, Articles without a thumbnail will check the Article for an Image uploaded as Article Content, and use that in place of a thumbnail if available. This functionality worked in the Teaser display, but there was an error that would prevent the backup image to display in the Feature Style render.

  Icon linking has been resolved by <https://github.com/CuBoulder/tiamat-theme/issues/604>

  Resolves #595 

* * *

- ### Updates sidebar regions

  Resolves CuBoulder/tiamat-theme#633

  Sister PR in: [tiamat10-profile](https://github.com/CuBoulder/tiamat10-profile/pull/77), ~~[ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/45)~~

* * *

- ### Class Note Enhancements

  Adjusts permissions for Class Notes, adds optional image field. Resolves <https://github.com/CuBoulder/tiamat-theme/issues/622>

  Includes:

  - tiamat-theme => <https://github.com/CuBoulder/tiamat-theme/pull/648>
  - tiamat-profile => <https://github.com/CuBoulder/tiamat10-profile/pull/75>
  - custom-entities => <https://github.com/CuBoulder/tiamat-custom-entities/pull/94>

* * *

- ### Adds Collection Grid block and Collection Item content type
  Closes #534.
  Adds the collection grid block and collection item node page

* * *

- ### Enables list styles in full HTML, Creates Migration Library

  Using Full HTML you can create various list styles found here: <https://styleguide.colorado.edu/content/lists>
  Also creates a temporary migration library for addtl styles needed for the migration process

  Resolves #624 

* * *

- ### FAQ Content Type

  Adds the FAQ Content Type. Resolves <https://github.com/CuBoulder/tiamat-theme/issues/620>

  Includes:

  - tiamat-theme (issue/tiamat-theme/620) => <https://github.com/CuBoulder/tiamat-theme/pull/641>
  - custom-entities (issue/tiamat-theme/620) => <https://github.com/CuBoulder/tiamat-custom-entities/pull/92>
  - ucb-admin-menus (issue/tiamat-theme/620) => <https://github.com/CuBoulder/ucb_admin_menus/pull/20>

* * *

- ### Update style.css

  Removal of layout builder styles (lots of this was gin fixing)
  Fix for Text Block title edit issue

  Sister PRs:
  <https://github.com/CuBoulder/tiamat10-profile/pull/69>
  <https://github.com/CuBoulder/ucb_bootstrap_layouts/pull/23>
  <https://github.com/CuBoulder/tiamat10-project-template/pull/30>

  Closes #638 

* * *

- ### Claro theme mini-update
  Fixes for the `layout-container` and local-tasks css

* * *

- ### Adds label fields for "Department" and "Job Type" on People List Pages

  Resolves CuBoulder/tiamat-theme#626

  Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/44)

* * *

- ### Claro theme
  Updated theme files to accommodate the change to Claro.

* * *

- ### Adds Class Note Page + Class Notes List Page

  Adds the `Class Note` Node and `Class Note List` node. A Class Note List Page lists your Class Notes and has built in filters to allow visitors to filter by year or sort by class year or date posted.

  Includes:
  `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/621>
  `tiamat-custom-entities` => <https://github.com/CuBoulder/tiamat-custom-entities/pull/91>

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/588>

* * *

- ### Fixes accessibility issues with Article and Article List

  - Adds alt text to Article List images.
  - Enhances readability and fixes bugs with article title backgrounds.

  Resolves CuBoulder/tiamat-theme#616

* * *

- ### Fixes expandable content `aria-expanded` errors
  Resolves CuBoulder/tiamat-theme#614

* * *

- ### Updates theme-provided 403 page; removes 404 image

  - Updates the theme-provided 403 page. This won't be visible often, as an anonymous user is redirected to the login page instead of being shown this page (CuBoulder/ucb_admin_menus#14).
  - Removes 404 image. CuBoulder/ucb_default_content#6

  Sister PR in: [ucb_default_content](https://github.com/CuBoulder/ucb_default_content/pull/8)

* * *

- ### Breadcrumb fix

  This render didn't need to be added to the if statement. 
  Fixed formatting as well.

  Closes #585 

* * *

- ### Title on Homepage no longer visible

  This fixes the functionality where a title is hidden when set as the site's homepage. This was previously working before a moveable title refactor and has been corrected.

  Resolves #607 

* * *

- ### Hero unit separation

  Hero Unit Separation

  Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/90>

  Closes #605

* * *

- ### Form Page - Adds Body Field

  The Form Page node's body displays above the attached form.

  Resolves #599 

* * *

- ### Events Calendar Background matches Section background color

  Adjusts the `Events Calendar` so it matches the background color of the section it is placed in, rather than being always white. Text color adjusted to white for black and dark gray section backgrounds. 

  @jcsparks - Let me know if gold section background needs some text color adjustments, I could make an override for that that makes the text a darker gray / black than the default. 

  Resolves #564 

* * *

- ### Social Media Menu - Now Icons Only

  Social Media Menu is now icons only, fixes bug where the site name would display. Fixes spelling of 'Facebook'.

  There was a: `<span class="vertical-icon-span"> * _siteNameHere_ * </span>`  on the template that was causing the site names to appear next to the respective logo on each link in the social media menu. These spans did not appear to be used anywhere else in d10, so they were removed to resolve the issue.

  Resolves #586 

* * *

- ### Fixes error on Newsletter pages
  Resolves CuBoulder/tiamat-theme#596

* * *

- ### Fixes Embedded Video not displaying, if also Aligned

  Adds a custom CSS override to Embedded Videos, if also aligned via CKeditor5, in order to prevent a visual bug where they becoming hidden if floated left/right or centered on a rendered page. This bug was caused by our customized embedded video style and the default alignments (left,right,center) conflicting. 

  Resolves #561

* * *

- ### Standardizes padding at the top of pages

  This theme update:

  - Corrects padding at the top of pages to a standard `20px`. Resolves CuBoulder/tiamat-theme#579
  - Cleans up some code in multiple content type templates and stylesheets.

  It may take longer to test due to the number of files changed.

* * *

- ### Secondary Menu Updates
  Closes #551.
  Adds button functionality to secondary menu and fixes other small misalignments.

* * *

- ### Adds Styling to Newsletters

  Adds the following switchable styles to the email version of the Newsletter: Classic, Minimal, Light-Boxed, Dark-Boxed, Simple. 

  This change also applies the selected `Newsletter` taxonomy's custom header image and footer into your email HTML. 

  For testing:

  - Create a taxonomy for `Newsletter`-- choose a custom header image, create a footer, and select a style. 
  - Select this taxonomy when creating a Newsletter page.
  - After creating your page go to `Edit` and `Preview`. After selecting preview, on the right hand side change the `View Mode` dropdown to `Email: HTML`
  - If you click the `Click to copy your Newsletter HTML` button, your email HTML will automatically be copied to clipboard, or you can select the HTML from the input. You can demo this by creating an HTML file and doing a Live Preview, or using a program like Email on Acid to test display ( although this will not show images served by localhost)

  I recommend two tabs when testing styles, one with the Email:HTML preview and one with `Edit taxonomy` term to change styles or other fields, then just refresh the Email:HTML preview. 

  Resolves #273 , Resolves #137 , Resolves #305 

* * *

## [20231212] - 2023-12-12

- ### Issue/567

  Changes to the teaser alternate so that the image divs are displayed empty if they have no image in them.
  This is so that the teasers actually alternate properly for staggered text.

  Closes #567 

  Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/88>

* * *

- ### Fixes Article Slider Bugs + Style Refinements

  ### Article Slider Changes

  #### Bug Fixes:

  - Adds condition where 6 articles filtered 'good' but additional articles available (10+ which triggers JSON API pagentation), this previously failed to render.
  - Fixes console error related to innerText (Removed old code for generating a Date and Body)

  #### Style Refinements:

  - The thumbnail image now uses `Focal Image Wide` rather than `Focal Image Square`
  - Spinning Loader is centered on the block

  Resolves #580 

* * *

- ### Adds a theme setting for heading font

  The setting defaults to _Bold_ but can also be set to _Normal_. Resolves CuBoulder/tiamat-theme#516.

  Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/39)

* * *

- ### Styles search results page

  Resolves CuBoulder/tiamat-theme#535 – A site's search page created using the [Google Programmable Search Engine](https://www.drupal.org/project/google_cse) module is now styled properly. Correct settings for the search page (may already be defaults):

  - Display Drupal-provided search input: **✓**
  - Display search results: **On this site (requires JavaScript)**
  - Layout of Search Engine: **Results only**

  "Display Google watermark" is on for D7 Express and works fine here too, whether to enable it is a possible future topic of discussion.

* * *

- ### CU Boulder Site Configuration 2.6

  This update:

  - Moves all settings from "Pages and Search" into "General". Search settings are now advanced settings.
  - Replaces the "Pages and search" and "Related articles" tabs with a brand new "Content types" tab. All "Related articles" settings have been moved into "Content types".
  - Replaces the `edit ucb pages` and `configure ucb related articles` permissions with a new `edit ucb content types` permission.
  - Moves the People List filter labels and Article date format into "Content types".
  - Moves the GTM account setting into "General" as an advanced setting.

  CuBoulder/ucb_site_configuration#36

  Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/38), [tiamat10-profile](https://github.com/CuBoulder/tiamat10-profile/pull/53)

* * *

- ### Enhanced Screen-Reader Text on 'Read More' links for Articles served by Article List Pages + Article Blocks

  Enhances accessibility text on the `Article List` Page and variations of `Article List Blocks` , where links to Articles were previously only 'Read More'. Screen readers will now state "Read more about &lt;Article's Title>" in these cases, providing more context to users using a screen reader.

  Resolves #570 

* * *

- ### Corrects Article Title Background Image display issues

  Corrects styles for `Article Title Background` with Overlays (under Advanced Style Options on Article Nodes)

  Resolves #566 

* * *

- ### Update page.html.twig

  Update for the sidebar menu hide/show.

  Closes #553 

* * *

- ### Fixes padding on tag and category icons in articles
  Resolves CuBoulder/tiamat-theme#569

* * *

- ### Fixes secondary menu alignment
  Fixes a bug which caused the secondary menu to be improperly aligned to the left when placed above the main navigation. Resolves CuBoulder/tiamat-theme#558

* * *

- ### People List Filter Labels as a Global Setting

  Changes the People List `Filter 1`, `Filter 2`, and `Filter 3` custom labels to a Global Setting in Site Configuration, rather than being set per-page. These labels will be set under Configuration => Cu Boulder Site Settings => Appearance and Layout.

  Resolves #543 

  Includes:

  - `ucb_site_configuarion` => <https://github.com/CuBoulder/ucb_site_configuration/pull/35>
  - `tiamat-theme` => <https://github.com/CuBoulder/tiamat-theme/pull/560>
  - `ucb_custom_entities` => 

* * *

- ### Breadcrumbs updates

  Updates to breadcrumbs to not display breadcrumb div when there are no items in the div

  Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/86>

  Closes #549 

* * *

- ### Completes in-content menu blocks

  This update completes in-content menu blocks (menu blocks placed outside of a navigation bar, e.g. in a sidebar) by styling them and adding the [Menu Block](https://www.drupal.org/project/menu_block) contrib module for additional options.

  Sister PR in: [tiamat10-project-template](https://github.com/CuBoulder/tiamat10-project-template/pull/25), [tiamat10-profile](https://github.com/CuBoulder/tiamat10-profile/pull/50), [ucb_admin_menus](https://github.com/CuBoulder/ucb_admin_menus/pull/13)

  Resolves CuBoulder/tiamat-theme#267
  Resolves CuBoulder/tiamat-theme#528 

* * *

- ### Cleans up accessible menus errors
  Resolves CuBoulder/tiamat-theme#538

* * *

- ### Adds menu styles to the user page
  Closes #525.
  Adds the menu styles to the user page.

* * *

- ### Issue/529

  CSS edits for the changes needed after the CAAAS hand migration

  Closes #529 

* * *

- ### Adds search frontend and settings

  This update:

  - Adds a search modal which appears when clicking on the search icon in the top bar.
  - Adds a new "Pages and search" tab to CU Boulder site settings (`/admin/config/cu-boulder/pages`). This tab contains settings accessible to Architect, Developer, and Site Manager:
    - The home page setting (moved from "General").
    - Options to enable site search, all of Colorado.edu search (default), both, or neither.
    - Configuration for the site search label, placeholder, and URL.
  - Renames "Appearance" to "Appearance and layout" and alters the descriptions of menu items.
  - Adds the [Google Programmable Search Engine](https://www.drupal.org/project/google_cse) module, which allows creating custom search pages to use with site search.

  Resolves CuBoulder/tiamat-theme#266

  Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/29), [tiamat10-profile](https://github.com/CuBoulder/tiamat10-profile/pull/43), [tiamat10-project-template](https://github.com/CuBoulder/tiamat10-project-template/pull/17)

* * *

- ### Fixes List Indicator Alignment with Left Align Images

  This change aligns the list indicators on a list element with other text elements next to a left-aligned image. 

  Previously, the float css for aligning an element left would cause visual issues with list indicators specifically, the bullet-point or numbering becoming hard to see or lost within the image. There is now condtionally applied left-spacing to rendered Ordered and Unordered list elements, when directly next to a Left Align (.align-left) image. 

  Resolves #523 

* * *

- ### Remove Extra Markup from inserted Images

  Conditionally removes extra `<div>` elements added through Twig when there's no attributes to justify an additional `<div>` wrap of the rendered content. 

  Changes default div styling of the imageMediaStyle class to not be `display:block`, both of which caused issues with wrapping an image in an anchor tag making the entire row clickable rather than just the image.

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/522>

* * *

- ### Add editor style options
  Closes #515.
  Adds initial styling.

* * *

- ### Updates tiamat-theme to Font Awesome 6 compatibility
  Resolves CuBoulder/tiamat-theme#511

* * *

- ### initial mobile menu commit
  Initial Mobile Menu commit before styling is decided

* * *

- ### User and 404 page changes
  Closes #484.
  Adds the new implementation of the user page and stores the image for the 404 page.

* * *

- ### Article List Block - Style Adjustments & Summary Bug Fix

  ## Article Block Bug Fix

  - Fixes bug with article summaries not displaying if they are derived from the body content, in lieu of the `Summary` field. This bug was present across `Article List Block`, `Article Grid Block`, `Article Feature Block` and has been corrected.

  * * *

  ## Style Adjustments

  Adjusts the following styles of the `Article List Block`:

  ### All `Article List Block` Styles

  - Thumbnail images set to 50px on mobile.
  - Article borders set to 1px.
  - `Link URL` is no longer a button-style link and is now a right-aligned basic link on the `Article List Block` specifically.

  ### Teaser Display

  - Sets thumbnails to 100px, 50px on mobile.
  - Adjusts layout to not force image above article card summary and details on single and multi column widths.

  ### Feature with Wide Photo

  - Uses the `Focal Image Wide` thumbnail for the images in `Article List Blocks` rendered in `Feature with Wide Photo` style. This image style was not previously available via JSON API when the block was initially created.

  ### Thumbnail & Title Displays

  - Thumbnail image 65px, 50px on mobile.
  - Equalizes padding above and below each article card, removing padding from images.

  * * *

  Resolves #497 

* * *

- ### favicon fix
  Closes #494.
  Quick fix to the favicon path

* * *

- ### Update region--site-information.html.twig

  Changed class name to fix styling error.

  Closes #490 

* * *

## [20230718] - 2023-09-18

- ### Remove FontAwesome Libraries

  Remove all Font Awesome files in preparation for global styles

  Sister PR: <https://github.com/CuBoulder/ucb_migration_shortcodes/pull/9>
  Sister PR: <https://github.com/CuBoulder/tiamat10-profile/pull/22>
  Sister PR: <https://github.com/CuBoulder/tiamat10-project-template/pull/12>

* * *

- ### Hero unit work

  Fixed the hero unit videos to work/fit properly in the new layout builder settings. Added "Size Priority" as an option to hero units so that we can have 100vh sections. Video now uses the 100vh by default because otherwise it's crazy ugly (can be easily changed now that I've refactored some of the css)

  Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/74>

  Closes #481

* * *

- ### Slider goes e2e in e2e sections
  Closes #476.
  Makes sliders in e2e sections to fully extend the width of the section.

* * *

- ### Linking to Expandable content
  Closes #403.
  Enables linking to expandable content based on title of the content.

* * *

- ### Edge-to-edge update

  Updated the templates and some css to accommodate the new edge-to-edge option

  Sister PR: <https://github.com/CuBoulder/ucb_bootstrap_layouts/pull/16>

  Closes #471 

* * *

- ### Page title changes

  Removed page title from the basic page theme
  Created a field file for the page title so that it has the proper tags and attributes

  Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/73>

  Closes #470

* * *

- ### Styling for taxonomy term views
  Closes #27 and #350 .
  Adds the css needed for the profile installations changes for the taxonomy views.

* * *

- ### Change: Video Reveal Display & Autoplay

  ### Changes to Video Reveal:

  Adds play/pause functionality to video reveal block videos, automatically toggling on click when image hides/shows. Fixes overlay to fit image.

  Resolves #388 

* * *

- ### Re-factor of Drupal Regions to more closely match D7 Express

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

- ### New: Adds 'People List Block'

  ### People List Block

  A configurable and placeable block that displays a list of People, similar to the Person List Page with simpler options. Block contains options for how your block will display to users (Teaser, Grid, Name & Thumbnail, Name Only) and selectable filters by taxonomies on a Person (Department, Job Type, Filter 1, 2, 3) to curate a specific list of People ordered by Last Name.

  Includes:

  - `tiamat-custom-entities` => `issue/tiamat-theme/466`
  - `tiamat-theme` => `issue/tiamat-theme/466`

  Resolves <https://github.com/CuBoulder/tiamat-theme/issues/466>

* * *

- ### Footer change
  Closes #461.
  Changes the footer to fill up whitespace.

* * *

- ### Updates bootstrap version
  Resolves CuBoulder/tiamat-theme#463

* * *

- ### Hides breadcrumbs on top-level pages
  Resolves CuBoulder/tiamat-theme#460

* * *

- ### Adds Articles by Person Block to a Person Page

  Adds an Articles by Person block to the Person page, displaying the most recent 5 articles associated.

  To reveal this block, you must have a byline taxonomy term created with a reference to the Person page in the `field_author_person_page` on the term, and then use that byline term on the article's byline. If a Person does not have any articles, this block will not display.

  Resolves #345 ,  Resolves #427 

* * *

- ### Removes image requirement from Content Row "Teaser" layouts

  This update enables the creation of Content Row blocks with image-less content and displays it correctly in the "Teasers" and "Teasers Alternate" layouts.

  Resolves CuBoulder/tiamat-theme#453

  Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/71)

* * *

- ### Page Title on user-set default Front Page set to screen-read only

  Resolves #448 

  Sets the title of pages chosen to be the site's default front page to 'sr-only' class. Will hide the title visually but still accessible to screen readers. Currently this works only if the page is set to explicitly the default '/homepage'. 

* * *

- ### sort alphabetically
  Closes #449.
  Small change to change the tags and categories to be sorted alphabetically.

* * *

- ### Removes "D9" from theme name and the theme, custom entities Composer package names

  Resolves CuBoulder/tiamat-theme#435

  Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/70), [tiamat-profile](https://github.com/CuBoulder/tiamat-profile/pull/52), [tiamat10-profile](https://github.com/CuBoulder/tiamat10-profile/pull/13), [tiamat-project-template](https://github.com/CuBoulder/tiamat-project-template/pull/28), [tiamat10-project-template](https://github.com/CuBoulder/tiamat10-project-template/pull/8), [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/26)

* * *

- ### fix for simple style menu issues
  Closes #438.
  Fixes drop shadow and margin issue in the simple menu style.

* * *

- ### Adds visual indication of active navigation menu items
  Resolves CuBoulder/tiamat-theme#437

* * *

## [20230707] - 2023-07-07

- ### Update for LB D10.1 style.css
  Update default layout builder styles so that things are readable and useable. These are temporary fixes until gin_lb gets an update.

* * *

- ### Hero unit vid fix

  Fixed the padding issues for the video background

  Closes #428 

* * *

- ### Menu Sub-Theme Styles
  Closes #330.
  Work in collaboration with siteconfiguration/#24.
  Adds 11 new menu styles to the base theme of the boulder theme.

* * *

- ### Change: Adds 'White' background to card-styled Text Block

  Adds a White background option to card-style Text Block for the case where sections have a different colored background

  Includes:

  - `tiamat-theme` => `issue/tiamat-theme/413`
  - `tiamat-custom-entities` => `issue/tiamat-theme/413`

  Resolves #413 

* * *

- ### Improves styling of the "Expandable Content" block type

  This update includes bug fixes and stylistic changes to the "Expandable Content" block type to address recent feedback.

  Resolves CuBoulder/tiamat-theme#401

  Resolves CuBoulder/tiamat-theme#402

  Resolves CuBoulder/tiamat-theme#404

  Resolves CuBoulder/tiamat-theme#405

  Resolves CuBoulder/tiamat-theme#422

* * *

- ### bugfix when no primary link
  Closes #419 
  Quick, easy fix to the situation in which there is no primary link.

* * *

- ### loop bug fix
  Closes #418.
  Solves an issue with looping with first != '#'.

* * *

- ### Update block--content-grid.html.twig
  Removed justify evenly class so that content will align left as it should.

* * *

- ### Change: Article Taxonomy term display style
  Resolves #348  - Changes Article Taxonomy term display style. Terms are no longer be all uppercase and icon flush with first term. Color changes to icons. 

* * *

- ### Adds Link field to Events Block

  Resolves #381 - Adds a Link field to the Events Calendar Block to allow for links to additional events. 

  Includes:
  [tiamat-theme](https://github.com/CuBoulder/tiamat-theme) => [issue/tiamat-theme/381 ](https://github.com/CuBoulder/tiamat-theme/pull/411)
  [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities) => [issue/tiamat-theme/381](https://github.com/CuBoulder/tiamat-custom-entities/pull/65)

* * *

- ### Change: Adjusts Hero Unit button spacing to 10px
  Resolves #400 

* * *

- ### Adds right formatting, remove padding and opacity
  Closes #383 and #384.
  Adds formatting for right overlay captions, removes bottom padding for mobile design, and reduces opacity for the slider.

* * *

- ### Hero Unit Buttons fixed for Internal Links

  Hero Unit buttons correctly link when provided internal links either by direct internal url or selected by page title within the form. 

  Resolves #407 

* * *

- ### Change Alerts Design
  Changes the design of the CU Alert to mirror the D7 version.
  Resolves #292 

* * *

- ### Update block--content-grid.html.twig

  Added options for 5 and 6 columns

  Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/63>

  Closes #374 

* * *

- ### Issue/320
  Closes #320.
  Adds a primary link to the person page which is displayed in the person lists. The icons can vary between multiple different icons based on the hostname of the url.

* * *

- ### slider bottom content fix
  Closes #385.
  Fixes issue where bottom-content sliders were having issues with animation.

* * *

- ### Fixes Content List and Text block stale cache issues

  A Content List block may have failed to update properly after updating a referenced node. A Content List or Text block placed using Block Layout may have also failed to reflect changes made to the block's fields. This update includes a fix to prevent stale cache issues.

  Resolves CuBoulder/tiamat-theme#377

  Resolves CuBoulder/tiamat-theme#378

  Resolves CuBoulder/tiamat-theme#387

* * *

- ### Updated feature settings

  Updated the feature option of the content rows block. Features are now a 60/40 split, width and sizing works properly. Removed the 20px bottom padding from the newer image styles update.

  Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/61>

  Closes #380 

* * *

- ### fix spacing in image gallery
  Closes #382. 
  Removes unneeded spacing between images.

* * *

- ### New Block Type: Article Slider

  Adds the Article Slider block. Much like the Article List page and other Article blocks, this will display a maximum of 6 articles in an interactive slider using user-provided inclusion and exclusion filters.

  Resolves #319 

  Includes:
  `tiamat-theme` => `issue/tiamat-theme/319`
  `tiamat-custom-entities` => `issue/tiamat-theme/319`

* * *

- ### Change: Article List adds button to load more Articles for improved accessibility

  The Article List page now uses a button to address accessibility concerns when loading more Articles, instead of a scroll-based 'infinite loader'. The button only appears if additional Articles are available via JSON API

  Resolves #370 , also resolves #238

* * *

- ### Update slider.css

  Added css to make link icon white rather than blue.

  Closes #339 

* * *

- ### New Block Type: Article Feature

  Adds a new block type: Article Feature. The Article Feature block displays the latest Articles, with Category & Tag filters set by the user much like the Article List page. The first Article displays a large image and summary and the remaining articles displays titles and thumbnails. 

  Resolves #318 

  Includes:

  - `tiamat-theme` => `issue/tiamat-theme/318`
  - `tiamat-custom-entities` => `issue/tiamat-theme/318`

* * *

- ### New Block Type: Article Grid

  Adds a new block type - Article Grid. Allows for Articles with thumbnails to be displayed in an Article List-style grid display.

  Includes:

  - `tiamat-theme` => `issue/tiamat-theme/317`
  - `tiamat-custom-entities` => `issue/tiamat-theme/317`

  Resolves #317 

* * *

- ### Update slider.css

  Updated css to remove slide content misalignment
  Fixed 3:2 sizes to be 3:2 instead of 3:1

  Closes #337 
  Closes #338 

* * *

- ### Update events-calendar.css

  Add link to event calendar widget generator into help text of builder
  Remove max-height from events calendar widget

  Closes #333 
  Closes #334 

  Sister PR: <https://github.com/CuBoulder/tiamat-custom-entities/pull/56>

* * *

- ### Change: Related Articles set via Global Settings

  Resolves #246 -- Related Articles paragraph now uses the Global Settings (Admin => Configuration / CU Boulder site settings / Related Articles) for Taxonomy Exclusions

  Includes:

  - tiamat-theme `issue/246`
  - tiamat-custom-entities `issue/tiamat-theme/246`

* * *

- ### New Block Type: Article List Block

  Adds Article List Block - a block version of the Article List page functionality with some added display style customizations.

  Resolves #316 

  Includes:
  \-tiamat-theme => `issue/tiamat-theme-316`
  \-custom-entities => `issue/tiamat-theme-316`

* * *

- ### Tweaks style of Article List; fixes image padding on mobile
  Resolves CuBoulder/tiamat-theme#363

* * *

- ### Content Sequence Block
  Closes #265.
  Add the horizontal, vertical, and advanced content sequences.

* * *

- ### Refactor to escape HTML from Article user input on Article List
  Resolves #361 -- Refactors render to use `innerText` instead of `innerHTML` to assemble list render, protecting from malicious user input

* * *

- ### Update page.html.twig

  Fixes container sizing issues for hero units
  Fixes above content not displaying blocks if put in the section 
  Fixes left and right side bars both not showing up if both are being used

  Closes #301 
  Closes #303
  Closes #340 

* * *

- ### Tweaks Person page image alignment and padding
  Resolves CuBoulder/tiamat-theme#354

* * *

- ### Fixes a bug which caused improper display of special characters like ampersands on Person pages
  - Some special characters such as `&` in _Job Title_ and _Department_ fields displayed as `&amp;` on Person pages. These characters now display properly. Resolves CuBoulder/tiamat-theme#275
  - An error resulted from the added `core/drupalSettings` dependency. This dependency is removed.
  - Person page schema changes: `itemprop` attributes have been move into field templates; `itemscope` moved to the higher-level `<article>` tag.
  - Additional cleanup of the Person page template

* * *

- ### Adds "Reset" button to People List page user filters

  - Adds a "Reset" button which automatically appears when a non-default user filter is selected on a People List page
  - Fixes a bug which caused broken default avatar images while previewing a People List page

  Resolves CuBoulder/tiamat-theme#312; Author @TeddyBearX

* * *

- ### Fix hero unit and image sizing

  Added extra css class to attributes for hero unit (will need to assess for other inline blocks and blocks) Added `img` to the style.css with the `article img` because images in block layout aren't given the `article` wrapping tag which caused problems with responsive images.

  Closes #298 

* * *

- ### Adds pronouns field to the Person page

  A pronouns text field has been added to the Person page, allowing a person's pronouns to be displayed below their name.

  Resolves CuBoulder/tiamat-theme#315

  Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/49)

* * *

- ### Change: Uniform Display of Title & Department fields on the different People List Page display options
  Resolves #313

* * *

- ### Change: Moves Person Photo caption on Person Page

  Closes #314 

  Moves Person's Photo caption underneath Person Photo on Person Page types. 
  Also contains : <https://github.com/CuBoulder/tiamat-theme/pull/325>

* * *

- ### Change: Adds Address Header to Person Page

  Resolves #309 

  Add heading for Address field on Person Page, similar to the Office Hours field heading

* * *

- ### Image Style additions
  Closes #152.
  Adds new image styles to both WYSIWYG and full html fields.

* * *

## [20230323] - 2023-03-23

- ### Change justify-content
  Closes #155.
  Removes justify-content from both image gallery and grid content

* * *

- ### Adds body field to people list
  Closes #279.
  Adds a summary of the body, if there is no summary field.

* * *

- ### Changes "Order by" for Person List page

  The option "Has Job Type, Last Name" has become "Job Type, Last Name". Rather than simply checking for the existence of the _job type_, sorting is performed alphabetically by a person's first _job type_.

  Resolves CuBoulder/tiamat-theme#280; Author @TeddyBearX 
  Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/41)

  Up to date with CuBoulder/tiamat-theme#286 – merge that one first!

* * *

- ### Person List aligns content to the left with and without image
  Closes #277.
  Quick css change to align all items to the left, regardless of whether there is an image there or not.

* * *

- ### Footer aligns vertically
  Closes #268.
  Quick fix to align all footers to be at the top

* * *

- ### Adds default Person image for People List Page grid renders, if no Person Image provided

  Resolves #278 -- Will use a default Person image in Grid-style renders of the People List page, if no image is provided on an included Person page.

  Includes:
  `tiamat-theme` => `change/278`

* * *

- ### Removes the ability to turn off "Restrict choices to those selected" in People List

  The option is no longer present when creating or editing a People List page.

  Resolves CuBoulder/tiamat-theme#281

  Sister PR in: [tiamat-custom-entities](https://github.com/CuBoulder/tiamat-custom-entities/pull/40)

* * *

- ### Newsletter Refactor

  Partially resolves #222 - Enhances the Newsletter for more consistency with final email html generation via Twig templating engine instead of JavaScript. Should resolve issues with inconsistent displays and partial/error renders from unexpected user inputs.

  TO DO - Will address `Newsletter Type` taxonomy and Theme selection in #273 

  ### New Workflow for Newsletters

  1. After creating your Newsletter, go to `Edit -> Preview`. 
  2. In the top dropdown menu to select your View Mode, select `Email HTML` as your View Mode. The page will now render the Email HTML version.
  3. Scroll to the bottom of your Email View Mode Preview for a button to automatically copy your html code to the clipboard ready to paste, as well as populate a text field with your email html.
  4. You can now paste into your email client / Salesforce client and send.

  Includes:

  - `tiamat-theme` => issue/222
  - `tiamat-custom-entities` => issue/222

* * *

- ### Adds sticky menu

  This update adds an optional "sticky menu" component to all pages on a site, enabled by visiting CU Boulder site settings → Appearance and toggling on _Show sticky menu_. The menu appears automatically when a user scrolls down passed the main website header, and only on large screen devices (at least 960 pixels wide).

  Resolves CuBoulder/tiamat-theme#247

  Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/20)

* * *

## [20230307] - 2023-03-07

- ### Updated people list formatting
  Adds better formatting to  person list.
  Closes #219 

* * *

- ### Adds "Advanced" appearance settings and custom site logos; modifies contact info settings

  This update:

  - Adds an _Advanced_ view at the bottom of the _Appearance_ settings, collapsed by default and visible only to those with the _Edit advanced site settings_ permission.
  - Moves all theme settings previously restricted to Drupal's default theme settings into the _Advanced_ view.
  - Adds site-specific custom logos (resolves CuBoulder/tiamat-theme#264) and places the settings for custom logos into the _Advanced_ view:
    - Custom logo requires _white text on dark header_ and _dark text on white header_ variants.
    - An image can be uploaded or a path can be manually specified for each.
    - ~~A scale can be specified, which defaults to _2x_ (Retina) but also allows _1x_ (standard) or _3x_ (enhanced Retina)~~.
  - Assigns the _Architect_ and _Developer_ user roles the _Edit advanced site settings_ permission.
  - Replaces address fields with general field and WYSIWYG editor in site contact info; removes colons from site contact info footer (resolves CuBoulder/tiamat-theme#269)

  Sister PR in: [ucb_site_configuration](https://github.com/CuBoulder/ucb_site_configuration/pull/19), [tiamat-profile](https://github.com/CuBoulder/tiamat-profile/pull/34)

* * *

- ### Enables block type templates to work properly with blocks added using either Layout Builder or Block Layout
  Resolves CuBoulder/tiamat-theme#225

* * *

- ### Hidden Terms: Categories and Tags recieve form option to toggle display for admin-only taxonomies

  Category and Tag taxonomies receive the form option for them to be hidden from public view, but the terms are still available for administration.

  - Articles tagged with a private term can still be used to group those articles within Article Lists.
  - Private terms are NOT used in the Related Articles block - private taxonomies do not affect an Articles 'related-ness' scores
  - Private terms will not display in the Category/Tag link section on Articles

  Resolves #217 

  Change Includes:

  - `tiamat-theme` => `issue/217`
  - `tiamat-custom-entities` => `issue/217`

* * *

## [20230209] - 2023-02-09

- ### Article List Formatting Changes and Updates

  - Reduce size of thumbnail image to 100px by 100px
  - Normalize date format to (Mon. DD, YYYY)
  - Trim summary length
  - Adjust padding and spacing 
  - Adjust the Read more link to be uppercase 
  - Add divider to the bottom of each article as a border-bottom

  Closes #199 

* * *

- ### Fix for center-align images placed via CKEditor

  Images were left-aligned even when specified to be centered when placed from the media library via the CKEditor interface.  

  Captions are not being honored either, however this seems to be an issue with CKEditor 5 and the Drupal Media Library.  Should be fixed in a future version of Drupal : (see : <https://www.drupal.org/project/drupal/issues/3246385> ) 

  Closes : #205 

* * *

- ### Advanced Style Options for Articles: Title Background Image

  Adds Advanced Styling options for Articles - including an optional Title Background Image, which replaces the default header with a full-width image holding the Article title. Also included is the ability to customize text color and a toggle to automatically add a light or dark overlay for better readability depending on your image.

  Resolves #154 

  Change Includes:

  - `tiamat-custom-entities` => issue/154
  - `tiamat-theme` => issue/154

* * *

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

* * *

## [0.20230110] - 2023-01-10

## [0.20221109] - 2022-11-09

[unreleased]: https://github.com/CuBoulder/tiamat-theme/compare/20250312...HEAD
[20250312]: https://github.com/CuBoulder/tiamat-theme/compare/20250226...20250312
[20250226]: https://github.com/CuBoulder/tiamat-theme/compare/20250219...20250226
[20250219]: https://github.com/CuBoulder/tiamat-theme/compare/20240212...20250219
[20240212]: https://github.com/CuBoulder/tiamat-theme/compare/20250205...20240212
[20250205]: https://github.com/CuBoulder/tiamat-theme/compare/20250129...20250205
[20250129]: https://github.com/CuBoulder/tiamat-theme/compare/20250121...20250129
[20250121]: https://github.com/CuBoulder/tiamat-theme/compare/20250115...20250121
[20250115]: https://github.com/CuBoulder/tiamat-theme/compare/20241211...20250115
[20241211]: https://github.com/CuBoulder/tiamat-theme/compare/20241204...20241211
[20241204]: https://github.com/CuBoulder/tiamat-theme/compare/20241122...20241204
[20241122]: https://github.com/CuBoulder/tiamat-theme/compare/20241120...20241122
[20241120]: https://github.com/CuBoulder/tiamat-theme/compare/20241120...20241120
[20241120]: https://github.com/CuBoulder/tiamat-theme/compare/20241118...20241120
[20241118]: https://github.com/CuBoulder/tiamat-theme/compare/20241113...20241118
[20241113]: https://github.com/CuBoulder/tiamat-theme/compare/20241030...20241113
[20241030]: https://github.com/CuBoulder/tiamat-theme/compare/20241023...20241030
[20241023]: https://github.com/CuBoulder/tiamat-theme/compare/20241017...20241023
[20241017]: https://github.com/CuBoulder/tiamat-theme/compare/20241009...20241017
[20241009]: https://github.com/CuBoulder/tiamat-theme/compare/20241002...20241009
[20241002]: https://github.com/CuBoulder/tiamat-theme/compare/20240925...20241002
[20240925]: https://github.com/CuBoulder/tiamat-theme/compare/20240918...20240925
[20240918]: https://github.com/CuBoulder/tiamat-theme/compare/20240911...20240918
[20240911]: https://github.com/CuBoulder/tiamat-theme/compare/20240904...20240911
[20240904]: https://github.com/CuBoulder/tiamat-theme/compare/20240821...20240904
[20240821]: https://github.com/CuBoulder/tiamat-theme/compare/20240814...20240821
[20240814]: https://github.com/CuBoulder/tiamat-theme/compare/20240805...20240814
[20240805]: https://github.com/CuBoulder/tiamat-theme/compare/20240725...20240805
[20240725]: https://github.com/CuBoulder/tiamat-theme/compare/20240719...20240725
[20240719]: https://github.com/CuBoulder/tiamat-theme/compare/20240711...20240719
[20240711]: https://github.com/CuBoulder/tiamat-theme/compare/20240612...20240711
[20240612]: https://github.com/CuBoulder/tiamat-theme/compare/20240604...20240612
[20240604]: https://github.com/CuBoulder/tiamat-theme/compare/20240513...20240604
[20240513]: https://github.com/CuBoulder/tiamat-theme/compare/20240221...20240513
[20240221]: https://github.com/CuBoulder/tiamat-theme/compare/20231212...20240221
[20231212]: https://github.com/CuBoulder/tiamat-theme/compare/20230718...20231212
[20230718]: https://github.com/CuBoulder/tiamat-theme/compare/20230707...20230718
[20230707]: https://github.com/CuBoulder/tiamat-theme/compare/20230323...20230707
[20230323]: https://github.com/CuBoulder/tiamat-theme/compare/20230307...20230323
[20230307]: https://github.com/CuBoulder/tiamat-theme/compare/20230209...20230307
[20230209]: https://github.com/CuBoulder/tiamat-theme/compare/0.20230110...20230209
[0.20230110]: https://github.com/CuBoulder/tiamat-theme/compare/0.20221109...0.20230110
[0.20221109]: https://github.com/CuBoulder/tiamat-theme/compare/fc8e434945affda25ee2d8cf5c7c659c3ff0b7f4...0.20221109
