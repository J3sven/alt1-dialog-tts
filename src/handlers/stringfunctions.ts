import { phoneticsMap } from "./modifiermaps/phoneticsmap";

export function stringExistsInJson(searchString: string, jsonData: { FemaleNpcs: string[] }): boolean {
    for (const str of jsonData.FemaleNpcs) {
        if (str === searchString) {
            return true;
        }
    }
    return false;
}

export function processString(inputString: string): string {
    const asteriskRegex = /\*([^*]+)\*/g;
    const commaRegex = /,([^ ])/g;
    const oneApostropheRegex = /1'/g;
    const oneMRegex = /1m/g;
    const oneVeRegex = /1ve/g;
    const oneDRegex = /1d/g;
    const oneLLRegex = /1ll/g;
    const dotRegex = /\.{2,}/g;

    const withoutAsterisks = inputString.replace(asteriskRegex, '');
    const commaFixedString = withoutAsterisks.replace(commaRegex, ', $1');
    const apostropheFixedString = commaFixedString.replace(oneApostropheRegex, "I'");
    const mFixedString = apostropheFixedString.replace(oneMRegex, "I'm");
    const veFixedString = mFixedString.replace(oneVeRegex, "I've");
    const dFixedString = veFixedString.replace(oneDRegex, "I'd");
    const llFixedString = dFixedString.replace(oneLLRegex, "I'll");
    const result = llFixedString.replace(dotRegex, '. ');

    return result;
}


export function processNameString(inputString: string): string {
    let result = inputString.toUpperCase();
    return result;
}

export function filterName(text: string, name: string, player: string): string {
    const nameContexts: string[] = ["my name is", "I'm", "i am", "this is", "you are", "they call me", "people know me as"];
    const adventurerReplacements: { [index: string]: string } = {
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
    text = generalizeText(text);
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

function generalizeText(input: string): string {
    const slayerText = "Your new task is to kill ";
    const hansText = /spent (.*) in the world/;
    const hansText2 = /arrived (.*) days/;
    const reaperText = /collect (\d+) souls/;
    const houseText = /(I mean the house that I designed myself, like your house)( in .*?\.)/;

    if (input.includes(slayerText)) {
        const regex = /\d+\s/g;
        const updatedString = input.replace(regex, "");
        return updatedString;
    }

    if (hansText.test(input)) {
        input = input.replace(hansText, "spent a lot of time in the world");
    }

    if (hansText2.test(input)) {
        input = input.replace(hansText2, "arrived many days");
    }

    if (reaperText.test(input)) {
        input = input.replace(reaperText, "collect souls");
    }

    if (houseText.test(input)) {
        input = input.replace(houseText, "$1.");
    }

    return input;
}




