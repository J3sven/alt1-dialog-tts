
export async function loadGenderData(url: string, jsonDataCache): Promise<{ FemaleNpcs: string[] }> {
	if (jsonDataCache) {
		return jsonDataCache;
	}
	const response = await fetch(url);
	const jsonData = await response.json();
	jsonDataCache = jsonData;
	return jsonData;
}