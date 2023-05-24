import { phoneticsMap } from "./phonetics/phoneticsmap";

export function stringExistsInJson(searchString: string, jsonData: { FemaleNpcs: string[] }): boolean {
    for (const str of jsonData.FemaleNpcs) {
        if (str === searchString) {
            return true;
        }
    }
    return false;
}

export function processString(inputString) {
    const commaRegex = /,([^ ])/g;
    const oneApostropheRegex = /1'/g;
    const oneMRegex = /1m/g;
    const commaFixedString = inputString.replace(commaRegex, ' $1'); // Changed from ', $1' to ' $1'
    const apostropheFixedString = commaFixedString.replace(oneApostropheRegex, "I'");
    const result = apostropheFixedString.replace(oneMRegex, "I'm");
    return result;
}

export function processNameString(inputString: string): string {
    let result = inputString.toUpperCase();
    return result;
}

export function filterName(text: string, name: string, player: string): string {
    const nameContexts: string[] = ["my name is", "I'm", "i am", "this is", "you are", "they call me", "people know me as"];
    const adventurerReplacements: {[index: string]: string} = {
        "my name is": "I am an adventurer",
        "I'm": "I am an adventurer",
        "i am": "I am an adventurer",
        "this is": "This is an adventurer",
        "you are": "You are an adventurer",
        "they call me": "They call me adventurer",
        "people know me as": "People know me as an adventurer",
    };
    
    if (player === name) {
        for (let context of nameContexts) {
            const regExp = new RegExp(`(${context}\\s${name})`, 'gi');
            text = text.replace(regExp, adventurerReplacements[context]);
        }
    }
    else {
        const regExp = new RegExp(`${name}`, 'gi');
        text = text.replace(regExp, "adventurer");
    }
    return text;
}

export function capitalizeName(str: string): string {
    str = processNameString(str);
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function fixPhonetics(text: string): string {
    // Regular expression to split text into words, preserving punctuation.
    const words = text.split(/(\b\w+\b)/g);

    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase();
      if (phoneticsMap.hasOwnProperty(word)) {
        words[i] = phoneticsMap[word];
      }
    }
    return words.join('');
  }