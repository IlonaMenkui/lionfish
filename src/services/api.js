const axios = require('axios')

module.exports = class Api {
    constructor({ baseUrl }) {
        this.axios = axios.create({
            baseURL: baseUrl
        })
    }

    findAnimeByName(name, options = {}) {
        return this.axios
            .get('/api/animes', { params: { search: name, ...options } })
            .then(res => res.data)
    }

    expandUrl(relativeUrl) {
        return `${this.axios.defaults.baseURL}${relativeUrl}`
    }
}
