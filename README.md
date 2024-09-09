# tiamat-theme
Drupal 10+ Base theme for CU Boulder web properties

## Installation
Add below to `composer.json` require section:
````
"cu-boulder/boulder_base" : "dev-main"
````

Add to repositories section:
````
{
    "type": "git",
    "url" : "https://github.com/CuBoulder/tiamat-theme.git"
}
````

**Note:** This theme is installed and set as the default with the profile. The theme is not intended to be used without the profile or other `cu-boulder/*` modules.

> To install a local version of Nextpress, follow the steps outlined in the
> [tiamat-project-template](https://github.com/CuBoulder/tiamat-project-template)

---
## Theme Options

Under `/admin/appearance/settings/...` you can manage various theme settings.

- Set [default values for the theme](#config) in the `boulder_base.settings.yml`
- Add more settings to the theme in `hook_system_theme_settings_alter` in [boulder_base.theme](https://github.com/CuBoulder/tiamat-theme/blob/main/boulder_base.theme)

## Linting

We are using stylelint and eslint

````
npm install          # install linters
npm run stylelint    # lint css
npm run eslint       # lint js
````
Linting is run automatically on all pull requests, however you can lint files locally too.
- configure eslint in `.eslintrc.json`
- configure styleint in `.stylelint.json`

---
## Directory Structure

### .github Directory
Contains the github actions workflow for linting
### config
Contains the default values for the theme settings. If new theme settings are added, update boulder_base.settings.yml with the default values. You can get the configuration by running `lando drush config-get boulder_base.settings` and copying the output into the file.

### css
- put styles relating the custom paragraphs in css/paragraphs
- put styles from the styleguide in css/styleguide

### js
Put JavaScript files here

### templates
Twig template overrides go here including those for the custom page and paragraph types. The packages dedicated to the page and paragraph types should only contain config.

### boulder_base.info.yml
- Define regions
- Add styles to the ckeditor
- Add globally included libraries

### boulder_base.libraries.yml
Define libraries

### boulder_base.theme
Add theme hooks

### boulder_base.breakpoints.yml
This file is used by the Breakpoint and Responsive Image module. These modules are used
for making images inserted with the text editor responsive.
