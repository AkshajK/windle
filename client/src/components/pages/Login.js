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
import GoogleLogin, { GoogleLogout } from "react-google-login";
import bgImg from "../../../dist/windleLettersBlur.png";
const GOOGLE_CLIENT_ID = "434008819449-cb80jm64j1c0b6rimhrtlaiprn8d70n8.apps.googleusercontent.com";
import { useParams } from "react-router-dom";

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
              <Guess
                guess={{
                  guess: "WINDLE",
                  result: ["white", "white", "white", "white", "white", "white"],
                }}
                finished
                hide
                online
              />
            </Box>
            {gameParams && (
              <Box style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <DialogTitle
                  style={{ backgroundColor: "#6c57f5", color: "white", fontSize: "48px" }}
                >
                  {communityName}
                </DialogTitle>
              </Box>
            )}

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
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Login;
