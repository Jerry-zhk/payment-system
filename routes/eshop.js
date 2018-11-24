const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const crypto = require('../crypto');

const items = [
  {
    id: 1,
    name: 'A very cool pig',
    price: 29.9,
    img: 'https://images-na.ssl-images-amazon.com/images/I/31RZP-0FXIL._SY355_.jpg'
  },
  {
    id: 2,
    name: 'Super big cup',
    price: 5,
    img: 'https://www.parknshop.com/medias/sys_master/front/prd/8883482230814.jpg'
  },
  {
    id: 3,
    name: 'A leaf',
    price: 100,
    img: 'https://www.virginiagreenlawncare.com/wp-content/uploads/2016/03/file42-300x300.jpg'
  },
  {
    id: 4,
    name: 'Diamond',
    price: 1.2,
    img: 'https://herkimerdiamondquartz.com/blog/wp-content/uploads/2016/12/Round-cut-diamond-300x300.jpg'
  }
];

const apiKeys = {
  access_key: '27ab452374c60f34237fe31eb2b7b4ff',
  secret_key: 'a7156868479182cc27c0d4da9aae0748fe3ee626f81579a01b1b2e763f2c7bwi'
}

function findItemById(id) {
  return items.find(function (item) {
    return item.id == id
  })
}

const requestObjectToString = (requestObj) => {
  let items = [];
  for (var key in requestObj) {
    // skip loop if the property is from prototype
    if (!requestObj.hasOwnProperty(key)) continue;

    items.push(key + '=' + requestObj[key]);
  }
  return items.join('&');
}


router.post('/checkout', async (req, res) => {
  const orderItems = req.body.order_items;
  let total = 0;
  let descriptions = [];
  let item;
  for (var i = 0; i < orderItems.length; i++) {
    item = findItemById(orderItems[i].id)
    if (!item) return res.json({ error: 'Invalid item' });
    total += item.price * orderItems[i].qty;
    descriptions.push(`${item.name} * ${orderItems[i].qty}`);
  }
  let data = {
    access_key: apiKeys.access_key,
    amount: total,
    description: descriptions.join(', ')
  };
  const requestString = requestObjectToString(data);
  const hmac = crypto.hmac(Buffer.from(apiKeys.secret_key, 'hex'), Buffer.from(requestString));

  fetch('http://localhost:3300/api/payment-request', {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": hmac
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  }).then(result => result.json())
    .then(json => res.json(json))
    .catch(err => {
      console.log(err)
    });
    
})

router.get('/items', (req, res) => {
  res.json(items);
});


module.exports = router;