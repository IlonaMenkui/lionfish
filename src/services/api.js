const axios = require('axios')

module.exports = class Api {
    constructor({ baseUrl }) {
        this.axios = axios.create({
            baseURL: baseUrl
        })
    }

    find(options = {}) {
        return this.axios
            .get('/api/animes', { params: { ...options } })
            .then(res => res.data)
    }

    findTop15ByYear(year, options = {}) {
        return this.find({
            season: year,
            limit: 15,
            order: 'popularity',
            ...options
        })
    }

    findAnimeByName(name, options = {}) {
        return this.find({
            search: name, ...options
        })
    }

    expandUrl(relativeUrl) {
        return `${this.axios.defaults.baseURL}${relativeUrl}`
    }
}
