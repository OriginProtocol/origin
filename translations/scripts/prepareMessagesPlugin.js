const fs = require('fs');
const glob = require('glob');
const filePattern = './translations/messages/src/**/*.json';
const outputDir = './translations/';

function PrepareMessagesPlugin(options) {
  // JJ dev note: leaving this here in case we want to add options later
}

PrepareMessagesPlugin.prototype.apply = function(compiler) {
  compiler.plugin('done', function(stats) {

    // Aggregates the default messages that were extracted from the React components
    // via the React Intl Babel plugin. An error will be thrown if there
    // are messages in different components that use the same `id`. The result
    // is a flat collection of `id: message` pairs.
    const defaultMessages = glob.sync(filePattern)
      .map((filename) => fs.readFileSync(filename, 'utf8'))
      .map((file) => JSON.parse(file))
      .reduce((collection, descriptors) => {
        descriptors.forEach(({id, defaultMessage}) => {
          if (collection.hasOwnProperty(id)) {
            stats.compilation.errors.push( new Error(`ERROR compiling react-intl messages: Duplicate message id: ${id}`) );
          }
          collection[id] = defaultMessage;
        });

        return collection;
      }, {});

    if (!stats.compilation.errors.length) {
      // Write the messages to /translations/all-messages.json
      fs.writeFileSync(outputDir + 'all-messages.json', JSON.stringify(defaultMessages, null, 2));
    }

  })
}

module.exports = PrepareMessagesPlugin
