type RefreshHandler = () => Promise<string>;

let accessToken: string | null = null;
let refreshHandler: RefreshHandler | null = null;
let activeRefresh: Promise<string> | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function registerRefreshHandler(handler: RefreshHandler) {
  refreshHandler = handler;

  return () => {
    if (refreshHandler === handler) {
      refreshHandler = null;
    }
  };
}

export async function requestAccessTokenRefresh() {
  if (!refreshHandler) {
    throw new Error("No session refresh handler is registered.");
  }

  if (!activeRefresh) {
    activeRefresh = refreshHandler().finally(() => {
      activeRefresh = null;
    });
  }

  return activeRefresh;
}
