import React from "react";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import Guess from "../modules/Guess";
import Box from "@mui/material/Box";
import AbcIcon from "@mui/icons-material/Abc";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IosShareIcon from "@mui/icons-material/IosShare";
import Alert from "@mui/material/Alert";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import bgImg from "../../../dist/windleLettersBlur.png";
const GOOGLE_CLIENT_ID = "434008819449-cb80jm64j1c0b6rimhrtlaiprn8d70n8.apps.googleusercontent.com";
import { useParams } from "react-router-dom";

function fnBrowserDetect() {
  let userAgent = navigator.userAgent;
  let browserName;

  if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = "chrome";
  } else if (userAgent.match(/firefox|fxios/i)) {
    browserName = "firefox";
  } else if (userAgent.match(/safari/i)) {
    browserName = "safari";
  } else if (userAgent.match(/opr\//i)) {
    browserName = "opera";
  } else if (userAgent.match(/edg/i)) {
    browserName = "edge";
  } else {
    browserName = "No browser detection";
  }
  return browserName;
  //document.querySelector("h1").innerText="You are using "+ browserName +" browser";
}

const browserName = fnBrowserDetect();
const giveWarning = window.innerWidth <= 768 && browserName === "No browser detection";
const Login = ({ handleLogin, gameParams }) => {
  const { communityName, tournamentNameEncoded } = useParams();

  return (
    <div className="main">
      <div className="login">
        <Dialog
          open={true}
          onClose={() => {}}
          style={{ backgroundImage: `url(${bgImg})`, backgroundSize: "repeat" }}
        >
          <DialogContent style={{ backgroundColor: "#6c57f5", color: "white" }}>
            <Box style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <Box>
                <Guess
                  guess={{
                    guess: "WINDLE",
                    result: ["white", "white", "white", "white", "white", "white"],
                  }}
                  finished
                  hide
                  online
                  large
                />
              </Box>
            </Box>
            {communityName && (
              <Box style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <DialogTitle
                  style={{ backgroundColor: "#6c57f5", color: "white", fontSize: "48px" }}
                >
                  {communityName}
                </DialogTitle>
              </Box>
            )}

            {!giveWarning && (
              <GoogleLogin
                clientId={GOOGLE_CLIENT_ID}
                buttonText="Login"
                onSuccess={handleLogin}
                onFailure={(err) => console.log(err)}
                render={(renderProps) => (
                  <Button
                    onClick={() => {
                      renderProps.onClick();
                    }}
                    disabled={renderProps.disabled}
                    fullWidth
                    color="inherit"
                  >
                    {gameParams ? `Login to access ${decodeURI(tournamentNameEncoded)}` : "Login"}
                  </Button>
                )}
              />
            )}
            {giveWarning && (
              <Box marginTop="20px">
                <Alert variant="standard" severity="warning">
                  You aren't in Chrome or Safari. Please either copy-paste the URL or click{" "}
                  <IosShareIcon fontSize="small" style={{ display: "inline" }} /> - Open in Safari
                </Alert>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Login;
