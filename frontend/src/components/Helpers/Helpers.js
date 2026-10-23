const capitalize = (word) => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

const formatPrice = (amount) => {
  const num = Number(amount) || 0;
  return `₹${num.toFixed(2)}`;
};

const calculateSubtotal = (cart) => {
  return cart
    .reduce((acc, item) => {
      const price = item.effectivePrice ? Number(item.effectivePrice) : Number(item.price);
      return acc + price * (item.quantity || 1);
    }, 0)
    .toFixed(2);
};

const calculateDiscount = (cart, discount) => {
  return Math.round((Number(calculateSubtotal(cart)) / 100) * discount);
};

const calculateTotal = (cart, discount, fee) => {
  let finalPrice = Number(calculateSubtotal(cart));
  finalPrice -= calculateDiscount(cart, discount);
  finalPrice += Number(fee || 0);
  return finalPrice.toFixed(2);
};

export { capitalize, formatPrice, calculateSubtotal, calculateDiscount, calculateTotal };
