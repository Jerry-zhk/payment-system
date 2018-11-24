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
  return db.createTable('payment_request',  {
    request_id: { type: 'int', primaryKey: true, autoIncrement: true },
    recipient: { type: 'int', notNull: true },
    amount: { type: 'real', notNull: true },
    description: { type: 'string' },
    created_at: { type: 'timestamp', notNull: true },
    expired_at: { type: 'timestamp' }
  })
};

exports.down = function(db) {
  return db.dropTable('payment_request');
};

exports._meta = {
  "version": 1
};
