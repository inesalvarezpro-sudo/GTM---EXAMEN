/* =====================================================================
   MES TAGS — Fichier élève (Examen E-commerce GA4)
   ===================================================================== */
window.dataLayer = window.dataLayer || [];
window.shopHooks = window.shopHooks || {};

// ---------------------------------------------------------------------
// 1. Dictionnaire : conversion des données produit vers le format GA4
// ---------------------------------------------------------------------
function versItem(x) {
  if (!x) return {};
  return {
    item_id: x.sku || x.id,
    item_name: x.name,
    item_brand: x.brand,
    item_category: x.category,
    item_variant: x.size || x.variant || undefined, // Taille si disponible
    price: Number(x.price),
    quantity: Number(x.quantity) || 1
  };
}

// ---------------------------------------------------------------------
// 2. Vue d'un produit (3.2)
// ---------------------------------------------------------------------
shopHooks.viewItem = function (data) {
  console.log("viewItem", data);
  
  dataLayer.push({ ecommerce: null }); // Réinitialisation obligatoire
  dataLayer.push({
    event: "view_item",
    ecommerce: {
      currency: "EUR",
      value: Number(data.product.price),
      items: [versItem(data.product)]
    }
  });
};

// ---------------------------------------------------------------------
// 3. Ajout au panier (3.3)
// ---------------------------------------------------------------------
shopHooks.addToCart = function (data) {
  console.log("addToCart", data);

  var item = versItem(data.product);
  item.item_variant = data.size;      // Taille choisie (ex: "M")
  item.price = Number(data.unitPrice); // Prix avec flocage compris
  item.quantity = Number(data.quantity);

  dataLayer.push({ ecommerce: null });
  dataLayer.push({
    event: "add_to_cart",
    ecommerce: {
      currency: "EUR",
      value: Number(data.value),
      items: [item]
    }
  });
};

// ---------------------------------------------------------------------
// 4. Tunnel de commande (3.4)
// ---------------------------------------------------------------------

// Début de commande
shopHooks.beginCheckout = function (data) {
  console.log("beginCheckout", data);

  dataLayer.push({ ecommerce: null });
  dataLayer.push({
    event: "begin_checkout",
    ecommerce: {
      currency: "EUR",
      value: Number(data.totals.subtotal - (data.totals.discount || 0)),
      coupon: data.totals.coupon || undefined,
      items: data.lines.map(versItem)
    }
  });
};

// Choix du mode de livraison
shopHooks.addShippingInfo = function (data) {
  console.log("addShippingInfo", data);

  dataLayer.push({ ecommerce: null });
  dataLayer.push({
    event: "add_shipping_info",
    ecommerce: {
      currency: "EUR",
      value: Number(data.totals.subtotal - (data.totals.discount || 0)),
      coupon: data.totals.coupon || undefined,
      shipping_tier: data.shippingTier,
      items: data.lines.map(versItem)
    }
  });
};

// Choix du mode de paiement
shopHooks.addPaymentInfo = function (data) {
  console.log("addPaymentInfo", data);

  dataLayer.push({ ecommerce: null });
  dataLayer.push({
    event: "add_payment_info",
    ecommerce: {
      currency: "EUR",
      value: Number(data.totals.subtotal - (data.totals.discount || 0)),
      coupon: data.totals.coupon || undefined,
      payment_type: data.paymentType,
      items: data.lines.map(versItem)
    }
  });
};

// ---------------------------------------------------------------------
// 5. Achat confirmé (3.5) + Anti-doublon
// ---------------------------------------------------------------------
shopHooks.purchase = function (data) {
  console.log("purchase", data);

  // Sécurité anti-doublon en cas de rafraîchissement de la page
  if (!data.firstView) return;

  var o = data.order;
  dataLayer.push({ ecommerce: null });
  dataLayer.push({
    event: "purchase",
    ecommerce: {
      transaction_id: String(o.transaction_id),
      currency: o.currency || "EUR",
      value: Math.round((o.total - (o.shipping || 0)) * 100) / 100,
      tax: Number(o.tax || 0),
      shipping: Number(o.shipping || 0),
      coupon: o.coupon || undefined,
      items: o.lines.map(versItem)
    }
  });
};

// ---------------------------------------------------------------------
// 6. Retrait du panier (Bonus)
// ---------------------------------------------------------------------
shopHooks.removeFromCart = function (data) {
  console.log("removeFromCart", data);

  var item = versItem(data.line);
  item.quantity = Number(data.quantity); // Quantité réellement retirée

  dataLayer.push({ ecommerce: null });
  dataLayer.push({
    event: "remove_from_cart",
    ecommerce: {
      currency: "EUR",
      value: Number(data.value),
      items: [item]
    }
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

  dataLayer.push({ ecommerce: null });
  dataLayer.push({
    event: "add_to_wishlist",
    ecommerce: {
      currency: "EUR",
      value: Number(data.product.price),
      items: [item]
    }
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
