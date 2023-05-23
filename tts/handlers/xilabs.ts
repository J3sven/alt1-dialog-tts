
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
  