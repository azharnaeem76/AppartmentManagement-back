const app = require('./app');
const db = require('./models')
const logger = require('./config/logger');
const { SimpleDB } = require('aws-sdk');
const bcrypt = require("bcryptjs");



let server;
const PORT = process.env.PORT || 8000;
db.sequelize.sync(
    // {   force:true}
    ).then(async () => {
        logger.info('DATABASE CONNECTED , Drop and Resync Db')
        const existingSuperadmin = await db.Superadmin.findOne({ where: { email: 'superadmin@apptx.com' } });

        if(!existingSuperadmin){
        
                    await db.Superadmin.create({
                        name: 'Super Admin',
                        email: 'superadmin@apptx.com',
                        password: '12345678@',
                    });
        }
    });



    
server = app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
})
app.get('/', (req, res) => {
    logger.info('/ hit')
    res.sendFile(__dirname + '/view/index.html');
});

app.use('*', (req, res) => {
    res.status(404).send({ message: 'route not found', sucess: false });
})


const exitHandler = (options, err) => {
    if (options.cleanup || err) {
        server.close(() => {
            logger.info('Server closed');
            process.exit(1);
        });
    }
    else {
        process.exit(1);
    }

}

const unexpectedHandler = (err) => {
    logger.error(err.stack);
    // exitHandler({ cleanup: true }, err);
}
process.on('uncaughtException', unexpectedHandler);
process.on('unhandledRejection', unexpectedHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    // exitHandler({ cleanup: true });
})