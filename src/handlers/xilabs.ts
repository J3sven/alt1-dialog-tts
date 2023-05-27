import { Md5 } from 'ts-md5';

export async function getXiCharactersRemaining(): Promise<number> {
  const storedElevenlabsApiKey = localStorage.getItem("elevenlabsapikey");

  if (!storedElevenlabsApiKey || storedElevenlabsApiKey.length === 0) {
    throw new Error('No ElevenLabs API key found');
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'xi-api-key': storedElevenlabsApiKey
      }
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }

    const data = await response.json();
    const remainingCharacters = data.subscription.character_limit - data.subscription.character_count;

    return remainingCharacters;
  } catch (error) {
    // Handle any errors that occurred during the request
    console.error(error);
    throw error;
  }
}

export async function getVoiceId(name: string, isMale: boolean): Promise<string> {
  let voiceId: string;

  const maleVoiceIds = [
    "ErXwobaYiN019PkySvjV",
    "TxGEqnHWrfWFTfGW9XjX",
    "VR6AewLTigWG4xSOukaG",
    "pNInz6obpgDQGcFmaJgB",
    "yoZ06aMxZJJ28mfd3POQ"
  ];

  const femaleVoiceIds = [
    "21m00Tcm4TlvDq8ikWAM",
    "AZnzlk1XvdvUeBnXmlld",
    "EXAVITQu4vr4xnSDxMaL",
    "MF3mGyEYCl7XYWbV9V6O"
  ];

  try {
    const response = await this.getVoicePairFromApi(name);
    if (!response.ok) {
      // If a voice pair does not exist on the server, create a new one.
      const voiceIds = isMale ? maleVoiceIds : femaleVoiceIds;
      voiceId = voiceIds[Math.floor(Math.random() * voiceIds.length)];

      // Store the new voice pair on the server.
      await this.storeVoicePairToApi(name, voiceId);
    } else {
      voiceId = (await response.json()).voiceId;
    }
  } catch (error) {
    console.error('Error while getting voice ID:', error);
  }

  return voiceId;
}

export async function getAudioFromCacheApi(name:string, voiceId:string, text:string){
    const hash = Md5.hashStr(voiceId + text);
    try {
      const response = await fetch(`https://api.j3.gg/audio/${name}/${hash}`);
      if (!response.ok) {

      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }
}

export async function generateXiLabsAudio(xiApiKey:string, voiceId:string, text:string) {
  const requestUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=2`;

  const headers = {
      'Accept': 'audio/mpeg',
      'xi-api-key': xiApiKey,
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