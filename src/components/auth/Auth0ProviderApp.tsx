import { AppState, Auth0Provider } from "@auth0/auth0-react";
import { FC } from "react";
import { useNavigate } from "react-router";

const VITE_AUTH0_DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN;
const VITE_AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID;
// Detect callback URL dynamically based on current location
const VITE_AUTH0_CALLBACK_URL = `${window.location.origin}/callback`;
const VITE_AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE;

type Props = {
  children: JSX.Element;
};

export const Auth0ProviderApp: FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  const onRedirectCallback = (appState: AppState | undefined) => {
    navigate(appState?.returnTo || "/");
  };

  if (!(VITE_AUTH0_DOMAIN && VITE_AUTH0_CLIENT_ID && VITE_AUTH0_CALLBACK_URL)) {
    return null;
  }
  return (
    <Auth0Provider
      domain={VITE_AUTH0_DOMAIN}
      clientId={VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        audience: VITE_AUTH0_AUDIENCE,
        redirect_uri: VITE_AUTH0_CALLBACK_URL, // dinámico según el dominio
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};
