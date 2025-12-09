const bcrypt = require('bcrypt');
const { sequelize, User } = require('./setup');

(async () => {
  try {
    await sequelize.sync({ force: true });

    const hashed = await bcrypt.hash('password123', 10);

    await User.bulkCreate([
      {
        email: 'john@company.com',
        password: hashed,
        role: 'employee'
      },
      {
        email: 'sarah@company.com',
        password: hashed,
        role: 'manager'
      },
      {
        email: 'mike@company.com',
        password: hashed,
        role: 'admin'
      }
    ]);

    console.log('✅ Database seeded correctly');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
