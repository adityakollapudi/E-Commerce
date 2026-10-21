import { useEffect, useState } from "react";
import { faker } from "@faker-js/faker";
import {
  usePrevNextButtons,
  PrevButton,
  NextButton,
} from "../../Carousel/EmblaCarouselArrowButtons";
import ReviewCard from "./ReviewCard";
import useEmblaCarousel from "embla-carousel-react";
const ReviewsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [fakeReviews, setFakeReviews] = useState([]);

  useEffect(() => {
    setFakeReviews(
      Object.keys([...Array(10)]).map((el) => {
        return {
          firstName: faker.person.firstName(),
          lastNameLetter: faker.person.lastName()[0],
          text: faker.lorem.words(10),
        };
      })
    );
  }, []);

  return (
    <section className="container reviews-container">
      <div className="heading-carousel-container">
        <h2 className="heading-carousel title">Our Happy Customers</h2>
        <div className="slider-buttons">
          <PrevButton
            aria-label="Previous review"
            onClick={usePrevNextButtons(emblaApi).onPrevButtonClick}
          />
          <NextButton
            aria-label="Next review"
            onClick={usePrevNextButtons(emblaApi).onNextButtonClick}
          />
        </div>
      </div>
      <div ref={emblaRef} className="reviews-carousel-container">
        <div className="embla__container">
          {fakeReviews.map((review, id) => (
            <div className="review-wrapper" key={id}>
              <ReviewCard
                className="embla__slide"
                firstName={review.firstName}
                lastNameLetter={review.lastNameLetter}
                text={review.text}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsCarousel;
