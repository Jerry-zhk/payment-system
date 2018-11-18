'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('account',  {
    user_id: { type: 'int', primaryKey: true, autoIncrement: true },
    username: { type: 'string', notNull: true, unique: true },
    password: { type: 'string', notNull: true },
    salt: { type: 'string', notNull: true, unique: true },
    balance: { type: 'real', notNull: true}
  }).then(() => {
    db.createTable('transaction',  {
      user_id: { type: 'int', foreignKey: {
        name: 'transaction_user_id_fk',
        table: 'account',
        rules: {
          onDelete: 'RESTRICT',
          onUpdate: 'RESTRICT'
        },
        mapping: { user_id: 'user_id'}}
      },
      transaction_id: { type: 'int', primaryKey: true, autoIncrement: true },
      from: { type: 'string', notNull: true },
      to: { type: 'string', notNull: true },
      amount: { type: 'real', notNull: true },
      method: { type: 'string', notNull: true },
      completion_time: { type: 'timestamp', notNull: true }
    })
  }).then(() => {
    db.createTable('session', {
        user_id: { type: 'int', primaryKey: true },
        session_id: { type: 'string', foreignKey: {
          name: 'session_user_id_fk',
          table: 'account',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
          },
          mapping: {user_id: 'user_id'}}
        }
    })
  }).then(() => {
    db.runSql("INSERT INTO account (username, password, salt, balance) values ('jerry', 'jchong', 'jer', '10'),('nick', 'nicpple', 'nic', '30');");
  })
};

exports.down = function(db) {
  return db.dropTable('session')
    .then(() => {
      db.dropTable('transaction');
    }).then(() => {
      db.dropTable('account');
    })
};

exports._meta = {
  "version": 1
};
