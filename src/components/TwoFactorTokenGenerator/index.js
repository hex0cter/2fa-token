import { authenticator } from "otplib";
import React, { useState, useEffect } from "react";
import HourglassFullIcon from "@material-ui/icons/HourglassFull";
import CircularProgress from "@material-ui/core/CircularProgress";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import styles from "./index.module.css";
import SecretField from "../SecretField";

export default function TwoFactorTokenGenerator() {
  const [secret, setSecret] = useState(
    localStorage.getItem("TwoFactorTokenSecret") || ""
  );
  const totpCode = secret ? authenticator.generate(secret) : "";
  const [code, setCode] = useState(totpCode);
  const [copyButtonText, setCopyButtonText] = useState("Copy");
  const [refreshButtonText, setRefreshButtonText] = useState("Refresh");
  const [progress, setProgress] = useState(100);

  const updateSecret = (event) => {
    const newSecret = event.target.value;
    setSecret(newSecret);
    localStorage.setItem("TwoFactorTokenSecret", newSecret);
  };

  const copyToClipboard = (str) => {
    if (str === "") {
      return;
    }
    const element = document.createElement("textarea");
    element.value = str;
    document.body.appendChild(element);
    element.select();
    document.execCommand("copy");
    document.body.removeChild(element);

    setCopyButtonText("Copied");
    setTimeout(() => setCopyButtonText("Copy"), 1500);
  };

  const updateProgress = () => {
    const secondElapsed = Math.round(Date.now() / 1000) % 30;
    const secondsRemain = 30 - secondElapsed;
    const percentage = (secondsRemain * 100) / 30;
    setProgress(percentage);

    if (percentage < 10) {
      setTimeout(generateCode, 2500);
    }
  };

  const generateCode = () => {
    if (!!!secret) {
      setCode("");
      return;
    }

    setRefreshButtonText(<HourglassFullIcon />);
    const newTotpCode = secret ? authenticator.generate(secret) : "";
    if (newTotpCode !== code) {
      setCode(newTotpCode);
    }
    setTimeout(() => setRefreshButtonText("Refresh"), 100);
  };

  useEffect(generateCode, [secret, code]);

  window.addEventListener("focus", generateCode);
  window.addEventListener("load", () => {
    updateProgress();
    setInterval(updateProgress, 2000);
  });

  return (
    <CardContent>
      <div className={styles.twoFactorContainer}>
        <SecretField secret={secret} onChange={updateSecret} />
        <div className={styles.result}>
          <div className={styles.token}>
            Code: {code} &nbsp;
            {code ?  <CircularProgress
              variant="determinate"
              value={progress}
              size={20}
            /> : null}
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={() => copyToClipboard(code)}
            className={styles.refreshButton}
          >
            {copyButtonText}
          </Button>{" "}
          &nbsp;
          <Button
            variant="contained"
            color="primary"
            onClick={generateCode}
            className={styles.refreshButton}
          >
            {refreshButtonText}
          </Button>
        </div>
      </div>
    </CardContent>
  );
}
