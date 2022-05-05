import { getVoiceConnection } from "@discordjs/voice";
import Player from "@music/player";
import { unreachable } from "@util";

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
        player.on("stopped", () => this.deletePlayer(guildId));
        this._players.set(guildId, player);
        return player;
    }

    private deletePlayer(guildId: string): void {
        this._players.delete(guildId);
        const connection = getVoiceConnection(guildId);
        if (!connection) {
            unreachable("Deleting a player without voice connection");
        }
        connection.destroy();
    }
}

export default JukeBox;
