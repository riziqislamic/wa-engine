module.exports = (sequelize, Sequelize) => {
    const MessageStatus = sequelize.define("message_status", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        message_id: {
            type: Sequelize.STRING,
            allowNull: false
        },
        status: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        status_at: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.NOW,
            allowNull: false
        }
    }, {
        timestamps: false,
        tableName: 'message_status'
    });

    return MessageStatus;
};