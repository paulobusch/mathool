const bcrypt = require('bcrypt');
const { Types } = require('mongoose');
const { ObjectId } = Types;

const { merge } = require('../utils/helpers/errors');
const { bindAll } = require('../utils/helpers/context');
const MongoDb = require('../database/mongo/models');
const MySqlDb = require('../database/mysql/models');
const roles = require('../utils/enums/roles');
const passwordValidator = require('../utils/validators/password');
const emailValidator = require('../utils/validators/email');

class UserService {
    async getAllAsync(req, res) {
        const filters = req.params;

        const users = await MongoDb.User.find(filters);

        res.json({ data: users.map(user => this.mapUserResponse(user)) });
    }

    async getByIdAsync(req, res) { 
        const _id = new ObjectId(req.params.id);

        const user = await MongoDb.User.findOne({ _id });

        if (!user) return res.status(400).json('User is not found');

        res.json({ data: this.mapUserResponse(user) });
    }

    async createAsync(req, res) { 
        const data = req.body;
        const errors = await this.getErrorsAsync(data);
        if (errors.length) return res.status(400).json({ errors });

        const salt = bcrypt.genSaltSync();
        const hash = bcrypt.hashSync(data.password, salt);
        const user = {
            name: data.name,
            email: data.email,
            role: data.role,
            classCode: data.classCode ? data.classCode : undefined,
            password: hash
        };
        const { _id } = await MongoDb.User.create(user);
        const { id } = await MySqlDb.User.create({ guid: _id.toString(), ...user });

        res.json({ data: { _id, id, ...user, password: undefined } });
    }

    async updateAsync(req, res) { 
        const _id = new ObjectId(req.params.id);
        const data = req.body;
        const errors = await this.getErrorsAsync(data, _id);
        if (errors.length) return res.status(400).json({ errors });

        const user = {
            name: data.name,
            email: data.email,
            classCode: data.classCode
        };
        await MySqlDb.User.update(user, { where: { guid: _id.toString() } });
        await MongoDb.User.updateOne({ _id }, user);

        res.json({ data: user });
    }

    async getErrorsAsync(data, _id) {
        const errors = [];
        if (_id && !await MongoDb.User.exists({ _id }))
            errors.push('User is not found');
        if (!data.name) errors.push('Parameter name is required');
        if (!data.email) errors.push('Parameter email is required');
        if (data.email) {
            const emailErrors = emailValidator.validate(data.email);
            merge(errors, emailErrors);
        }
        if (data.email && await MongoDb.User.exists({ email: data.email, _id: { $ne: _id } }))
            errors.push('User with email already exist');
        if (!_id && !data.password) errors.push('Parameter password is required');
        if (!_id && data.password) {
            const passwordErrors = passwordValidator.validate(data.password);
            merge(errors, passwordErrors);
        }
        if (!_id && !data.confirmPassword) 
            errors.push('Parameter confirmPassword is required');
        if (!_id && data.password !== data.confirmPassword) 
            errors.push('Parameter confirmPassword is not equal to password');
        if (!_id && !data.role) errors.push('Parameter role is required');
        if (!_id && data.role && [roles.TEACHER, roles.STUDENT].indexOf(data.role) === -1) 
            errors.push(`Parameter type require in (${roles.TEACHER}, ${roles.STUDENT})`);
        if (data.classCode && !await MongoDb.Class.exists({ code: data.classCode }))
            errors.push('Class with code is not found');
        return errors;
    }

    mapUserResponse(data) {
        return {
            _id: data._id,
            name: data.name,
            email: data.email,
            role: data.role,
            classCode: data.classCode
        };
    }
}

module.exports = bindAll(UserService, new UserService());