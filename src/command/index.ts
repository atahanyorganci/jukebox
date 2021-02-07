import { Message, MessageEmbed } from "discord.js";
import { logger, PREFIX } from "../bot";

export type handlerFunc = (
    msg: Message,
    args: string[]
) => Promise<Message | Message[]>;

export type HandlerOptions = {
    description?: string;
};

export class CommandHandler {
    handlers: Map<string, handlerFunc>;
    descriptions: Map<string, string>;

    constructor() {
        this.handlers = new Map();
        this.handlers.set("help", msg => this.helpCommand(msg));
        this.descriptions = new Map();
    }

    registerHandler(
        command: string,
        handler: handlerFunc,
        handlerOptions?: HandlerOptions
    ): void {
        this.handlers.set(command, handler);
        if (handlerOptions) {
            const { description } = handlerOptions;
            if (description) this.descriptions.set(command, description);
        }
    }

    handle(msg: Message): Promise<Message | Message[]> {
        const { content, author } = msg;
        if (!content.startsWith(PREFIX) || author.bot) return;

        const [cmd, ...args] = content.slice(PREFIX.length).trim().split(/ +/);
        logger.info(`Command: "${cmd}" Args: ${args}`);

        const handler = this.handlers.get(cmd.toLocaleLowerCase());
        if (handler) return handler(msg, args);
        this.helpCommand(msg, `Invalid command \`${PREFIX}${cmd}\``);
    }

    helpCommand(msg: Message, error?: string) {
        const response = new MessageEmbed()
            .setTitle("Available Commands")
            .setColor("#123123");
        if (error) response.setDescription(error);
        this.descriptions.forEach((description, command) =>
            response.addField(`\`${PREFIX}${command}\``, description)
        );
        return msg.channel.send(response);
    }
}

export class CommandHandlerBuilder {
    commandHandler: CommandHandler;

    constructor() {
        this.commandHandler = new CommandHandler();
    }

    register(
        command: string,
        handler: handlerFunc,
        handlerOptions?: HandlerOptions
    ): CommandHandlerBuilder {
        this.commandHandler.registerHandler(command, handler, handlerOptions);
        return this;
    }

    build(): CommandHandler {
        return this.commandHandler;
    }
}
