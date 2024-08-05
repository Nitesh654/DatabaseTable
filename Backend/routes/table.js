const express = require('express');

const tableController = require('../controllers/table');
const router = express.Router();

router.post('/table', tableController.createTable);
router.get('/tables', tableController.getAllTables);
router.get('/table/:tableName', tableController.getTableDetails);
router.get('/table/:tableName/fields', tableController.getFields);
router.post('/table/:tableName/record', tableController.addRecord);
router.put('/table/:tableName/record/:recordId', tableController.updateRecord);
router.delete('/table/:tableName', tableController.deleteTable);
router.delete('/table/:tableName/record/:recordId', tableController.deleteRecord);


module.exports = router;
