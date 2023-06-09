import "./App.css";
import Nav from "./Nav";
import RoutesList from "./RoutesList";
import { BrowserRouter } from "react-router-dom";
import JoblyApi from "./api";
import userContext from "./userContext.js";
import { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";

/** App
 *
 * Props: None
 *
 * State:
 *       - user: localStorage(user) -> { username, firstName, lastName, email, isAdmin, applications}
 *       - token: localStorage(token) -> string of token
 *
 * App -> Nav
 * App -> RoutesList
 */

function App() {
  const [user, setUser] = useState(null);
  // DEV BUILD TOKEN:
  const [token, setToken] = useState(JoblyApi.token);
  // PRODUCTION BUILD TOKEN:
  // const [token, setToken] = useState(localStorage.getItem("token"));

  /** Updates state for user and token whenever token changes. Adds token and user to local storage. */
  useEffect(
    function fetchUserOnTokenChange() {
      async function getUser(username) {
        try {
          const user = await JoblyApi.getUser(username);
          setUser(user);
        } catch (err) {
          return;
        }
      }
      if (token) {
        const { username } = jwt_decode(token);
        JoblyApi.token = token;
        getUser(username);
        localStorage.setItem("token", token);
      }
    },
    [token]
  );

  /** Makes api call to log in user, updates state token */
  async function handleLogin({ username, password }) {
    const token = await JoblyApi.loginUser({ username, password });
    setToken(token);
  }

  /** Makes api call to sign up new user, updates state for token */
  // Destructure formdata when passing info from formData
  async function handleSignup(formData) {
    const token = await JoblyApi.registerUser(formData);
    setToken(token);
  }

  /** Sets all states to null (logs out user and removes token/user from localStorage) */
  function logOut(formData) {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  }

  /** TODO: Work on this */
  async function handleProfileEdit(username, formData) {
    try {
      const user = await JoblyApi.editUser(username, formData);
      setUser(user);
    } catch (err) {
      return err;
    }
  }

  if (token && !user) {
    return `loading...`;
  }

  return (
    <div className="App">
      <userContext.Provider value={{ user }}>
        <BrowserRouter>
          <Nav logOut={logOut} />
          <RoutesList
            handleLogin={handleLogin}
            handleSignup={handleSignup}
            handleProfileEdit={handleProfileEdit}
          />
        </BrowserRouter>
      </userContext.Provider>
    </div>
  );
}

export default App;
