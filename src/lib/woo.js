/**
 * WooCommerce Store API data layer.
 *
 * The Store API is public (no auth) and is read at BUILD TIME so the
 * published Astro site is fully static — no runtime dependency on the
 * WordPress box. Override the base URL with WOO_API_BASE when the store
 * moves off the local Herd domain.
 */
const BASE =
  import.meta.env.WOO_API_BASE ||
  'https://thaifoodproduct.com/wp-json/wc/store/v1';

async function api(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Woo API ${res.status} for ${path}`);
  }
  return res.json();
}

// Cache across getStaticPaths / page renders within a single build.
let _categories = null;
let _productsByCat = new Map();

/** All product categories with a non-zero product count. */
export async function getCategories() {
  if (_categories) return _categories;
  const raw = await api('/products/categories?per_page=100&orderby=name');
  _categories = raw.filter((c) => c.count > 0);
  return _categories;
}

/** Top-level categories with their children nested under `.children`. */
export async function getCategoryTree() {
  const cats = await getCategories();
  const top = cats.filter((c) => c.parent === 0);
  return top.map((c) => ({
    ...c,
    children: cats.filter((child) => child.parent === c.id),
  }));
}

/** A single category by slug. */
export async function getCategoryBySlug(slug) {
  const cats = await getCategories();
  return cats.find((c) => c.slug === slug) || null;
}

/** All products in a category (by id), up to 100. */
export async function getProductsByCategory(categoryId) {
  if (_productsByCat.has(categoryId)) return _productsByCat.get(categoryId);
  const products = await api(
    `/products?category=${categoryId}&per_page=100&orderby=title&order=asc`
  );
  _productsByCat.set(categoryId, products);
  return products;
}

/**
 * Full catalog with RELIABLE category tags.
 *
 * The Store API's bulk /products listing returns an empty `categories` array
 * for many products, so we can't trust per-product category data. Instead we
 * fetch products per category (the `?category=ID` filter is reliable) and tag
 * each product with the slugs that returned it — plus the PARENT slug for any
 * sub-category item, so selecting a parent also surfaces its children.
 */
let _catalog = null;
export async function getCatalog() {
  if (_catalog) return _catalog;
  const cats = await getCategories();
  const byId = new Map();

  for (const cat of cats) {
    const parent = cat.parent ? cats.find((c) => c.id === cat.parent) : null;
    const products = await getProductsByCategory(cat.id);
    for (const p of products) {
      let entry = byId.get(p.id);
      if (!entry) {
        entry = { product: p, cats: new Set(), catNames: new Set() };
        byId.set(p.id, entry);
      }
      entry.cats.add(cat.slug);
      entry.catNames.add(cat.name);
      if (parent) {
        entry.cats.add(parent.slug);
        entry.catNames.add(parent.name);
      }
    }
  }

  _catalog = [...byId.values()]
    .map((e) => ({
      ...e.product,
      catSlugs: [...e.cats],
      catNames: [...e.catNames],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return _catalog;
}

/** Every published product in the store (paginated, 100 per request). */
let _allProducts = null;
export async function getAllProducts() {
  if (_allProducts) return _allProducts;
  const all = [];
  let page = 1;
  while (true) {
    const batch = await api(
      `/products?per_page=100&page=${page}&orderby=title&order=asc`
    );
    all.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }
  _allProducts = all;
  return all;
}

/**
 * Products flagged "Featured" in WooCommerce (the ★ on the products list).
 * Falls back to most-recent products only if nothing has been featured yet,
 * so the homepage section is never empty.
 */
export async function getFeaturedProducts(limit = 8) {
  const featured = await api(
    `/products?featured=true&per_page=${limit}&orderby=date`
  );
  if (featured.length > 0) return featured;
  return api(`/products?per_page=${limit}&orderby=date`);
}
