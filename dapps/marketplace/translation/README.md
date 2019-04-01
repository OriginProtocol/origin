# Translation

We use [Crowdin](https://crowdin.com/project/originprotocol) to allow the communtity to contribute translations. Github integration is managed by the `OriginProtocol` user, owned by Coleman.

Translations are updated by running `npm run translate` in the `marketplace` directory.

It performs the following steps:

### Extract strings to be translated

1. **`npm run fbt:manifest`** : Generate fbt enum manifests and source manifests that indicate which files need to be translated (`.src_manifest.json` and `.enum_manifest.json`)
1. **`npm run fbt:collect`** : Collects translatable strings from throughout the app. Outputs to `.source_strings.json`
1. **`node scripts/fbtToCrowdin.js`** : Converts `.source_strings.json` to simple key-value json stored at `./translation/crowdin/all-messages.json`
1. Crowdin automatically reads `./translation/crowdin/all-messages.json`

### Import translated string into DApp to be used
1. Translators do their magic
1. Crowdin will (within 10 minutes) update branch [crowdin](https://github.com/OriginProtocol/origin/tree/crowdin) and create a pull request updating locale-specifc files in `./translation/crowdin/all-messages_<locale>.js`
1. `node scripts/crowdinToFbt.js` : Converts simple key-value back into fbt json format, stored in `./translation/fbt/<locale>.js`
1. **`npm run fbt:translate`** : Using the translations in `./translation/fbt/<locale>.json`, outputs combined file to `.translated_fbts.json`. (This file could be used by other non-web applications, but we only use it as intermediate file.)
1. **`node scripts/splitTranslations.js`** : Using `.translated_fbts.json`, outputs locale-specific translations in a react-friendly format to `./public/translations`
1. **`cp .enum_manifest.json translations/.enum_manifest.json`** : Copy [enums](https://facebookincubator.github.io/fbt/docs/enums#shared-enums) into same dir, as they are required at runtime.
1. DApp uses the translations in `./public/translations` at runtime.

Run all in terminal as:

    npm run fbt:manifest
    npm run fbt:collect
    node scripts/fbtToCrowdin.js
    # Do translations here
    node scripts/crowdinToFbt.js
    npm run fbt:translate
    node scripts/splitTranslations
    cp .enum_manifest.json translations/.enum_manifest.json


The pipeline then looks like this:

`./.source_strings.json` → `./trasnlation/crowdin/all-messages.json` → _Translation Occurs_ → `./trasnlation/crowdin/all-messages_<locale>.js` → `./trasnlation/fbt/<locale>.js` → `.translated_fbts.json` → `./public/translations`
