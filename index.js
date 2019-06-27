const { VK } = require('vk-io');
const fs = require('fs');
const shlex = require('shlex');
const config = require('./config.json');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('commands.json')
const db = low(adapter)

const helpers = require('./helpers');

const botObject = {
    'commands': {},
    'db': db
}

db.defaults({ commands: [], usersWhoCan: [...config.admins] }).write()

const vk = new VK({
    token: config.token
});

// IMPORT PLUGINS
console.log("[] Initing plugins...")

let pluginsFolder = fs.readdirSync("./plugins");
let fileToExport = [];

for (let item of pluginsFolder) {
    if (item.endsWith(".js")) {
        fileToExport.push(`./plugins/${item}`)
        continue;
    }
}

console.log("[] Load plugins...");

fileToExport.forEach((pluginPath) => {
    // import command
    const command = require(pluginPath);

    const pluginCommands = Object.entries(command.cmdsHandler);

    for (let pCommand of pluginCommands) {
        try {
            botObject.commands[pCommand[0]] = pCommand[1];
        } catch (e) {
            console.log("Произошла ошибка при загрузке команд плагина!");
            console.log(pluginPath);
            console.log(e);
        }
    }

    console.log(`[] Loading ${pluginPath}...`);
})

console.log(`[] Loaded ${Object.entries(botObject.commands).length} commands from file`);

console.log("[] Loading commands from DB")

let DBCommands = db.get('commands').value();
for (let command of DBCommands) {
    console.log(`[] Loading '${command.command}'...`);

    let newHandler = helpers.buildHandler(vk, command);
    botObject.commands[command.command] = newHandler;
}

vk.updates.on('message', (message, next) => {
    handleMessage(message, next);
})

async function handleMessage(message, next) {
    if (message.text !== null) message.text = message.text.replace(/\[.*\]/g, '') // убираем все упоминания сообщества
    if (message.text === null || message.text !== null && !message.text.startsWith(config.prefix)) return next();

    let textSheet = shlex.split(message.text.slice(config.prefix.length));
    let commandd = textSheet[0].toLowerCase();
    let args = textSheet.slice(1);
    let author = message.senderId;
    let nowTime = Math.floor(Date.now() / 1000);
    message.vk = vk;

    let command = botObject.commands[commandd];
    if (!command) return next();

    console.log(`[Commands](${nowTime}) Пользователь ${author} - !${commandd}[${args.join('|')}]`)

    try {
        command(botObject, message, args);
    } catch (e) {
        console.error(e);
        await message.send("Произошла ошибка при выполнении этой команды, пожалуйста напишите администратору!");
    }
}

vk.updates.start().then((r)=>{
    console.log("[] Start hearing LongPoll");
}).catch(console.error);