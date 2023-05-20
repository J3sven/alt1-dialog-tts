import { getPlayerFromLocalStorage } from "./handlers/self";
import { populateFormFromLocalStorage } from "./handlers/playerform";
import { capture } from "./handlers/capture";

require("!file-loader?name=[name].[ext]!./index.html");
require("!file-loader?name=[name].[ext]!./app.css");
require("!file-loader?name=[name].[ext]!./icon.png");
require("!file-loader?name=[name].[ext]!./femaleNpcs.json");
require("!file-loader?name=[name].[ext]!./appconfig.json");
require("!file-loader?name=[name].[ext]!./mespeak_config.json");

populateFormFromLocalStorage();
const player = getPlayerFromLocalStorage();

interface FormElements {
    [key: string]: HTMLInputElement | HTMLSelectElement;
}

const formIds = ["player", "gender", "ttsEngine", "awsRegion", "awsAccessKey", "awsSecretKey", "elevenlabsapikey", "awsttsEngine"];
const elements: FormElements = formIds.reduce((acc: FormElements, id: string) => ({ ...acc, [id]: document.getElementById(id) as HTMLInputElement | HTMLSelectElement }), {});

const settingsForm = document.getElementById("settings-form") as HTMLFormElement;
const settingsToggle = document.getElementById("settingsToggle") as HTMLElement;
const settings = document.getElementById("settings") as HTMLElement;

settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    Object.entries(elements).forEach(([key, element]) => {
        const value = (key === "awsttsEngine") ? (element as HTMLInputElement).checked.toString() : element.value;
        localStorage.setItem(key, value);
    });
    window.location.reload();
});

const handleElementsVisibility = (elements: HTMLCollectionOf<HTMLElement>, display: string) => {
    Array.from(elements).forEach((element: HTMLElement) => {
        element.style.display = display;
    });
};

const handleInputChange = () => {
    (settingsForm.querySelector(".formsubmit") as HTMLButtonElement).classList.add("cta");
};

const handleSelectChange = (addCtaClass = true) => {
    const selectedOption = elements.ttsEngine.value;
    handleElementsVisibility(document.getElementsByClassName("aws") as HTMLCollectionOf<HTMLElement>, "none");
    handleElementsVisibility(document.getElementsByClassName("elevenlabs") as HTMLCollectionOf<HTMLElement>, "none");

    if (selectedOption === "aws" || selectedOption === "elevenlabs") {
        handleElementsVisibility(document.getElementsByClassName(selectedOption) as HTMLCollectionOf<HTMLElement>, "");
    }
    
    if (addCtaClass) handleInputChange();
};

Array.from(settingsForm.querySelectorAll("input, select")).forEach((element: HTMLElement) => {
    element.addEventListener("change", handleInputChange);
    element.addEventListener("change", () => handleSelectChange(true));
});

handleSelectChange(false);

let captureInterval = window.setInterval(async () => {
    try {
        await capture(player);
    } catch (error) {
        console.error("Error capturing:", error);
        window.clearInterval(captureInterval);
    }
}, 600);

settingsToggle.addEventListener("click", () => {
    settings.classList.toggle("hidden");
    settingsToggle.classList.toggle("active");
});

if (window.alt1) {
    alt1.identifyAppUrl("./appconfig.json");
} else{
	const output = document.getElementById("status");
	output.insertAdjacentHTML("beforeend", `<div>You need to run this page in alt1 to capture the screen</div>`);
	if (!alt1.permissionPixel) output.insertAdjacentHTML("beforeend", `<div>Page is not installed as app or capture permission is not enabled</div>`);
}
