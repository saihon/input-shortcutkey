
type HTMLEditableElement = HTMLInputElement|HTMLTextAreaElement;

class Texts {
    public static prevBreak(element: HTMLEditableElement): number {
        let value    = element.value;
        let position = element.selectionEnd as number;

        if (position - 1 <= 0) return 0;

        if (value.charAt(position - 1) === '\n') {
            return position;
        }

        while (position--) {
            if (value[position] === '\n') {
                return position + 1;
            }
        }

        return 0;
    }

    public static nextBreak(element: HTMLEditableElement): number {
        let value    = element.value;
        let len      = value.length;
        let position = element.selectionEnd as number;
        if (position === len) return len;

        if (value.charAt(position) === '\n') {
            return position;
        }
        let index = value.indexOf('\n', position)
        if (index !== -1) return index;
        return len;
    }

    public static insert(text: string, index: number, insert: string): string {
        return (index === text.length) ? text + insert
                                       : text.slice(0, index) + insert +
                                             text.slice(index, text.length);
    }

    public static cut(text: string, begin: number, end: number): string {
        return text.substring(0, begin) + text.substring(end);
    }

    public static replace(text: string,
                          begin: number,
                          end: number,
                          replacement: string): string {
        return text.substring(0, begin).trimRight() + replacement +
               text.substring(end)
    }
}

// alt+u, esc u   to upper case
// alt+l, esc l   to lower case
// alt+c, esc c   to title case

export class Actions {
    private static active: boolean = true;

    private static _isEditable(element: HTMLElement): boolean {
        const tag = element.tagName;
        return tag == 'TEXTAREA' || tag == 'INPUT' || element.isContentEditable;
    }

    private static _stopAction(element: HTMLElement,
                               e: ExtendedKeyboardEvent): boolean {
        if (Actions.active == false) return true;
        if (Actions._isEditable(element)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        return true;
    }

    public static toggle_activate_key = [ 'alt+i', 'esc i' ];
    public static toggle_activate(e: ExtendedKeyboardEvent, combo: string) {
        Actions.active = !Actions.active;
        return;
    }

    public static move_cursor_to_the_backward_one_character_key = [ 'ctrl+b' ];
    public static move_cursor_to_the_backward_one_character(
        e: ExtendedKeyboardEvent, combo: string) {
        let element = e.target as HTMLEditableElement;
        if (Actions._stopAction(element, e)) return;

        let position = element.selectionEnd as number;
        if (position == null || position <= 0) {
            return;
        }

        element.setSelectionRange(position - 1, position - 1);
    }

    public static move_cursor_to_the_forward_one_character_key = [ 'ctrl+f' ];
    public static move_cursor_to_the_forward_one_character(
        e: ExtendedKeyboardEvent, combo: string) {
        let element = e.target as HTMLEditableElement;
        if (Actions._stopAction(element, e)) return;

        let position = element.selectionEnd as number;
        if (position == null || position === element.value.length) {
            return;
        }

        element.setSelectionRange(position + 1, position + 1);
    }

    public static move_cursor_to_the_backward_one_word_key =
        [ 'alt+b', 'esc b' ];
    public static move_cursor_to_the_backward_one_word(e: ExtendedKeyboardEvent,
                                                       combo: string) {
        let element = e.target as HTMLEditableElement;
        if (Actions._stopAction(element, e)) return;

        let position = element.selectionEnd as number;
        if (position == null) return;

        let left          = element.value.slice(0, position);
        let sum: number   = 0;
        let index: number = 0;
        while (left) {
            if ((index = left.search(/[\s\n](?:\b)/)) !== -1) {
                sum += index + 1;
                left = left.substring(index + 1);
            } else {
                break;
            }
        }

        element.setSelectionRange(sum, sum);
    }

    public static move_cursor_to_the_forward_one_word_key =
        [ 'alt+f', 'esc f' ];
    public static move_cursor_to_the_forward_one_word(e: ExtendedKeyboardEvent,
                                                      combo: string) {
        let element = e.target as HTMLEditableElement;
        if (Actions._stopAction(element, e)) return;

        let position = element.selectionEnd;
        if (position == null) return;

        let right         = element.value.slice(position);
        let index: number = right.search(/\s(?:\b)/);
        if (index == -1) {
            const end = element.value.length;
            element.setSelectionRange(end, end);
        } else {
            index++;
            element.setSelectionRange(position + index, position + index);
        }
    }

    public static move_cursor_to_the_beginning_of_the_line_key = [ 'ctrl+a' ];
    public static move_cursor_to_the_beginning_of_the_line(
        e: ExtendedKeyboardEvent, combo: string) {
        let element = e.target as HTMLEditableElement;
        if (Actions._stopAction(element, e)) return;

        let prev = Texts.prevBreak(element);
        element.setSelectionRange(prev, prev);
    }

    public static move_cursor_to_the_end_of_the_line_key = [ 'ctrl+e' ];
    public static move_cursor_to_the_end_of_the_line(e: ExtendedKeyboardEvent,
                                                     combo: string) {
        let element = e.target as HTMLEditableElement;
        if (Actions._stopAction(element, e)) return;

        let next = Texts.nextBreak(element);
        element.setSelectionRange(next, next);
    }

    public static delete_the_word_before_the_cursor_key = [ 'ctrl+w' ];
    public static delete_the_word_before_the_cursor(e: ExtendedKeyboardEvent,
                                                    combo: string) {
        let element = e.target as HTMLEditableElement;
        if (Actions._stopAction(element, e)) return;

        let position = element.selectionEnd;
        if (position == null) return;

        let left  = element.value.slice(0, position);
        let right = element.value.slice(position);

        let _left         = left;
        let sum: number   = 0;
        let index: number = 0;
        while (_left) {
            if ((index = _left.search(/[\s\n](?:\b)/)) !== -1) {
                sum += index + 1;
                _left = _left.substring(index + 1);
            } else {
                break;
            }
        }
        left          = left.substr(0, sum);
        element.value = (sum === 0) ? right : left + right;
        element.setSelectionRange(sum, sum);
    }

    public static delete_the_word_after_the_cursor_key = [ 'alt+d', 'esc d' ];
    public static delete_the_word_after_the_cursor(e: ExtendedKeyboardEvent,
                                                   combo: string) {
        let element = e.target as HTMLEditableElement;
        if (Actions._stopAction(element, e)) return;

        let position = element.selectionEnd;
        if (position == null) return;

        let left  = element.value.slice(0, position);
        let right = element.value.slice(position);

        let index: number = 0;
        if ((index = right.search(/\s(?:\b)/)) !== -1) {
            right         = right.substring(index + 1);
            element.value = left + right;
        } else {
            element.value = left;
        }
        element.setSelectionRange(position, position);
    }

    public static delete_the_character_before_the_cursor_key = [ 'ctrl+h' ];
    public static delete_the_character_before_the_cursor(
        e: ExtendedKeyboardEvent, combo: string) {
        let element = e.target as HTMLEditableElement;
        if (Actions._stopAction(element, e)) return;

        let position = element.selectionEnd;
        if (position == null || position <= 0) return false;
        position--;

        element.value = Texts.cut(element.value, position, position + 1);
        element.setSelectionRange(position, position);
    }

    public static delete_the_character_after_the_cursor_key = [ 'ctrl+d' ];
    public static delete_the_character_after_the_cursor(
        e: ExtendedKeyboardEvent, combo: string) {
        let element = e.target as HTMLEditableElement;
        if (Actions._stopAction(element, e)) return;

        let position = element.selectionEnd;
        if (position == null || position >= element.value.length) return;

        element.value = Texts.cut(element.value, position, position + 1);
        element.setSelectionRange(position, position);
    }

    public static delete_part_of_the_line_before_the_cursor_key = [ 'ctrl+u' ];
    public static delete_part_of_the_line_before_the_cursor(
        e: ExtendedKeyboardEvent, combo: string) {
        let element = e.target as HTMLEditableElement;
        if (Actions._stopAction(element, e)) return;

        let position = element.selectionEnd;
        let prev     = Texts.prevBreak(element);
        if (position == null || prev == position) return;

        element.value = Texts.cut(element.value, prev, position);
        element.setSelectionRange(prev, prev);
    }

    public static delete_part_of_the_line_after_the_cursor_key = [ 'ctrl+k' ];
    public static delete_part_of_the_line_after_the_cursor(
        e: ExtendedKeyboardEvent, combo: string) {
        let element = e.target as HTMLEditableElement;
        if (Actions._stopAction(element, e)) return;

        let position = element.selectionEnd;
        let next     = Texts.nextBreak(element);
        if (position == null || position == next) return;

        element.value = Texts.cut(element.value, position, next);
        element.setSelectionRange(position, position);
    }

    public static delete_the_current_line_key = [ 'alt+r', 'esc r' ];
    public static delete_the_current_line(e: ExtendedKeyboardEvent,
                                          combo: string) {
        let element = e.target as HTMLEditableElement;
        if (Actions._stopAction(element, e)) return;

        if (!element.value) return;

        let prev     = Texts.prevBreak(element);
        let next     = Texts.nextBreak(element);
        let position = element.selectionEnd;
        if (position == null) return;

        if (prev === next) {
            if (element.value.charAt(prev - 1) === '\n') {
                element.value =
                    Texts.cut(element.value, position - 1, position);
            } else if (element.value.charAt(next) === '\n') {
                element.value =
                    Texts.cut(element.value, position, position + 1);
            } else {
                return;
            }
        } else {
            element.value = Texts.cut(element.value, prev, next);
        }
        element.setSelectionRange(prev, prev);
    }

    public static insert_line_below_key = [ 'ctrl+enter' ];
    public static insert_line_below(e: ExtendedKeyboardEvent, combo: string) {
        let element = e.target as HTMLEditableElement;
        if (Actions._stopAction(element, e)) return;

        let next      = Texts.nextBreak(element);
        element.value = Texts.insert(element.value, next, "\n");
        element.setSelectionRange(next + 1, next + 1);
    }

    public static insert_line_above_key = [ 'ctrl+shift+enter' ];
    public static insert_line_above(e: ExtendedKeyboardEvent, combo: string) {
        let element = e.target as HTMLEditableElement;
        if (Actions._stopAction(element, e)) return;

        let prev      = Texts.prevBreak(element);
        element.value = Texts.insert(element.value, prev, "\n");
        element.setSelectionRange(prev, prev);
    }

    public static join_lines_key = [ 'ctrl+j' ];
    public static join_lines(e: ExtendedKeyboardEvent, combo: string) {
        let element = e.target as HTMLEditableElement;
        if (Actions._stopAction(element, e)) return;

        let position = element.selectionEnd;
        if (position == null) return;
        let insert = ' '
        let begin  = Texts.nextBreak(element);
        if (begin === element.value.length) {
            begin  = Texts.prevBreak(element) - 1;
            insert = '';
        }
        if (begin <= 0) return;
        element.value = Texts.replace(element.value, begin, begin + 1, insert);
        element.setSelectionRange(position, position);
    }
}

export const ActionNames: string[] = (() => {
    let names = [];
    for (let key of Object.getOwnPropertyNames(Actions)) {
        if (typeof (Actions as any)[key] === "function") {
            if (key.charAt(0) == '_') continue;
            names.push(key);
        }
    }
    return names;
})();

export const DefaultKeymap: {[key: string]: string|string[]|null} = (() => {
    let keymap: {[key: string]: string|string[]|null} = {};
    for (const name of ActionNames) {
        keymap[name] = (Actions as any)[name + '_key'];
    }
    return keymap
})();
