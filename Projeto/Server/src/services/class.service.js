const { Types } = require('mongoose');
const { ObjectId } = Types;

const { Class } = require('../database/models');
const role = require('../utils/enums/roles');
const { bindAll } = require('../utils/helpers/context');

class ClassService {

    async getByIdAsync(req, res) {
        const _id = new ObjectId(req.params.id);

        const classe = await Class.findOne({ _id });

        if (!classe) return res.status(400).json('Classe is not found');

        res.json({ data: this.mapClassResponse(classe) });
     }

    async getAllAsync(req, res) {
        const professor_id = req.user._id;
        const filters = req.params;
        const classes = (role.Teacher == req.user.role) ? 
            await Class.find( { professor_id } ) : 
            await Class.find( filters );
        res.json({ data: classes.map(classe => this.mapClassResponse(classe)) });

    }

    async createAsync(req, res) { 
        const data = req.body;

        const classe = {
            name: data.name,
            serie: data.serie,
            class: data.class,
            code: data.code,            
            professor_id: req.user._id,
            active_class: true
        }; 
        const { _id } = await Class.create(classe);

        res.json({ data: { _id,  ...classe } });
    }


    async updateAsync(req, res) {
        const _id = new ObjectId(req.params.id);
        const data = req.body;
        const errors = await this.getErrorsAsync(data, _id);
        if (errors.length) return res.status(400).json({ errors });

        const classe = {
            name: data.name,
            serie: data.serie,
            class: data.class,
            code: data.code,
            active_class: req.user.active_class
        };
        await Class.updateOne({ _id }, classe);

        res.json({ data: classe });
    }

    async indexAsync(req, res) {
        const _id = new ObjectId(req.params.id);
        const data = req.body;

        const classe = {
            active_class: data.active_class
        };
        await Class.updateOne({ _id }, classe);

        res.json({ data: classe });
    }

    async removeAsync(req, res) {
        try{
            const id = req.params.id;
            const classe = await Class.findByIdAndRemove(id);

            res.json(classe);
        } catch (err){
            return res.status(400).json({err});
        }
    }

    async getErrorsAsync(data, _id) {
        const errors = [];
        if (_id && !await Class.exists({ _id }))
            errors.push('Class is not found');
        if (!data.name) errors.push('Parameter name is required');
        if (!data.serie) errors.push('Parameter serie is required');
        if (!data.class) errors.push('Parameter class is required');
        if (!data.code) errors.push('Parameter code is required');
        
        return errors;
    }

    mapClassResponse(data) {
        return {
            _id: data._id,
            name: data.name,
            serie: data.serie,
            class: data.class,
            code: data.code,
            professor_id: data.professor_id,
            active_class: data.active_class
        };
    }
}

module.exports = bindAll(ClassService, new ClassService());