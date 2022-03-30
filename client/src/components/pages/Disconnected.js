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

const Disconnected = () => {
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
                />
              </Box>
            </Box>

            <Box marginTop="20px">
              <Alert variant="standard" severity="warning">
                You have been disconnected - perhaps for opening another Tab of Windle. Refresh to
                return to Windle!
              </Alert>
            </Box>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Disconnected;
