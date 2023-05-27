export function isGhost(name: string): boolean {
    return ghosts.has(name.toUpperCase());
  }
  
  export function isGnome(name: string): boolean {
    return gnomes.has(name.toUpperCase());
  }
  
  const ghosts: Set<string> = new Set([
    "GHOST VILLAGER",
    "GHOST SHOPKEEPER",
    "GHOST INNKEEPER",
    "ALICE'S HUSBAND",
    "GHOST DISCIPLE",
    "SHADY GHOST",
    "NECROVARUS",
    "GRAVINGAS",
    "GHOST",
    "FILLIMAN TARLOCK",
    "NATURE SPIRIT",
    "THRANTAX THE MIGHTY",
    "SPIRIT",
    "SUMMER BONDE",
    "NIRRIE",
    "TIRRIE",
    "HALLAK",
    "MERANEK THANATOS",
    "ERIK BONDE",
    "JALLEK LENKIN",
    "ORMOD",
    "LENIAN",
    "EMACIATED SPIRIT",
  ]);
  
  const gnomes: Set<string> = new Set([
    "ANITA",
    "KING NARNODE SHAREEN",
    "NARNODE SHAREEN",
    "GNOME CHILD",
    "GNOME GUARD",
    "GNOME BALLER",
    "GNOME BALL REFEREE",
    "GNOME COACH",
    "GNOME TRAINER",
    "GNOME SHOPKEEPER",
    "GNOME WAITER",
    "GNOME WAITRESS",
    "GNOME",
    "DAERO",
    "GLOPHREN",
    "GLOUGH",
    "WAYDAR",
  ]);
  