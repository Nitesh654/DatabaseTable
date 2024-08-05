const { models, createModel } = require('../models/user');
const moment = require('moment');

const formatTimestamps = (record) => {
    record.createdAt = moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss');
    record.updatedAt = moment(record.updatedAt).format('YYYY-MM-DD HH:mm:ss');
    return record;
};

const tables = {};

exports.createTable = async (req, res) => {
    const { tableName, fields } = req.body;

    try {
        const Model = createModel(tableName, fields);
        await Model.sync();
        tables[tableName] = Model;
        res.status(201).send('Table created');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getAllTables = async (req, res) => {
    try {
        const tableNames = Object.keys(models);
        res.json({ tables: tableNames });
        console.log('Tables:', tableNames);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching tables' });
    }
};

exports.getTableDetails = async (req, res) => {
    const { tableName } = req.params;

    if (!models[tableName]) {
        return res.status(404).json({ message: 'Table not found' });
    }

    try {
        const records = await models[tableName].findAll();
        const formattedRecords = records.map(record => formatTimestamps(record.toJSON()));
        res.json(formattedRecords);
    } catch (error) {
        console.error(`Error fetching records for table ${tableName}:`, error);
        res.status(500).json({ message: 'Error fetching records', error });
    }
};

exports.getFields = async (req, res) => {
    const { tableName } = req.params;
    if (!models[tableName]) {
        return res.status(404).json({ message: 'Table not found' });
    }

    try {
        const fields = models[tableName].rawAttributes;
        res.json({ fields: Object.keys(fields).map(key => ({
            name: key,
            type: fields[key].type.key
        })) });
    } catch (error) {
        console.error(`Error fetching fields for table ${tableName}:`, error);
        res.status(500).json({ message: 'Error fetching fields', error });
    }
};


exports.addRecord = async (req, res) => {
    const { tableName } = req.params;
    const data = req.body;

    if (!models[tableName]) {
        return res.status(404).json({ message: 'Table not found' });
    }

    try {
        const model = models[tableName];
        const record = await model.create(data);
        const formattedRecord = formatTimestamps(record.toJSON());
        res.status(201).json(formattedRecord);
    } catch (error) {
        res.status(500).json({ message: 'Error adding record', error });
    }
};

exports.deleteTable = async (req, res) => {
    const { tableName } = req.params;
    const table = tables[tableName];
    
    if (!table) {
        return res.status(404).json({ message: 'Table not found' });
    }

    try {
        await table.drop();
        delete tables[tableName];
        delete models[tableName];
        res.json({ message: 'Table deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting table', error });
    }
};

exports.getRecordById = async (req, res) => {
    const { tableName, recordId } = req.params;

    if (!models[tableName]) {
        return res.status(404).json({ message: 'Table not found' });
    }

    try {
        const record = await models[tableName].findByPk(recordId);
        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }
        res.json(record);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching record', error });
    }
};

exports.updateRecord = async (req, res) => {
    const { tableName, recordId } = req.params;
    const updatedData = req.body;

    if (!models[tableName]) {
        return res.status(404).json({ message: 'Table not found' });
    }

    try {
        const record = await models[tableName].findByPk(recordId);
        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }
        await record.update(updatedData);
        res.json(record);
    } catch (error) {
        res.status(500).json({ message: 'Error updating record', error });
    }
};

exports.deleteRecord = async (req, res) => {
    const { tableName, recordId } = req.params;

    if (!models[tableName]) {
        return res.status(404).json({ message: 'Table not found' });
    }

    try {
        const record = await models[tableName].findByPk(recordId);
        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }
        await record.destroy();
        res.json({ message: 'Record deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting record', error });
    }
};
