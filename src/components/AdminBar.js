import React from "react"

import DraftForm from "./DraftForm.js"
import LeagueSelection from "./LeagueSelection.js"

import * as styles from "../styles/adminbar.module.css"
import * as generalStyles from "../styles/generalStyles.module.css"


export default function AdminBar(props) {

  const buttonStyle =
      props.isDraftStarted ? generalStyles.draftButton : generalStyles.draftButtonOff;

  const notButtonStyle =
    props.isDraftStarted ? generalStyles.draftButtonOff : generalStyles.draftButton;

  return(
    <div className={styles.adminBar}>
      <h2>Admin</h2>
      <div className={styles.adminContents}>
        <LeagueSelection
          isResponsive={!props.isDraftStarted}
          leagues={props.leagues}
          onLeagueChange={props.onLeagueChange}
        />
        <DraftForm
          submitVal="ADD"
          defaultText="New Team"
          handleSubmit={props.handleNewTeam}
          isResponsive={!props.isDraftStarted}
        />
        <div className={styles.nRounds}>
          <label htmlFor="numRounds">Rounds: </label>
          <input
            type="number"
            id="numRounds"
            name="numRounds"
            value={props.nRounds}
            onChange={props.onNumRoundsChange}/>
        </div>
        {/*<h3>Draft Controls</h3>*/}
        <div className={styles.draftControls}>
          <button
            className={notButtonStyle}
            type="button"
            onClick={props.onBegin}
            disabled={props.isDraftStarted}>
            Begin Draft
          </button>
          <button
            className={buttonStyle}
            type="button"
            onClick={props.onReset}
            disabled={!props.isDraftStarted}>
            Configure Draft
          </button>
        </div>
        <div className={styles.draftControls}>
          <button
            className={buttonStyle}
            type="button"
            onClick={props.undoPick}
            disabled={!props.isDraftStarted}>
            Undo Pick
          </button>
          <button
            className={buttonStyle}
            type="button"
            disabled={!props.isDraftStarted}
            onClick={props.onSubmit}>
            Submit Draft
          </button>
        </div>
      </div>
    </div>
  );

}