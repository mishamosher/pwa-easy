/**
 * The EmojiUnicode class. Allows getting the unicode code of an emoji.
 *
 * Based on https://github.com/IonicaBizau/emoji-unicode/blob/592d8d45d9ed083b93c457fadf51e4e0fbc75bd8/lib/index.js
 */
class EmojiUnicode {
    constructor() {
        throw new Error('Can not instantiate. Please use the static members.');
    }

    /**
     * Get the unicode code points of an emoji.
     *
     * @param {String} input The emoji character.
     * @returns {Array<int>} The unicode code points.
     */
    static raw(input) {
        if (input.length === 1) {
            return [input.charCodeAt(0)];
        } else if (input.length > 1) {
            const pairs = [];
            for (let i = 0; i < input.length; i++) {
                const codeI = input.charCodeAt(i);
                if (codeI >= 0xd800 && codeI <= 0xdbff) { // high surrogate
                    const codeI1 = input.charCodeAt(i + 1);
                    if (codeI1 >= 0xdc00 && codeI1 <= 0xdfff) { // low surrogate
                        pairs.push((codeI - 0xd800) * 0x400 + (codeI1 - 0xdc00) + 0x10000);
                    }
                } else if (codeI < 0xd800 || codeI > 0xdfff) { // modifiers and joiners
                    pairs.push(codeI);
                }
            }
            return pairs;
        }

        return [];
    }

    /**
     * Get the unicode code of an emoji in base 16.
     *
     * @param {String} input The emoji character.
     * @param {String} separator Separator for the joined code points.
     * @param {String} prefix Prefix for the joined code points.
     * @returns {String} The base 16 unicode code.
     */
    static hex(input, separator = ' ', prefix = '') {
        return EmojiUnicode.raw(input).map(val => `${prefix}${val.toString(16)}`).join(separator);
    }
}

export default EmojiUnicode;