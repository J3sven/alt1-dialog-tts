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
    const storedTtsEngine = localStorage.getItem("ttsEngine");
    const storedAwsttsEngine = localStorage.getItem("awsttsEngine");

    const currentEngineElement = document.getElementById("currentEngine");
    if (storedTtsEngine !== null) {
        currentEngineElement.innerText = capitalizeName(storedTtsEngine);
        if(storedTtsEngine === "elevenlabs") {
            const remainingCharacters = await getXiCharactersRemaining();
            currentEngineElement.append(` (${remainingCharacters})`);
        } else if (storedTtsEngine === "aws") {
            currentEngineElement.innerText = "Amazon Polly";
            if (storedAwsttsEngine === "true"){
                currentEngineElement.append(" (Neural)");
            }
        }
    } else {
        (document.getElementById("ttsEngine") as HTMLSelectElement).value = "mespeak";
        currentEngineElement.innerText = "mespeak";
    }

    if (storedAwsttsEngine !== null) {
        const checkbox = document.getElementById("awsttsEngine") as HTMLInputElement;
        checkbox.checked = storedAwsttsEngine === "true";
    }
}
