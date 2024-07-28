import '../styles/retro-dark-theme.scss';

Hooks.once('init', function () {
    console.log(`Initializing Retro Dark Theme...`);
});

Hooks.once('ready', function () {
    console.log(`Retro Dark Theme initialized successfully.`);
});

Hooks.on('createProseMirrorEditor', function (uuid, plugins, options) {});

Hooks.on('renderActorSheet', function (app, html, data) {
    html.css({ width: '500' });

    foundry.utils.mergeObject(app, {
        options: {
            width: 500,
        },
    });

    _applyMothershipFixes(html);
});

function _applyCRTEffect(html) {
    // Do not apply effects to the following windows
    // if (html.hasClass('journal')) return;

    html.find('.window-content').addClass('crt');
}

function _applyMothershipFixes(html) {
    html.find('.window-content').addClass('crt').addClass('blink');

    // Mothership specific fixes
    html.find('.saves')
        .children('.resource')
        .children('.grid')
        .css({ 'grid-template-columns': '', 'margin-left': '' })
        .addClass('inputs-list')
        .removeClass('grid')
        .removeClass('grid-3col');

    var headerFields = html.find('.header-fields');

    html.find('.health')
        .filter('.grid')
        .children('div')
        .last()
        .addClass('trauma-response')
        .detach()
        .appendTo(headerFields)
        .css({
            'grid-column-start': '',
            'grid-column-end': '',
            'margin-left': '',
            'margin-right': '',
        });

    // Fix incorrect space in main abilities grid
    html.find('.abilities').find('.widegap').removeClass('widegap');

    // Fix Trauma Response text area with incorrect height
    html.find('.trauma-response').find('textarea').css({ height: '' });

    // Fix grid of Health, Wounds, Stress and Armor stats
    html.find('.health.grid')
        .css({
            'margin-top': '',
            'grid-template-rows': '',
        })
        .removeClass('grid')
        .removeClass('grid-2col');

    // Fix Armor stat with in-line grid properties messing with proper grid
    html.find('.health')
        .children('.resource')
        .last()
        .css({ 'grid-column': '' });
}

Hooks.on('renderApplication', function (app, html, data) {
    _applyCRTEffect(html);
    _applyMothershipFixes(html);
});
