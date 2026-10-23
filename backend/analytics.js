const BUSINESS_TIME_ZONE = 'Asia/Kolkata';

function getDateKey(value) {
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match && !value.startsWith(`${match[1]}T`)) return match[1];
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const dateParts = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

function getPeriodDays(value) {
  const days = Number(value);
  return [7, 30, 90].includes(days) ? days : 7;
}

function getSalesAnalytics(orders, orderItems, foodItems, requestedDays) {
  const days = getPeriodDays(requestedDays);
  const paidOrders = orders.filter(
    (order) => order.payment_status === 'Paid' && order.order_status !== 'Cancelled'
  );
  const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const [year, month, day] = getDateKey(new Date()).split('-').map(Number);

  const dailySales = Array.from({ length: days }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, day - (days - index - 1)));
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      label: date.toLocaleDateString('en-IN', {
        timeZone: BUSINESS_TIME_ZONE,
        day: 'numeric',
        month: 'short',
      }),
      value: 0,
    };
  });
  const salesByDate = new Map(dailySales.map((day) => [day.key, day]));

  for (const order of paidOrders) {
    const key = getDateKey(order.order_date);
    const day = salesByDate.get(key);
    if (day) day.value += Number(order.total_amount || 0);
  }

  const paidOrderIds = new Set(paidOrders.map((order) => order.id));
  const productSales = new Map();
  for (const entry of orderItems) {
    if (!paidOrderIds.has(entry.order_id)) continue;
    const foodItem = foodItems.find((item) => item.id === entry.food_item_id);
    if (!foodItem) continue;

    const sale = productSales.get(foodItem.id) || {
      name: foodItem.name,
      quantity: 0,
      revenue: 0,
      orderIds: new Set(),
    };
    const quantity = Number(entry.quantity || 0);
    sale.quantity += quantity;
    sale.revenue += Number(entry.unit_price ?? foodItem.price ?? 0) * quantity;
    sale.orderIds.add(entry.order_id);
    productSales.set(foodItem.id, sale);
  }

  const bestSelling = [...productSales.values()]
    .sort((left, right) => right.quantity - left.quantity || right.revenue - left.revenue)
    .slice(0, 5)
    .map(({ name, quantity, revenue: itemRevenue, orderIds }) => ({
      name,
      quantity,
      orders: orderIds.size,
      revenue: Number(itemRevenue.toFixed(2)),
    }));

  return {
    totalOrders: orders.length,
    paidOrders: paidOrders.length,
    totalRevenue: Number(revenue.toFixed(2)),
    averageOrderValue: paidOrders.length ? Number((revenue / paidOrders.length).toFixed(2)) : 0,
    dailySales,
    bestSelling,
  };
}

module.exports = { getSalesAnalytics, getPeriodDays };
