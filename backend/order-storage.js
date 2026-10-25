const fs = require('fs');
const path = require('path');

const storageFile = path.join(__dirname, '..', '.foodnest', 'orders.json');

function loadOrderData() {
  if (!fs.existsSync(storageFile)) {
    return null;
  }

  const data = JSON.parse(fs.readFileSync(storageFile, 'utf8'));
  if (
    !data ||
    !Array.isArray(data.orders) ||
    !Array.isArray(data.orderItems) ||
    !Array.isArray(data.customers)
  ) {
    throw new Error(`Saved order data is invalid: ${storageFile}`);
  }

  return data;
}

function saveOrderData(data) {
  const directory = path.dirname(storageFile);
  const temporaryFile = `${storageFile}.tmp`;
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(temporaryFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(temporaryFile, storageFile);
}

module.exports = { loadOrderData, saveOrderData };
