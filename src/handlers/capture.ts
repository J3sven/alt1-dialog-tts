import * as a1lib from "@alt1/base";
import DialogReader from "@alt1/dialog"
import { AwsTextToSpeech, MeSpeakTextToSpeech, ElevenLabsTextToSpeech } from "./tts";
import { processString, capitalizeName } from "./stringfunctions";

const dialog = new DialogReader();
var statusDiv = document.getElementById("status");

export let tts: MeSpeakTextToSpeech | AwsTextToSpeech | ElevenLabsTextToSpeech;
const awsNeural = localStorage.getItem("awsttsEngine") === "true";

const ttsEngine = {
	"aws": () => new AwsTextToSpeech(localStorage.getItem("awsAccessKey"), localStorage.getItem("awsSecretKey"), localStorage.getItem("awsRegion"), awsNeural),
	"elevenlabs": () => new ElevenLabsTextToSpeech(localStorage.getItem("elevenlabsapikey"), 'MF3mGyEYCl7XYWbV9V6O', 'VR6AewLTigWG4xSOukaG'),
	"default": () => new MeSpeakTextToSpeech()
}

tts = (ttsEngine[localStorage.getItem("ttsEngine")] || ttsEngine.default)();

export async function capture(player:any) {
	var img = a1lib.captureHoldFullRs();
	let dialogBool = dialog.find(img);

	if (dialogBool) {
		let [name, dialogText] = [dialog.readTitle(img), dialog.readDialog(img, dialog.checkDialog(img))].map(v => processString(String(v)));
		if (dialogText !== "null") tts.speak(dialogText, name.toUpperCase(), player);

		statusDiv.innerHTML = `<h2 class="talker">${capitalizeName(name)}</h2><p>${dialogText}</p>`;
	} else {
		if (tts.isPlaying) {
			return;
		}
        const progressBar = document.getElementById('progress') as HTMLElement;
		progressBar.style.width = "0%";
		statusDiv.innerHTML = `<div>Waiting...</div>`;
	}
}
