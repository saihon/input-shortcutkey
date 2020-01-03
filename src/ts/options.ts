
import '../css/options.css';

import {DefaultKeymap} from './action';

const editorArea = document.getElementById('editor') as HTMLTextAreaElement;
const errorArea  = document.getElementById('error') as HTMLElement;

const initialize = (items: {[key: string]: any}): void => {
    let keymap: any = {};
    if (Object.keys(items).length == 0) {
        chrome.storage.local.set(DefaultKeymap);
        keymap = DefaultKeymap;
        console.log(keymap);
    } else {
        keymap = items;
    }

    editorArea.value = JSON.stringify(keymap, null, 2);
};

chrome.storage.local.get(initialize);

const onChange = (e: any) => {
    try {
        const items = JSON.parse(e.target.value);
        chrome.storage.local.set(items);
        errorArea.innerText = '';
    } catch (e) {
        errorArea.innerText = e.message;
    }
};

editorArea.addEventListener('change', onChange);
