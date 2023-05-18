//alt1 base libs, provides all the commonly used methods for image matching and capture
//also gives your editor info about the window.alt1 api
import { getPlayerFromLocalStorage } from "./handlers/self";
import { populateFormFromLocalStorage } from "./handlers/playerform";
import { capture } from "./handlers/capture";

//tell webpack to add index.html and appconfig.json to output
require("!file-loader?name=[name].[ext]!./index.html");
require("!file-loader?name=[name].[ext]!./appconfig.json");

populateFormFromLocalStorage();

const player = getPlayerFromLocalStorage();


document.getElementById("settings-form").addEventListener("submit", function (event) {
	event.preventDefault();

	const playerField = (document.getElementById("player") as HTMLInputElement).value;
	const isFemaleField = (document.getElementById("gender") as HTMLSelectElement).value;
	const ttsEngineField = (document.getElementById("tts-engine") as HTMLSelectElement).value;
	const awsRegionField = (document.getElementById("aws-region") as HTMLSelectElement).value;
	const awsAccessKeyField = (document.getElementById("aws-accesskey") as HTMLInputElement).value;
	const awsSecretKeyField = (document.getElementById("aws-secretkey") as HTMLInputElement).value;
	const elevenlabsApiKeyField = (document.getElementById("elevenlabs-apikey") as HTMLInputElement).value;
	const awsTtsEngineField = (document.getElementById("aws-ttsengine") as HTMLInputElement);
	let neuralEngine = "false"
	if (awsTtsEngineField.checked) neuralEngine = "true"

	localStorage.setItem("player", playerField);
	localStorage.setItem("isFemale", isFemaleField);
	localStorage.setItem("ttsEngine", ttsEngineField);
	localStorage.setItem("awsRegion", awsRegionField);
	localStorage.setItem("awsAccessKey", awsAccessKeyField);
	localStorage.setItem("awsSecretKey", awsSecretKeyField);
	localStorage.setItem("elevenlabsapikey", elevenlabsApiKeyField);
	localStorage.setItem("awsttsEngine", neuralEngine);

	const updatedPlayer = getPlayerFromLocalStorage();

	player.self = updatedPlayer.self;
	player.selfFemale = updatedPlayer.selfFemale;
	window.location.reload();
});

const form = document.getElementById("settings-form") as HTMLFormElement;
const nameForm = document.getElementById("player") as HTMLInputElement;
const genderSelect = document.getElementById("gender") as HTMLSelectElement;
const select = document.getElementById("tts-engine") as HTMLSelectElement;
const submitButton = form.querySelector(".formsubmit") as HTMLButtonElement;

const awsElements = document.getElementsByClassName("aws") as HTMLCollectionOf<HTMLElement>;
const elevenlabsElements = document.getElementsByClassName("elevenlabs") as HTMLCollectionOf<HTMLElement>;

function handleSelectChange(addCtaClass = true) {
	const selectedOption = select.value;

	// Hide all AWS and Elevenlabs elements
	for (let i = 0; i < awsElements.length; i++) {
		awsElements[i].style.display = "none";
	}
	for (let i = 0; i < elevenlabsElements.length; i++) {
		elevenlabsElements[i].style.display = "none";
	}

	// Show elements based on the selected option
	if (selectedOption === "aws" || selectedOption === "elevenlabs") {
		const elementsToDisplay = selectedOption === "aws" ? awsElements : elevenlabsElements;
		for (let i = 0; i < elementsToDisplay.length; i++) {
			elementsToDisplay[i].style.display = "";
		}
	}

	if (addCtaClass) {
		submitButton.classList.add("cta");
	}
}

function handleInputChange() {
	submitButton.classList.add("cta");
}

// Add event listeners to all input and select elements
Array.from(form.querySelectorAll("input, select")).forEach((element: HTMLElement) => {
	element.addEventListener("change", handleInputChange);
});

nameForm.addEventListener("change", () => handleInputChange());
select.addEventListener("change", () => handleSelectChange(true));
genderSelect.addEventListener("change", () => handleSelectChange(true));

// Call handleSelectChange initially to set the form state based on the initial select value, but don't add the cta class
handleSelectChange(false);




window.setInterval(async () => {
	try {
		await capture(player);
	} catch (error) {
		console.error("Error capturing:", error);
	}
}, 600);

document.getElementById("settingsToggle").addEventListener("click", () => {
	document.getElementById("settings").classList.toggle("hidden");
	document.getElementById("settingsToggle").classList.toggle("active");
});

// statusDiv.insertAdjacentHTML("beforeend", `<h2 class="talker">Tester</h2>`);
// statusDiv.insertAdjacentHTML("beforeend", `<p>lorem	ipsum dolor set amet we're finally here! Can you believe it?</p>`);

if (window.alt1) {
	alt1.identifyAppUrl("./appconfig.json");
}