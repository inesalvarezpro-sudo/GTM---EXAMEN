window.dataLayer = window.dataLayer || [];
window.shopHooks = window.shopHooks || {};

// Transforme un produit en format GA4
function versItem(p) {
  return {
    item_id: p.sku,
    item_name: p.name,
    item_brand: p.brand,
    item_category: p.category,
    price: p.price,
    quantity: p.quantity || 1
  };
}

// Transforme la liste "lines" du panier en items GA4
function versItems(lines) {
  return lines.map(function (l) {
    return {
      item_id: l.sku,
      item_name: l.name,
      item_brand: l.brand,
      item_category: l.category,
      item_variant: l.size,
      price: l.price,
      quantity: l.quantity
    };
  });
}

// Envoie un événement e-commerce proprement
function envoyer(nomEvenement, ecommerce) {
  dataLayer.push({ ecommerce: null });   // 1) on VIDE l'ancien objet
  dataLayer.push({                       // 2) on pousse le nouveau
    event: nomEvenement,
    ecommerce: ecommerce
  });
}

// ---------------------------------------------------------------------
// 2. Vue d'un produit (3.2)
// ---------------------------------------------------------------------
shopHooks.viewItem = function (data) {
  console.log(data);
  envoyer("view_item", {
    currency: "EUR",
    value: data.product.price,
    items: [versItem(data.product)]
  });
};
// ---------------------------------------------------------------------
// 3. Ajout au panier (3.3)
// ---------------------------------------------------------------------
shopHooks.addToCart = function (data) {
  console.log(data);
  envoyer("add_to_cart", {
    currency: data.currency,
    value: data.value,
    items: [{
      item_id: data.product.sku,
      item_name: data.product.name,
      item_brand: data.product.brand,
      item_category: data.product.category,
      item_variant: data.size,        // la taille
      price: data.unitPrice,          // prix flocage compris
      quantity: data.quantity
    }]
  });
};

// ---------------------------------------------------------------------
// 4. Tunnel de commande (3.4) begin_checkout, add_shipping_info, add_payment_info
// ---------------------------------------------------------------------

function paiementBase(data) {
  var e = {
    currency: data.totals.currency,
    value: data.totals.total,
    items: versItems(data.lines)
  };
  if (data.totals.coupon) {
    e.coupon = data.totals.coupon;
  }
  return e;
}

shopHooks.beginCheckout = function (data) {
  console.log(data);
  envoyer("begin_checkout", paiementBase(data));
};

shopHooks.addShippingInfo = function (data) {
  console.log(data);
  var e = paiementBase(data);
  e.shipping_tier = data.shippingTier;
  envoyer("add_shipping_info", e);
};

shopHooks.addPaymentInfo = function (data) {
  console.log(data);
  var e = paiementBase(data);
  e.payment_type = data.paymentType;
  envoyer("add_payment_info", e);
};

// ---------------------------------------------------------------------
// 5. Achat confirmé (3.5) + Anti-doublon
// ---------------------------------------------------------------------
shopHooks.purchase = function (data) {
  console.log(data);

  // Anti-doublon : on n'envoie que la PREMIÈRE fois
  if (!data.firstView) {
    return;
  }

  var o = data.order;
  var e = {
    transaction_id: o.transaction_id,
    value: o.total,
    tax: o.tax,
    shipping: o.shipping,
    currency: o.currency,
    items: versItems(o.lines)
  };
  if (o.coupon) {
    e.coupon = o.coupon;
  }
  envoyer("purchase", e);
};
// ---------------------------------------------------------------------
// 6. Retrait du panier (Bonus)
// ---------------------------------------------------------------------
shopHooks.removeFromCart = function (data) {
  console.log(data);
  var l = data.line;
  envoyer("remove_from_cart", {
    currency: data.currency,
    value: data.value,
    items: [{
      item_id: l.sku,
      item_name: l.name,
      item_brand: l.brand,
      item_category: l.category,
      item_variant: l.size,
      price: l.price,
      quantity: data.quantity   // la quantité RÉELLEMENT retirée
    }]
  });
};

// ---------------------------------------------------------------------
// Crochets complémentaires (si demandés)
// ---------------------------------------------------------------------
shopHooks.couponApplied = function (data) {
  console.log("couponApplied", data);
  dataLayer.push({
    event: "coupon_applied",
    coupon_code: data.coupon,
    coupon_valid: data.valid ? "oui" : "non"
  });
};

shopHooks.addToWishlist = function (data) {
  console.log("addToWishlist", data);
  var item = versItem(data.product);
  if (data.size) item.item_variant = data.size;

  envoyer("add_to_wishlist", {
    currency: "EUR",
    value: Number(data.product.price),
    items: [item]
  });
};

shopHooks.sizeGuideOpen = function (data) {
  console.log("sizeGuideOpen", data);
  dataLayer.push({
    event: "size_guide_open",
    product_id: data.product.sku,
    product_name: data.product.name
  });
};
