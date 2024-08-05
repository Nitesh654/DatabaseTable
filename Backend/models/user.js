const Sequelize = require('sequelize');
const sequelize = require('../connection/database');
const moment = require('moment');

const models = {};

function createModel(tableName, fields) {
    const attributes = {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
            unique: true,
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        updatedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    };

    fields.forEach(field => {
        attributes[field.name] = {
            type: field.type === 'text' ? Sequelize.STRING : field.type === 'number' ? Sequelize.INTEGER : Sequelize.STRING
        };
    });

    models[tableName] = sequelize.define(tableName, attributes, {
        hooks: {
            afterFind: (records) => {
                const formatTimestamps = (record) => {
                    record.createdAt = moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss');
                    record.updatedAt = moment(record.updatedAt).format('YYYY-MM-DD HH:mm:ss');
                    return record;
                };
                if (Array.isArray(records)) {
                    records.forEach(formatTimestamps);
                } else if (records) {
                    formatTimestamps(records);
                }
            },
        },
    });

    return models[tableName];
}

module.exports = { createModel, models };
