import { useState, useEffect } from "react";
import { Switch, BrowserRouter as Router, Route } from "react-router-dom";
import NotFound from "./pages/NotFound.js";
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
  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        // they are registed in the database, and currently logged in.
        setUserId(user._id);
        setUserName(user.name);
      }
    });
  }, []);

  const handleLogin = (res) => {
    console.log(`Logged in as ${res.profileObj.name}`);
    const userToken = res.tokenObj.id_token;
    post("/api/login", { token: userToken }).then((user) => {
      setUserId(user._id);
      setUserName(user.name);

      post("/api/initsocket", { socketid: socket.id });
    });
  };

  const handleLogout = () => {
    setUserId(undefined);
    post("/api/logout");
  };

  if (!userId) {
    return <LoginButton handleLogin={handleLogin} handleLogout={handleLogout} userId={userId} />;
  }
  return (
    <>
      <Router>
        <Switch>
          <Route path="/:communityName/:tournamentNameEncoded">
            <Game userName={userName} />
          </Route>
          <Route path="/:communityName">
            <Community userName={userName} />
          </Route>
        </Switch>
      </Router>
    </>
  );
};

export default App;
