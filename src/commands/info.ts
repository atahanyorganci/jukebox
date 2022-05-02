import { Client, Message, MessageEmbed } from "discord.js";
import { Command } from ".";

export class InfoCommand extends Command {
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
        const { guild, member, channel } = msg;

        if (arg === "bot" && bot.user) {
            const icon = bot.user.displayAvatarURL();
            const response = new MessageEmbed()
                .setDescription("Bot Information")
                .setColor("#123123")
                .setThumbnail(icon)
                .addField("Bot Name:", bot.user.username)
                .addField(
                    "Created On",
                    bot.user.createdAt.toLocaleDateString()
                );
            await channel.send({ embeds: [response] });
        } else if (arg === "server" && guild && member) {
            const joinedAt = member.joinedAt.toLocaleDateString();
            const createdAt = guild.createdAt.toLocaleDateString();
            const memberCount = guild.memberCount.toString();

            const response = new MessageEmbed()
                .setDescription("Server Information")
                .setColor("#123123")
                .addField("Server Name:", guild.name)
                .addField("Created On", createdAt)
                .addField("Member count", memberCount)
                .addField("You Joined At", joinedAt);
            if (guild.icon) response.setThumbnail(guild.icon);
            await channel.send({ embeds: [response] });
        } else {
            await this.sendErrorMessage(msg);
        }
    }

    async sendErrorMessage(msg: Message): Promise<void> {
        await msg.channel.send("`!info` takes arguments `bot` or `server`.");
    }
}
