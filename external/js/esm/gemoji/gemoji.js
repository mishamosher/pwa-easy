import EmojiUnicode from "../emoji-unicode/emoji-unicode.js";

const supported = new Set([
    '👋',
    '🤚',
    '🖐️',
    '✋',
    '🖖',
    '👌',
    '🤏',
    '✌️',
    '🤞',
    '🤟',
    '🤘',
    '🤙',
    '👈',
    '👉',
    '👆',
    '🖕',
    '👇',
    '☝️',
    '👍',
    '👎',
    '✊',
    '👊',
    '🤛',
    '🤜',
    '👏',
    '🙌',
    '👐',
    '🤲',
    '🙏',
    '✍️',
    '💅',
    '🤳',
    '💪',
    '🦵',
    '🦶',
    '👂',
    '🦻',
    '👃',
    '👶',
    '🧒',
    '👦',
    '👧',
    '🧑',
    '👱',
    '👨',
    '🧔',
    '👱‍♂️',
    '👨‍🦰',
    '👨‍🦱',
    '👨‍🦳',
    '👨‍🦲',
    '👩',
    '👱‍♀️',
    '👩‍🦰',
    '👩‍🦱',
    '👩‍🦳',
    '👩‍🦲',
    '🧓',
    '👴',
    '👵',
    '🙍',
    '🙍‍♂️',
    '🙍‍♀️',
    '🙎',
    '🙎‍♂️',
    '🙎‍♀️',
    '🙅',
    '🙅‍♂️',
    '🙅‍♀️',
    '🙆',
    '🙆‍♂️',
    '🙆‍♀️',
    '💁',
    '💁‍♂️',
    '💁‍♀️',
    '🙋',
    '🙋‍♂️',
    '🙋‍♀️',
    '🧏',
    '🧏‍♂️',
    '🧏‍♀️',
    '🙇',
    '🙇‍♂️',
    '🙇‍♀️',
    '🤦',
    '🤦‍♂️',
    '🤦‍♀️',
    '🤷',
    '🤷‍♂️',
    '🤷‍♀️',
    '👨‍⚕️',
    '👩‍⚕️',
    '👨‍🎓',
    '👩‍🎓',
    '👨‍🏫',
    '👩‍🏫',
    '👨‍⚖️',
    '👩‍⚖️',
    '👨‍🌾',
    '👩‍🌾',
    '👨‍🍳',
    '👩‍🍳',
    '👨‍🔧',
    '👩‍🔧',
    '👨‍🏭',
    '👩‍🏭',
    '👨‍💼',
    '👩‍💼',
    '👨‍🔬',
    '👩‍🔬',
    '👨‍💻',
    '👩‍💻',
    '👨‍🎤',
    '👩‍🎤',
    '👨‍🎨',
    '👩‍🎨',
    '👨‍✈️',
    '👩‍✈️',
    '👨‍🚀',
    '👩‍🚀',
    '👨‍🚒',
    '👩‍🚒',
    '👮',
    '👮‍♂️',
    '👮‍♀️',
    '🕵️',
    '🕵️‍♂️',
    '🕵️‍♀️',
    '💂',
    '💂‍♂️',
    '💂‍♀️',
    '👷',
    '👷‍♂️',
    '👷‍♀️',
    '🤴',
    '👸',
    '👳',
    '👳‍♂️',
    '👳‍♀️',
    '👲',
    '🧕',
    '🤵',
    '👰',
    '🤰',
    '🤱',
    '👼',
    '🎅',
    '🤶',
    '🦸',
    '🦸‍♂️',
    '🦸‍♀️',
    '🦹',
    '🦹‍♂️',
    '🦹‍♀️',
    '🧙',
    '🧙‍♂️',
    '🧙‍♀️',
    '🧚',
    '🧚‍♂️',
    '🧚‍♀️',
    '🧛',
    '🧛‍♂️',
    '🧛‍♀️',
    '🧜',
    '🧜‍♂️',
    '🧜‍♀️',
    '🧝',
    '🧝‍♂️',
    '🧝‍♀️',
    '💆',
    '💆‍♂️',
    '💆‍♀️',
    '💇',
    '💇‍♂️',
    '💇‍♀️',
    '🚶',
    '🚶‍♂️',
    '🚶‍♀️',
    '🧍',
    '🧍‍♂️',
    '🧍‍♀️',
    '🧎',
    '🧎‍♂️',
    '🧎‍♀️',
    '👨‍🦯',
    '👩‍🦯',
    '👨‍🦼',
    '👩‍🦼',
    '👨‍🦽',
    '👩‍🦽',
    '🏃',
    '🏃‍♂️',
    '🏃‍♀️',
    '💃',
    '🕺',
    '🕴️',
    '🧖',
    '🧖‍♂️',
    '🧖‍♀️',
    '🧗',
    '🧗‍♂️',
    '🧗‍♀️',
    '🏇',
    '🏂',
    '🏌️',
    '🏌️‍♂️',
    '🏌️‍♀️',
    '🏄',
    '🏄‍♂️',
    '🏄‍♀️',
    '🚣',
    '🚣‍♂️',
    '🚣‍♀️',
    '🏊',
    '🏊‍♂️',
    '🏊‍♀️',
    '⛹️',
    '⛹️‍♂️',
    '⛹️‍♀️',
    '🏋️',
    '🏋️‍♂️',
    '🏋️‍♀️',
    '🚴',
    '🚴‍♂️',
    '🚴‍♀️',
    '🚵',
    '🚵‍♂️',
    '🚵‍♀️',
    '🤸',
    '🤸‍♂️',
    '🤸‍♀️',
    '🤽',
    '🤽‍♂️',
    '🤽‍♀️',
    '🤾',
    '🤾‍♂️',
    '🤾‍♀️',
    '🤹',
    '🤹‍♂️',
    '🤹‍♀️',
    '🧘',
    '🧘‍♂️',
    '🧘‍♀️',
    '🛀',
    '🛌',
    '🧑‍🤝‍🧑',
    '👭',
    '👫',
    '👬'
]);

function isModifiable(emoji) {
    return supported.has(emoji);
}

const ZERO_WIDTH_JOINER = '\u{200d}';
const VARIATION_16 = 0xfe0f;

function applyTone(sequence, tone) {
    const sequenceWithToneRemoved = removeTone(sequence);
    if (!isModifiable(sequenceWithToneRemoved)) return sequence;
    const modifier = toneModifier(tone);
    if (!modifier) return sequence;
    return sequenceWithToneRemoved
        .split(ZERO_WIDTH_JOINER)
        .map(emoji => (isModifiable(emoji) ? tint(emoji, modifier) : emoji))
        .join(ZERO_WIDTH_JOINER);
}

function applyTones(sequence, tones) {
    const sequenceWithToneRemoved = removeTone(sequence);
    if (!isModifiable(sequenceWithToneRemoved)) return sequence;
    const modifiers = tones.map(t => toneModifier(t));
    return sequenceWithToneRemoved
        .split(ZERO_WIDTH_JOINER)
        .map(emoji => {
            if (!isModifiable(emoji)) return emoji;
            const modifier = modifiers.shift();
            return modifier ? tint(emoji, modifier) : emoji;
        }).join(ZERO_WIDTH_JOINER);
}

function removeTone(emoji) {
    return [...emoji].filter(ch => !isTone(ch.codePointAt(0))).join('');
}

function tint(emoji, tone) {
    const points = [...emoji].map(p => p.codePointAt(0));
    if (points[1] && (isTone(points[1]) || points[1] === VARIATION_16)) points[1] = tone;
    else points.splice(1, 0, tone);
    return String.fromCodePoint(...points);
}

function isTone(point) {
    return point >= 0x1f3fb && point <= 0x1f3ff;
}

function toneModifier(id) {
    switch (id) {
        case 1:
            return 0x1f3fb;
        case 2:
            return 0x1f3fc;
        case 3:
            return 0x1f3fd;
        case 4:
            return 0x1f3fe;
        case 5:
            return 0x1f3ff;
        default:
            return null;
    }
}

const _textContent = new WeakMap();

/**
 * The GEmojiElement class.
 *
 * Shows an emoji as a SVG, thus allowing non-emoji browsers to see it.
 *
 * Refer to {@see https://github.com/github/g-emoji-element/} for usage examples. The attribute fallback-src is not
 * supported, because the logic has been modified to always use an SVG instead of the emoji.
 *
 * Don't forget to register via `window.customElements.define('tag-name', GEmojiElement);`
 *
 * Uses assets from https://openmoji.org/
 *
 * Based on https://github.com/github/g-emoji-element/blob/c057e2ef1ac50891a7f8e7833c3e415f6c2ccb6a/src/index.ts
 *
 * @property {string} alias Used to set the 'alt' attribute of the inner HTMLImageElement containing the emoji SVG. If falsy or not present will default to the emoji itself.
 * @property {string} tone Space separated list of tone to apply, 1 trough 5 means white trough black, 0 means no tone
 * @property {string} size Size of the element. Can be suffixed by any CSS measurement unit.
 * @property {string} textContent Sets or gets the currently displayed emoji. Please note that setting textContent will respect the alias and tone if present.
 */
class GEmojiElement extends HTMLElement {
    /**
     * The inner HTMLImageElement containing the emoji SVG
     *
     * @readonly
     * @return {HTMLImageElement|null}
     */
    get image() {
        return this.firstElementChild instanceof HTMLImageElement ? this.firstElementChild : null;
    }

    get tone() {
        return (this.getAttribute('tone') || '')
            .split(' ')
            .map(value => {
                const tone = parseInt(value, 10);
                return tone >= 0 && tone <= 5 ? tone : null;
            }).filter(value => typeof value === 'number').join(' ');
    }

    set tone(modifiers) {
        this.setAttribute('tone', modifiers);
    }

    get size() {
        return this.getAttribute('size');
    }

    set size(value) {
        this.setAttribute('size', value);
    }

    get alias() {
        return this.getAttribute('alias');
    }

    set alias(value) {
        this.setAttribute('alias', value);
    }

    get textContent() {
        return _textContent.get(this) ?? '';
    }

    set textContent(value) {
        value = tonedEmoji(value, this.tone);
        _textContent.set(this, value);

        if (!this.image) return;
        this.image.src = svgUrl(value);
        if (!this.alias) this.image.alt = value;
    }

    connectedCallback() {
        // re-set textContent so it is only stored in a private field and not shown in the DOM
        _textContent.set(this, super.textContent);
        super.textContent = '';

        this.appendChild(emojiImage(this));

        updateTone(this);
        updateSize(this);
        updateAlias(this);
    }

    static get observedAttributes() {
        return ['tone', 'size', 'alias'];
    }

    attributeChangedCallback(name) {
        switch (name) {
            case 'tone':
                updateTone(this);
                break;
            case 'size':
                updateSize(this);
                break;
            case 'alias':
                updateAlias(this);
        }
    }
}

function svgUrl(emoji) {
    return `${config.rootURL.pathname}external/img/openmoji/${EmojiUnicode.hex(emoji, '-').toUpperCase()}.svg`;
}

function emojiImage(el) {
    const image = document.createElement('img');
    image.className = 'emoji';
    image.src = svgUrl(el.textContent);

    const style = image.style;
    style.display = 'inline-block';
    style.verticalAlign = 'text-bottom';

    return image;
}

/**
 * Generates a 'toned' emoji.
 *
 * tonedEmoji(:family-man-woman-girl-boy:, '0 3 5 0') --> :family-man_tone_none-woman_tone_medium-girl_tone_dark-boy_tone_none:
 * tonedEmoji(:wave:, '3') --> :wave_tone_medium:
 *
 * Please note that only the emojis listed in the `supported` set are supported.
 *
 * @param {string} emoji Emoji to tone
 * @param {string} tone Space separated list of tone to apply, 1 trough 5 means white trough black, 0 means no tone
 * @returns {string} The toned emoji, or the emoji without modifications if its not supported.
 */
function tonedEmoji(emoji, tone) {
    if (!tone) return emoji;
    const tones = tone.split(' ').map(x => parseInt(x, 10));
    if (tones.length === 0) emoji = removeTone(emoji || '');
    else if (tones.length === 1) {
        const tone = tones[0];
        emoji = tone === 0 ? removeTone(emoji || '') : applyTone(emoji || '', tone);
    } else emoji = applyTones(emoji || '', tones);

    return emoji;
}

function updateTone(el) {
    el.textContent = tonedEmoji(el.textContent, el.tone);
}

function updateSize(el) {
    if (!el.image) return;
    const style = el.image.style;
    style.height = style.width = el.size || '20px';
}

function updateAlias(el) {
    if (!el.image) return;
    el.image.alt = el.alias || el.textContent;
}

export default GEmojiElement;