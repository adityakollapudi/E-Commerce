import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CategoryProduct from "./CategoryProduct";
import { getNewArrivals, getBestSellers, fetchProductsSafe } from "../../../data/products";

const HomeCategory = ({ title, category, subtitle = "Curated with intention, crafted for everyday longevity" }) => {
  const [productList, setProductList] = useState(() => {
    if (title.toLowerCase().includes("new")) return getNewArrivals(4);
    if (title.toLowerCase().includes("best")) return getBestSellers(4);
    return getNewArrivals(4);
  });

  useEffect(() => {
    let isMounted = true;
    fetchProductsSafe(category).then((data) => {
      if (isMounted && data && data.length > 0) {
        setProductList(data.slice(0, 4));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [category]);

  return (
    <div className="container home-category">
      <div className="home-category-header">
        <h2 className="category-heading title">{title}</h2>
        {subtitle && <p className="category-subheading">{subtitle}</p>}
      </div>
      <div className="grid-category-squares">
        {productList.map((product) => {
          return <CategoryProduct key={product.id} {...product} />;
        })}
      </div>
      <Link to="/products" className="btn-luxury btn-outline btn-intro">
        View All Products →
      </Link>
    </div>
  );
};

export default HomeCategory;
