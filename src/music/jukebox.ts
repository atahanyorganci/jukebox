import Player from "@music/player";

class JukeBox {
    private static _instance: JukeBox;
    private _players: Map<string, Player> = new Map();

    public static the(): JukeBox {
        if (!JukeBox._instance) {
            JukeBox._instance = new JukeBox();
        }
        return JukeBox._instance;
    }

    public getPlayer(guildId: string): Player | null {
        const player = this._players.get(guildId);
        if (player) {
            return player;
        }
        return null;
    }

    public createPlayer(guildId: string, channelId: string): Player {
        const player = new Player(guildId, channelId);
        this._players.set(channelId, player);
        return player;
    }
}

export default JukeBox;
