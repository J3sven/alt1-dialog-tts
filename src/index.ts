import { getPlayerFromLocalStorage } from "./handlers/self";
import { populateFormFromLocalStorage } from "./handlers/playerform";
import { capture } from "./handlers/capture";
import { loadCache } from './handlers/localcache';

(window as any).cacheServer = "https://api.j3.gg";
// (window as any).cacheServer = "http://localhost:3000";

populateFormFromLocalStorage();
const player = getPlayerFromLocalStorage();

interface FormElements {
    [key: string]: HTMLInputElement | HTMLSelectElement;
}

const formIds = ["player", "isFemale", "elevenlabsapikey"];
const elements: FormElements = formIds.reduce((acc: FormElements, id: string) => ({ ...acc, [id]: document.getElementById(id) as HTMLInputElement | HTMLSelectElement }), {});

const settingsForm = document.getElementById("settings-form") as HTMLFormElement;
const settingsToggle = document.getElementById("settingsToggle") as HTMLElement;
const settings = document.getElementById("settings") as HTMLElement;
const submitButton = document.getElementById("formsubmit") as HTMLElement;

settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    Object.entries(elements).forEach(([key, element]) => {
        const value = element.value;
        localStorage.setItem(key, value);
    });
    window.location.reload();
});

// const handleElementsVisibility = (elements: HTMLCollectionOf<HTMLElement>, display: string) => {
//     Array.from(elements).forEach((element: HTMLElement) => {
//         element.style.display = display;
//     });
// };

const handleInputChange = () => {
    (submitButton as HTMLButtonElement).classList.add("cta");
};

Array.from(settingsForm.querySelectorAll("input, select")).forEach((element: HTMLElement) => {
    element.addEventListener("change", handleInputChange);
});


let captureInterval = window.setInterval(async () => {
    try {
        await capture(player);
    } catch (error) {
        console.error("Error capturing:", error);
        window.clearInterval(captureInterval);
    }
}, 400);

settingsToggle.addEventListener("click", () => {
    settings.classList.toggle("hidden");
    submitButton.classList.toggle("hidden");
    settingsToggle.classList.toggle("active");
});

// document.addEventListener('contextmenu', (event) => {
//     event.preventDefault();
// });


if (window.alt1) {
    alt1.identifyAppUrl("./appconfig.json");
} else {
    const output = document.getElementById("status");
    output.insertAdjacentHTML("beforeend", `<div>You need to run this page in alt1 to capture the screen</div>`);
    if (!alt1.permissionPixel) output.insertAdjacentHTML("beforeend", `<div>Page is not installed as app or capture permission is not enabled</div>`);
}

window.onload = loadCache;