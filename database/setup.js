require('dotenv').config();
const { Sequelize } = require('sequelize');

// Create database connection
const sequelize = new Sequelize({
    dialect: process.env.DB_TYPE,
    storage: process.env.DB_NAME
});

// Define User model
const User = sequelize.define('User', {
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'employee',
        validate: {
            isIn: [['employee', 'manager', 'admin']]
        }
    }
});

// Define Project model
const Project = sequelize.define('Project', {
    name: Sequelize.STRING,
    description: Sequelize.STRING,
    status: Sequelize.STRING
});

// Define Task model
const Task = sequelize.define('Task', {
    title: Sequelize.STRING,
    description: Sequelize.STRING,
    status: Sequelize.STRING,
    priority: Sequelize.STRING
});

// Relationships
User.hasMany(Project, { foreignKey: 'managerId' });
Project.belongsTo(User, { foreignKey: 'managerId' });

Project.hasMany(Task, { foreignKey: 'projectId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(Task, { foreignKey: 'assignedUserId' });
Task.belongsTo(User, { foreignKey: 'assignedUserId' });

// Export for use in seed.js + server.js
module.exports = {
    db: sequelize,
    User,
    Project,
    Task
};
