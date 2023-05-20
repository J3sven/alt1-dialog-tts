import { capitalizeName } from "./stringfunctions";
import { getXiCharactersRemaining } from "./xilabs";

export function setFormListener() {
    document.getElementById("settings-form").addEventListener("submit", function (event) {
        event.preventDefault();

        const player = (document.getElementById("player") as HTMLInputElement).value;
        const isFemale = (document.getElementById("gender") as HTMLSelectElement).value;

        localStorage.setItem("player", player);
        localStorage.setItem("isFemale", isFemale);
    });
    
}

// Check if localStorage values are set and autopopulate the form
export async function populateFormFromLocalStorage() {
    const storedPlayer = localStorage.getItem("player");
    const storedIsFemale = localStorage.getItem("isFemale");
    const storedTtsEngine = localStorage.getItem("ttsEngine");
    const storedAwsRegion = localStorage.getItem("awsRegion");
    const storedAwsAccessKey = localStorage.getItem("awsAccessKey");
    const storedAwsSecretKey = localStorage.getItem("awsSecretKey");
    const storedAwsttsEngine = localStorage.getItem("awsttsEngine");
    const storedElevenlabsApiKey = localStorage.getItem("elevenlabsapikey");

    if (storedPlayer !== null) {
        (document.getElementById("player") as HTMLInputElement).value = storedPlayer;
    }

    if (storedIsFemale !== null) {
        (document.getElementById("gender") as HTMLSelectElement).value = storedIsFemale;
    }

    if (storedTtsEngine !== null) {
        (document.getElementById("tts-engine") as HTMLSelectElement).value = storedTtsEngine;
        document.getElementById("currentEngine").innerText = capitalizeName(storedTtsEngine);
        if(storedTtsEngine === "elevenlabs") {
            let remainingCharacters = await getXiCharactersRemaining();
            document.getElementById("currentEngine").append(" (" + remainingCharacters + ")");
        }
    } else{
        (document.getElementById("tts-engine") as HTMLSelectElement).value = "mespeak";
        document.getElementById("currentEngine").innerText =  "mespeak";
    }

    if (storedAwsRegion !== null) {
        (document.getElementById("aws-region") as HTMLSelectElement).value = storedAwsRegion;
    }

    if (storedAwsAccessKey !== null) {
        (document.getElementById("aws-accesskey") as HTMLInputElement).value = storedAwsAccessKey;
    }

    if (storedAwsSecretKey !== null) {
        (document.getElementById("aws-secretkey") as HTMLInputElement).value = storedAwsSecretKey;
    }

    if (storedElevenlabsApiKey !== null) {
        (document.getElementById("elevenlabs-apikey") as HTMLInputElement).value = storedElevenlabsApiKey;
    }

    if (storedAwsttsEngine !== null) {
        const checkbox = document.getElementById("aws-ttsengine") as HTMLInputElement;
        checkbox.checked = storedAwsttsEngine === "true";
    }
}

