const { Class } = require('../database/models');

class ClassService {
    async getByIdAsync(req, res) { }
    async getAllAsync(req, res) { }
    async createAsync(req, res) { }
    async updateAsync(req, res) { }
    async removeAsync(req, res) { }

    getErrors(data) {
        const errors = [];
        return errors;
    }
}

module.exports = new ClassService();