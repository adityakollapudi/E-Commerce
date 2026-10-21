import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Path from "../Path";
import Gallery from "./Gallery";
import ProductDescription from "./ProductDescription";
import ProductInfoTabs from "./ProductInfoTabs";
import HomeCategory from "../../Home/HomeCategory/HomeCategory";
import { getProductById } from "../../../data/products";

const Product = ({ addToCart }) => {
  const [productDetails, setProductDetails] = useState({});
  const [sizeWarning, setSizeWarning] = useState(false);
  const params = useParams();
  const navigate = useNavigate();

  const handleSizeWarning = (bool) => {
    setSizeWarning(bool);
  };

  useEffect(() => {
    // 1. Check Backend API first (including newly added admin products)
    fetch(`/api/products/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found in API");
        return res.json();
      })
      .then((data) => {
        if (data && data.success && data.product) {
          const p = data.product;
          setProductDetails({
            ...p,
            price: Number(p.price).toFixed(2),
            images:
              p.images && p.images.length > 0
                ? p.images
                : p.img
                ? [p.img, p.img, p.img]
                : [],
          });
          return;
        }
        throw new Error("Invalid API product");
      })
      .catch(() => {
        // 2. Fallback to local curated products
        const localProduct = getProductById(params.id);
        if (localProduct) {
          setProductDetails({
            ...localProduct,
            price: Number(localProduct.price).toFixed(2),
          });
          return;
        }

        // 3. Fallback to remote mock API
        fetch(`https://fakestoreapi.com/products/${params.id}`)
          .then((response) => {
            if (!response.ok) throw new Error("Product not found");
            return response.json();
          })
          .then((data) => {
            setProductDetails({
              ...data,
              price: Number(data.price).toFixed(2),
              originalPrice: (data.price * 1.25).toFixed(2),
              discountPercent: 20,
              images: [
                data.image,
                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80",
              ],
            });
          })
          .catch((error) => {
            console.error("Error fetching product details:", error);
            navigate("/products");
          });
      });
  }, [params.id, navigate]);

  const galleryImages =
    productDetails.images && productDetails.images.length > 0
      ? productDetails.images
      : productDetails.image
      ? [productDetails.image, productDetails.image, productDetails.image]
      : [];

  return (
    <>
      <Path
        path={[
          {
            route: params.category || "Shop",
            link: `/products/${params.category || ""}`,
          },
          {
            route: productDetails.title || "Product Details",
            link: "#",
          },
        ]}
      />
      <main id="main-content" className="product-page container">
        <div className="product-container">
          {galleryImages.length > 0 && (
            <Gallery
              mainImage={galleryImages[0]}
              images={galleryImages}
            />
          )}
          <ProductDescription
            details={productDetails}
            addToCart={addToCart}
            sizeWarning={sizeWarning}
            handleSizeWarning={handleSizeWarning}
          />
        </div>
        <ProductInfoTabs details={productDetails} />
        <HomeCategory
          title="You might also like"
          category={params.category || "men's clothing"}
        />
      </main>
    </>
  );
};

export default Product;
