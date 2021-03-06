const { Schema } = require('mongoose');
const roles = require('../../utils/enums/roles');

module.exports = new Schema({
    name: { type: String, required: true, maxLength: 150 },
    email: { type: String, required: true, unique: true, maxLength: 100 },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: [roles.TEACHER, roles.STUDENT] },
    classCode: String
});