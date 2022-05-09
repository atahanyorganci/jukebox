import { Client, Guild, GuildMember, Message, MessageEmbed } from "discord.js";
import { PREFIX } from "@config";
import { logger } from "@logger";
import { inlineCode } from "@discordjs/builders";

export interface CommandOptions {
    name: string;
    description?: string;
    aliases?: string[];
}

export interface CommandContext {
    bot: Client;
    message: Message;
    guild: Guild;
    member: GuildMember;
}

export abstract class Command {
    name: string;
    description?: string;
    aliases?: string[];

    constructor({ name, description, aliases }: CommandOptions) {
        this.name = name;
        this.aliases = aliases;
        this.description = description;
    }

    abstract run(context: CommandContext, args: string[]): Promise<void>;

    handleError(error: Error): void {
        logger.error(`Error in command ${this.name}: ${error.message}`);
    }
}

class HelpCommand extends Command {
    response: MessageEmbed;

    constructor(commands: Map<string, Command>) {
        super({
            name: "help",
            aliases: ["h"],
            description: "displays available commands",
        });

        this.response = this.buildResponse(commands);
    }

    private buildResponse(commands: Map<string, Command>): MessageEmbed {
        const response = new MessageEmbed()
            .setTitle("Available Commands")
            .setColor("#123123");
        commands.forEach(({ name, description }) => {
            if (description)
                response.addField(`\`${PREFIX}${name}\``, description);
        });
        response.addField(`\`${PREFIX}${this.name}\``, this.description || "");
        return response;
    }

    async run({ message }: CommandContext, args: string[]): Promise<void> {
        if (args.length > 0)
            this.response.setDescription(
                "Help command doesn't require arguments"
            );
        await message.channel.send({ embeds: [this.response] });
    }
}

export class CommandDispatcher {
    commands: Map<string, Command>;
    aliases: Map<string, Command>;

    constructor() {
        this.commands = new Map();
        this.aliases = new Map();
    }

    register(command: Command): void {
        const { name, aliases } = command;
        this.commands.set(name, command);
        if (aliases) aliases.forEach(alias => this.aliases.set(alias, command));
    }

    registerAll(commands: Command[]): void {
        commands.forEach(command => this.register(command));
    }

    async handle(bot: Client, message: Message): Promise<void> {
        const { content, author, member, guild } = message;

        if (!content.startsWith(PREFIX) || author.bot || !member || !guild) {
            return;
        }

        const [cmd, ...args] = content.slice(PREFIX.length).trim().split(/ +/);

        if (args.length !== 0) {
            logger.debug(
                `Received command ${cmd} with args ${args} from ${author.id} in ${guild.id}`
            );
        } else {
            logger.debug(
                `Received command ${cmd} from ${author.id} in ${guild.id}`
            );
        }

        const command =
            this.commands.get(cmd.toLocaleLowerCase()) ||
            this.aliases.get(cmd.toLocaleLowerCase());

        if (command) {
            try {
                await command.run({ bot, message, guild, member }, args);
            } catch (error) {
                command.handleError(error as Error);
            }
        } else {
            try {
                await this.sendUnknownCommandMessage(cmd, message);
            } catch (error) {
                logger.error(
                    `${error} occurred while sending unknown command message.`
                );
            }
        }
    }

    registerHelpCommand(): void {
        this.register(new HelpCommand(this.commands));
    }

    async sendUnknownCommandMessage(cmd: string, msg: Message): Promise<void> {
        const invalid = inlineCode(`${PREFIX}${cmd}`);
        const help = inlineCode(`${PREFIX}help`);
        await msg.channel.send(
            `${invalid} is not a valid command, use ${help} to view available commands.`
        );
    }
}

export class DispatcherBuilder {
    commandHandler: CommandDispatcher;

    constructor() {
        this.commandHandler = new CommandDispatcher();
    }

    register(command: Command): DispatcherBuilder {
        this.commandHandler.register(command);
        return this;
    }

    build(): CommandDispatcher {
        this.commandHandler.registerHelpCommand();
        return this.commandHandler;
    }
}
