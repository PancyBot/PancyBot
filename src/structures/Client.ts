import {
    ApplicationCommandDataResolvable,
    Client,
    ClientEvents,
    Collection
} from "discord.js";
import { CommandType } from "../typings/command";
import { CommandTypeMsg } from "../typings/commandMsg";
import glob from "glob";
import { promisify } from "util";
import { RegisterCommandsOptions } from "../typings/client";
import { Event } from "./Events"; 
const globPromise = promisify(glob);


export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();
    commandsMsg: Collection<string, CommandTypeMsg> = new Collection()

    constructor() {
        super({ intents: 32767 });
    }
    

    start() {
        this.registerModules();
        this.login(process.env.botToken);
    }
    async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }

    async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
        if (guildId) {
            this.guilds.cache.get(guildId)?.commands.set(commands);
            console.log(`Registering commands to ${guildId}`);
        } else {
            this.application?.commands.set(commands);
            console.log("Registering global commands");
        }
    }

    async registerModules() {
        // Commands
        const slashCommands: ApplicationCommandDataResolvable[] = [];
        const commandFiles = await globPromise(
            `${__dirname}/../commands/interaction/*/*{.ts,.js}`
        );
        commandFiles.forEach(async (filePath) => {
            const command: CommandType = await this.importFile(filePath);
            if (!command.name) return;
            console.log(command);

            this.commands.set(command.name, command);
            slashCommands.push(command);
        });

        this.on("ready", () => {
            this.registerCommands({
                commands: slashCommands,
                guildId: null
            });
        });

        // Event
        const eventFiles = await globPromise(
            `${__dirname}/../events/*/*{.ts,.js}`
        );
        eventFiles.forEach(async (filePath) => {
            
            const event: Event<keyof ClientEvents> = await this.importFile(
                filePath
            );
            console.log(event.event)
            this.on(event.event, event.run);
        });
    }
}