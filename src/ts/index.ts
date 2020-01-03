
import Mousetrap from 'mousetrap';
;
import 'mousetrap-global-bind';

import {Actions, ActionNames, DefaultKeymap} from './action';

const pattern = new RegExp(
    'f[1-9]|f1[0-2]|ctrl|shift|alt|meta|backspace|tab|enter|return|capslock|esc|escape|space|pageup|pagedown|end|home|left|up|right|down|ins|del|plus',
    'ig');

const normalize = (key: string): string => {
    return key.trim()
        .replace(/\s+/, ' ')
        .replace(pattern, v => v.toLowerCase())
        .split(/\s*\+\s*/)
        .join('+');
};

const bindings = (keys: any, funcName: string) => {
    if (ActionNames.indexOf(funcName) == -1) return;
    switch (true) {
    case Array.isArray(keys):
        if (keys.length == 0) return;
        keys = (keys as string[]).map(v => normalize(v));
        break;
    case typeof keys == 'string':
        if (keys == '') return;
        keys = normalize(keys);
        break;
    default:
        return;
    }
    Mousetrap.bindGlobal(keys, (Actions as any)[funcName]);
};

const initialize = (items: {[key: string]: any}): void => {
    let keymap: any = {};
    if (Object.keys(items).length == 0) {
        chrome.storage.sync.set(DefaultKeymap);
        keymap = DefaultKeymap;
    } else {
        keymap = items;
    }
    for (let funcName in keymap) {
        let keys = keymap[funcName];
        if (keys == void 0) continue;
        bindings(keys, funcName);
    }
};

chrome.storage.sync.get(initialize);

function onChanged(changes: {[key: string]: chrome.storage.StorageChange;},
                   areaName: string) {

    for (let funcName in changes) {
        let c = changes[funcName];
        if (c.newValue.toString() !== c.oldValue.toString()) {
            Mousetrap.unbind(c.oldValue);
            bindings(c.newValue, funcName);
        }
    }
};

chrome.storage.onChanged.addListener(onChanged);
