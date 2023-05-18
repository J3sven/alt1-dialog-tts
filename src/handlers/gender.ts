
export async function loadGenderData(url: string, jsonDataCache): Promise<{ FemaleNpcs: string[] }> {
	if (jsonDataCache) {
		console.log('returning cached json data');
		return jsonDataCache;
	}
	console.log('fetching json data');
	const response = await fetch(url);
	const jsonData = await response.json();
	jsonDataCache = jsonData;
	return jsonData;
}