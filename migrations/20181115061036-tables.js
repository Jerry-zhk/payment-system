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
//Account-------------------------------------------------------
  return db.createTable('account',  {
    user_id: { type: 'int', primaryKey: true, autoIncrement: true },
    username: { type: 'string', notNull: true, unique: true },
    password: { type: 'string', notNull: true },
    salt: { type: 'string', notNull: true, unique: true },
    balance: { type: 'real', notNull: true}
  }).then(() => {
//Transaction within account-----------------------------------
    db.createTable('ac_transaction',  {
      from: { type: 'int', notNull: true },
      transaction_id: { type: 'int', primaryKey: true, autoIncrement: true },
      to: { type: 'string', notNull: true },
      amount: { type: 'real', notNull: true },
      completion_time: { type: 'timestamp', notNull: true }
    })
  }).then(() => {
//Session----------------------------------------------------------
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
//Credit card----------------------------------------------------------
    db.createTable('creditcard', {
        cc_number: { type: 'string', primaryKey: true },
        cvv: { type: 'int', notNull: true },
        card_holder: { type: 'string', notNull: true },
        expiration_date: { type: 'string', notNull: true },
        credit_limit: { type: 'real', notNull: true}
    })
  }).then(() => {
//Add value record----------------------------------------------------------
    db.createTable('add_value', {
        av_id: { type: 'int', primaryKey: true, autoIncrement: true },
        user_id: { type: 'string', primaryKey: true },
        creditcard: { type: 'int', notNull: true },
        amount: { type: 'real', notNull: true}
    });
  }).then(() => {
//Sample records--------------------------------------------------------
    db.runSql("INSERT INTO account (username, password, salt, balance) values ('jerrysama', 'jchong', 'jer', '100'),('nicksama', 'nicpple', 'nic', '30');");
  }).then(() => {
    db.runSql("INSERT INTO creditcard () values ('4463915235847879', 779, 'puisama', '11/2023', 100),('4957102320090763', 101, 'willysama', '07/2022', 200);");
  })
};

exports.down = function(db) {
  return db.dropTable('creditcard')
    .then(() => {
      db.dropTable('session')
    }).then(() => {
      db.dropTable('ac_transaction');
    }).then(() => {
      db.dropTable('account');
    }).then(() => {
      db.dropTable('add_value');
    });
};

exports._meta = {
  "version": 1
};
