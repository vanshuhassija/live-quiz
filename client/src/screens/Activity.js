import { Alert } from "@chakra-ui/alert";
import { Avatar } from "@chakra-ui/avatar";
import { Flex, Heading, HStack, VStack } from "@chakra-ui/layout";
import React, { useContext, useEffect } from "react";
import QuestionModal from "./QuestionModal";
import UserContext from "../contexts/User";
import {
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/table";

const Activity = ({ socket }) => {
  const { user } = useContext(UserContext);

  const [activities, setActivities] = React.useState([]);
  const [leaderboard, setLeaderboard] = React.useState([]);
  useEffect(() => {
    if (socket) {
      socket.emit("fetchLeaderboard");
      socket.on("newSubmission", (data) => {
        setActivities(data);
      });
      socket.on("fetchLeaderboard", (data) => {
        console.log("Leaderboard", data);
        setLeaderboard(data);
      });
    }
  }, [socket]);

  const activityString = (activity) => {
    return `${activity.user.name} from  team ${
      activity?.user?.team?.id
    } submitted ${
      activity.correctAnswer ? "a correct answer" : "an incorrect answer"
    }`;
  };
  console.log("User is",user);

  return (
    <>
      {/* <QuestionModal socket={socket}/> */}
      <HStack bg="orange.100" p={10}>
          <VStack>
        {activities.map((activity) => {
          return (
            <Alert status={activity.correctAnswer ? "success" : "error"} mt={3}>
              <Avatar name={user.name} mr={5} />
              {activityString(activity)}
            </Alert>
          );
        })}
        </VStack>
        <Table  >
          <TableCaption>Leaderboard</TableCaption>
          <Thead>
            <Tr>
              <Th>Team Name</Th>
              <Th>Score</Th>
            </Tr>
          </Thead>
          <Tbody>
              {leaderboard.map((team) => {
                return (
                  <Tr bg={user?.team?.id===team.id&&"teal.100"}>
                    <Td>{team.id}</Td>
                    <Td>{team.score}</Td>
                  </Tr>
                );
              })}
            
          </Tbody>
        </Table>
      </HStack>
    </>
  );
};

export default Activity;
