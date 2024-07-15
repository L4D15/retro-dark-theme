import '../styles/minimal-dark-theme.scss';

Hooks.once('init', function () {
    console.log(`Initializing Minimal Dark Theme...`);
});

Hooks.once('ready', function () {
    console.log(`Minimal Dark Theme initialized successfully.`);
});

Hooks.on('createProseMirrorEditor', function (uuid, plugins, options) {});

Hooks.on('renderActorSheet', function (app, html, data) {
    html.css('width', '500');

    foundry.utils.mergeObject(app, {
        options: {
            width: 500,
        },
    });
});

Hooks.on('renderApplication', function (app, html, data) {});
