const helpers = require('../helpers');
const config  = require('../config.json');

const commands = async (bot, message, args) => {
    let commands = bot.db.get('commands').value()
    let resultCommands = []
    for (let c of commands) {
        resultCommands.push(`!${c['command']}`)
    }
    resultCommands.sort();
    return await message.send(`Команды в боте:\n${resultCommands.join('\n')}`)
}

const addp = async(bot, message, args) => {
    const whoCan = bot.db.get('usersWhoCan').value()
    if (whoCan.indexOf(message.senderId) < 0) return;

    if (args.length < 1 || message.attachments.length < 1 || message.attachments.length > 0 && message.attachments[0].type !== "photo") {
         return await message.send("Вы забыли что-то указать");
    }

    let link = helpers.parseLargePhoto(message.attachments[0]);
    let command = args[0].toLowerCase();

    let isUpdating = false;
    let cp = bot.db.get('commands').find({ command: command }).value()
    if (cp) {
        isUpdating = true;
    }

    let newObject = {
        'command': command,
        'type': 'photo',
        'link': link
    }

    if (isUpdating) {
        bot.db.get('commands').find({ command: command }).assign(newObject).write()
    } else {
        bot.db.get('commands').push(newObject).write()
    }

    bot.commands[command] = helpers.buildHandler(message.vk, newObject)
    return await message.send((isUpdating) ? "Команда обновлена" : "Команда добавлена")
}

const addv = async(bot, message, args) => { 
    const whoCan = bot.db.get('usersWhoCan').value()
    if (whoCan.indexOf(message.senderId) < 0) return;

    if (args.length < 1 || message.attachments.length < 1 || message.attachments.length > 0 && message.attachments[0].type !== "video") {
         return await message.send("Вы забыли что-то указать");
    }

    let videoAttach = `video${message.attachments[0]['ownerId']}_${message.attachments[0]['id']}`;
    let command = args[0].toLowerCase();

    let isUpdating = false;
    let cp = bot.db.get('commands').find({ command: command }).value()
    if (cp) {
        isUpdating = true;
    }

    let newObject = {
        'command': command,
        'type': 'video',
        'attach': videoAttach
    }

    if (isUpdating) {
        bot.db.get('commands').find({ command: command }).assign(newObject).write()
    } else {
        bot.db.get('commands').push(newObject).write()
    }

    bot.commands[command] = helpers.buildHandler(message.vk, newObject)
    return await message.send((isUpdating) ? "Команда обновлена" : "Команда добавлена")
}

const adda = async(bot, message, args) => { 
    const whoCan = bot.db.get('usersWhoCan').value()
    if (whoCan.indexOf(message.senderId) < 0) return;

    if (args.length < 1 || message.attachments.length < 1 || message.attachments.length > 0 && message.attachments[0].type !== "audio") {
         return await message.send("Вы забыли что-то указать");
    }

    let audioAttach = `audio${message.attachments[0]['ownerId']}_${message.attachments[0]['id']}`;
    let command = args[0].toLowerCase();

    let isUpdating = false;
    let cp = bot.db.get('commands').find({ command: command }).value()
    if (cp) {
        isUpdating = true;
    }

    let newObject = {
        'command': command,
        'type': 'audio',
        'attach': audioAttach
    }

    if (isUpdating) {
        bot.db.get('commands').find({ command: command }).assign(newObject).write()
    } else {
        bot.db.get('commands').push(newObject).write()
    }

    bot.commands[command] = helpers.buildHandler(message.vk, newObject)
    return await message.send((isUpdating) ? "Команда обновлена" : "Команда добавлена")
}

const adde = async(bot, message, args) => { 
    if (config.admins.indexOf(message.senderId) < 0) return;

    if (args.length < 2) {
         return await message.send("Вы забыли что-то указать");
    }

    let evaling = args.slice(1).join(' ');
    let command = args[0].toLowerCase();

    let isUpdating = false;
    let cp = bot.db.get('commands').find({ command: command }).value()
    if (cp) {
        isUpdating = true;
    }

    let newObject = {
        'command': command,
        'type': 'send_eval',
        'evaling': evaling
    }

    if (isUpdating) {
        bot.db.get('commands').find({ command: command }).assign(newObject).write()
    } else {
        bot.db.get('commands').push(newObject).write()
    }

    bot.commands[command] = helpers.buildHandler(message.vk, newObject)
    return await message.send((isUpdating) ? "Команда обновлена" : "Команда добавлена")
}

const addt = async(bot, message, args) => { 
    const whoCan = bot.db.get('usersWhoCan').value()
    if (whoCan.indexOf(message.senderId) < 0) return;

    if (args.length < 2) {
         return await message.send("Вы забыли что-то указать");
    }

    let text = args.slice(1).join(' ');
    let command = args[0].toLowerCase();

    let isUpdating = false;
    let cp = bot.db.get('commands').find({ command: command }).value()
    if (cp) {
        isUpdating = true;
    }

    let newObject = {
        'command': command,
        'type': 'text',
        'text': text
    }

    if (isUpdating) {
        bot.db.get('commands').find({ command: command }).assign(newObject).write()
    } else {
        bot.db.get('commands').push(newObject).write()
    }

    bot.commands[command] = helpers.buildHandler(message.vk, newObject)
    return await message.send((isUpdating) ? "Команда обновлена" : "Команда добавлена")
}

const addwho = async(bot, message, args) => { 
    if (config.admins.indexOf(message.senderId) < 0) return;

    if (args.length < 1) {
         return await message.send("Вы забыли что-то указать");
    }

    let user_id = parseInt(args[0]);
    if (bot.db.get('usersWhoCan').value().indexOf(user_id) > -1) {
        return await message.send("Этот пользователь уже может добавлять команды!")
    }

    bot.db.get('usersWhoCan').push(user_id).write();
    return await message.send("Теперь этот пользователь может добавлять команды!")
}

const del = async(bot, message, args) => { 
    const whoCan = bot.db.get('usersWhoCan').value()
    if (whoCan.indexOf(message.senderId) < 0) return;

    if (args.length < 1) {
         return await message.send("Вы забыли что-то указать");
    }

    let command = args[0].toLowerCase();
    let commandDB = bot.db.get('commands').find({ command: command }).value();
    if (!commandDB) {
        return await message.send("Такой команды нет")
    }

    bot.db.get('commands').remove({ command: command }).write();
    delete bot.commands[command];
    return await message.send("Удалил эту команду");    
}

const deletewho = async(bot, message, args) => { 
    if (config.admins.indexOf(message.senderId) < 0) return;

    if (args.length < 1) {
         return await message.send("Вы забыли что-то указать");
    }

    let user_id = parseInt(args[0]);
    let users = bot.db.get('usersWhoCan').value();
    if (users.indexOf(user_id) < 0) {
        return await message.send("Он и так не может!")
    }

    users.splice(users.indexOf(user_id), 1)
    bot.db.get('usersWhoCan').assign(users).write();
    return await message.send("Теперь он бомж.")
}

module.exports = {
    name: 'Контроллер',
    cmdsHandler: {
        'addp': addp,
        'addv': addv,
        'adda': adda,
        'adde': adde,
        'addt': addt,
        'addwho': addwho,
        'del': del,
        'deletewho': deletewho,
        'commands': commands
    }
}