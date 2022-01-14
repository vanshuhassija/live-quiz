const app = require("express")();
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"],
  },
});
require("dotenv").config();
let questions = [];
const rounds = [
  {
    round: 1,
    acceptableResponses: 2,
    positive: 10,
    negative: -5,
  },
  {
    round: 2,
    acceptableResponses: 20,
    positive: 10,
    negative: -5,
  },
  {
    round: 3,
    acceptableResponses: 2,
    positive: 10,
    negative: -5,
  },
];
let activeRound=rounds[0];
const teamsAwarded=[];

let activities = [];

let awards=[];





/* Creating POOL MySQL connection.*/

const pool = mysql.createPool({
  connectionLimit: 100,
  host: "localhost",
  user: "root",
  password: process.env.DB_PASS,
  database: "quiz",
  debug: false,
});

function refreshLeaderboard(){
    console.log("Refreshing leaderboard");
    const query=`SELECT * FROM teams ORDER BY score DESC`;
    pool.query(query,(err,rows)=>{
        if(!err){
            io.sockets.emit("fetchLeaderboard",rows);
        }
    });
}

function updateScores(points){
    console.log("Updating scores");
    const promises=[];
    for(let i=0;i<points.length;i++){
        const point=points[i];
        const query=`UPDATE teams SET score=score+${point.points} WHERE id='${point.team}'`;
        console.log("query is",query);
        promises.push(pool.query(query));
    }
    Promise.all(promises).then(()=>{
        console.log("Scores updated");
        refreshLeaderboard();
    }).catch((err)=>{
        console.error("Error is",error)
    });
}

function awardPoints(){
    const allTeams= [...new Set(activities.map(activity => activity.user.team.id))];
    console.log("All teams",allTeams);
    const pointsArr=[];
    for(let i=0;i<allTeams.length;i++){
        const team=allTeams[i];
        const answersByTeam=activities.filter(activity=>activity.user.team.id===team);
        console.log("Answers by team",answersByTeam[0].user.team);
        let points=0;
        for(let j=0;j<answersByTeam.length;j++){
            const answer=answersByTeam[j];
            points+=answer.correctAnswer?activeRound.positive:activeRound.negative;  
        }
        pointsArr.push({team,points});
        console.log(pointsArr,"PointsArr")
    }
    updateScores(pointsArr);
}




app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get("/", function (req, res) {
  res.send("Welcome to Live Quiz");
});

app.post("/team", function (req, res) {
  const id = req.body.name;
  pool.getConnection(function (err, connection) {
    if (err) {
      res.json({
        code: 400,
        failed: `error ocurred ${err}`,
      });
      return;
    }
    connection.query(
      `INSERT into teams(id) values('${id}')`,
      function (err, rows) {
        connection.release();
        if (!err) {
          res.json({
            code: 201,
            success: "team created successfully",
          });
        } else {
          res.json({
            code: 400,
            failed: `Could not create team ${err}`,
          });
        }
      }
    );
  });
});

app.post("/member", function (req, res) {
  const name = req.body.name;
  const teamId = req.body.teamId;
  const isAdmin = req.body.isAdmin || false;
  pool.getConnection(function (err, connection) {
    if (err) {
      res.json({
        code: 400,
        failed: `error ocurred ${err}`,
      });
      return;
    }
    connection.query(
      `INSERT into members(name,team_id,isAdmin) values('${name}', '${teamId}',${isAdmin})`,
      function (err, rows) {
        connection.release();
        if (!err) {
          res.json({
            code: 201,
            success: "team created successfully",
          });
        } else {
          res.json({
            code: 400,
            failed: `Could not create team ${err}`,
          });
        }
      }
    );
  });
});

app.post("/question", function (req, res) {
  const {
    question,
    code,
    answer,
    option1 = "",
    option2 = "",
    option3 = "",
    option4 = "",
    asked = 0,
    round,
  } = req.body;
  pool.getConnection(function (err, connection) {
    if (err) {
      res.json({
        code: 400,
        failed: `error ocurred ${err}`,
      });
      return;
    }
    connection.query(
      `INSERT into questions(question,code,answer,option1,option2,option3,option4,asked,round) values('${question}', '${code}', '${answer}','${option1}','${option2}','${option3}','${option4}',${asked},${round})`,
      function (err, rows) {
        connection.release();
        if (!err) {
          res.json({
            code: 201,
            success: "Question created successfully",
          });
        } else {
          res.json({
            code: 400,
            failed: `Could not create question ${err}`,
          });
        }
      }
    );
  });
});

/*  This is auto initiated event when Client connects to Your Machien.  */

io.on("connection", function (socket) {
  //   console.log("A user is connected", socket);
  socket.on("validateUser", function (data) {
    console.log("Data is", data);
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        return;
      }
      connection.query(
        `SELECT * FROM members WHERE name='${data.name}' AND team_id='${data.team}'`,
        function (err, rows) {
          if (!err) {
            if (rows.length > 0) {
              connection.query(
                `SELECT * FROM teams WHERE id='${rows[0].team_id}'`,
                function (error, teamRows) {
                  console.log("teamRows", teamRows);
                  if (!error) {
                    const user = rows[0];
                    user.team = teamRows[0];
                    socket.emit("validateUser", {
                      code: 200,
                      success: "User is valid",
                      user: user,
                    });
                  }
                }
              );
            } else {
              socket.emit("validateUser", {
                code: 400,
                failed: "User is not valid",
              });
            }
          } else {
            socket.emit("validateUser", {
              code: 400,
              failed: `Could not validate user ${err}`,
            });
          }
        }
      );
    });
  });

  socket.on("fetchQuestions", (data) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        return;
      }
      connection.query(
        `SELECT * FROM questions WHERE round=${data.round}`,
        function (err, rows) {
          if (!err) {
            questins = rows;
            socket.emit("fetchQuestions", {
              code: 200,
              success: "Questions fetched successfully",
              questions: rows,
            });
          } else {
            socket.emit("fetchQuestions", {
              code: 400,
              failed: `Could not fetch questions ${err}`,
            });
          }
        }
      );
    });
  });

  socket.on("submitAnswer", (data) => {
    const { question, answer, user } = data;
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        return;
      }
      let correctAnswer = false;
      if (question.answer.replaceAll(" ", "") === answer.replaceAll(" ", "")) {
        correctAnswer = true;
      }
      const activity={
        user: data.user,
        question: data.question,
        correctAnswer,
      };
      activities.push(activity);
      io.sockets.emit("newSubmission",activities);
      if(activities.length>=activeRound.acceptableResponses){
          io.sockets.emit("ideal");
          awardPoints();
      }
    });
  });

  socket.on("launchQuestion", (data) => {
    activities=[];
    io.sockets.emit("newSubmission", []);
    pool.getConnection(function (err, connection) {
      io.sockets.emit("launchQuestion", data);
    });
  });

  socket.on("ideal", (data) => {
    io.sockets.emit("ideal");
  });
  socket.on("fetchLeaderboard",refreshLeaderboard)
});

var add_status = function (status, callback) {
  pool.getConnection(function (err, connection) {
    if (err) {
      callback(false);
      return;
    }
    connection.query(
      "INSERT INTO `status` (`s_text`) VALUES ('" + status + "')",
      function (err, rows) {
        connection.release();
        if (!err) {
          callback(true);
        }
      }
    );
    connection.on("error", function (err) {
      callback(false);
      return;
    });
  });
};

http.listen(3000, function () {
  console.log("Listening on 3000");
});
