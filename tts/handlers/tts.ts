import * as AWS from 'aws-sdk';
import { processString, stringExistsInJson, processNameString, fixPhonetics } from './stringfunctions';
import { loadGenderData } from './gender';
import * as meSpeak from './meSpeak';
import { getXiCharactersRemaining } from "./xilabs";
import { gsap } from 'gsap';
import {Md5} from 'ts-md5';

const femaleNpcs = './femaleNpcs.json'
var genderCache: { FemaleNpcs: string[] } | null = null;

export abstract class TextToSpeech<T> {
    protected audioQueue: T[] = [];
    public isPlaying = false;
    protected lastProcessedString: string | null = null;
    protected femaleVoice: string;
    protected maleVoice: string;
    public audioVolume: number = 1;

    public updateProgress(ratio: number): void {
        const progressBar = document.getElementById('progress') as HTMLElement;
        if (progressBar) {
            gsap.to(progressBar, {
                width: (ratio * 100).toFixed(2) + '%',
                duration: 0.1,
                ease: "power1.inOut"
            });
        }
    }

    constructor() {
        const volumeSlider = document.getElementById('volume') as HTMLInputElement;
        volumeSlider.addEventListener('input', () => {
            this.audioVolume = parseFloat(volumeSlider.value);
        });
    }

    public async speak(text: string, name: string, player: any): Promise<void> {
        if (!text) {
            console.error('Text is empty.');
            return;
        }

        if (!name || name === '') {
            return;
        }

        if (this.lastProcessedString === text) {
            return;
        }

        if (this.isPlaying && this.isInAudioQueue(text)) {
            return;
        }


        this.lastProcessedString = text;

        let genderVoice = this.maleVoice;

        const jsonData = await loadGenderData(femaleNpcs, genderCache);
        if (stringExistsInJson(processNameString(name), jsonData)) genderVoice = this.femaleVoice;

        if (name === player.self && player.selfFemale) genderVoice = this.femaleVoice;

        if (name === player.self  && player.selfFemale){ 
            name = 'player-female'
        } else if (name === player.self && !player.selfFemale){
            name = 'player-male'
        }

        await this.processSpeech(fixPhonetics(text), genderVoice, name.toUpperCase());
    }

    protected abstract isInAudioQueue(text: string): boolean;

    protected abstract processSpeech(text: string, genderVoice: string, name:string): Promise<void>;
}


export class AwsTextToSpeech extends TextToSpeech<string> {
    private polly: AWS.Polly;
    private neural = false;

    constructor(accessKeyId: string, secretAccessKey: string, region: string, neural?: boolean) {
        super();
        this.femaleVoice = "Joanna";
        this.maleVoice = "Matthew";

        AWS.config.region = region;
        AWS.config.credentials = new AWS.Credentials({
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
        });

        this.polly = new AWS.Polly();
        this.neural = neural || false;
    }

    protected isInAudioQueue(text: string): boolean {
        return this.audioQueue.indexOf(text) !== -1;
    }

    protected async processSpeech(text: string, genderVoice: string): Promise<void> {
        const params: AWS.Polly.SynthesizeSpeechInput = {
            Engine: this.neural ? 'neural' : 'standard',
            Text: processString(text),
            OutputFormat: 'mp3',
            VoiceId: genderVoice,
        };

        try {
            const data = await this.polly.synthesizeSpeech(params).promise();
            const audioContent = (data.AudioStream as Buffer).toString('base64');
            this.enqueueAudio(`data:audio/mp3;base64,${audioContent}`);
        } catch (error) {
            console.error('Error while fetching Amazon Polly TTS API:', error);
        }
    }

    private enqueueAudio(audioSrc: string): void {
        this.audioQueue.push(audioSrc);
        if (!this.isPlaying) {
            this.playNext();
        }
    }

    private async playNext(): Promise<void> {

        if (this.audioQueue.length === 0) {
            this.isPlaying = false;
            return;
        }

        this.isPlaying = true;
        const audioSrc = this.audioQueue.shift();
        const audio = new Audio(audioSrc);
        audio.addEventListener('loadedmetadata', () => {
            this.updateProgress(0);
        });
        audio.addEventListener('timeupdate', () => {
            this.updateProgress(audio.currentTime / audio.duration);
        });
        audio.volume = this.audioVolume;
        audio.onended = async () => {
            await this.playNext();
        };
        audio.play();
    }
}


export class MeSpeakTextToSpeech extends TextToSpeech<{ text: string; voice: string }> {
    constructor() {
        super();
        this.femaleVoice = 'en/en+f3';
        this.maleVoice = 'en/en+m3';

        meSpeak.loadConfig('./mespeak_config.json');
        meSpeak.loadVoice('./voices/en.json');
    }

    protected isInAudioQueue(text: string): boolean {
        return this.audioQueue.some(item => item.text === text);
    }

    protected async processSpeech(text: string, genderVoice: string): Promise<void> {
        this.enqueueAudio({ text, voice: genderVoice });
    }

    private enqueueAudio(item: { text: string; voice: string }): void {
        this.audioQueue.push(item);
        if (!this.isPlaying) {
            this.playNext();
        }
    }

    private playNext(): void {
        if (this.audioQueue.length === 0) {
            this.isPlaying = false;
            return;
        }

        this.isPlaying = true;
        const { text, voice } = this.audioQueue.shift();
        const wavData = meSpeak.speak(text, { voice, rawdata: 'array' });

        if (wavData && !(wavData instanceof Boolean)) {
            const blob = new Blob([new Uint8Array(wavData as ArrayBuffer)], { type: 'audio/wav' });
            const audioURL = URL.createObjectURL(blob);
            const audio = new Audio(audioURL);
            audio.addEventListener('loadedmetadata', () => {
                this.updateProgress(0);
            });
            audio.addEventListener('timeupdate', () => {
                this.updateProgress(audio.currentTime / audio.duration);
            });
            audio.volume = this.audioVolume;
            audio.onended = () => {
                this.playNext();
            };
            audio.play();
        } else {
            console.error('Error synthesizing speech:', text);
            this.isPlaying = false;
        }
    }
}

export class ElevenLabsTextToSpeech extends TextToSpeech<string> {
    private xiApiKey: string;

    constructor(xiApiKey: string, femaleVoiceId: string, maleVoiceId: string) {
        super();
        this.xiApiKey = xiApiKey;
        this.femaleVoice = femaleVoiceId;
        this.maleVoice = maleVoiceId;
    }

    protected getFemaleVoice(): string {
        return this.femaleVoice;
    }

    protected getMaleVoice(): string {
        return this.maleVoice;
    }

    protected isInAudioQueue(text: string): boolean {
        return this.audioQueue.includes(text);
    }

    protected async postAudio(hash: string, audio: Blob, name: string): Promise<void> {
        console.log('Posting audio to Eleven Labs API')
        try {
            const formData = new FormData();
            formData.append('file', audio, `${hash}.mp3`);
        
            const response = await fetch(`http://api.j3.gg/audio/${name}/${hash}`, {
                method: 'POST',
                body: formData,
            });
        
            if (!response.ok) {
                throw new Error(`Failed to post audio. HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error while posting audio:', error);
        }
    }

    protected async processSpeech(text: string, voiceId: string, name:string): Promise<void> {
        const hash = Md5.hashStr(voiceId + text);
        console.log('Processing speech:', text, 'with hash:', hash)
    
        try {
            let response = await fetch(`http://api.j3.gg/audio/${name}/${hash}`);
            console.log('Response:', response)
            let audioContent;
    
            if (!response.ok) {
                console.log('Audio not found in cache, generating new audio')
                // If the audio isn't found in cache, generate new audio
                response = await this.textToSpeech(text, voiceId);
    
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
    
                audioContent = await response.blob();
                
                // Cache the new audio for future use
                this.postAudio(hash, audioContent, name);
            } else {
                console.log('Audio found in cache')
                audioContent = await response.blob();
            }
    
            const audioSrc = URL.createObjectURL(audioContent);
            this.audioQueue.push(audioSrc);
    
            if (!this.isPlaying) {
                await this.playNext();
            }
        } catch (error) {
            console.error('Error while processing speech:', error);
        }
    }
    

    private async textToSpeech(text: string, voiceId: string): Promise<Response> {
        const requestUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=2`;

        const headers = {
            'Accept': 'audio/mpeg',
            'xi-api-key': this.xiApiKey,
            'Content-Type': 'application/json'
        };

        const body = JSON.stringify({
            text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
                stability: 0,
                similarity_boost: 0
            }
        });

        const response = await fetch(requestUrl, {
            method: 'POST',
            headers,
            body
        });

        
        let remainingCharacters = await getXiCharactersRemaining();
        document.getElementById("currentEngine").innerText = "Elevenlabs";
        document.getElementById("currentEngine").append(" (" + remainingCharacters + ")");

        return response;
    }

    private async playNext(): Promise<void> {
        if (this.audioQueue.length === 0) {
            this.isPlaying = false;
            return;
        }

        this.isPlaying = true;
        const audioSrc = this.audioQueue.shift();
        if (!audioSrc) {
            this.isPlaying = false;
            return;
        }

        const audio = new Audio(audioSrc);
        audio.volume = this.audioVolume;
        audio.addEventListener('loadedmetadata', () => {
            this.updateProgress(0);
        });
        audio.addEventListener('timeupdate', () => {
            this.updateProgress(audio.currentTime / audio.duration);
        });
        audio.addEventListener('ended', () => {
            this.playNext();
        });
        await audio.play();
    }
}
