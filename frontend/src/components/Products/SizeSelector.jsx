import ButtonSize from "../Misc/ButtonSize";

export const STANDARDIZED_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "Free Size",
];

export const normalizeSize = (size) => {
  if (!size || typeof size !== "string") return "";
  const s = size.trim().toLowerCase();
  switch (s) {
    case "xs":
    case "x-small":
    case "xsmall":
    case "extra small":
      return "XS";
    case "s":
    case "small":
      return "S";
    case "m":
    case "medium":
      return "M";
    case "l":
    case "large":
      return "L";
    case "xl":
    case "x-large":
    case "xlarge":
    case "extra large":
      return "XL";
    case "xxl":
    case "2xl":
    case "xx-large":
    case "xxlarge":
      return "XXL";
    case "free size":
    case "freesize":
    case "free":
    case "one size":
    case "onesize":
      return "Free Size";
    default:
      return size.trim();
  }
};

const SizeSelector = ({
  handleSizeClick,
  isSizeActive,
  availableSizes = STANDARDIZED_SIZES,
  disabledSizes = [],
}) => {
  const sizesToRender =
    Array.isArray(availableSizes) && availableSizes.length > 0
      ? availableSizes
      : STANDARDIZED_SIZES;

  return (
    <ul className="sizes-list">
      {sizesToRender.map((sz) => {
        const normalized = normalizeSize(sz);
        const active = isSizeActive ? isSizeActive(sz) || isSizeActive(normalized) : false;
        const isDisabled = Array.isArray(disabledSizes) && disabledSizes.includes(normalized);

        return (
          <li key={sz}>
            <ButtonSize
              className={`btn-size text--gray ${active ? "size-active" : ""} ${
                isDisabled ? "size-disabled" : ""
              }`}
              onClick={() => {
                if (!isDisabled && handleSizeClick) {
                  handleSizeClick(normalized);
                }
              }}
              aria-pressed={Boolean(active)}
              disabled={isDisabled}
              title={isDisabled ? `${sz} (Unavailable)` : sz}
            >
              {sz}
            </ButtonSize>
          </li>
        );
      })}
    </ul>
  );
};

export default SizeSelector;
