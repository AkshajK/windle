import { useState, useEffect } from "react";
import { Switch, BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Login from "./pages/Login.js";
import Community from "./pages/Community.js";
import Game from "./pages/Game.js";
import LoginButton from "./modules/LoginButton.js";
import "../utilities.css";

import { socket } from "../client-socket.js";

import { get, post } from "../utilities";

/**
 * Define the "App" component
 */
const App = () => {
  const [userId, setUserId] = useState(undefined);
  const [userName, setUserName] = useState(undefined);
  const [picture, setPicture] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(undefined);
  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        setUserId(user._id);
        setUserName(user.name);
        setPicture(user.picture);
        setIsAdmin(user.admin);
      }
    });
  }, []);

  const handleLogin = (res) => {
    console.log(`Logged in as ${res.profileObj.name}`);
    const userToken = res.tokenObj.id_token;
    post("/api/login", { token: userToken }).then((user) => {
      post("/api/initsocket", { socketid: socket.id }).then(() => {
        setUserId(user._id);
        setUserName(user.name);
        setPicture(user.picture);
      });
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    post("/api/logout");
  };

  const loginButton = (
    <LoginButton handleLogin={handleLogin} handleLogout={handleLogout} userId={userId} />
  );

  return (
    <>
      <Router>
        <Switch>
          <Route path="/admin/:communityName">
            {userId ? (
              <Community userName={userName} picture={picture} admin={isAdmin} />
            ) : (
              <Login handleLogin={handleLogin} />
            )}
          </Route>
          <Route path="/:communityName/:tournamentNameEncoded">
            {userId ? (
              <Game userName={userName} userId={userId} />
            ) : (
              <Login handleLogin={handleLogin} gameParams />
            )}
          </Route>
          <Route path="/:communityName">
            {userId ? (
              <Community userName={userName} picture={picture} />
            ) : (
              <Login handleLogin={handleLogin} />
            )}
          </Route>
          <Route path="/">
            <Redirect to="/MIT" />
          </Route>
        </Switch>
      </Router>
    </>
  );
};

export default App;
