module.exports = (sequelize, Sequelize) => {
    const Messages = sequelize.define("message", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        device_id: {
            type: Sequelize.STRING,
            allowNull: false
        },
        jid_phone: {
            type: Sequelize.STRING,
            allowNull: true
        },
        message_id: {
            type: Sequelize.STRING,
            allowNull: true
        },
        number: {
            type: Sequelize.STRING,
            allowNull: false
        },
        message: {
            type: Sequelize.STRING,
            allowNull: false
        },
        file: {
            type: Sequelize.STRING,
            allowNull: true
        },
        type: {
            type: Sequelize.STRING,
            allowNull: true
        },
        status_message: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        waktukirim: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.NOW,
            allowNull: false
        },
        sent_attemp: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        }
    }, {
        timestamps: false,
        tableName: 'message'
    });

    return Messages;
};