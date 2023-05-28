import { Md5 } from 'ts-md5';
import JSZip = require("jszip")
// Setup IndexedDB
let db;
const openRequest = indexedDB.open('audioDB', 1);

openRequest.onupgradeneeded = function(e) {
    let db = openRequest.result;
    if (!db.objectStoreNames.contains('audio')) {
        db.createObjectStore('audio');
    }
};

openRequest.onerror = function(e) {
    console.error("Error", openRequest.error);
};

openRequest.onsuccess = function(e) {
    db = openRequest.result;
};

// Function to add a blob to IndexedDB
export async function addToDB(hash, blob) {
    const transaction = db.transaction(['audio'], 'readwrite');
    const objectStore = transaction.objectStore('audio');
    objectStore.put(blob, hash);
}

// Function to get a blob from IndexedDB
export async function getFromDB(hash) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['audio'], 'readonly');
        const objectStore = transaction.objectStore('audio');
        const getRequest = objectStore.get(hash);

        getRequest.onsuccess = function(event) {
            if (getRequest.result) {
                resolve(getRequest.result);
            } else {
                resolve(null);
            }
        };

        getRequest.onerror = function(event) {
            reject(new Error(`Error fetching data from IndexedDB: ${event.target.errorCode}`));
        };
    });
}

// Function to load cache into IndexedDB
export async function loadCache() {
    // Download the cache zip file
    const response = await fetch('https://www.j3.gg/tts/cache.zip');
    const arrayBuffer = await response.arrayBuffer();

    // Use JSZip to unzip the file
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Iterate over each file in the zip
    zip.forEach(async function (_, zipEntry) {
        if (zipEntry.dir) return; // ignore directories

        const blob = await zipEntry.async('blob');

        // Extract the name and hash from the path
        const pathSegments = zipEntry.name.split('/');
        const name = pathSegments[pathSegments.length - 2];
        const hash = Md5.hashStr(name + pathSegments[pathSegments.length - 1]);

        // Add the blob to IndexedDB
        await addToDB(hash, blob);
    });
}

