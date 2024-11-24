import '../styles/retro-dark-theme.scss';

Hooks.once('init', function () {
    console.log(`Initializing Retro Dark Theme...`);
});

Hooks.once('ready', function () {
    console.log(`Retro Dark Theme initialized successfully.`);
});

Hooks.on('createProseMirrorEditor', function (uuid, plugins, options) {});

Hooks.on('renderJournalSheet', function (app, html, data) {
    _applyCRTEffect(html);
});

Hooks.on('renderMothershipActorSheet', function (app, html, data) {
    // Target sheet with unique ID to avoid altering other open sheets
    var id = app._element[0].id;
    var sheetHtml = $('#' + id);

    _applyInitialSheetSize(sheetHtml, app, 475, 700);
    _applyMothershipFixes(html);
    _applyCharacterFixes(sheetHtml);
});

Hooks.on('renderMothershipCreatureSheet', function (app, html, data) {
    var id = app._element[0].id;
    var sheetHtml = $('#' + id);

    _applyInitialSheetSize(sheetHtml, app, 475, 700);
    _applyMothershipFixes(html);
    _applyNPCFixes(sheetHtml);
});

Hooks.on('renderMothershipItemSheet', function (app, html, data) {
    var id = app._element[0].id;
    var sheetHtml = $('#' + id);

    _applyInitialSheetSize(sheetHtml, app, 475, 350);
    _applyMothershipFixes(html);
    _applyItemFixes(html);
});

function _applyCRTEffect(html) {
    html.find('.window-content').addClass('crt');
}

function _applyInitialSheetSize(html, app, width, height) {
    html.css({ width: width, height: height });

    app.position.width = width;
    app.position.height = height;
}

function _applyMothershipFixes(html) {
    _applyCRTEffect(html);

    html.find('.rollable').hover(function () {
        var target = $(this);
        target.toggleClass('aberration');
    });

    html.find('.button').hover(function () {
        $(this).toggleClass('aberration');
    });
}

function _applyCharacterFixes(html) {
    console.log(`#DEBUG# Applying Character fixes to sheet`);

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
        .css({ 'grid-column': '' })
        .children('.minmaxwrapper')
        .css({
            width: '',
            background: '',
            'border-radius': '',
            display: '',
        })
        .children('.maxhealth-input')
        .css({ display: '' });

    // Fix Saves grid
    html.find('.saves')
        .removeClass('grid')
        .removeClass('grid-1col')
        .removeClass('savebackground');

    html.find('.saves').append('<div class="saves-list"></div>');
    var savesList = html.find('.saves-list');

    html.find('.saves').children('.resource').detach().appendTo(savesList);

    html.find('.saves')
        .children('.resource')
        .children('.grid')
        .css({ 'grid-template-columns': '', 'margin-left': '' })
        .addClass('inputs-list')
        .removeClass('grid')
        .removeClass('grid-3col');

    // Fix Saves with different structure than attributes

    html.find('.saves')
        .children('.saves-list')
        .addClass('grid')
        .addClass('grid-1col');

    html.find('.saves')
        .children('.saves-list')
        .children('.resource')
        .each(function () {
            // Wrap the save in a contained to match the attributes structure
            $(this).before('<div class="save-wrapper"></div>');
            var wrapper = $(this).prev();
            $(this).detach().appendTo(wrapper);

            var badContainer = $(this).children().eq(1);

            // Remove hard-coded styling
            $(badContainer)
                .removeClass('grid')
                .removeClass('grid-3col')
                .css({ 'grid-template-columns': '', 'margin-left': '' });

            // Move main input outside, so its on level with the label
            $(badContainer)
                .children()
                .eq(0)
                .attr({ style: '' })
                .detach()
                .appendTo($(this));

            // Move bonus input and + sign out to the main wrapper
            $(badContainer)
                .children()
                .eq(0)
                .attr({ style: '' })
                .detach()
                .appendTo($(wrapper));
            $(badContainer)
                .children()
                .eq(0)
                .attr({ style: '' })
                .detach()
                .appendTo($(wrapper));

            $(badContainer).remove();

            // Fix label missing a wrapping div
            $(this)
                .children('span.ability-mod')
                .before('<div class="mainsavelabel"></div>');
            var labelContainer = $(this).find('.mainsavelabel');
            $(this).find('.ability-mod').detach().appendTo($(labelContainer));
        });

    html.find('.saves')
        .children('.resource')
        .children('.inputs-list')
        .children('.mainstatmod-title')
        .each(function () {
            $(this).css({ top: '' });
        });
}

function _applyNPCFixes(html) {
    html.find('form').addClass('flexcol');
    html.find('.whiteline').remove();
    // Move NPC profile picture to top-left corner
    html.find('img.profile')
        .detach()
        .prependTo(html.find('.creature-header-grid'));

    // Move name field inside the attributes grid
    html.find('input.creaturename')
        .detach()
        .prependTo(html.find('.creature-header'));

    // Remove hard-coded width for creature stats
    html.find('.mainstatwrapper')
        .children('.creature-mainstat')
        .children('input.creaturestat')
        .css({ width: '' });

    // Remove hard-coded size for the profile
    html.find('.profile')
        .removeClass('noborder')
        .css({ width: '', height: '' });

    // Add missing label for creature name
    html.find('.creature-header').prepend(
        '<div class="creature-name-wrapper"</div>'
    );

    html.find('.creature-name-wrapper')
        .append('<div class="headerinputtext">Name</div>')
        .append('<div class="headerinputfield charname"></div>');

    html.find('input.creaturename')
        .removeClass('noborder')
        .attr('style', '')
        .detach()
        .appendTo(
            html.find('.creature-name-wrapper .headerinputfield.charname')
        );

    html.find('.creature-description-grid')
        .children('.creaturedescription')
        .children('.grid')
        .attr('id', 'resources')
        .removeClass('grid')
        .detach()
        .appendTo(html.find('.creaturedescription'));

    html.find('.creature-abilities')
        .children('li.creature-ability-container')
        .css({ 'margin-top': '' });
}

function _applyItemFixes(html) {
    html.find('form').addClass('flexcol');
}

Hooks.on('renderApplication', function (app, html, data) {
    if (html.hasClass('window-app')) {
        _applyMothershipFixes(html);
    }

    // if (
    //     app._element !== null &&
    //     app._element.length > 0 &&
    //     app._element[0].hasClass('window-app')
    // ) {
    //     _applyMothershipFixes(html);
    // }
});
