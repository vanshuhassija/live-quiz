import { Button, ButtonGroup } from "@chakra-ui/button";
import { Box, Flex, Heading, Text } from "@chakra-ui/layout";
import { HStack } from "@chakra-ui/react";
import React, { useEffect } from "react";
import Select from "react-select";
const Admin = ({ socket }) => {
  const [selectedRound, setSelectedRound] = React.useState(null);
  const [questions, setQuestions] = React.useState([]);

  useEffect(() => {
    if (socket) {
      socket.on("fetchQuestions", (data) => {
        if (data) {
          setQuestions(data?.questions);
        }
      });
    }
  }, [socket]);

  const roundOpts = [
    {
      label: 1,
      value: 1,
    },
    {
      label: 2,
      value: 2,
    },
    {
      label: 3,
      value: 3,
    },
    {
      label: 4,
      value: 4,
    },
  ];

  return (
    <Flex direction="column" bg="orange.100" p={10}>
      <Select
        value={selectedRound}
        options={roundOpts}
        placeholder="Select Round"
        onChange={(newVal) => {
          setSelectedRound(newVal);
          socket.emit("fetchQuestions", { round: newVal.value });
        }}
      />
      <Flex mt={3} alignItems="flex-start">
        <HStack>
          <Button
            colorScheme="red"
            onClick={() => {
              socket.emit("ideal");
            }}
          >
            Make Ideal
          </Button>
          <Button
            onClick={() => {
              socket.emit("completeRound", 1);
            }}
          >
            Complete Round 1
          </Button>
          <Button
            onClick={() => {
              socket.emit("completeRound", 2);
            }}
          >
            Complete Round 2
          </Button>
          <Button
            onClick={() => {
              socket.emit("completeRound", 3);
            }}
          >
            Complete Round 3
          </Button>
          <Button
            onClick={() => {
              socket.emit("completeRound", 4);
            }}
          >
            Complete Round 4
          </Button>
        </HStack>
      </Flex>

      {questions?.length
        ? questions.map((question) => {
            return (
              <Flex
                bg="white"
                mt={3}
                p={4}
                align="flex-start"
                direction="column"
              >
                <Heading as="h3" size="md">
                  Question
                </Heading>
                <Text my={4}>{question.question}</Text>
                {question.code ? <img src={question.code} /> : ""}
                <Flex mt={3}>
                  {!question.asked ? (
                    <Button
                      colorScheme="blue"
                      mr={3}
                      onClick={() => {
                        socket.emit("launchQuestion", { question });
                      }}
                    >
                      Launch Question
                    </Button>
                  ) : (
                    ""
                  )}
                </Flex>
              </Flex>
            );
          })
        : null}
    </Flex>
  );
};

export default Admin;
