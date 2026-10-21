import SocMediaIcons from "../Misc/SocMediaIcons";
import FooterSubscribe from "./FooterSubscribe";
import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <>
      
      <footer className="footer-container">
      <FooterSubscribe />
        <div className="container">
          <div className="flex-footer">
            <div className="description-container">
              <h1 className="title">
                <a href="#">SHOP.CO</a>
              </h1>
              <p className="text--gray">
                We have clothes that suits your style and which you’re proud to
                wear. From women to men.
              </p>
              <SocMediaIcons />
            </div>
            <div className="footer-links">
              <div className="links-container">
                <h3 className="title--sm title--spaced">Company</h3>
                <ul className="links-list text--gray">
                  <li>
                    <Link to="/underconstruction">About</Link>
                  </li>
                  <li>
                    <Link to="/underconstruction">Features</Link>
                  </li>
                  <li>
                    <Link to="/underconstruction">Works</Link>
                  </li>
                  <li>
                    <Link to="/underconstruction">Career</Link>
                  </li>
                </ul>
              </div>
              <div className="links-container">
                <h3 className="title--sm title--spaced">Help</h3>
                <ul className="links-list text--gray">
                  <li>
                    <Link to="/underconstruction">Customer Support</Link>
                  </li>
                  <li>
                    <Link to="/underconstruction">Delivery Details</Link>
                  </li>
                  <li>
                    <Link to="/underconstruction">Terms & Conditions</Link>
                  </li>
                  <li>
                    <Link to="/underconstruction">Privacy Policy</Link>
                  </li>
                </ul>
              </div>
              <div className="links-container">
                <h3 className="title--sm title--spaced">FAQ</h3>
                <ul className="links-list text--gray">
                  <li>
                    <Link to="/underconstruction">Account</Link>
                  </li>
                  <li>
                    <Link to="/underconstruction">Manage Deliveries</Link>
                  </li>
                  <li>
                    <Link to="/underconstruction">Orders</Link>
                  </li>
                  <li>
                    <Link to="/underconstruction">Payments</Link>
                  </li>
                </ul>
              </div>
              <div className="links-container">
                <h3 className="title--sm title--spaced">Resources</h3>
                <ul className="links-list text--gray">
                  <li>
                    <Link to="/underconstruction">Free eBooks</Link>
                  </li>
                  <li>
                    <Link to="/underconstruction">Development tutorial</Link>
                  </li>
                  <li>
                    <Link to="/underconstruction">How to - Blog</Link>
                  </li>
                  <li>
                    <Link to="/underconstruction">Youtube Playlist</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
