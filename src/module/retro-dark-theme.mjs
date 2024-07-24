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

    html.find('.trauma-response').find('textarea').css({ height: '' });
});

function _applyCRTEffect(html) {
    // Do not apply effects to the following windows
    // if (html.hasClass('journal')) return;

    html.find('.window-content').addClass('crt');
}

function _applyMothershipFixes(html) {
    console.log('#RDT# Appying fixes to application.');
    let saves = html.find('.saves');

    if (saves !== null) {
        console.log('#RDT# Found saves area.');
        console.log(JSON.stringify(saves));

        var grids = saves.children('.grid');

        if (grids !== undefined) {
            console.log('#RDT# Found grids inside saves.');
            console.log(JSON.stringify(grids));

            saves.children('.grid').each(function () {
                console.log(
                    '#RDT# Fixing grid for element in Mothership application.'
                );
            });
        }
    }
}

Hooks.on('renderApplication', function (app, html, data) {
    _applyCRTEffect(html);
    _applyMothershipFixes(html);
});
