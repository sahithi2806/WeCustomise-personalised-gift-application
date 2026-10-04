// utils/money.js
// Money is stored as a Prisma Float, so every arithmetic boundary needs an
// explicit round or tiny drift leaks into the amount a customer is charged
// versus the amount recorded on the order (e.g. 999 * 0.8 = 799.1999999999999).
function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

module.exports = { round2 };
