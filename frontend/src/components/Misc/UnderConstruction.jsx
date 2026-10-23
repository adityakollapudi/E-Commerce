import { Link } from "react-router-dom";

const UnderConstruction = () => {
    return (
        <main className="container">
      <h1 className="title">This page is under construction...</h1>
      <Link to="/" className="title">Go back to Home</Link>
    </main>
    )
}

export default UnderConstruction;