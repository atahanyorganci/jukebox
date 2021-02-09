import { Client, Message, MessageEmbed } from "discord.js";
import { logger, PREFIX } from "../bot";

export interface CommandOptions {
    name: string;
    description?: string;
    aliases?: string[];
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

    abstract run(bot: Client, msg: Message, args: string[]): Promise<void>;
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
        response.addField(`\`${PREFIX}${this.name}\``, this.description);
        return response;
    }

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        if (args.length === 1 && args[1] === "Invaild command.")
            this.response.setDescription("Invalid command");
        await msg.channel.send(this.response);
    }
}

export class CommandDispacther {
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

    async handle(bot: Client, msg: Message): Promise<void> {
        const { content, author } = msg;
        if (!content.startsWith(PREFIX) || author.bot) return;

        const [cmd, ...args] = content.slice(PREFIX.length).trim().split(/ +/);
        logger.info(`Command: "${cmd}" Args: ${args}`);

        const command =
            this.commands.get(cmd.toLocaleLowerCase()) ||
            this.aliases.get(cmd.toLocaleLowerCase());

        try {
            if (command) {
                command.run(bot, msg, args);
            } else {
                const helpCommand = this.commands.get("help");
                helpCommand.run(bot, msg, ["Invalid command."]);
            }
        } catch (error) {
            logger.error(`${error} occured while handling ${cmd}`);
        }
    }

    registerHelpCommand(): void {
        this.register(new HelpCommand(this.commands));
    }
}

export class DispactherBuilder {
    commandHandler: CommandDispacther;

    constructor() {
        this.commandHandler = new CommandDispacther();
    }

    register(command: Command): DispactherBuilder {
        this.commandHandler.register(command);
        return this;
    }

    build(): CommandDispacther {
        this.commandHandler.registerHelpCommand();
        return this.commandHandler;
    }
}
