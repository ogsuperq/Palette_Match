import React, { useMemo, useState } from "react";
import DeckViewer from "@/components/deck/DeckViewer";
import "@/styles/investorDeck.css";

const ACCESS_CODE = process.env.REACT_APP_INVESTOR_ACCESS_CODE;

export default function InvestorsPage() {
  const [passcode, setPasscode] = useState("");
  const [status, setStatus] = useState("idle");
  const [hasAccess, setHasAccess] = useState(() => {
    return window.sessionStorage.getItem("palette-match-investor-access") === "granted";
  });

  const lockedMessage = useMemo(() => {
    if (!ACCESS_CODE) {
      return "Investor access is currently locked. Please contact Palette Match for access.";
    }
    if (status === "denied") {
      return "That passcode does not match. Please try again.";
    }
    return "";
  }, [status]);

  const unlockPasscode = () => {
    if (!ACCESS_CODE) {
      setStatus("locked");
      return;
    }
    if (passcode.trim() === ACCESS_CODE) {
      window.sessionStorage.setItem("palette-match-investor-access", "granted");
      setHasAccess(true);
      setStatus("idle");
      return;
    }
    setStatus("denied");
  };

  const submitPasscode = (event) => {
    event.preventDefault();
    unlockPasscode();
  };

  const handlePasscodeKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    unlockPasscode();
  };

  if (hasAccess && ACCESS_CODE) {
    return <DeckViewer />;
  }

  return (
    <main className="investor-lock">
      <section className="investor-lock__panel" aria-labelledby="investor-access-title">
        <div className="investor-lock__mark" aria-label="Palette Match">
          <span className="investor-lock__diamond" aria-hidden="true" />
          <span className="investor-lock__brand">Palette Match</span>
        </div>

        <div className="investor-lock__eyebrow">Private Access</div>
        <h1 id="investor-access-title">Palette Match Investor Access</h1>
        <p className="investor-lock__subtitle">
          Confidential Investor Presentation
        </p>

        <form className="investor-lock__form" onSubmit={submitPasscode}>
          <label className="investor-lock__label" htmlFor="investor-passcode">
            Passcode
          </label>
          <div className="investor-lock__row">
            <input
              id="investor-passcode"
              className="investor-lock__input"
              type="password"
              value={passcode}
              onChange={(event) => {
                setPasscode(event.target.value);
                setStatus("idle");
              }}
              onKeyDown={handlePasscodeKeyDown}
              autoComplete="off"
              aria-describedby="investor-lock-message"
            />
            <button className="investor-lock__button" type="submit">
              Access
            </button>
          </div>
          <p id="investor-lock-message" className="investor-lock__message" aria-live="polite">
            {lockedMessage}
          </p>
        </form>
      </section>
    </main>
  );
}
