import { Client, Message, MessageEmbed } from "discord.js";
import { Command } from ".";

class InfoCommand extends Command {
    constructor() {
        super({
            name: "info",
            description: "Information about the server or the bot.",
            aliases: ["i"],
        });
    }

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        const [arg, ...rest] = args;
        if (rest.length !== 0) {
            await this.sendErrorMessage(msg);
            return;
        }

        if (arg === "bot") {
            const icon = bot.user.displayAvatarURL();
            const response = new MessageEmbed()
                .setDescription("Bot Information")
                .setColor("#123123")
                .setThumbnail(icon)
                .addField("Bot Name:", bot.user.username)
                .addField("Created On", bot.user.createdAt);
            await msg.channel.send(response);
        } else if (arg === "server") {
            const icon = bot.user.displayAvatarURL();
            const response = new MessageEmbed()
                .setDescription("Server Information")
                .setColor("#123123")
                .setThumbnail(icon)
                .addField("Server Name:", msg.guild.name)
                .addField("Created On", msg.guild.createdAt)
                .addField("Total Members", msg.guild.memberCount)
                .addField("You Joined At", msg.member.joinedAt);
            await msg.channel.send(response);
        } else {
            await this.sendErrorMessage(msg);
        }
    }

    async sendErrorMessage(msg: Message): Promise<void> {
        await msg.channel.send("`!info` takes arguments `bot` or `server`.");
    }
}

export default InfoCommand;
