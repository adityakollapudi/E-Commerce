import { useEffect } from "react";
import { useUser, useAuth as useClerkAuth, useClerk } from "@clerk/clerk-react";

/**
 * ClerkBridge Component
 * Safely bridges Clerk user session and actions into the unified AuthContext
 * Only mounted when VITE_CLERK_PUBLISHABLE_KEY is configured
 */
export const ClerkBridge = ({ onClerkStateChange, registerClerkActions }) => {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { getToken, signOut } = useClerkAuth();
  const clerk = useClerk();

  // Register Clerk UI triggers (Sign In, Sign Up, User Profile, Sign Out)
  useEffect(() => {
    if (typeof registerClerkActions === "function") {
      registerClerkActions({
        openSignIn: (opts = {}) => clerk.openSignIn(opts),
        openSignUp: (opts = {}) => clerk.openSignUp(opts),
        openUserProfile: (opts = {}) => clerk.openUserProfile(opts),
        signOut: () => signOut(),
        isClerkActive: true,
      });
    }
  }, [clerk, signOut, registerClerkActions]);

  // Synchronize Clerk user identity & JWT session token with AuthContext
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && clerkUser) {
      getToken()
        .then((token) => {
          const primaryEmail =
            clerkUser.primaryEmailAddress?.emailAddress ||
            clerkUser.emailAddresses?.[0]?.emailAddress ||
            "";

          const normalizedUser = {
            id: clerkUser.id,
            name:
              `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
              clerkUser.username ||
              (primaryEmail ? primaryEmail.split("@")[0] : "Customer"),
            email: primaryEmail,
            avatar: clerkUser.imageUrl || null,
            role: clerkUser.publicMetadata?.role === "admin" ? "admin" : "customer",
            isClerk: true,
          };

          onClerkStateChange({
            user: normalizedUser,
            token: token || null,
            isSignedIn: true,
          });
        })
        .catch((err) => {
          console.warn("[ClerkBridge] Could not retrieve session token:", err);
        });
    } else {
      onClerkStateChange({
        user: null,
        token: null,
        isSignedIn: false,
      });
    }
  }, [isLoaded, isSignedIn, clerkUser, getToken, onClerkStateChange]);

  return null;
};

export default ClerkBridge;
