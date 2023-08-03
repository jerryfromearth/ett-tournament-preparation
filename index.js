///////////////////////
// Inputs START
let ids =
  "347650,273428,87,662378,309286,1483289,698777,1075235,213061,262,1669372,315909,292547,1561548,454981,481017,1513309,1620068,474200,1464379,1069048,1171264,916969,395571,160464,484532,1673421,26671,479167,1229913,1650899,172812,1084491,1360251,713877,395416,1048228,574160,446049,1155128,1276364,764090,1333611,1613810,1604838,695810,1482889,1599551,31374,1288174,186338,14294,641189,688448,465690,1033360,793011,1666827,294661,328919,1080292,1521330,1456882,1418307,1642793,237840,635999,102027,1464478,1373104,1413653,761925,1030922,459637,1670637,1580491,392808,393996,98389,1224115,1455697,1484252,4908,459502,597186,855923,501349,1665025,1609330,1417519,1443210,1376527,1339831,1546528,507723,108374,61087,1059868,1579044,1292351,1418464,381237,1424178,520037,709273,154174,578913,234850,448143,471060,1653584,1596424,193302,1293191,949001,1361933,1454901,1409622,705801,1245532,516183,1670138,1655147,1067651,1666332,708083,656856,201082,665939,1202988,754590,1641672,201082,1508148,1569207,604264,1188482,1033022,1288174,720329,1657782,558168,1636777,797364,491138,1484542,471060,1482889,617396";
const timeStart = new Date("2023-06-03T00:00:00.000Z");
const timeEnd = new Date("2023-08-04T00:00:00.000Z");
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
    `ID,Username,CurrentELO,HighestEloInTimeFrame,HighestEloTime,ElevenLink,ClubLink`
  );

  for (let i = 0; i < idsArray.length; i++) {
    let id = idsArray[i];
    let elo = 0;
    let username = "";

    let historyURL = `http://elevenvr.club/accounts/${id}/elo-history`;
    let matches = [];

    /////////////////////////
    // send request to GET profileURL

    let profileURL = `http://elevenvr.club/accounts/${id}`;
    try {
      const response = await axios.get(profileURL);
      username = response.data.data.attributes["user-name"];
      elo = response.data.data.attributes["elo"];
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
      },https://www.elevenvr.net/eleven/${id},https://11clubhouse.com/${id}/`
    );
  }

  console.log(
    "\nDone! Copy the above block of output and save them into a csv file. Then you can view the data nicely in excel or google sheet."
  );
})();
