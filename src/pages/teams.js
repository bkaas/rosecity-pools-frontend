import React from "react"
import BeatLoader from "react-spinners/BeatLoader"

import Layout from "../components/Layout.js"
import Error from "../components/Error.js"
import Dropdown from "../components/Dropdown.js"
import teamIcons from "../components/TeamIcons.js"
import * as styles from "../styles/teams.module.css"

// Layout split from the TeamGrid component so the navbar
// doesn't refresh with the api call in TeamGrid
export default function TeamsPage() {

  return (
    <Layout>
      <TeamGrid />
    </Layout>
  );

}

class TeamGrid extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      team: [{ // array of team objects
        name: '',
        stats: [{ // array of stats objects
          lastname: '',
          firstname: '',
          points: '',
          logo: '',
          pick: '', // added for sorting teams by draft position
          eliminated: false, // changes to true when a team is eliminated
        }],
      }],
      sortIndex: 2, // Default to standings sort
      isStandingsDropdownVisible: false,
      fetchErr: false,
      loading: true,
      year: new Date().getFullYear(), // default to the current year
      league: "Rose City", // default to Rose City: TODO shouldn't be hardcoded, pull from db
    };

    this.sortOptions = ['Alphabetical', 'Draft Order', 'Standings'];

    this.onSortSelect = this.onSortSelect.bind(this);
    this.onStandingsDropdownClick = this.onStandingsDropdownClick.bind(this);
    this.onYearSelect = this.onYearSelect.bind(this);
    this.onLeagueSelect = this.onLeagueSelect.bind(this);
    this.fetchStats = this.fetchStats.bind(this);
  }

  componentDidMount() {
    this.fetchStats(this.state.year, this.state.league);
  }

  fetchStats(year, league) {
    let fetchUrl;
    if (process.env.GATSBY_API_URL) {
      fetchUrl = process.env.GATSBY_API_URL + "/api/stats";
    }
    else {
     fetchUrl = "/api/stats";
    }

    // Append the query for the stats year on the URL
    fetchUrl += "/?year=" + year + "&league=" + league;

    fetch(fetchUrl)
      .then(res => {
        // console.log(res);
        // console.log(res.body);
        return res.json();

      })
      .then(data => {
        this.setState({
          team: data,
          fetchErr: false,
          loading: false,
          year: year,
          league: league,
        })

        // Sort the teams when they first mount
        this.onSortSelect(this.sortOptions[this.state.sortIndex]);
      })
      .catch(error => {
        this.setState({
          fetchErr: true,
          loading: false,
        });
      });

  }

  onSortSelect(selectedOption) {

    const optionIndex = this.sortOptions.indexOf(selectedOption);

    this.setState( (state) => {

      /* assembleStandingsData needs to be in setState(), otherwise
       * the state data is too old */
      const standingsData = assembleStandingsData(state);
      const sortCallback = getSortCallback(optionIndex, standingsData);

      return ({
        team: state.team.sort(sortCallback),
      });
    });
  }

  onStandingsDropdownClick() {
    this.setState((state) => {
      return ({
        isStandingsDropdownVisible: !state.isStandingsDropdownVisible,
      });
    });
  }

  onYearSelect(selectedYear) {
    // Update the year within fetchStats()
    // If updating prior to the call, it wasn't updating in time for the fetch
    this.setState({loading: true});
    this.fetchStats(selectedYear, this.state.league);
  }

  onLeagueSelect(selectedLeague) {
    // Update the league within fetchStats()
    // If updating prior to the call, it wasn't updating in time for the fetch
    this.setState({loading: true});
    this.fetchStats(this.state.year, selectedLeague);
  }

  render() {

    // Handle loading teams
    if (this.state.loading) {
      return (
        <div className={styles.loader}>
          <BeatLoader color={"#2d4682"}/>
        </div>
      );
    }

    // Handle fetch error
    if (this.state.fetchErr) {
      return(
        <Error>
          <p>Failed to fetch team data from server.</p>
        </Error>
      );
    }

    // Handle missing team data
    const emptyTeams = {
      name: '',
      stats: [{
        lastname: '',
        firstname: '',
        points: '',
        logo: '',
        pick: '',
        eliminated: false,
      }],
    };

    const isDataEmpty =
      this.state.team.length === 1 &&
      JSON.stringify(emptyTeams) === JSON.stringify(this.state.team[0]);

    if (isDataEmpty) {
      return (
        <Error>
          <p>Empty team data received from server.</p>
        </Error>
      );
    }

    // Create standings table
    const standingsData = assembleStandingsData(this.state);
    // console.log(standingsData);

    const teams = this.state.team.map( (team, ii) => {
        return (
          <Team key={ii} teamData={team} />
        );
      });

    const standingsDropdownClass = this.state.isStandingsDropdownVisible ?
      `${styles.standingsDropdown} ${styles.visible}` : styles.standingsDropdown;

    // Calculate the number of years the pool has been running for
    // the year selection drop down menu
    // TODO, we should fetch this from the backend with "SELECT DISTINCT"
    // from the database
    const startYear = 2020;
    const nYears = new Date().getFullYear() - startYear + 1;
    // Generates: [2020, 2021, 2022 .... up to the current year]
    const yearArray = [...Array(nYears).keys()].map(x => x + startYear);
    const leagueArray = ["Rose City", "Scam"];

    return (
      <>
        {/*Standings bar and its dropdown*/}
        <div className={styles.standingsBar}>
          <button onClick={this.onStandingsDropdownClick}>
            Standings
          </button>
        </div>
        <div className={standingsDropdownClass}>
          <Team
            teamData={standingsData}
            teamType="standings"
          />
        </div>

        {/*Main area of the page. Includes the standings pane, the
        main teams pane, and the sort by drop down.*/}
        <div className={styles.teamsMain}>

          <div className={styles.standingsPane}>
            <Team teamData={standingsData} teamType="standings"/>
          </div>

          <div className={styles.teamsPane}>
            <div className={styles.sortBar}>
              <Dropdown
                selectId="league"
                label=""
                selectName="league"
                options={leagueArray}
                onSelect={this.onLeagueSelect}
                initialSelect={this.state.league}
              />
              <Dropdown
                selectId="poolYear"
                label=""
                selectName="poolYear"
                options={yearArray}
                onSelect={this.onYearSelect}
                initialSelect={this.state.year}
              />
              <Dropdown
                selectId="sortBy"
                label="Sort:"
                selectName="sortBy"
                options={this.sortOptions}
                onSelect={this.onSortSelect}
                initialSelect={this.sortOptions[this.state.sortIndex]}
              />
            </div>
            <div className={styles.teamGrid}>
              {teams}
            </div>
          </div>

        </div>
      </>
    );
  }
}

// Encapsulate the TeamTable within some divs and include
// the team's total points and team name
function Team(props) {

  let totalPoints;
  let totalPointsElement;
  if (!props.teamType) {
    totalPoints = props.teamData.stats.reduce((sum, stat) => {
      return sum + stat.points;
    }, 0);

    totalPointsElement = <h3 className={styles.tableHeaderPts}>{totalPoints}</h3>;
  }
  else {
    totalPointsElement = '';
  }

  const teamContainerClass = props.teamType ? `${styles.teamContainer} ${styles.standingsContainer}` : styles.teamContainer;

  return (
    <div className={teamContainerClass}>
      <div className={styles.teamBackground}>
        <div className={styles.tableHeader}>
          <h3>{props.teamData.name}</h3>
          {totalPointsElement}
        </div>
        <TeamTable stats={props.teamData.stats} teamType={props.teamType}/>
      </div>
    </div>
  );
}

// Splits the table header row from the team data.
// Used for the standings and for each team.
function TeamTable(props) {

  let headings;
  if (props.teamType) {
    headings = ["", "", ""];
  }
  else {
    headings = ["", "Player", "Pts"];
  }

  const htmlHeadings = headings.map( (heading, ii) => <th key={ii}>{heading}</th> );

  return (
    <table>
      <tbody>
        <tr>
          {htmlHeadings}
        </tr>
        <TeamTableEntries stats={props.stats} teamType={props.teamType}/>
      </tbody>
    </table>
  );
}

// Format each table row from the stats data
function TeamTableEntries(props) {

  return (
    props.stats.map( (stats, ii) => {
      // Setting the names to lowercase here so I can capitalize in css
      const playername = (stats.firstname + ' ' + stats.lastname).toLowerCase();

      let logo;
      // teamType is equal to "standings" or otherwise empty
      if (props.teamType) {
        // This is the team ranking for the standings table
        logo = ii + 1;
      }
      else {
        if (stats.logo) {
          // Remove the ".svg" from the logo string to index the teamIcons object
          logo = teamIcons[stats.logo.slice(0, -4)];
        } else {
          logo = '';
        }
      }

      let playerClass = "";
      if (stats.eliminated) {
        playerClass = styles.eliminated;
      }

      return(
        <tr key={ii}>
          <td>{logo}</td>
          <td className={playerClass}>
            {playername}
          </td>
          <td>{stats.points}</td>
        </tr>
      );
    })
  );
}

const getSortCallback = (optionIndex, standingsData) => {

  switch(optionIndex) {
  case 0: // Alphabetical
    return (teamA, teamB) => teamA.name.localeCompare(teamB.name);
  case 1: // Draft Order
    return (teamA, teamB) => teamA.stats[0].pick - teamB.stats[0].pick;
  case 2: // Standings
  default:
    // Copy the standingsData order
    const standingsTeamOrder = standingsData.stats.map( ({firstname}) => firstname );
    return (teamA, teamB) => standingsTeamOrder.indexOf(teamA.name) - standingsTeamOrder.indexOf(teamB.name);
  }

};

const assembleStandingsData = (inState) => {
  // Create object that is similar to the "state" object in structure
  // Pass the object into the Team component for standings
  // The "name" of the team will be "Standings"
  // The stats will be each team name and their total points

  const standingsData = inState.team.map( team => {

    const teamTotalPoints = team.stats.reduce((sum, stat) => {
      return sum + stat.points;
    }, 0);

    return ({
      firstname: team.name,
      lastname:  "",
      points:    teamTotalPoints,
      logo:      false,
    });
  });

  standingsData.sort((a, b) => {
    return b.points - a.points;
  });

  return ({
    name: "Standings",
    stats: standingsData,
  });
};