import { Link } from "react-router-dom";

const CategorySquare = ({ title, styleName, imgSrc }) => {
  return (
    <Link to={`/products?style=${encodeURIComponent(styleName)}`} className="bg-img">
      <img
        src={imgSrc}
        alt={title}
        width="300"
        height="240"
        className="category-square-img"
      />
      <h3 className="title--sm">{title}</h3>
    </Link>
  );
};

export default CategorySquare;
