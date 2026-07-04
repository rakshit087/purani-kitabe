# Provider Research — Second-Hand Book Sources (India)

Research date: 2026-07-04. All endpoints below were live-tested with query "harry potter" (or niche-appropriate query). Scope: **preloved/used books only** — mixed stores include the exact filter needed.

---

## Part 1 — Existing provider audit

App wires 3 providers into `Promise.all` in `src/actions/search.ts`. Contract: `search<Provider>(query) => Book[]` where `Book = {title, author, price, productUrl, bookCover, source, isbn?}`.

| Provider | File | Status | Detail |
|---|---|---|---|
| Second Hand Books India | `_secondHandBooksIndia.ts` | ✅ WORKING | `GET https://www.secondhandbooksindia.com/search?query=<q>` — all selectors (`.col-sm-2.pro_homeleft`, `img.lazy`, `font.style1`) still match; 16/16 results parsed |
| MyPustak | `_mypustak.ts` | ❌ BROKEN | Typesense call succeeds (200, 50 hits) but schema drifted: `productUrl` field removed, replaced by `slug` + `bookId`. Guard drops every hit → 0 results. Fix: build URL from slug/bookId (see MyPustak entry below) |
| Lock The Box | `_lockthebox.ts` | ❌ DEAD STORE | Store permanently closed 30 Nov 2025; inventory moved to BookChor.com. Legacy `query.php` still serves stale cards but buttons say "Shortlist Book" (parser expects "ADD TO CART" → 0 results). Remove provider |
| 99Cart | `_99cart.ts` | ☠️ dead code | Never imported. Old `/api/products` endpoint 404s. Replace with Shopify suggest.json (below) |
| Bookchor | `_bookchor.ts` | ☠️ dead stub | Never imported, never sends query, returns nothing. Replace with scrape (below) |

**Net today: 1 of 3 wired providers returns books.**

---

## Part 2 — New provider candidates

### Tier A — Clean JSON APIs (lowest effort, most stable)

| # | Provider | Inventory | Endpoint | Notes |
|---|---|---|---|---|
| 1 | **Worthing** worthing.in | Used-only (books + huge comics catalog) | `GET https://www.worthing.in/search/suggest.json?q=<q>&resources%5Btype%5D=product&resources%5Blimit%5D=10` | Shopify. `title`, `price`, `available`, `url`, `image`, vendor=author. ISBN embedded in handle. No anti-bot. Skip bundle collections ("10 Books for ₹499") by title |
| 2 | **Kitabay** kitabay.com (no www — NXDOMAIN!) | Used-only (~24.6k products) | `GET https://kitabay.com/search/suggest.json?q=<q>&resources%5Btype%5D=product&resources%5Blimit%5D=10` | Shopify. Filter `product_type == "Book"` (also sells merch). Tags include "Gently Used" |
| 3 | **99bookscart** 99bookscart.com | Used-only (filter `vendor == "99bookscart"` to drop affiliate items) | `GET https://99bookscart.com/search/suggest.json?q=<q>&resources%5Btype%5D=product&resources%5Blimit%5D=10` | Shopify. `body` field contains ISBN + author. Brackets MUST be URL-encoded or empty results |
| 4 | **MyPustak (fix)** mypustak.com | Mixed → `filter_by=bookCondition:!=BrandNew` (or `:=[VeryGood,AlmostNew,AverageButInReadableCondition]`) | `GET https://ew5h2tr67livkp41p-1.a1.typesense.net/collections/books_collection/documents/search?q=<q>&query_by=title&per_page=20` header `X-TYPESENSE-API-KEY: ynYXfz3KuyLdSvLrMitLZWtsOImkATlb` | Typesense Cloud, search-only key from their JS bundle (rotation risk). Fields: `title,author,bookId,bookThumb,bookCondition,slug`. Build productUrl from slug/bookId. 651k docs, 166k+ used |
| 5 | **Pustakkosh** pustakkosh.com | Mixed → category slug `used-or-second-hand-books` (resolve id via `/wp-json/wc/store/v1/products/categories`) | `GET https://pustakkosh.com/wp-json/wc/store/v1/products?search=<q>&category=<id>&per_page=20` | WooCommerce Store API. `sku` = ISBN. Prices minor-unit 0 (rupees) |
| 6 | **Bookmafiya** bookmafiya.com | Mixed; condition in `short_description` text ("Condition- old/Good") — parse it | `GET https://bookmafiya.com/wp-json/wc/store/v1/products?search=<q>&per_page=20` | Woo Store API. Prices in paise (`currency_minor_unit: 2`) |
| 7 | **AnjaniBooks** anjanibooks.com | Mixed → used category ids `208,118,121,215,216,120` | `GET https://anjanibooks.com/wp-json/wc/store/v1/products?search=<q>&category=208,118,121,215,216,120&per_page=10` | Woo Store API. Academic-heavy. Many used items out of stock — check `is_in_stock` |
| 8 | **WishAllBook** wishallbook.com | Mixed → second-hand category ids `131,1627,1633,2562,2555,2568,3445` | `GET https://wishallbook.com/wp-json/wc/store/v1/products?search=<q>&category=131,...&per_page=10` | Woo Store API. Academic/medical niche (MBBS, NEET-PG, nursing) |
| 9 | **UsedBookStore.in** usedbookstore.in | Used-only | `GET https://usedbookstore.in/wp-json/wc/store/v1/products?search=<q>&per_page=10` | Woo Store API. **Cloudflare 403 unless full browser headers**: real Chrome UA + `Accept: application/json` + `Referer: https://usedbookstore.in/` |
| 10 | **OldBookShop** oldbookshop.in | Used-primarily (+ some new stationery) | `GET https://api.smartbiz.in/stores/35345/catalog/items?searchString=<q>&pageSize=100&offset=0` | Amazon SmartBiz API, CORS `*`, no key. Fields: `name, mrp, sellingPrice, inStock, imageUrl, sku` |
| 11 | **UsedBooksWorld** usedbooksworld.in | Used-only (ex-library etc., condition in description) | `POST https://api.dotshowroom.in/api/dotk/catalog/searchItems` JSON body `{"store_id":9236355,"search_text":"<q>","page":1}` | Dotpe/DigitalDukaan. `name, price, discounted_price, available, image_url` + pagination. Don't call api.dotpe.in (301 drops POST body) |
| 12 | **Blossom Book House** blossombookhouse.in (Bangalore, ships pan-India) | Mixed → keep only variants whose `name` starts with "Used" ("Used Good", "Used Like New", "Used Very Good") | `GET https://blossombookhouse.in/api/product?q=<q>&limit=20&offset=0` | Zopping platform. price = `mrp − discount`, `stock`, ISBN in `barcodes`. Product URL `/product/<slug>` |
| 13 | **eLocalshops** elocalshops.com | Mixed → preloved collections: `preloved-books-1` (1362), `used-books` (298), `preloved-kids-books`, `old-hardcover` | Search: `GET https://www.elocalshops.com/search/suggest.json?q=<q>...` then intersect with preloved collections; or dump `GET /collections/preloved-books-1/products.json?limit=250&page=N` | Shopify. Site-wide search mixes new — intersection step required for preloved-only |

### Tier B — HTML scrape (cheerio, like existing providers)

| # | Provider | Inventory | Request | Selectors / notes |
|---|---|---|---|---|
| 14 | **BookChor** bookchor.com | Mixed new+used; used store at `/store/37/used-books`; per-product condition options | `GET https://www.bookchor.com/search/?query=<q>` | `.product-item-info` → `h3 a` (title, href has ISBN), `p` author, `.product-price > span` price. Cloudflare passive, browser UA advised. Successor of Lock The Box inventory |
| 15 | **UsedBooksFactory** usedbooksfactory.com | Used-only | `GET https://www.usedbooksfactory.com/buy-second-hand-old-books/search?titlepublisher=<q>` | Django. Param name is `titlepublisher`. `.aa-product-title > a`, `.aa-product-price`, `.aa-product-img img` |
| 16 | **BooksByKilo** booksbykilo.in | Individual used titles + "New Books" collection → exclude `data-collection="New Books"` | `POST https://www.booksbykilo.in/umbraco/surface/ProductFilters/PagedSearch` body `PageIndex=0&search=<q>` | HTML fragment but all data in attributes: `div.card-view` with `data-name, data-author, data-isbn, data-saleprice, data-mrp, data-qty, data-url, data-collection`. No anti-bot, no CSRF |
| 17 | **Usedbookr** usedbookr.com | Used-only | `GET https://www.usedbookr.com/product-search/<base64(q)>` e.g. `/product-search/aGFycnkgcG90dGVy` | Laravel. `.product-card`, `.card-title a`, `.autor-name a`, `.card-text b` price, `.less_price` MRP. ISBN in product URL |
| 18 | **BestOfUsedBooks** bestofusedbooks.com | Used-only | `GET https://bestofusedbooks.com/search?q=<q>&type=product` (suggest.json disabled) | Shopify but predictive search off. Scrape `/products/<handle>` links + JSON-LD `"@type":"Product"` blocks (price/availability). Alt: full dump `/products.json?limit=250&page=N` |
| 19 | **Bookaao** bookaao.com | Mixed (2nd-hand + new + rent) → keep cards with `.product-type-badge.2nd_hand` | `GET https://bookaao.com/search_results.php?query=<q>` | `.product-card`, `.product-title`, `.price-display`, `a.product-link`. Ships from listed city (`.shipping-info`) |
| 20 | **Clankart** clankart.com | P2P used-only marketplace | `GET https://www.clankart.com/search?q=<q>` | `a[href^="/books/"]`, `h3.item-heading`, `span.price`, `img.lazy[data-src]`. Easy scrape. P2P caveat: individual sellers, variable fulfillment |
| 21 | **StarterGroup** startergroup.in | Used textbooks (school/medical/engg) | `GET https://www.startergroup.in/index.php?route=product/search&search=<q>` | OpenCart. `.price-new`. MUST scope to main results container — page also renders ~12 fixed "featured products" widgets. `&description=true` widens match |
| 22 | **BuyUsedBooks.in** buyusedbooks.in | Used-only, sparse/stale stock | `GET https://www.buyusedbooks.in/index.php?route=product/search&search=<q>` | OpenCart. `h4.name a`, `.price`, `outofstock` class on `.product-thumb`. Filter out-of-stock |
| 23 | **Bookmandee** bookmandee.com | P2P used listings | `GET https://bookmandee.com/?s=<q>&post_type=rtcl_listing` | WP + RTCL plugin. `.rtcl-price-amount` + title links. (rtcl/v1 API is 403; wp/v2 JSON has no price) |
| 24 | **BookFlow** bookflow.in | P2P used listings, condition taxonomy | `GET https://bookflow.in/wp-json/wp/v2/ad_post?search=<q>&per_page=20` → JSON (title, link, `class_list` condition) then scrape listing page `.recent-ads-list-price h3` for price | Two-step (price not in API). Medium effort. Frontend `?s=` search 500s |

### Dead / excluded

| Site | Why |
|---|---|
| Bookish Santa (bookishsanta.com) | HTTP 430 StoreHippo "domain not added" for ~2 years. Dead |
| BlueWhaleBooks (bluewhalebooks.in) | NXDOMAIN. Gone. (bluewhalebooks.com = unrelated US antiquarian) |
| GetMyBooks (getmybooks.com) | Cloudflare 522, origin down |
| Lock The Box (lockthebox.in) | Store closed 30 Nov 2025 → BookChor. Remove existing provider |
| Amazon.in | No public search API; used-book programme wound down in India; aggressive CAPTCHA |
| Flipkart | New books only; affiliate API deprecated; Akamai bot protection |

---

## Part 3 — Recommendations

1. **Fix MyPustak** first — API already works, just map `slug`/`bookId` → productUrl and add `filter_by=bookCondition:!=BrandNew` so results are preloved-only.
2. **Remove Lock The Box**, delete `_99cart.ts` / `_bookchor.ts` dead code.
3. **Add Tier A first** (13 JSON providers) — no HTML parsing to break. Shopify ones (Worthing, Kitabay, 99bookscart) are near-identical code → one shared Shopify adapter.
4. Same for WooCommerce Store API (Pustakkosh, Bookmafiya, AnjaniBooks, WishAllBook, UsedBookStore.in) → one shared Woo adapter with per-site category filter + minor-unit handling.
5. **Preloved-only guarantee**: mixed stores must use the documented filters (condition field / category ids / variant-name prefix / collection intersection / badge class). Sites with no reliable used filter for search results (eLocalshops site-wide, Bookmafiya text-parsing) should be lower priority or filtered strictly.
6. P2P marketplaces (Clankart, Bookmandee, BookFlow) list one-off seller items — good coverage of rare titles, but prices/availability less reliable; consider tagging them differently in UI.
7. Add per-provider timeout (existing `Promise.all` has none) — with 20+ providers one slow scrape holds the whole search; also consider `Promise.allSettled` semantics + per-provider cache.
