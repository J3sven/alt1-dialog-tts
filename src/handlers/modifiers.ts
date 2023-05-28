import { createRubberBandNode } from 'rubberband-web';
// Create an AudioContext
const context = new AudioContext();

// Define the impulse response
interface ImpulseResponse {
    title: string;
    file: string;
    size: number;
    buffer: null | ArrayBuffer;
    link: string;
    addDuration: number;
}

const impulseResponse: ImpulseResponse = {
    title: "Creswell Crags",
    file: "handlers/sounds/impulse_response_3.wav",
    size: 1048220,
    buffer: null,
    link: "https://openairlib.net/?page_id=441",
    addDuration: 1
};

// Function to load an audio file into an audio buffer
async function loadAudioBuffer(audioBlob: Blob): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            context.decodeAudioData(arrayBuffer, resolve, reject);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(audioBlob);
    });
}


// Function to create a WAV file from an AudioBuffer
function audioBufferToWav(buffer: AudioBuffer): Blob {
    // Create a DataView to hold the WAV data
    const dataView = new DataView(new ArrayBuffer(44 + buffer.length * 2));

    // Write the WAV header
    const writeString = (data: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            data.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(dataView, 0, 'RIFF');
    dataView.setUint32(4, 32 + buffer.length * 2, true);
    writeString(dataView, 8, 'WAVE');
    writeString(dataView, 12, 'fmt ');
    dataView.setUint32(16, 16, true);
    dataView.setUint16(20, 1, true);
    dataView.setUint16(22, buffer.numberOfChannels, true);
    dataView.setUint32(24, buffer.sampleRate, true);
    dataView.setUint32(28, buffer.sampleRate * 4, true);
    dataView.setUint16(32, 4, true);
    dataView.setUint16(34, 16, true);
    writeString(dataView, 36, 'data');
    dataView.setUint32(40, buffer.length * 2, true);

    // Write the PCM data
    const floatData = buffer.getChannelData(0);
    for (let i = 0; i < floatData.length; i++) {
        const multiplier = floatData[i] < 0 ? 0x8000 : 0x7FFF;
        dataView.setInt16(44 + i * 2, Math.round(floatData[i] * multiplier), true);
    }

    // Create a Blob from the DataView
    const blob = new Blob([dataView], { type: 'audio/wav' });
    return blob;
}

// Function to apply reverb and pitch shift effects
export async function applyReverb(audioBlob: Blob): Promise<Blob> {
    try {
        // Load audio and impulse response
        const audioBuffer = await loadAudioBuffer(audioBlob);
        let impulseBuffer: AudioBuffer | null = null;
        if (applyReverb) {
            const response = await fetch(impulseResponse.file);
            const impulseBlob = await response.blob();
            impulseBuffer = await loadAudioBuffer(impulseBlob);
        }

        // Create an OfflineAudioContext for rendering
        const offlineContext = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);

        // Create a BufferSourceNode for the audio to be processed
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;

        // Create a GainNode to adjust the volume before applying reverb
        const gainNode = offlineContext.createGain();
        gainNode.gain.value = 1.2; // Adjust this value to get the desired volume
        source.connect(gainNode);

        // Apply reverb if requested
        if (impulseBuffer) {
            const convolver = offlineContext.createConvolver();
            convolver.buffer = impulseBuffer;
            gainNode.connect(convolver);
            convolver.connect(offlineContext.destination);
        } else {
            gainNode.connect(offlineContext.destination);
        }

        // Start processing
        source.start();

        // Render the audio
        const renderedBuffer = await offlineContext.startRendering();

        // Convert the rendered AudioBuffer to a Blob
        const blob = audioBufferToWav(renderedBuffer);

        return blob;
    } catch (err) {
        throw new Error(`Error applying effects: ${err}`);
    }
}



export async function shiftPitch(audioBlob: Blob, pitchRatio: number): Promise<Blob> {
    
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const pitchShift = pitchRatio; // change this to desired pitch shift

    const postprocessResponse = await fetch(`https://api.j3.gg/postprocess/${pitchShift}`, {
        method: 'POST',
        body: formData
    });

    return await postprocessResponse.blob();
}