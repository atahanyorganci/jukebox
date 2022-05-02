import Player from "@music/player";

class JukeBox {
    private static _instance: JukeBox;

    private constructor() {}

    public static the(): JukeBox {
        if (!JukeBox._instance) {
            JukeBox._instance = new JukeBox();
        }
        return JukeBox._instance;
    }

    public getPlayer(guildId: string): Player | null {
        throw new Error("Method not implemented.");
    }

    public createPlayer(channelId: string): Player {
        throw new Error("Method not implemented.");
    }
}

export default JukeBox;
