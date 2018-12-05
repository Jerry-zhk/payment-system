'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.createTable('gift_card', {
    card_id: { type: 'int', primaryKey: true, autoIncrement: true },
    code: { type: 'string', notNull: true },
    amount: { type: 'real', notNull: true },
    expired_at: { type: 'timestamp', notNull: true }
  }).then(() => {
    //Sample records--------------------------------------------------------
    db.runSql("INSERT INTO gift_card (code, amount, expired_at) values \
                ('67amZyfdm75P9K66Xy8NLKW3Ya5o36bG6WKwJ3eNxjAeMVRKoBFdohfUUvX0WjSp' ,50, '2020-01-01'),\
                ('vx3ae09RjYmE3MBEgzUC30i9SxlPImBfK7jKSDCEGqtSpeLKgjfHzmAUR1pCyRbH' ,50, '2020-01-01'),\
                ('tFDsCLKD57INXW8QwVCaBb1fjwx6SPL9u47yBZL4aVfMpZXOlty3UjpUJISSl4dl' ,100, '2020-01-01'),\
                ('si29ZKvcyBEjCoeVNr8zyPMWLaasoZDYNIXXEYRIe45g5Oxoq4rDOewW4rbEOGET' ,100, '2020-01-01'),\
                ('tWZ9rHW84Q7JRCokiWm2xnO1KIVrsKrX9gznMTr32OuP30zmZbBPa6a2kqO6LNJc' ,100, '2020-01-01'),\
                ('5035uOW2n9BJWqrFhaeUEE4AI2rRCCF48d4NiBFIUrBwt6S61uGFLvjAJUJNwXhB' ,100, '2020-01-01'),\
                ('9hnrws1KVWtGDUdfuAwnrEAMESXBF0QhVMh3FEe4rLzcy3WD32R4GgLA7tBwYWsg' ,100, '2020-01-01'),\
                ('IdmCU7bCYOvKCPAxjk9LlB9bRpsPRZlRWpEy7hXQ9zrCGDmBtWf7eCpNPo1zaN5B' ,100, '2020-01-01'),\
                ('ZyRm79ytrdl011QAptahXy1pIG0fsyzVpXIMtk4jCYfGIPWwMnfrbZlcsjEeh8Mm' ,1000, '2020-01-01'),\
                ('JSbQDFCxESJGKcjunEn5UTxa12aiKKnLQbTdjYKn9kZBu4Y0tqBfiDlmmmnhuzNc' ,1000, '2020-01-01'),\
                ('JeUCRkkla1azJRn64JJLmUej5ldsZimZtl9g1t1pzXevyn2TdLJQAQfaD8VqWCAC' ,1000, '2020-01-01'),\
                ('IMP6zGYZxB7vAb2dxGJYl2V3OicVLWct5Y2S9AWfrXsbkSlPyqUtqF6pIZSFDiS8' ,10000, '2020-01-01'),\
                ('QORkMqUL3V9GYRHfqfObwf4jH8LUFK9lseXqxIBHaxxynGeneFVBSZlMpOQSzhZs' ,10000, '2020-01-01')\
                ;");
  });
};

exports.down = function (db) {
  return db.dropTable('gift_card');
};

exports._meta = {
  "version": 1
};
