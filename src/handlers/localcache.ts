import { Md5 } from 'ts-md5';
import * as JSZip from 'jszip';
// Setup IndexedDB
let db;
const DB_NAME = 'audioDB';
const DB_STORE_NAME = 'audio';

const VOICE_DB_NAME = 'voicePairsDB';
const VOICE_DB_STORE_NAME = 'voicePairsStore';

export async function openDB() {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, 1);

        request.onerror = function(event) {
            console.error('Error opening database.');
            reject("Error");
        };

        request.onsuccess = function(event) {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        // This event is only implemented in recent browsers   
        request.onupgradeneeded = function(event) {
            db = (event.target as IDBOpenDBRequest).result;
            db.createObjectStore(DB_STORE_NAME, { keyPath: "id" });
        };
    });
}

let existingKeysSet = new Set();  // This will hold our existing keys

export async function loadExistingKeys() {
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([DB_STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(DB_STORE_NAME);
        const request = objectStore.openCursor();

        request.onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                existingKeysSet.add(cursor.key);
                cursor.continue();
            } else {
                resolve();
            }
        };

        request.onerror = function(event) {
            console.error('Error loading existing keys:', request.error);
            reject(request.error);
        };
    });
}

// Function to add a blob to IndexedDB
export async function addToDB(name: string, hash: string, data: Blob) {
    const key = `${name}/${hash}`;

    // If the key already exists, don't add it again
    if (existingKeysSet.has(key)) {
        return;
    }

    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([DB_STORE_NAME], 'readwrite');
        transaction.onerror = event => {
            console.error('Error adding data to DB:', transaction.error);
            reject(transaction.error);
        };
        transaction.oncomplete = event => {
            resolve();
        };
        const objectStore = transaction.objectStore(DB_STORE_NAME);
        const record = {
            id: key,
            data: data
        };
        objectStore.add(record);  // Using add() instead of put()
    });
}

// Function to get a blob from IndexedDB
export async function getFromDB(name: string, hash: string) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['audio']);
        transaction.onerror = (event) => reject("Couldn't retrieve item from DB: " + event);

        const objectStore = transaction.objectStore('audio');
        const request = objectStore.get(`${name}/${hash}`);
        request.onsuccess = () => resolve(request.result);
    });
}

// Function to load cache into IndexedDB
export async function loadCache() {
    document.querySelector('.loading-screen').classList.toggle("hidden");
    await loadVoicePairsCache();
    await openDB();
    const cacheTimestamp = localStorage.getItem('cacheTimestamp');

    if (cacheTimestamp) {
        const diff = Date.now() - Number(cacheTimestamp);

        // If the cache is less than 7 days old, don't re-download it
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            console.log('Using existing cache');
            document.querySelector('.loading-screen').classList.toggle("hidden");
            return;
        }
    }

    console.log('Loading cache...');
    // Download the cache zip file
    const response = await fetch('https://api.j3.gg/package/cache.zip');
    const arrayBuffer = await response.arrayBuffer();

    // Use JSZip to unzip the file
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    await loadExistingKeys();

    // Create an array to hold the promises
    const promises = [];

    // Iterate over each file in the zip
    zip.forEach(function (_, zipEntry) {
        if (zipEntry.dir) return; // ignore directories

        // Add the promise to the array
        promises.push((async () => {
            // Generate a Blob from the zipped file's data
            const data = await zipEntry.async('uint8array');
            const blob = new Blob([data], { type: 'audio/mpeg' });

            // Extract the name and hash from the path
            const pathSegments = zipEntry.name.split('/');
            const name = pathSegments[pathSegments.length - 2];
            const fileName = pathSegments[pathSegments.length - 1];
            const hash = fileName.split('.')[0];  // get hash from filename, excluding extension

            // Add the blob to IndexedDB
            await addToDB(name, hash, blob);
        })());
    });

    // Wait for all promises to finish
    await Promise.all(promises);
    document.querySelector('.loading-screen').classList.toggle("hidden");
    console.log('Cache initiated')

    // Update the cache timestamp
    localStorage.setItem('cacheTimestamp', String(Date.now()));
}

// Function to add to the voice pairs database
export const addToVoicePairsDB = async (name: string, voiceId: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(VOICE_DB_NAME);

        request.onupgradeneeded = function() {
            const db = request.result;
            db.createObjectStore(VOICE_DB_STORE_NAME, { keyPath: "id" });
        };

        request.onsuccess = function() {
            const db = request.result;
            const transaction = db.transaction([VOICE_DB_STORE_NAME], 'readwrite');
            const objectStore = transaction.objectStore(VOICE_DB_STORE_NAME);
            const addRequest = objectStore.put({ id: name, voiceId });

            addRequest.onsuccess = () => resolve();
            addRequest.onerror = () => reject(addRequest.error);
        };

        request.onerror = () => reject(request.error);
    });
};

// Function to get from the voice pairs database
export const getFromVoicePairsDB = async (name: string): Promise<{ id: string, voiceId: string } | undefined> => {
    return new Promise<{ id: string, voiceId: string } | undefined>((resolve, reject) => {
        const request = indexedDB.open(VOICE_DB_NAME);

        request.onupgradeneeded = function() {
            const db = request.result;
            db.createObjectStore(VOICE_DB_STORE_NAME, { keyPath: "id" });
        };

        request.onsuccess = function() {
            const db = request.result;
            const transaction = db.transaction([VOICE_DB_STORE_NAME]);
            const objectStore = transaction.objectStore(VOICE_DB_STORE_NAME);
            const getRequest = objectStore.get(name);

            getRequest.onsuccess = () => resolve(getRequest.result as { id: string, voiceId: string } | undefined);
            getRequest.onerror = () => reject(getRequest.error);
        };

        request.onerror = () => reject(request.error);
    });
};

export async function loadVoicePairsCache() {
    const cacheTimestamp = localStorage.getItem('voicePairsCacheTimestamp');

    if (cacheTimestamp) {
        const diff = Date.now() - Number(cacheTimestamp);

        // If the cache is less than 7 days old, don't re-download it
        if (diff < 7 * 24 * 60 * 60 * 1000) {
            console.log('Using existing voice pairs cache');
            return;
        }
    }
    // Download the voicepairs.json file
    const response = await fetch('https://api.j3.gg/voicepairs.json');
    const voicePairs = await response.json();

    // Add each voice pair to the IndexedDB
    for (const [name, voiceId] of Object.entries(voicePairs)) {
        await addToVoicePairsDB(name, voiceId as string);
    }

    // Update the voice pairs cache timestamp
    localStorage.setItem('voicePairsCacheTimestamp', String(Date.now()));
    console.log('Voice pairs cache initiated')
}