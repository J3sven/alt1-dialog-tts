import { phoneticsMap } from '../../src/handlers/phonetics/phoneticsmap';

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
    const semicolonPeriodRegex = /;./g;
    let upperCaseString = inputString.toUpperCase();
    let result = upperCaseString.replace(semicolonPeriodRegex, 'E');
    return result;
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
    console.log('fixPhonetics')
    // Regular expression to split text into words, preserving punctuation.
    const words = text.split(/(\b\w+\b)/g);

    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase();
      if (phoneticsMap.hasOwnProperty(word)) {
        words[i] = phoneticsMap[word];
      }
    }
    console.log('fixPhonetics', words.join(''))
    return words.join('');
  }