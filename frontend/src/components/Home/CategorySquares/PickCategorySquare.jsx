import CategorySquare from "./CategorySquare";

const PickCategorySquare = () => {
  return (
    <div className="container">
      <div className="category-squares-container">
        <h2 className="category-heading title">BROWSE BY DRESS STYLE</h2>
        <div className="grid-category-squares">
          <CategorySquare title="Casual" styleName="casual" imgSrc="/casual.jpg" />
          <CategorySquare title="Formal" styleName="formal" imgSrc="/formal.jpg" />
          <CategorySquare title="Party" styleName="party" imgSrc="/party.jpg" />
          <CategorySquare title="Gym" styleName="gym" imgSrc="/gym.jpg" />
        </div>
      </div>
    </div>
  );
};

export default PickCategorySquare;
