# Localization

## Status 2018-11-28
Progress tracker on [Crowdin](https://crowdin.com/project/originprotocol).

Full list of [supported locales](https://github.com/OriginProtocol/origin/blob/master/origin-dapp/translations/supported-locales.json).
## Implementation

Localization is done with `react-intl`. [See Documentation here](https://github.com/yahoo/react-intl/wiki).

## Extract new/edited English strings for translation

1) Add `FormattedMessage` components with unique IDs and default text:

```
import { FormattedMessage } from 'react-intl'

<FormattedMessage
  id={ 'listings-grid.originContractNotFound' }
  defaultMessage={ 'The Origin Contract was not found on this network.' }
/>
```
These are compiled automatically into JSON message files by `babel-plugin-react-intl` and a custom webpack plugin.

The auto-generated file `all-messges.json` is parsed by Crowdin each time it is pushed to a branch and new/edited messages are queued for translation.

## Updating translations in the DApp

Crowdin automatically creates a PR to this repo each time a translator finishes some translation work. 

To utilize this translated text in the DApp, simply merge the PR from Crowdin and run `npm run translations`, then commit the resulting file called `translated-messges.json`.

## Adding/Editing strings in schemas

In order to avoid having English strings in schemas, we use `react-intl` IDs to represent strings in schemas. Each schema has a corresponding file in `/src/schemaMessages/` that maps the string IDs with their English defaultMessages.

So, in the `housing.json` schema, the string "Category" is represented by the ID `schema.housing.category`, which is mapped in `/src/schemaMessages/housing.js` like this:
```
'schema.housing.category': {
  id: 'schema.housing.category',
  defaultMessage: 'Category'
}
```

If you need to make changes to strings in schemas, make sure you also make the corresponding changes in the schema's translation map file, then follow the steps above for extracting English strings and updating translations in the DApp.
