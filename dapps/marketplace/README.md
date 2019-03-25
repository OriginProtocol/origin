![Origin Protocol](data/origin-header.png)

A UI leveraging `@origin/graphql`. View and manage listings and offers.

Test builds at https://originprotocol.github.io/test-builds/

# Usage

    npm start

# Tests

Tests are run in a headless Chrome instance via puppeteer

    npm test

To observe the tests running in the browser:

    npm run test:browser

# Translation

Current process:

1. **`npm run fbt:manifest`** : Generate fbt enum manifests and source manifests that indicate which files need to be translated (`.src_manifest.json` and `.enum_manifest.json`)
1. **`npm run fbt:collect`** : Collects translatable strings from throughout the app. Outputs to `.source_strings.json`
1. `node scripts/fbtToCrowdin.js` : Converts `.source_strings.json` to simple key-value json stored at `translation/crowdin/all-messages.json`
1. Crowdin reads `translation/crowdin/all-messages.json` 
1. Translators do their magic
1. Crowdin pushes locale-specifc files to `./translation/crowding/all-messages_<locale>.js`
1. `node scripts/crowdinToFbt.js` : Converts simple key-value back into fbt json format, stored in `./translations/<locale>.js`
1. **`npm run fbt:translate`** : Using the translations in `./translations/<locale>.js`, outputs combined file to `.translated_fbts.json`
1. **`node scripts/splitTranslations`** : Using `.translated_fbts.json`, outputs locale-specific translations to `./public/translations`
1. DApp uses the translations in `./public/translations`

