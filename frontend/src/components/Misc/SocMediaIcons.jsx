// TODO(owner): replace these with the Giftingwellness profile URLs; they currently open each network's home page.
const SOCIAL_LINKS = [
  { href: "https://www.facebook.com/", label: "Facebook", icon: "fa-facebook-f" },
  { href: "https://twitter.com/", label: "X (Twitter)", icon: "fa-x-twitter" },
  { href: "https://www.instagram.com/", label: "Instagram", icon: "fa-instagram" },
];

const SocMediaIcons = () => {
  return (
    <div>
      {SOCIAL_LINKS.map((s) => (
        <a
          key={s.label}
          target="_blank"
          rel="noreferrer"
          href={s.href}
          aria-label={`${s.label} (opens in a new tab)`}
          className="soc-icon-link"
        >
          <i className={`fa-brands ${s.icon} fa-lg`} aria-hidden="true"></i>
        </a>
      ))}
    </div>
  );
};

export default SocMediaIcons;
