const fetch = require('node-fetch');

module.exports = {
    "buildHandler": (vk, command) => {
        var result = null;
        var attachment = null;
        var linkToUpload = null;
        var needEval = null;
        switch(command.type) {
            case "photo":
                result = "";
                linkToUpload = command.link
                break;
            case "video":
                result = "";
                attachment = command.attach;
                break;
            case "audio":
                result = "";
                attachment = command.attach;
                break;
            case "text":
                result = command.text;
                break;
            case "send_eval":
                result = "";
                needEval = command.evaling;
                break;
        }

        if (result === null) return null;

        const handler = async (bot, message, args) => {
            if (result !== null && result.length < 1 && attachment !== null) {
                return await message.send({ attachment: attachment })
            } 
            if (result !== null && result.length < 1 && linkToUpload !== null) {

                let linkFetching = await fetch(linkToUpload)
                let imageBuffer = await linkFetching.buffer()
                let image = await vk.upload.messagePhoto({
                    source: imageBuffer
                })
                
                return await message.send("", { attachment: `photo${image['ownerId']}_${image['id']}`})
            }

            if (result !== null && needEval !== null) {
                try {
                    result = eval(needEval)
                } catch (e) {
                    result = "error"
                }
            }

            return await message.send(result)
        }

        return handler;
    },

    "parseLargePhoto": (photo) => {
        let link = null;
        if (photo['sizes']) {
            let m_s_ind = -1
            let m_s_wid = 0

            for (let [i, size] of photo['sizes'].entries()) {
                if (size.width > m_s_wid) {
                    m_s_wid = size.width
                    m_s_ind = i
                }
            }

            link = photo.sizes[m_s_ind].url
        }
        else if (photo['url']) {
            link = photo.url
        }
        return link
    }
}
