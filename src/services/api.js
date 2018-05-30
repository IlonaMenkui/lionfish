const axios = require('axios')
const _ = require('lodash')

module.exports = class Api {
    constructor({ baseUrl }) {
        this.axios = axios.create({
            baseURL: baseUrl
        })
    }

    getGenres() {
        return this.axios
            .get('/api/genres')
            .then(res => res.data)
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

    findRandomByGenre(genre, options = {}) {
        return this.find({
            genre: genre.toString(),
            limit: 50,
            order: 'random',
            ...options
        })
        .then(_.sample)
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
