const AUTH_RETURN_KEY = "palette_match_auth_return";

export function startLogin(returnPath = "/dashboard") {
  sessionStorage.setItem(AUTH_RETURN_KEY, returnPath);
  const redirectUrl = `${window.location.origin}${returnPath}`;
  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
}

export function consumeAuthReturn() {
  const returnPath = getAuthReturn();
  sessionStorage.removeItem(AUTH_RETURN_KEY);
  return returnPath;
}

export function getAuthReturn() {
  const returnPath = sessionStorage.getItem(AUTH_RETURN_KEY) || "/dashboard";
  return returnPath.startsWith("/") ? returnPath : "/dashboard";
}
