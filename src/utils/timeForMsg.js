const msgtime = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().toString()
    }
}
const loctime = (username, url) => {
    return{
        username,
        url,
        createdAt: new Date().toString()
    }
}

module.exports = {
    msgtime,
    loctime
}