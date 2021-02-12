import { JukeBox } from "./jukebox";

export class Musican {
    boxes = new Map<string, JukeBox>();

    get(guildId: string): JukeBox | null {
        const jukebox = this.boxes.get(guildId);
        return jukebox ? jukebox : null;
    }

    create(guildId: string): JukeBox {
        const jukebox = new JukeBox(guildId);
        this.boxes.set(guildId, jukebox);
        return jukebox;
    }

    delete(guildId: string) {
        this.boxes.delete(guildId);
    }
}
