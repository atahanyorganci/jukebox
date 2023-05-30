import { Client, EmbedBuilder, Message } from "discord.js";
import { Command, CommandContext } from "~/commands/index.js";

export class InfoCommand extends Command {
    constructor() {
        super({
            name: "info",
            description: "Information about the server or the bot.",
            aliases: ["i"],
        });
    }

    async run({ message, bot }: CommandContext, args: string[]): Promise<void> {
        const [arg, ...rest] = args;
        if (rest.length !== 0) {
            await this.sendErrorMessage(message);
            return;
        }
        const { guild, member } = message;

        if (arg === "bot" && bot.user) {
            await this.sendBotInfo(bot, message);
        } else if (arg === "server" && guild && member) {
            await this.sendServerInfo(bot, message);
        } else {
            await this.sendErrorMessage(message);
        }
    }

    async sendErrorMessage(msg: Message): Promise<void> {
        await msg.channel.send("`!info` takes arguments `bot` or `server`.");
    }

    async sendBotInfo(bot: Client, msg: Message): Promise<void> {
        if (!bot.user) return;
        const icon = bot.user.displayAvatarURL();
        const response = new EmbedBuilder()
            .setDescription("Bot Information")
            .setColor("#123123")
            .setThumbnail(icon)
            .addFields(
                {
                    name: "Bot Name",
                    value: bot.user.username,
                },
                {
                    name: "Created On",
                    value: bot.user.createdAt.toLocaleDateString(),
                }
            );
        await msg.channel.send({ embeds: [response] });
    }

    async sendServerInfo(bot: Client, msg: Message): Promise<void> {
        if (!msg.guild || !msg.member) return;
        const { guild, member } = msg;
        const createdAt = guild.createdAt.toLocaleDateString();
        const memberCount = guild.memberCount.toString();

        const response = new EmbedBuilder()
            .setDescription("Server Information")
            .setColor("#123123")
            .addFields(
                { name: "Server Name:", value: guild.name },
                { name: "Created On", value: createdAt },
                { name: "Member count", value: memberCount }
            );
        if (guild.icon) response.setThumbnail(guild.icon);
        if (member.joinedAt) {
            const joinedAt = member.joinedAt.toLocaleDateString();
            response.addFields({ name: "You Joined At", value: joinedAt });
        }
        await msg.channel.send({ embeds: [response.data] });
    }
}
