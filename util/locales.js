const i18n = require('i18n');

i18n.configure({
    directory: __dirname + '/locales',
    defaultLocale: 'de'
});

module.exports = i18n;