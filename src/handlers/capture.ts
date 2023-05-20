import * as a1lib from "@alt1/base";
import DialogReader from "@alt1/dialog"
import { AwsTextToSpeech, MeSpeakTextToSpeech, ElevenLabsTextToSpeech } from "./tts";
import { processString, processNameString, capitalizeName } from "./stringfunctions";

const dialog = new DialogReader();
const output = document.getElementById("output");
var statusDiv = document.getElementById("status");

let tts: MeSpeakTextToSpeech | AwsTextToSpeech | ElevenLabsTextToSpeech;
const awsNeural = localStorage.getItem("awsttsEngine") === "true";

const ttsEngine = {
	"aws": () => new AwsTextToSpeech(localStorage.getItem("awsAccessKey"), localStorage.getItem("awsSecretKey"), localStorage.getItem("awsRegion"), awsNeural),
	"elevenlabs": () => new ElevenLabsTextToSpeech(localStorage.getItem("elevenlabsapikey"), 'MF3mGyEYCl7XYWbV9V6O', 'VR6AewLTigWG4xSOukaG'),
	"default": () => new MeSpeakTextToSpeech()
}

tts = (ttsEngine[localStorage.getItem("ttsEngine")] || ttsEngine.default)();

export async function capture(player:any) {
	const alt1 = window.alt1;
	if (!alt1) return output.insertAdjacentHTML("beforeend", `<div>You need to run this page in alt1 to capture the screen</div>`);
	if (!alt1.permissionPixel) return output.insertAdjacentHTML("beforeend", `<div>Page is not installed as app or capture permission is not enabled</div>`);

	var img = a1lib.captureHoldFullRs();
	let dialogBool = dialog.find(img);

	if (dialogBool) {
		let [name, dialogText] = [dialog.readTitle(img), dialog.readDialog(img, dialog.checkDialog(img))].map(v => processString(String(v)));
		if (dialogText !== "null") tts.speak(dialogText, name, player);

		statusDiv.innerHTML = `<h2 class="talker">${capitalizeName(name)}</h2><p>${dialogText}</p>`;
	} else {
		statusDiv.innerHTML = `<div>Waiting...</div>`;
	}
}
