import { capitalizeName } from "./stringfunctions";
import { getXiCharactersRemaining } from "./xilabs";

const localStorageKeys = ["player", "isFemale", "ttsEngine", "awsRegion", "awsAccessKey", "awsSecretKey", "awsttsEngine", "elevenlabsapikey"];

export function setFormListener() {
    document.getElementById("settings-form").addEventListener("submit", (event) => {
        event.preventDefault();
        localStorage.setItem("player", (document.getElementById("player") as HTMLInputElement).value);
        localStorage.setItem("isFemale", (document.getElementById("isFemale") as HTMLSelectElement).value);
    });
}

export async function populateFormFromLocalStorage() {
    for (const key of localStorageKeys) {
        const value = localStorage.getItem(key);
        if (value !== null && document.getElementById(key) !== null) {
            (document.getElementById(key) as HTMLInputElement | HTMLSelectElement).value = value;
        }
    }
}
