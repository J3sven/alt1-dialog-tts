import { stringExistsInJson, capitalizeName, processNameString, fixPhonetics } from './stringfunctions';
import { loadGenderData } from './gender';
import { getXiCharactersRemaining } from "./xilabs";
import { gsap } from 'gsap';
import { Md5 } from 'ts-md5';
import { applyReverb, shiftPitch } from './modifiers';
import { isGhost, isGnome, isDemon } from './modifiermaps/specialentities';
import { getFromDB, addToDB, addToVoicePairsDB, getFromVoicePairsDB } from './localcache';


const femaleNpcs = './data/femaleNpcs.json'
const sourceElement = document.querySelector('.responseSource') as HTMLElement;
var genderCache: { FemaleNpcs: string[] } | null = null;

export abstract class TextToSpeech<T> {
    protected audioQueue: { src: string, id: number }[] = [];
    protected dialogQueue: { name: string, text: string, id: number }[] = [];
    public isPlaying = false;
    protected lastProcessedString: string | null = null;
    protected femaleVoice: string;
    protected maleVoice: string;
    public audioVolume: number = 1;
    protected nextId: number = 0;

    public updateUIWithText(name: string, dialogText: string): void {
        document.getElementById("status").innerHTML = `<h2 class="talker">${capitalizeName(name)}</h2><p>${dialogText}</p>`;
        const progressBar = document.getElementById('progress') as HTMLElement;
        progressBar.style.width = "0%";
    }

    protected async isFemale(name: string): Promise<boolean> {
        const jsonData = await loadGenderData(femaleNpcs, genderCache);
        return stringExistsInJson(processNameString(name), jsonData);
    }

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
    
        // Load the stored value from localStorage or use a default value if there is no stored value
        const storedVolume = localStorage.getItem('volume');
        if (storedVolume !== null) {
            this.audioVolume = parseFloat(storedVolume);
            volumeSlider.value = storedVolume;  // Set the slider to the stored value
        } else {
            this.audioVolume = 0.5; // Default value
        }
    
        volumeSlider.addEventListener('input', () => {
            this.audioVolume = parseFloat(volumeSlider.value);
            // Store the new value in localStorage every time it changes
            localStorage.setItem('volume', volumeSlider.value);
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

        const currentId = this.nextId++;

        this.lastProcessedString = text;
        this.dialogQueue.push({ name, text, id: currentId });

        let genderVoice = this.maleVoice;
        if (this.isFemale(name)) {
            genderVoice = this.femaleVoice;
        }

        if (name === player.self) {
            if (player.selfFemale) {
                genderVoice = this.femaleVoice;
                name = 'player-female';
            } else {
                name = 'player-male';
            }
        }
        await this.processSpeech(fixPhonetics(text), genderVoice, name.toUpperCase(), currentId);
    }

    protected abstract isInAudioQueue(text: string): boolean;

    protected abstract processSpeech(text: string, name: string, genderVoice:string, currentId: number): Promise<void>;


    protected async getVoiceId(name: string, isMale: boolean): Promise<string> {
        let voiceId = '';
    
        const maleVoiceIds = [
            "ErXwobaYiN019PkySvjV",
            "TxGEqnHWrfWFTfGW9XjX",
            "VR6AewLTigWG4xSOukaG",
            "pNInz6obpgDQGcFmaJgB",
            "yoZ06aMxZJJ28mfd3POQ",
            "2EiwWnXFnvU5JabPnv8n",
            "CYw3kZ02Hs0563khs1Fj",
            "D38z5RcWu1voky8WS1ja",
            "N2lVS1w4EtoT3dr4eOWO",
            "ODq5zmih8GrVes37Dizd",
            "SOYHLrjzK2X1ezoPC6cr",
            "TX3LPaxmHKxFdv7VOQHJ",
            "Yko7PKHZNXotIFUBG7I9",
            "ZQe5CZNOzWyzPSCn5a3c",
            "Zlb1dXrM653N07WRdFW3",
            "bVMeCyTHy58xNoL34h3p",
            "g5CIjZEefAph4nQFvHAz",
            "onwK4e9ZLuTAKqWW03F9"
        ];
    
        const femaleVoiceIds = [
            "21m00Tcm4TlvDq8ikWAM",
            "AZnzlk1XvdvUeBnXmlld",
            "EXAVITQu4vr4xnSDxMaL",
            "MF3mGyEYCl7XYWbV9V6O",
            "AZnzlk1XvdvUeBnXmlld",
            "ThT5KcBeYPX3keUQqHPh",
            "XB0fDUnXU5powFXDhCwa",
            "XrExE9yKIg1WjnnlVkGX",
            "jBpfuIE2acCO8z3wKNLl",
            "jsCqWAovK2LkecY7zXl4",
            "oWAxZDx7w5VEj9dCyTzz",
            "pMsXgVXv3BLzUgSXRplE",
            "z9fAnlkpzviPz146aGWa"
        ];
    
        try {
            const cacheResponse = await getFromVoicePairsDB(name);
    
            if (cacheResponse) {
                voiceId = cacheResponse.voiceId;
            } else {
                const apiResponse = await this.getVoicePairFromApi(name);
    
                if (!apiResponse.ok) {
                    // If a voice pair does not exist on the server, create a new one.
                    const voiceIds = isMale ? maleVoiceIds : femaleVoiceIds;  // Assuming you have these arrays defined somewhere accessible.
                    voiceId = voiceIds[Math.floor(Math.random() * voiceIds.length)];
    
                    // Store the new voice pair on the server.
                    await this.storeVoicePairToApi(name, voiceId);
                } else {
                    voiceId = (await apiResponse.json()).voiceId;
                }
    
                // Update the cache with the new voiceId
                await addToVoicePairsDB(name, voiceId);
            }
        } catch (error) {
            console.error('Error while getting voice ID:', error);
        }
    
        return voiceId;
    }

    protected async getVoicePairFromApi(name: string): Promise<Response> {
        return fetch((window as any).cacheServer + `/voice/${name}`);
    }

    protected async storeVoicePairToApi(name: string, voiceId: string): Promise<Response> {
        return fetch((window as any).cacheServer + `/voice/${name}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voiceId })
        });
    }

}

export class ElevenLabsTextToSpeech extends TextToSpeech<string> {
    private xiApiKey: string;
    private receivedFrom: string;

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
        return this.audioQueue.some(audioObj => audioObj.src === text);
    }    

    protected async postAudio(hash: string, audio: Blob, name: string): Promise<void> {
        try {
            const formData = new FormData();
            formData.append('file', audio, `${hash}.mp3`);

            const response = await fetch((window as any).cacheServer + `/audio/${name}/${hash}`, {
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

    protected async processSpeech(text: string, genderVoice: string, name: string, currentId: number): Promise<void> {
        let voiceId: string;
        console.log('text: ' + text);
        const voiceIdLookup = {
            'PLAYER-FEMALE': 'MF3mGyEYCl7XYWbV9V6O',
            'PLAYER-MALE': 'VR6AewLTigWG4xSOukaG',
            'WISE OLD MAN': 'TiLw41Jevzwmmak89xWl',
            'GRANNY POTTERINGTON': 'sNCcXLo5TnCQrzQ5d8hl',
            'ZENEVIVIA': 'iKwvJVerfnKx6PrfJK3Y',
            'ARIS': 'gZ9LBLNjYC02R7gSBR6P',
            'FORTUNETELLER': 'gZ9LBLNjYC02R7gSBR6P'
        };
        
        if (voiceIdLookup.hasOwnProperty(name)) {
            voiceId = voiceIdLookup[name];
        } else {
            const isFemale = await this.isFemale(name);
            voiceId = await this.getVoiceId(name, !isFemale);
        }
        
        

        const hash = Md5.hashStr(voiceId + text);
        console.log(`Hash: ${hash}`)
        try {
            let audioContent;
            let audioData = await getFromDB(name, hash) as { data: Blob } | undefined;
            audioContent = audioData?.data ;
            this.receivedFrom = 'Local cache';
            sourceElement.style.color = "#24dd24";
            
            if (!audioContent) {
                this.receivedFrom = 'Remote cache';
                sourceElement.style.color = "#00dcff";
                let response = await fetch((window as any).cacheServer + `/audio/${name}/${hash}`);

                if (!response.ok) {
                    console.log('Audio not found in cache, generating new audio')
                    // uncomment when debugging
                    // return
                    // If the audio isn't found in cache, generate new audio
                    response = await this.textToSpeech(text, voiceId);

                    this.receivedFrom = 'Generated new audio';
                    sourceElement.style.color = "yellow";

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    audioContent = await response.blob();
                    if (isGhost(name)) audioContent = await applyReverb(audioContent, 0);
                    if (isGnome(name)) audioContent = await shiftPitch(audioContent, 1.1);
                    if (isDemon(name)) audioContent = await shiftPitch(audioContent, 0.65);

                    // Cache the new audio for future use
                    await addToDB(name, hash, audioContent);
                    this.postAudio(hash, audioContent, name);
                } else {
                    audioContent = await response.blob();
                    await addToDB(name, hash, audioContent);
                }
            }

            const audioSrc = URL.createObjectURL(audioContent);

            this.audioQueue.push({ src: audioSrc, id: currentId });

            this.audioQueue.sort((a, b) => a.id - b.id);
            this.dialogQueue.sort((a, b) => a.id - b.id);

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
        document.getElementById("currentEngine").innerText = "elevenlabs.io";
        document.getElementById("currentEngine").append(" (" + remainingCharacters + ")");

        return response;
    }

    private async playNext(): Promise<void> {
        if (this.audioQueue.length === 0) {
            this.isPlaying = false;
            return;
        }

        this.isPlaying = true;
        const audioData = this.audioQueue.shift();
        const dialog = this.dialogQueue.shift();
        if (!audioData) {
            this.isPlaying = false;
            return;
        }
        
        const audio = new Audio(audioData.src);
        this.updateUIWithText(dialog.name, dialog.text);
        audio.volume = this.audioVolume;
        sourceElement.innerText = this.receivedFrom;
        sourceElement.style.display = "inline-block";
        audio.addEventListener('loadedmetadata', () => {
            this.updateProgress(0);
        });
        audio.addEventListener('timeupdate', () => {
            this.updateProgress(audio.currentTime / audio.duration);
        });
        audio.addEventListener('ended', () => {
            this.playNext();
            sourceElement.style.display = "none";
        });
        await audio.play();
    }
}
