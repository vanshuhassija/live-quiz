import { Alert } from "@chakra-ui/alert";
import { Button } from "@chakra-ui/button";
import {
  FormControl,
  FormHelperText,
  FormLabel,
} from "@chakra-ui/form-control";
import {useNavigate} from "react-router-dom"
import { Input } from "@chakra-ui/input";
import { Box, Flex } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import React, { useContext } from "react";
import UserContext
 from "../contexts/User";
const Login = ({ socket }) => {
  const [name, setName] = React.useState("");
  const [team, setTeam] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const {setUser}=useContext(UserContext);
  const history=useNavigate();

  React.useEffect(() => {
    if (socket) {
      socket.on("validateUser", (data) => {
        setLoading(true);
        handleUser(data);
      });
    }
  }, [socket]);

  if (!socket) {
    return <h1>No Connection</h1>;
  }

  const handleUser = (data) => {
      setLoading(false);
    if (data.code === 200) {
        setError("");
        setUser(data.user)
        if(data?.user?.isAdmin){
            history("/admin");
        }
        else{
            history("/activity");
        }
    } else {
      setError(data.failed);
    }
  }

  const validateUser = () => {
    socket.emit("validateUser", {
      name:name.toLowerCase(),
      team:team.toLowerCase(),
    });
  };

  return (
    <Flex justify="center" align="center" h="100vh" bg="orange.100" direction="column">
     
      <Box bg="white" p={6} boxShadow="md">
      {error && (
        <Alert status="error" mb={6}>No records match for details entered.</Alert>
      )}
        <Flex direction="column" alignItems="flex-start">
          <FormControl isRequired>
            <FormLabel htmlFor="name">Your Name</FormLabel>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired mt={6}>
            <FormLabel htmlFor="team">Team Name</FormLabel>
            <Input
              id="team"
              type="text"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
            />
            <FormHelperText>
              This should be same as your registered team name.
            </FormHelperText>
          </FormControl>
          <Button colorScheme="blue" mt={6} onClick={validateUser} disabled={!name||!team}>
            {loading?<Spinner/>:"Join Quiz"}
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};

export default Login;
