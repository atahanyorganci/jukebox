import { Message, MessageEmbed } from "discord.js";
import { bot } from "../bot";
import { handlerFunc } from ".";

const infoCommand: handlerFunc = (msg, args) => {
    const [arg, ...rest] = args;
    if (rest.length !== 0) return sendErrorMessage(msg);

    if (arg === "bot") {
        const icon = bot.user.displayAvatarURL();
        const response = new MessageEmbed()
            .setDescription("Bot Information")
            .setColor("#123123")
            .setThumbnail(icon)
            .addField("Bot Name:", bot.user.username)
            .addField("Created On", bot.user.createdAt);
        return msg.channel.send(response);
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
        return msg.channel.send(response);
    }
    sendErrorMessage(msg);
};

function sendErrorMessage(msg: Message): Promise<Message> {
    return msg.channel.send("`!info` takes arguments `bot` or `server`.");
}

export const infoDescription = "Information about the server or the bot.";
export default infoCommand;
