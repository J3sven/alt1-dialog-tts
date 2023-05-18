export function definePlayer(playerName: string | null, female:boolean | null){
    let selfFemale = false;
    let self = null;
    if (playerName === null) {
        console.error('Player name is empty.');
        return;
    } else{
        self = playerName;
    }

    
    if(female == true){
        selfFemale = true;
    }

    return {self, selfFemale}
}

export function getPlayerFromLocalStorage(): ReturnType<typeof definePlayer> {
    const playerName = localStorage.getItem("player");
    const isFemale = JSON.parse(localStorage.getItem("isFemale") as string);
    return definePlayer(playerName, isFemale);
}
