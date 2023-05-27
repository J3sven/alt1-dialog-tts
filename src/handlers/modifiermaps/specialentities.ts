export function isGhost(name: string): boolean {
    return ghosts[name.toUpperCase()] === "ghost";
}

export function isGnome(name: string): boolean {
    return gnomes[name.toUpperCase()] === "gnome";
}

const ghosts: { [word: string]: string; } = {
    "GHOST VILLAGER": "ghost",
    "GHOST SHOPKEEPER": "ghost",
    "GHOST INNKEEPER": "ghost",
    "ALICE'S HUSBAND": "ghost",
    "GHOST DISCIPLE": "ghost",
    "SHADY GHOST" : "ghost",
    "NECROVARUS": "ghost",
    "GRAVINGAS": "ghost",
    "GHOST": "ghost",
    "FILLIMAN TARLOCK": "ghost",
    "NATURE SPIRIT": "ghost",
    "THRANTAX THE MIGHTY": "ghost",
    "SPIRIT": "ghost",
    "SUMMER BONDE": "ghost",
    "NIRRIE": "ghost",
    "TIRRIE": "ghost",
    "HALLAK": "ghost",
    "MERANEK THANATOS": "ghost",
    "ERIK BONDE": "ghost",
    "JALLEK LENKIN": "ghost",
    "ORMOD": "ghost",
    "LENIAN": "ghost",
    "EMACIATED SPIRIT": "ghost",
}

const gnomes: { [word: string]: string; } = {
    "ANITA": "gnome",
    "KING NARNODE SHAREEN": "gnome",
    "NARNODE SHAREEN": "gnome",
    "GNOME CHILD": "gnome",
    "GNOME GUARD": "gnome",
    "GNOME BALLER": "gnome",
    "GNOME BALL REFEREE": "gnome",
    "GNOME COACH": "gnome",
    "GNOME TRAINER": "gnome",
    "GNOME SHOPKEEPER": "gnome",
    "GNOME WAITER": "gnome",
    "GNOME WAITRESS": "gnome",
    "GNOME": "gnome",
    "DAERO": "gnome",
    "GLOPHREN": "gnome",
    "GLOUGH": "gnome",
    "WAYDAR": "gnome",
}
