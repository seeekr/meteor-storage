Package.describe({
    name: "seeekr:storage",
    summary: "A reactive wrapper for localStorage, which will use chrome.storage if used in a chrome packaged app or extension",
    version: "0.1.9",
    git: "https://github.com/seeekr/meteor-storage.git"
});

Package.onUse(function (api) {
    api.versionsFrom('METEOR@1.0');

    api.use('underscore', 'client');
    api.use('localstorage', 'client');

    api.export('LocalStore');

    api.addFiles('LocalStore.js', 'client');
});
