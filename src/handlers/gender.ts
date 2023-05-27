
export async function loadGenderData(url: string, jsonDataCache): Promise<{ FemaleNpcs: string[] }> {
	if (jsonDataCache) {
		return jsonDataCache;
	}
	const response = await fetch(url);
	const jsonData = await response.json();
	jsonDataCache = jsonData;
	return jsonData;
}

export function determineVoiceId(name:string, isFemale:Boolean, voice:string){
	let voiceId: string;
	if (name === 'PLAYER-FEMALE') {
		voiceId = 'MF3mGyEYCl7XYWbV9V6O'
	} else if (name === 'PLAYER-MALE') {
		voiceId = 'VR6AewLTigWG4xSOukaG'
	} else {
		voiceId = voice
		console.log('Voice ID:', voiceId)
	}
	return voiceId
}