import * as a1lib from "@alt1/base";
import DialogReader from "@alt1/dialog"
import { AwsTextToSpeech, MeSpeakTextToSpeech, ElevenLabsTextToSpeech } from "./tts";
import { processString, processNameString, capitalizeName } from "./stringfunctions";

const dialog = new DialogReader();
const output = document.getElementById("output");
var statusDiv = document.getElementById("status");

let tts: MeSpeakTextToSpeech | AwsTextToSpeech | ElevenLabsTextToSpeech;

const storedTtsEngine = localStorage.getItem("ttsEngine");
const storedAwsRegion = localStorage.getItem("awsRegion");
const storedElevenlabsApiKey = localStorage.getItem("elevenlabsapikey");
const storedAwsAccessKey = localStorage.getItem("awsAccessKey");
const storedAwsSecretKey = localStorage.getItem("awsSecretKey");
const storedAwsttsEngine = localStorage.getItem("awsttsEngine");
let awsNeural = false;
if(storedAwsttsEngine == "true") awsNeural = true;

if(storedTtsEngine == "aws") {
	tts = new AwsTextToSpeech(storedAwsAccessKey, storedAwsSecretKey, storedAwsRegion, awsNeural) as AwsTextToSpeech;
} else if(storedTtsEngine == "elevenlabs") {
	tts = new ElevenLabsTextToSpeech(storedElevenlabsApiKey, 'MF3mGyEYCl7XYWbV9V6O', 'VR6AewLTigWG4xSOukaG') as ElevenLabsTextToSpeech;
}else {
	tts = new MeSpeakTextToSpeech() as MeSpeakTextToSpeech;
}

export async function capture(player:any) {
	if (!window.alt1) {
		output.insertAdjacentHTML("beforeend", `<div>You need to run this page in alt1 to capture the screen</div>`);
		return;
	}
	if (!alt1.permissionPixel) {
		output.insertAdjacentHTML("beforeend", `<div>Page is not installed as app or capture permission is not enabled</div>`);
		return;
	}
	var img = a1lib.captureHoldFullRs();

	let dialogBool = dialog.find(img);

	if (dialogBool != false) {
		console.log("dialog is open")
		let dialogcheck = dialog.checkDialog(img);
		let name = dialog.readTitle(img);
		let cleanName = processNameString(String(name));
		let dialogText = dialog.readDialog(img, dialogcheck);
		let cleanDialogText = processString(String(dialogText));
		if (dialogcheck = true && String(dialogText) !== "null") {
			tts.speak(cleanDialogText, cleanName, player);
		}
		statusDiv.innerHTML = "";
		statusDiv.insertAdjacentHTML("beforeend", `<h2 class="talker">${capitalizeName(cleanName)}</h2>`);
		statusDiv.insertAdjacentHTML("beforeend", `<p>${cleanDialogText}</p>`);
	} else {
		statusDiv.innerHTML = "";
		statusDiv.insertAdjacentHTML("beforeend", `<div>Waiting...</div>`);
	}
}