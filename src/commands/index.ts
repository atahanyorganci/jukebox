import { Client, Message, MessageEmbed } from "discord.js";
import { PREFIX } from "@config";
import { logger } from "@logger";

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
        response.addField(`\`${PREFIX}${this.name}\``, this.description || "");
        return response;
    }

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        if (args.length > 0)
            this.response.setDescription(
                "Help command doesn't require arguments"
            );
        await msg.channel.send({ embeds: [this.response] });
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

    async handle(bot: Client, msg: Message): Promise<void> {
        const { content, author } = msg;
        if (!content.startsWith(PREFIX) || author.bot) return;

        const [cmd, ...args] = content.slice(PREFIX.length).trim().split(/ +/);

        if (args.length !== 0) {
            logger.info(`Recived command "${cmd}" with [${args.join(", ")}]`);
        } else {
            logger.info(`Recived command "${cmd}"`);
        }

        const command =
            this.commands.get(cmd.toLocaleLowerCase()) ||
            this.aliases.get(cmd.toLocaleLowerCase());

        try {
            if (command) {
                command.run(bot, msg, args);
            } else {
                this.sendUnknownCommandMessage(cmd, msg);
            }
        } catch (error) {
            logger.error(`${error} occurred while handling ${cmd}`);
        }
    }

    registerHelpCommand(): void {
        this.register(new HelpCommand(this.commands));
    }

    async sendUnknownCommandMessage(cmd: string, msg: Message): Promise<void> {
        await msg.channel.send(
            `\`${PREFIX}${cmd}\` is not a valid command, use \`${PREFIX}help\` to view available commands.`
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
