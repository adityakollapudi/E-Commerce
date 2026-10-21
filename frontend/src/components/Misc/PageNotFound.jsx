import { Link } from "react-router-dom";
const PageNotFound = () => {
  return (
    <main className="container">
      <h1 className="title">404 Page not found</h1>
      <Link to="/" className="title">Go back to Home</Link>
    </main>
  );
};

export default PageNotFound;
