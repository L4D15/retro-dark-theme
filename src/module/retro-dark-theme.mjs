import '../styles/retro-dark-theme.scss';

const MODULE_ID = 'retro-dark-theme';

/** Initial size of Mothership sheets, applied only the first time a sheet is opened. */
const MOTHERSHIP_SHEET_SIZES = {
    MothershipActorSheet: { width: 475, height: 700 },
    MothershipCreatureSheet: { width: 475, height: 700 },
    MothershipItemSheet: { width: 475, height: 350 },
    // Narrower than the system's 800px, to fit the same stat columns as the character sheet
    DLActorGenerator: { width: 490 },
};

/** CRT effects each player can turn off, in case they get in the way of reading. */
const CRT_EFFECTS = {
    scanlines: {
        name: 'Scanlines',
        hint: 'Horizontal lines and RGB pattern over windows and chat messages.',
    },
    glow: {
        name: 'Glow',
        hint: 'Light bloom around highlighted elements and critical roll results.',
    },
    aberration: {
        name: 'Chromatic Aberration',
        hint: 'Shaking color fringes on rollable text when hovering over it.',
    },
};

Hooks.once('init', function () {
    console.log(`${MODULE_ID} | Initializing Retro Dark Theme...`);
    _registerEffectSettings();
    _forceDarkTheme();
});

Hooks.once('i18nInit', function () {
    _hideCheckSuccessFlavor();
});

Hooks.once('ready', function () {
    console.log(`${MODULE_ID} | Retro Dark Theme initialized successfully.`);
});

/**
 * Register a client setting per CRT effect. Disabled effects are flagged with a
 * `retro-dark-theme-no-<effect>` class on the body, which the styles use to turn them off.
 */
function _registerEffectSettings() {
    for (const [effect, { name, hint }] of Object.entries(CRT_EFFECTS)) {
        const toggle = (enabled) =>
            document.body.classList.toggle(`${MODULE_ID}-no-${effect}`, !enabled);

        game.settings.register(MODULE_ID, `effect.${effect}`, {
            name,
            hint,
            scope: 'client',
            config: true,
            type: Boolean,
            default: true,
            onChange: toggle,
        });

        toggle(game.settings.get(MODULE_ID, `effect.${effect}`));
    }
}

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

/**
 * Successful checks add a flavor line ("You gain some confidence in your skills.") with no
 * game effect, which reads like a reward next to the stress gained on failures. Blank it:
 * an empty string still counts as translated, so the system won't fall back to the key.
 * The English fallback is blanked too, for translations missing some of these lines.
 */
function _hideCheckSuccessFlavor() {
    for (const strings of [game.i18n.translations, game.i18n._fallback]) {
        const attributes = foundry.utils.getProperty(strings, 'Mosh.attribute') ?? {};

        for (const attribute of Object.values(attributes)) {
            if (!attribute?.check) continue;
            for (const systemClass of Object.keys(attribute.check)) {
                attribute.check[systemClass] = '';
            }
        }
    }
}

// Chat messages

Hooks.on('renderChatMessageHTML', function (message, html) {
    _addSpeakerPortrait(message, html);
    _tagRollOutcome(html);
});

/**
 * Show the portrait of the speaking actor next to its name in the message header.
 */
function _addSpeakerPortrait(message, html) {
    const actor = message.speakerActor;
    const sender = html.querySelector('.message-header .message-sender');
    if (!actor?.img || !sender) return;

    const portrait = document.createElement('img');
    portrait.classList.add('message-portrait');
    portrait.src = actor.img;
    portrait.alt = actor.name;
    sender.before(portrait);
}

/**
 * Mothership roll cards show the outcome as plain text (SUCCESS!, CRITICAL FAILURE!...).
 * Tag the message with it so the outcome and the total can be colored.
 */
function _tagRollOutcome(html) {
    const outcome = html.querySelector(
        '.mosh .rollcontainer > div:not([class]) strong'
    );
    if (!outcome) return;

    const text = outcome.textContent.toUpperCase();
    outcome.classList.add('roll-outcome');
    html.classList.toggle('roll-success', text.includes('SUCCESS'));
    html.classList.toggle('roll-failure', text.includes('FAILURE'));
    html.classList.toggle('roll-critical', text.includes('CRITICAL'));
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

Hooks.on('renderDLActorGenerator', function (app) {
    _applyInitialSheetSize(app, MOTHERSHIP_SHEET_SIZES.DLActorGenerator);
    _waitForDiceInGenerator(app.constructor);
});

Hooks.once('setup', function () {
    _waitForDiceOnChatMessages();
});

/** Number of character generator rolls in progress, see `_waitForDiceInGenerator`. */
let generatorRolls = 0;

/**
 * The character generator fills in each result as soon as its roll is sent to chat,
 * while Dice So Nice is still throwing the dice. Count its rolls in progress, so the
 * chat messages they create wait for the animation before the results are shown.
 */
function _waitForDiceInGenerator(generatorClass) {
    const proto = generatorClass.prototype;
    if (proto[`${MODULE_ID}.waitsForDice`]) return;
    proto[`${MODULE_ID}.waitsForDice`] = true;

    for (const method of ['rollDices', 'rollTable']) {
        const original = proto[method];
        if (typeof original !== 'function') continue;

        proto[method] = async function (...args) {
            generatorRolls++;
            try {
                return await original.apply(this, args);
            } finally {
                generatorRolls--;
            }
        };
    }
}

/**
 * Chat messages created during a character generator roll resolve once their
 * Dice So Nice animation is over (right away when Dice So Nice isn't active).
 */
function _waitForDiceOnChatMessages() {
    const messageClass = CONFIG.ChatMessage.documentClass;
    const create = messageClass.create;

    messageClass.create = async function (...args) {
        const message = await create.apply(this, args);
        if (generatorRolls > 0 && message?.id && game.dice3d) {
            await game.dice3d.waitFor3DAnimationByMessageID(message.id);
        }
        return message;
    };
}

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
