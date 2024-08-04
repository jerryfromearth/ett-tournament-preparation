///////////////////////
// Inputs START
let ids = "384070, 4008";
const timeStart = new Date("2024-06-01T00:00:00.000Z");
const timeEnd = new Date("2024-08-05T00:00:00.000Z");
// Inputs END

const axios = require("axios");

console.log("Inputs:\n", ids, "\n", timeStart, "\n", timeEnd);
console.log(
  "Warning: due to the way eleven API works, the highest elo in the timeframe only consists of ELO before each match. So if you see some highest elo that is near the tournament bracket dividers, please double check."
);
console.log("This can take a while...\n");

//a function that both writes to console and writes to file
async function writeToFile(data) {
  console.log(data);
  await fs.writeFile("output.txt", data);
}

(async () => {
  ids = ids.replace(/\s/g, "");
  let idsArray = ids.split(",");

  console.log(
    `ID,Username,CurrentELO,HighestEloInTimeFrame,HighestEloTime,ElevenLink,ClubLink,MainOrGuest,ParentID,ParentUsername,ParentElo`
  );

  for (let i = 0; i < idsArray.length; i++) {
    let id = idsArray[i];
    let elo = 0;
    let username = "";
    let parentId = 0;
    let parentUsername = "";
    let parentElo = 0;

    //let historyURL = `http://elevenvr.club/accounts/${id}/elo-history`;
    let historyURL = `http://api2.elevenvr.com/accounts/${id}/elo-history?api-key=gyghufjiuhrgy783ru293ihur8gy`;
    let matches = [];

    /////////////////////////
    // send request to GET profileURL

    //let profileURL = `http://elevenvr.club/accounts/${id}`;
    let profileURL = `http://api2.elevenvr.com/accounts/${id}?api-key=gyghufjiuhrgy783ru293ihur8gy`;
    try {
      const response = await axios.get(profileURL);
      username = response.data.data.attributes["user-name"];
      elo = response.data.data.attributes["elo"];
      parentId = response.data.data.attributes["parent-id"];
      if (parentId !== 0) {
        const parentResponse = await axios.get(
          `http://api2.elevenvr.com/accounts/${parentId}?api-key=gyghufjiuhrgy783ru293ihur8gy`
        );
        parentUsername = parentResponse.data.data.attributes["user-name"];
        parentElo = parentResponse.data.data.attributes["elo"];
      }
    } catch (error) {
      console.error(error.response.body);
    }

    /////////////////////////
    // send request to GET historyURL
    try {
      const response = await axios.get(historyURL);
      matches = response.data.data;
    } catch (error) {
      console.error("error", error.response.body);
    }
    //console.log(matches);

    matches = matches.filter((match) => {
      let timeMatch = new Date(match.attributes["created-at"]);
      // check if timeMatch is between timeBegin and timeEnd
      if (timeMatch >= timeStart && timeMatch <= timeEnd) {
        return true;
      }
      return false;
    });

    let maxElo = 0;
    let matchIndex = null;
    if (matches.length === 0) {
      // lazy bone who hasn't played any ranked games in the period
      maxElo = elo;
      matchIndex = null;
    } else {
      // find the highest elo in matches
      maxElo = Math.max(
        ...matches.map((match) => parseInt(match.attributes["current-elo"]))
      );
      // get the id of array of the match that has the highest elo
      matchIndex = matches.findIndex(
        (match) => parseInt(match.attributes["current-elo"]) === maxElo
      );
    }

    /////////////////////////
    // output line
    console.log(
      `${id},${username},${elo},${maxElo},${
        matchIndex != null
          ? matches[matchIndex].attributes["created-at"]
          : "N/A"
      },https://www.elevenvr.net/eleven/${id},https://11clubhouse.com/${id}/,${
        parentId === 0 ? "MAIN" : "GUEST"
      },${parentId === 0 ? "" : parentId},${parentUsername},${
        parentElo === 0 ? "" : parentElo
      },${parentId === 0 ? "" : "https://11clubhouse.com/" + parentId}`
    );
  }

  console.log(
    "\nDone! Copy the above block of output and save them into a csv file. Then you can view the data nicely in excel or google sheet."
  );
})();
