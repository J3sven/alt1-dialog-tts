

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

const fNamesSet: Set<string> = new Set([
    "FADBURG",
    "FASTER BUNNY",
    "FDDA",
    "FDINA",
    "FFARITAY",
    "FILWYNN",
    "FIR",
    "FIRA",
    "FIRLYS",
    "FLDER RUNE FANATIC",
    "FLEN ANTERTH",
    "FLENA",
    "FLENA SUERTEN",
    "FLF GIRL",
    "FLFINLOCKS",
    "FLIDINIS",
    "FLISABETA",
    "FLISE",
    "FLISSA",
    "FLIZA",
    "FLIZABETH",
    "FLLAMARIA",
    "FLLENA",
    "FLLY THE CAMEL",
    "FLSIE",
    "FLUNED",
    "FLVARG",
    "FLVEN RECRUITER",
    "FLZIK",
    "FMBER",
    "FMILEE",
    "FMILIA",
    "FMILY",
    "FMLYN",
    "FNAKHRA",
    "FNDWYR, EMISSARY OF SEREN",
    "FRITONA THE GREEN",
    "FRYSAIL THE PIOUS",
    "FSHE",
    "FSSIANDAR GAR",
    "FSSJAY",
    "FSTRITH",
    "FTHEREAL LADY",
    "FTTA STONE",
    "FTUYA",
    "FVA",
    "FVEY",
    "FVIL NIYA",
    "FXAMINER",
    "THE FXILE",
    "FZREAL"
]);

export function processNameString(inputString: string): string {
    const semicolonPeriodRegex = /;./g;
    let upperCaseString = inputString.toUpperCase();
    let result = upperCaseString.replace(semicolonPeriodRegex, 'E');
    if (fNamesSet.has(upperCaseString)) {
        result = 'E' + result.substring(1);
    }
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