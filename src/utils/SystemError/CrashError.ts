import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { curly } from 'node-libcurl' 
import { MessageEmbed } from 'discord.js';
import { version } from '../../../package.json'
export class AntiCrash {
    constructor() {}

    inint() {
        process.on('unhandledRejection', async (reason, p) => {
            console.log(' [antiCrash] :: Unhandled Rejection/Catch');
            console.log(reason, p);
            const data = `${reason} ${p}`
            if (!existsSync(`${process.cwd()}/ErrorLogs`)) {
                mkdirSync(`${process.cwd()}/ErrorLogs`, { recursive: true});
            }
            
            writeFileSync(""+process.cwd()+"/ErrorLogs/unhandledRejection_"+Date.now()+".log", data);

            const Embed = new MessageEmbed()
            .setAuthor({ name: 'CrashReport'})
            .setDescription(`CrashError: ${reason} ${p}`)
            .setColor('RED')
            .setFooter({ text: `Pancybot v${version}` })

            const {statusCode} = await curly.post(process.env.errorWebhook, {
                postFields: JSON.stringify({
                    username: `PancyBot ${version} | CrashError`,
                    embeds: [
                        Embed
                    ]
                }),
                httpHeader: [
                    'Content-Type: application/json',
                ],
            });

            console.warn(`[AntiCrash] :: Sent CrashError to Webhook, Status Code: ${statusCode}`);
        });
        process.on("uncaughtException", (err, origin) => {
            console.log(' [antiCrash] :: Uncaught Exception/Catch');
            console.log(err, origin);
            const data = `${err + origin}`
            if (!existsSync(`${process.cwd()}/ErrorLogs`)) {
                mkdirSync(`${process.cwd()}/ErrorLogs`, { recursive: true});
            }
            writeFileSync(""+process.cwd()+"/ErrorLogs/uncaughtException_"+Date.now()+".log", data);
        });
        process.on('uncaughtExceptionMonitor', (err, origin) => {
            console.log(' [antiCrash] :: Uncaught Exception/Catch (MONITOR)');
            console.log(err, origin);
            const data = `${err + origin}`
            if (!existsSync(`${process.cwd()}/ErrorLogs`)) {
                mkdirSync(`${process.cwd()}/ErrorLogs`, { recursive: true});
            }
    
            writeFileSync(""+process.cwd()+"/ErrorLogs/uncaughtExceptionMonitor_"+Date.now()+".log", data);
            
        });
        process.on('multipleResolves', (type, promise, reason, origin) => {
            console.log(' [antiCrash] :: Multiple Resolves');
            console.log(type, reason, promise, origin);
            const data = `${type + reason + promise + origin}`
            if (!existsSync(`${process.cwd()}/ErrorLogs`)) {
                mkdirSync(`${process.cwd()}/ErrorLogs`, { recursive: true});
            }
    
            writeFileSync(""+process.cwd()+"/ErrorLogs/multipleResolves_"+Date.now()+".log", data);
        });
    }
}