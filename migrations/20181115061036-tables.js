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
    display_name: { type: 'string', notNull: true },
    password: { type: 'string', notNull: true },
    salt: { type: 'string', notNull: true, unique: true },
    balance: { type: 'real', notNull: true},
    access_key: { type: 'string', notNull: true, unique: true },
    secret_key: { type: 'string', notNull: true, unique: true }
  }).then(() => {
//Transaction within account-----------------------------------
    db.createTable('transactions',  {
      transaction_id: { type: 'int', primaryKey: true, autoIncrement: true },
      payment_request_id: { type: 'int', notNull: true },
      paid_by: { type: 'int', notNull: true },
      paid_at: { type: 'timestamp', notNull: true }
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
    db.runSql("INSERT INTO account (username, display_name, password,  salt, balance, access_key, secret_key) values \
            ('pui123', 'Pui2', 'd3552e7a2c01bd055805f8a5bd5e32a617b44486e7cd127735dbc423a2828f29763fb3e0e6f3601f95debd885e81b35f9e76002847d82026944b07f6ed15009f', 'U7rIuTAJlEXbR2ainio6n8gq3H9jiSOpjYruFH5ZvVfDB6pva4bC0m2c0UdYUtK2', '1000', 'b0657685ba0636c53625cf341e6fe220', 'b6125876aa59ebff7f7479a519798c9e6dafcbc111813533c5041d8b822e4587'),\
            ('jerry123', 'Jerry', '64c8413e5eb8b053e350328822b88dad87ba1cbb713de0e8634cf17fb15e6e6e40c6f34eb34f0b49cf4773f1267564175dbbc8c76382b1ff51b7df51a38d117b', 'QgEra9wQVooP1oDndqsNyAK86TmrXwk2DSzQjxVTrqPrssvz43ysyE2wYXCk9J8Z', '1000', 'f5925c548975ed54705972207886bda7', '4bb1e275a706fbe876e99d404f9854a8edf684420eba6ae69a713c676b17b61b'),\
            ('yiran123', 'Yiran', 'a3ff5df52410493124fb527c49497ea69a18e23e84acc7b8818cd5d88a6e03b06a110e046b4ed71cd5698e5b2030193eeeb65d312b354e1bb350f0b1650f405c', 'DZMp5zeCDNq2uh6dyf3p7idn0XqJ43T6Zyi9rQnxxmSQ4GKOEJ0jc6uW6qCb66C2', '1000', '83a67c0441c858fc627706536cfb0b70', 'a7156868479182cc27c0d4da9aae0748fe3ee626f81579a01b1b2e763f2c7bb1'),\
            ('willy123', 'Willy', '448d7aa73d77ba3703d5ad8761382cf9bf85829879dad47dd7cd3a456cd50e4e4d10f7ba2d6c0176c442c823976a23255c6f37dc5722fe73da847aa88e127af4', 'mQ8sRv0GZhL720NkjR0jlNg7nnteW46MjZJj4Gln5GWzz4UmR4vgWayvSC5HGpI8', '1000', '27ab452374c60f34b17fe31eb2b7b4ff', 'd54f423b93a5560d9e5c54173d93bec05c48a8588ed9fb874b4090b67e1345b6')\
              ;");
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
