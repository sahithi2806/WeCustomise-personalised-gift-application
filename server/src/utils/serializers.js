function parseJsonField(value, fallback = null) {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function serialiseCustomisation(customisation) {
  if (!customisation) return null;
  return typeof customisation === 'string' ? customisation : JSON.stringify(customisation);
}

function parseCustomisation(customisation) {
  return parseJsonField(customisation, null);
}

function parseAddress(address) {
  return parseJsonField(address, {});
}

function formatOrder(order) {
  return {
    ...order,
    address: parseAddress(order.address),
    items: order.items?.map((item) => ({
      ...item,
      customisation: parseCustomisation(item.customisation),
    })) || [],
  };
}

function formatCartItem(item) {
  return {
    ...item,
    customisation: parseCustomisation(item.customisation),
  };
}

module.exports = {
  formatCartItem,
  formatOrder,
  parseAddress,
  parseCustomisation,
  serialiseCustomisation,
};
