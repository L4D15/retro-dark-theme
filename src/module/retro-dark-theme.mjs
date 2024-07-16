import '../styles/retro-dark-theme.scss';

Hooks.once('init', function () {
    console.log(`Initializing Retro Dark Theme...`);
});

Hooks.once('ready', function () {
    console.log(`Retro Dark Theme initialized successfully.`);
});

Hooks.on('createProseMirrorEditor', function (uuid, plugins, options) {});

Hooks.on('renderActorSheet', function (app, html, data) {
    html.css('width', '500');

    foundry.utils.mergeObject(app, {
        options: {
            width: 500,
        },
    });

    html.find('.window-content').addClass('crt').addClass('blink');
});

function _applyCRTEffect(html) {
    // Do not apply effects to the following windows
    // if (html.hasClass('journal')) return;

    html.find('.window-content').addClass('crt');
}

Hooks.on('renderApplication', function (app, html, data) {
    _applyCRTEffect(html);
});
