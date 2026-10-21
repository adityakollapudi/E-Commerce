import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import CategoryProduct from "../Home/HomeCategory/CategoryProduct";
import FiltersSidebar from "./FiltersSidebar";
import PaginationButtons from "./PaginationButtons";
import Path from "./Path";
import { capitalize } from "../Helpers/Helpers";
import { fetchProductsSafe, getAllProducts, searchProducts } from "../../data/products";

const PRODUCTS_NUMBER = 9;

const Products = () => {
  const [products, setProducts] = useState(() => getAllProducts());
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState({ min: 0, max: 2000 });
  const [appliedPrice, setAppliedPrice] = useState({ min: 0, max: 2000 });
  const [size, setSize] = useState([]);
  const [appliedSize, setAppliedSize] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);

  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const styleQuery = searchParams.get("style") || "";

  // Synchronize style query from URL
  useEffect(() => {
    if (styleQuery) {
      setSelectedStyle(styleQuery);
    }
  }, [styleQuery]);

  // Load products when category or search changes
  useEffect(() => {
    setLoading(true);
    if (searchQuery) {
      setProducts(searchProducts(searchQuery));
      setLoading(false);
    } else {
      const targetCategory = params.category || styleQuery || "all";
      fetchProductsSafe(targetCategory)
        .then((data) => {
          setProducts(data || getAllProducts());
        })
        .catch(() => {
          setProducts(getAllProducts());
        })
        .finally(() => {
          setLoading(false);
        });
    }
    setActivePage(1);
  }, [params.category, searchQuery, styleQuery]);

  // Prevent scroll when filter drawer is open on mobile
  useEffect(() => {
    if (isFilterOpen) {
      document.body.classList.add("body-noscroll");
    } else {
      document.body.classList.remove("body-noscroll");
    }
    return () => {
      document.body.classList.remove("body-noscroll");
    };
  }, [isFilterOpen]);

  const handlePriceEnter = (min, max) => {
    const numMin = Number(min) || 0;
    const numMax = Number(max) || 500;
    setPrice({ min: numMin, max: numMax });
  };

  const handleSizeClick = (newSize) => {
    if (size.includes(newSize)) {
      setSize(size.filter((s) => s !== newSize));
    } else {
      setSize([...size, newSize]);
    }
  };

  const handleFilterClick = () => {
    setAppliedPrice(price);
    setAppliedSize(size);
    setActivePage(1);
  };

  const clearAllFilters = () => {
    setPrice({ min: 0, max: 500 });
    setAppliedPrice({ min: 0, max: 500 });
    setSize([]);
    setAppliedSize([]);
    setSelectedStyle("");
    if (searchQuery || styleQuery) {
      setSearchParams({});
    }
    setActivePage(1);
  };

  // Filter predicate
  const productsFilterFn = (product) => {
    const numPrice = Number(product.price);
    const matchesPrice = numPrice >= appliedPrice.min && numPrice <= appliedPrice.max;
    const matchesSize =
      appliedSize.length === 0 ||
      (product.sizes && product.sizes.some((s) => appliedSize.includes(s))) ||
      appliedSize.includes(product.size);
    const matchesStyle =
      !selectedStyle ||
      (product.style && product.style.toLowerCase() === selectedStyle.toLowerCase());

    return matchesPrice && matchesSize && matchesStyle;
  };

  // Filter and sort products (proper top-level useMemo hook)
  const filteredProducts = useMemo(() => {
    let result = products.filter(productsFilterFn);

    if (sortOption === "price-low") {
      result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOption === "price-high") {
      result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortOption === "rating") {
      result = [...result].sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
    } else if (sortOption === "newest") {
      result = [...result].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return result;
  }, [products, appliedPrice, appliedSize, selectedStyle, sortOption]);

  // Paginated slice
  const paginatedProducts = useMemo(() => {
    const startIndex = (activePage - 1) * PRODUCTS_NUMBER;
    const endIndex = startIndex + PRODUCTS_NUMBER;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, activePage]);

  // Title generation
  const pageTitle = useMemo(() => {
    if (searchQuery) return `Search: "${searchQuery}"`;
    if (selectedStyle) return `${capitalize(selectedStyle)} Collection`;
    if (params.category) return capitalize(params.category);
    return "All Products";
  }, [searchQuery, selectedStyle, params.category]);

  return (
    <main id="main-content" className="products-container">
      <Path
        path={[
          {
            route: params.category || selectedStyle || (searchQuery ? "Search" : "Products"),
            link: "/products",
          },
        ]}
      />
      <div className="container products-flex">
        <FiltersSidebar
          handleSizeClick={handleSizeClick}
          handleFilterClick={handleFilterClick}
          isSizeActive={(s) => (size.includes(s) ? "size-active" : "")}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          handlePriceEnter={handlePriceEnter}
          price={price}
          setPrice={setPrice}
          selectedStyle={selectedStyle}
          setSelectedStyle={(style) => {
            setSelectedStyle(style);
            setActivePage(1);
          }}
          clearAllFilters={clearAllFilters}
        />
        <div className="products-column">
          <div className="products-heading-flex">
            <div>
              <h1 className="title">{pageTitle}</h1>
              {searchQuery && (
                <button
                  onClick={() => setSearchParams({})}
                  className="btn-clear-search"
                >
                  Clear search ✕
                </button>
              )}
            </div>
            <div className="products-sort">
              <button
                onClick={() => setIsFilterOpen((prevState) => !prevState)}
                aria-label="open filters"
                className="btn-search btn-filters-mobile"
              >
                <img
                  src="/filterIconEnabled.png"
                  width="32"
                  height="32"
                  alt="filter"
                />
              </button>
              <p className="text--sm text--gray products-number">
                Showing{" "}
                {filteredProducts.length === 0
                  ? 0
                  : (activePage - 1) * PRODUCTS_NUMBER + 1}
                -
                {Math.min(activePage * PRODUCTS_NUMBER, filteredProducts.length)}{" "}
                of {filteredProducts.length} products
              </p>
              <div
                className="dropdown-sort-container"
                onBlur={(e) =>
                  !e.currentTarget.contains(e.relatedTarget) &&
                  setIsSortOpen(false)
                }
              >
                <button
                  onClick={() => setIsSortOpen((prev) => !prev)}
                  className="btn-dropdown-sort"
                >
                  Sort By:{" "}
                  {sortOption === "price-low"
                    ? "Lowest Price"
                    : sortOption === "price-high"
                    ? "Highest Price"
                    : sortOption === "rating"
                    ? "Top Rated"
                    : sortOption === "newest"
                    ? "Newest"
                    : "Featured"}
                  <i className="fa-solid fa-chevron-down" style={{ marginLeft: "6px" }}></i>
                </button>
                <div className={`dropdown-sort ${isSortOpen ? "open" : ""}`}>
                  <ul className="dropdown-sort-list">
                    <li>
                      <button
                        className="btn-dropdown-sort"
                        onClick={() => {
                          setSortOption("default");
                          setIsSortOpen(false);
                        }}
                      >
                        Featured
                      </button>
                    </li>
                    <li>
                      <button
                        className="btn-dropdown-sort"
                        onClick={() => {
                          setSortOption("newest");
                          setIsSortOpen(false);
                        }}
                      >
                        Newest Arrivals
                      </button>
                    </li>
                    <li>
                      <button
                        className="btn-dropdown-sort"
                        onClick={() => {
                          setSortOption("price-low");
                          setIsSortOpen(false);
                        }}
                      >
                        Lowest Price
                      </button>
                    </li>
                    <li>
                      <button
                        className="btn-dropdown-sort"
                        onClick={() => {
                          setSortOption("price-high");
                          setIsSortOpen(false);
                        }}
                      >
                        Highest Price
                      </button>
                    </li>
                    <li>
                      <button
                        className="btn-dropdown-sort"
                        onClick={() => {
                          setSortOption("rating");
                          setIsSortOpen(false);
                        }}
                      >
                        Top Rated
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="products-loading">
              <p>Loading curated products...</p>
            </div>
          ) : paginatedProducts.length > 0 ? (
            <div className="products-list">
              {paginatedProducts.map((product) => (
                <CategoryProduct key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="products-empty-state">
              <i className="fa-solid fa-shirt" style={{ fontSize: "3rem", color: "#d1d5db", marginBottom: "1rem" }}></i>
              <h2>No clothing items matched your filter</h2>
              <p className="text--gray">Try clearing some filters or searching for something else.</p>
              <button
                onClick={clearAllFilters}
                className="btn-pill btn-black"
                style={{ marginTop: "1rem" }}
              >
                Reset All Filters
              </button>
            </div>
          )}

          {filteredProducts.length > PRODUCTS_NUMBER && (
            <PaginationButtons
              activePage={activePage}
              setActivePage={setActivePage}
              products={filteredProducts}
              PRODUCTS_NUMBER={PRODUCTS_NUMBER}
              productsFilterFn={() => true}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default Products;
