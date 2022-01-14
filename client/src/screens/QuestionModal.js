import { Text } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import {
  FormControl,
  FormHelperText,
  FormLabel,
} from "@chakra-ui/form-control";
import React, { useContext, useEffect } from "react";
import { Input } from "@chakra-ui/input";
import { Button } from "@chakra-ui/button";
import UserContext from "../contexts/User";
import { Alert } from "@chakra-ui/alert";

const QuestionModal = ({ socket }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (socket) {
      socket.on("launchQuestion", (data) => {
        setIsOpen(true);
        setQuestion(data.question);
      });
      socket.on("ideal", (data) => {
        setIsOpen(false);
        setAnswer("");
        setQuestion(null);
      });
    }
  }, [socket]);

  if (!socket) {
    return "Establishing connection ....";
  }

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <Modal isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Question</ModalHeader>
        <ModalBody>
          <Text mb={4}>{question?.question}</Text>
          <img src={question?.code} alt="question" width={800} />
          {user?.team?.canPlay ? (
            <FormControl isRequired my={3}>
              <FormLabel htmlFor="name">Answer</FormLabel>
              <Input
                id="answer"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                autoFocus
              />
            </FormControl>
          ) : (
            <Alert status="error" my={4}>You cannot answer this question because, you have been eliminated</Alert>
          )}
        </ModalBody>
        {user?.team?.canPlay?(
        <ModalFooter alignItems="flex-start">
          <Button
            colorScheme="blue"
            mr={3}
            disabled={!answer}
            onClick={() => {
              setIsOpen(false);
              setAnswer("");
              socket.emit("submitAnswer", {
                question,
                answer,
                user,
              });
            }}
          >
            Commit Answer
          </Button>
          <Button colorScheme="red" mr={3} onClick={onClose}>
            I do not want to answer
          </Button>
        </ModalFooter>):null}
      </ModalContent>
    </Modal>
  );
};

export default QuestionModal;
