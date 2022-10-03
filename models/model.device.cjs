module.exports = (sequelize, Sequelize) => {
    const Device = sequelize.define("device", {
        device_id: {
            type: Sequelize.STRING,
            primaryKey: true,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false
        },
        no_sender: {
            type: Sequelize.STRING,
            allowNull: true
        },
        device_manufacturer: {
            type: Sequelize.STRING,
            allowNull: true
        },
        device_model: {
            type: Sequelize.STRING,
            allowNull: true
        },
        wa_version: {
            type: Sequelize.STRING,
            allowNull: true
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false
        },
        due_date: {
            type: Sequelize.DATE,
            allowNull: true
        },
        package_serial: {
            type: Sequelize.STRING,
            allowNull: true
        },
        jambuka: {
            type: Sequelize.TIME,
            allowNull: true
        },
        jamtutup: {
            type: Sequelize.TIME,
            allowNull: true
        },
        last_status_update: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.NOW,
            allowNull: true
        },
        pesanreply: {
            type: Sequelize.STRING,
            allowNull: true
        },
        pesanchatbot: {
            type: Sequelize.STRING,
            allowNull: true
        },
        server: {
            type: Sequelize.STRING,
            allowNull: false
        },
        port: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 9001,
        }
    }, {
        timestamps: false,
        tableName: 'device'
    });

    return Device;
};