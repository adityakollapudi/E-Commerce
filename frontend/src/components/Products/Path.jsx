import { Link } from "react-router-dom";
import { capitalize } from "../Helpers/Helpers";
const Path = ({ path }) => {
  return (
    <div className="path-links container">
      <Link to="/" className="text--sm">
        Home
      </Link>
      {path.map((routeInstance) => (
        <Link key={routeInstance.route} to={routeInstance.link}>{capitalize(routeInstance.route)}</Link>
      ))}
    </div>
  );
};

export default Path;
