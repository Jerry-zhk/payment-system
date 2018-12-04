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
  return db.createTable('gift_card',  {
    card_id: { type: 'int', primaryKey: true, autoIncrement: true },
    code: { type: 'string', notNull: true },
    amount: { type: 'real', notNull: true },
    expired_at: { type: 'timestamp', notNull: true }
  });
};

exports.down = function(db) {
  return db.dropTable('gift_card');
};

exports._meta = {
  "version": 1
};
