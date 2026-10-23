const PaginationButtons = ({activePage, setActivePage, products, PRODUCTS_NUMBER, productsFilterFn}) => {
    return (
        <div className="pages-list-container">
            <button
              disabled={activePage === 1}
              className="change-page"
              onClick={() => setActivePage((prevPage) => prevPage - 1)}
            >
              <span>
                <i
                  className="fa-solid fa-arrow-left fa-lg arrow"
                  
                ></i>
              </span>
              Previous
            </button>
            <ol className="pages-list">
              {products && products.filter(productsFilterFn).map((product, index, array) => {
                if ((index + 1) % PRODUCTS_NUMBER === 0) {
                  return (
                    <li key={index}>
                      <button
                        className={`page-number ${
                          activePage === (index + 1) / PRODUCTS_NUMBER
                            ? "page-number-active"
                            : ""
                        }`}
                        onClick={() =>
                          setActivePage((index + 1) / PRODUCTS_NUMBER)
                        }
                      >
                        {(index + 1) / PRODUCTS_NUMBER}
                      </button>
                    </li>
                  );
                } else if (index + 1 === array.length) {
                  return (
                    <li key={index}>
                      <button
                        className={`page-number ${
                          activePage ===
                          Math.ceil((index + 1) / PRODUCTS_NUMBER)
                            ? "page-number-active"
                            : ""
                        }`}
                        onClick={() =>
                          setActivePage(
                            Math.ceil((index + 1) / PRODUCTS_NUMBER)
                          )
                        }
                      >
                        {Math.ceil(array.length / PRODUCTS_NUMBER)}
                      </button>
                    </li>
                  );
                }
                return null;
              })}
            </ol>
            <button
              disabled={
                activePage === Math.ceil(products.length / PRODUCTS_NUMBER)
              }
              className="change-page"
              onClick={() => setActivePage((prevPage) => prevPage + 1)}
            >
              Next
              <span>
                <i className="fa-solid fa-arrow-right fa-lg arrow"></i>
              </span>
            </button>
          </div>
    )
}

export default PaginationButtons;