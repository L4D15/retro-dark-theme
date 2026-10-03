import '../styles/retro-dark-theme.scss';

const MODULE_ID = 'retro-dark-theme';

/** Initial size of Mothership sheets, applied only the first time a sheet is opened. */
const MOTHERSHIP_SHEET_SIZES = {
    MothershipActorSheet: { width: 475, height: 700 },
    MothershipCreatureSheet: { width: 475, height: 700 },
    MothershipItemSheet: { width: 475, height: 350 },
};

Hooks.once('init', function () {
    console.log(`${MODULE_ID} | Initializing Retro Dark Theme...`);
    _forceDarkTheme();
});

Hooks.once('ready', function () {
    console.log(`${MODULE_ID} | Retro Dark Theme initialized successfully.`);
});

/**
 * Foundry forces the light theme on some elements regardless of the user settings
 * (ApplicationV1 windows, chat log, notifications, chat bubbles...). Swap them to dark
 * so the core dark theme variables, which this theme builds upon, apply everywhere.
 */
function _forceDarkTheme() {
    const swap = (el) => el.classList.replace('theme-light', 'theme-dark');
    const swapTree = (root) => {
        if (!(root instanceof Element)) return;
        if (root.classList.contains('theme-light')) swap(root);
        root.querySelectorAll('.theme-light').forEach(swap);
    };

    swapTree(document.body);

    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes') swapTree(mutation.target);
            else mutation.addedNodes.forEach(swapTree);
        }
    }).observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class'],
    });
}

// Mothership sheets (ApplicationV1: hooks receive jQuery)

Hooks.on('renderMothershipActorSheet', function (app, html) {
    _applyInitialSheetSize(app, MOTHERSHIP_SHEET_SIZES.MothershipActorSheet);
    _moveSkillTrainingToNotes(html[0]);
});

Hooks.on('renderMothershipCreatureSheet', function (app, html) {
    _applyInitialSheetSize(app, MOTHERSHIP_SHEET_SIZES.MothershipCreatureSheet);
    _applyCreatureHeader(html[0]);
});

Hooks.on('renderMothershipItemSheet', function (app) {
    // Class and Skill sheets inherit from the item sheet but use their own layout
    if (app.constructor.name !== 'MothershipItemSheet') return;
    _applyInitialSheetSize(app, MOTHERSHIP_SHEET_SIZES.MothershipItemSheet);
});

/**
 * Resize a sheet the first time it is rendered, leaving any later user resize alone.
 */
function _applyInitialSheetSize(app, size) {
    if (app[`${MODULE_ID}.sized`]) return;
    app[`${MODULE_ID}.sized`] = true;
    app.setPosition(size);
}

/**
 * Skill Training is shown in the Notes tab instead of the Skills tab.
 */
function _moveSkillTrainingToNotes(root) {
    const notesTab = root.querySelector('.tab[data-tab="notes"]');
    const trainingFrame = root.querySelector(
        '.tab[data-tab="skills"] .skill_training_frame'
    );

    if (notesTab && trainingFrame) notesTab.prepend(trainingFrame);
}

/**
 * Move the creature portrait from the abilities column to the header, next to a
 * labelled name field, matching the character sheet header.
 */
function _applyCreatureHeader(root) {
    const header = root.querySelector('.creature-header-grid');
    const profile = root.querySelector('.creature-abilities img.profile');
    const nameInput = root.querySelector(
        '.creature-header-grid > input.creaturename'
    );

    if (!header || !profile || !nameInput) return;

    const nameField = document.createElement('div');
    nameField.classList.add('creature-name-field');
    nameField.innerHTML = `<div class="headerinputtext">${game.i18n.localize(
        'Mosh.Name'
    )}</div>`;
    nameField.append(nameInput);

    const fields = document.createElement('div');
    fields.classList.add('creature-header-fields');
    fields.append(nameField, root.querySelector('.creature-header'));

    header.prepend(profile, fields);
}
