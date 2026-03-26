export const state = {
    token: localStorage.getItem("token") || "",
    isLoading: false,
    isAuthenticating: false,
    isRegistration: false,
    selectedTab: "All",
    todos: [],
  };
  
  export function setToken(token) {
    state.token = token || "";
    if (state.token) localStorage.setItem("token", state.token);
    else localStorage.removeItem("token");
  }