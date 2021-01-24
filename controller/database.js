const passport = require('passport');
require('dotenv').config();

const hostname = process.env.HOST;
const user = process.env.USER;
const password = process.env.PASSWORD;
const database = process.env.DATABASE;
const user_table = process.env.USER_TABLE;
const photos_table = process.env.PHOTOS_TABLE;

module.exports = {
    'connection': {
        'host': hostname,
        'user': user,
        'password': password
    },
    
    'database': database,
    'user_table': user_table,
    'photos_table': photos_table,
    'port': 3000
};