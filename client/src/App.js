import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";
import Login from "./screens/Login";
import { useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { BrowserRouter as Router, Routes, Route, Link,Outlet,useNavigate } from "react-router-dom";
import Admin from "./screens/Admin";
import QuestionModal from "./screens/QuestionModal";
import Activity from "./screens/Activity";
import UserContext from "./contexts/User";

function LayoutsWithModal({socket}) {
  const navigate=useNavigate();
  const {user}=useContext(UserContext);
  if(!user){
    navigate("/login")
  }
  return (
    <>
      {/* Your navbar component */}
      <QuestionModal socket={socket} />

      {/* This Outlet is the place in which react-router will render your components that you need with the navbar */}
      <Outlet /> 
      
      {/* You can add a footer to get fancy in here :) */}
    </>
  );
}

function App() {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const newSocket = io(`http://localhost:3000`);
    setSocket(newSocket);
    return () => newSocket.close();
  }, [setSocket]);

  if (!socket) {
    <h1>Not Connected</h1>;
  }

  return (
    <ChakraProvider>
      <UserContext.Provider value={{ user,setUser }}>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<LayoutsWithModal socket={socket} />}>
              <Route path="/activity" element={<Activity socket={socket} />} />
            </Route>
            <Route path="/login" exact element={<Login socket={socket} />} />
            <Route path="/admin" element={<Admin socket={socket} />} />
          </Routes>
        </Router>
      </div>
      </UserContext.Provider>
    </ChakraProvider>
  );
}

export default App;
