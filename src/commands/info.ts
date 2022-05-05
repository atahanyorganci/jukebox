import { Client, Message, MessageEmbed } from "discord.js";
import { Command } from "@commands";

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
        const { guild, member } = msg;

        if (arg === "bot" && bot.user) {
            await this.sendBotInfo(bot, msg);
        } else if (arg === "server" && guild && member) {
            await this.sendServerInfo(bot, msg);
        } else {
            await this.sendErrorMessage(msg);
        }
    }

    async sendErrorMessage(msg: Message): Promise<void> {
        await msg.channel.send("`!info` takes arguments `bot` or `server`.");
    }

    async sendBotInfo(bot: Client, msg: Message): Promise<void> {
        if (!bot.user) return;
        const icon = bot.user.displayAvatarURL();
        const response = new MessageEmbed()
            .setDescription("Bot Information")
            .setColor("#123123")
            .setThumbnail(icon)
            .addField("Bot Name:", bot.user.username)
            .addField("Created On", bot.user.createdAt.toLocaleDateString());
        await msg.channel.send({ embeds: [response] });
    }

    async sendServerInfo(bot: Client, msg: Message): Promise<void> {
        if (!msg.guild || !msg.member) return;
        const { guild, member } = msg;
        const createdAt = guild.createdAt.toLocaleDateString();
        const memberCount = guild.memberCount.toString();

        const response = new MessageEmbed()
            .setDescription("Server Information")
            .setColor("#123123")
            .addField("Server Name:", guild.name)
            .addField("Created On", createdAt)
            .addField("Member count", memberCount);
        if (guild.icon) response.setThumbnail(guild.icon);
        if (member.joinedAt) {
            const joinedAt = member.joinedAt.toLocaleDateString();
            response.addField("You Joined At", joinedAt);
        }
        await msg.channel.send({ embeds: [response] });
    }
}
