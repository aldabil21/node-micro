export const createCookie = (name, value, expiration) => {
  let expires = "";
  if (expiration) {
    expires = "; expires=" + expiration;
  }
  document.cookie = name + "=" + value + expires + "; path=/";
};

export const readCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};
export const eraseCookie = (name) => {
  createCookie(name, "", "Thu, 01 Jan 1970 00:00:00 GMT");
};

export const getCookieToken = () => {
  const cookie = readCookie("auth");
  const auth = JSON.parse(cookie);
  if (auth) {
    return auth;
  }
  return { token: null, expired: null, token_origine: null };
};
