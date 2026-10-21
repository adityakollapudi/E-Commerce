const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  for (let i = 0; i < fullStars; i++) {
    stars.push(<i key={i} className="fa-solid fa-star" />);
  }
  const partialStar = rating - fullStars !== 0;

  if (partialStar) {
    stars.push(<i key="partial" className="fa-solid fa-star-half-stroke" />);
  }

  return (
    <div className="rating">
      {stars} <span className="text--xs">{rating}/5</span>
    </div>
  );
};

export default StarRating;
