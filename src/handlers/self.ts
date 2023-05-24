export function definePlayer(playerName: string | null, female: boolean | null) {
    if (!playerName) {
        console.error('Player name is empty.');
        return;
    }
    return {
        self: playerName,
        selfFemale: female === true
    }
}

export function getPlayerFromLocalStorage(): ReturnType<typeof definePlayer> {
    if(localStorage.getItem("player") === null) return
    if(localStorage.getItem("isFemale") === null) return
    const playerName = localStorage.getItem("player");
    const isFemale = JSON.parse(localStorage.getItem("isFemale") as string);
    return definePlayer(playerName.toUpperCase(), isFemale);
}
