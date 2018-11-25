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
            ('pui123', 'Pui2', 'ee35e910874489903ccac11b526873599bce63bbd0549459950254f3cae92993397a9dd719f19df319b6679349affe6cf25f118811c1fee3d91bece023727b3e', 'teZJyf26xBYQ6E8DzH5uTTwjHHY98hdpN6e1sEXRuWCCMEuVQjTZbIobPQbcKbIT', '1000', 'b0657685ba0636c53625cf341e6fe220', 'b6125876aa59ebff7f7479a519798c9e6dafcbc111813533c5041d8b822e4587'),\
            ('jerry123', 'Jerry', '3b623b5944f349f91754d71e657f1f0d57f723ba42e9280db9e290ad1919251f8718a525212592e01812f67560a625997eed61edfcb375f9e6d099303501d009', '4RkEdJYQSRSjoftYy9jEV4aYRRSRrIu8AjYF1t1yxLPkvT7QcUffej10bPgkwRLY', '1000', 'f5925c548975ed54705972207886bda7', '4bb1e275a706fbe876e99d404f9854a8edf684420eba6ae69a713c676b17b61b'),\
            ('yiran123', 'Yiran', '3463b120ee95737fb280dfcb48b6ef22681f49ba56e9e9c5b405ed258fd5ad92c6e345f9ff9ed1620e40dd5ceaaca9cb7b889f400cc8b2b53489bdac2e54b3f2', 'VykPykXb36Nf5XvonfAwoGMG12qCx3kFMXYhOLN6pXIKVyWxX5XkcrXRuY1SSL3J', '1000', '83a67c0441c858fc627706536cfb0b70', 'a7156868479182cc27c0d4da9aae0748fe3ee626f81579a01b1b2e763f2c7bb1'),\
            ('willy123', 'Willy', '9f1b652f63f0581d9e3d7dc05f639e463e49c9726fdc686ceca304916e7369c1091754910ea453a11e5c603ee11d0e5e681ed0483c711a8d6518c61c7a995a11', 'htkjqylnkpfrA2vasjCdOqjoNWier1PGdyTW7ZYmt8uFFX1qpxMiU25eLGEtWVDI', '1000', '27ab452374c60f34b17fe31eb2b7b4ff', 'd54f423b93a5560d9e5c54173d93bec05c48a8588ed9fb874b4090b67e1345b6'),\
            ('eshop123', 'eShop', '35104c15510ca50665dfa84bee5c2d6f4eb01dde004285b8bbe07446dceca07dca67fe637630aaad55660c411898c2ea4ce2a59c20140d3090c6eb0d1d510591', 'Q1wUUXD1TMPXjsqSTeItUlEj7C2JOo7nsgnAVND8cQGVIzQ9X8gH5nqXJatooblZ', '1000', '27ab452374c60f14b17fe88eb2b7b4ff', 'd54f429393a5560d9e5c54173493bec05c48a8588ed9fb874b4090b67e1345b6')\
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
