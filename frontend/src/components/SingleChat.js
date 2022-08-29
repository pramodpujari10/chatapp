import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast, Button } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import animationData from "../animations/typing.json";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";

import imga from "../chatbg2.png";

const ENDPOINT =
  // "https://chat-appli-mern.herokuapp.com/";
  "http://localhost:8000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();
  const [newMessageForChat, setNewMessageForChat] = useState("");
  const [userStatus, setUserStatus] = useState(false);
  const [personalChat, setPersonalChat] = useState("");
  const [nowTime, setNowTime] = useState();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const {
    lastSeen,
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
  } = ChatState();
  // console.log("single Chat ", user);
  // console.log("single Chat ", user.userStatus);
  let chatPerson = selectedChat;
  // console.log("single selectedChat ", chatPerson._id);

  let logOutTime = lastSeen;
  // console.log("logOutTime ", logOutTime);
  //const e = logOutTime.getHours();
  // console.log(e);
  // const f = logOutTime.getMinutes();

  console.log("lastSeen ", lastSeen);
  // console.log()

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 8000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      console.log("DATENOW sending ", Date.now());

      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        socket.emit("new message", data);
        console.log("DATENOW sending 2", Date.now());
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 8000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  console.log(" personalChat ", selectedChat);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      newMessageRecieved && console.log("message received", Date.now());
      setNewMessageForChat(newMessageRecieved);
      console.log("message received 2", Date.now());

      // console.log("single chat newMessageRecieved", newMessageRecieved);
      // console.log(
      // "single chat newMessageRecieved",
      // newMessageRecieved.createdAt
      // );
      // setMessages([...messages, newMessageRecieved]);

      console.log(
        "selectedChatCompare._id ",
        selectedChatCompare._id,
        "newMessageRecieved.chat._id ",
        newMessageRecieved.chat._id
      );
      if (
        // !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
          setUserStatus(false);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
        setUserStatus(true);
        // console.log("message received", Date.now());
      }
    });
  });

  console.log("selectedChatCompare ", selectedChatCompare);

  const blockUser = (user, selectedChat) => {
    console.log("Block User");
    console.log(user);
    console.log(selectedChat);
    let a = getSenderFull(user, selectedChat.users);
    console.log(a._id);
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };
  let dd = lastSeen;
  // let ee = dd.toString();
  console.log(dd);

  // setNowTime(selectedChat);
  // console.log(" personalChat2 ", nowTime);

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "flex" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  <Text fontSize={{ base: "12px", md: "18px" }}>
                    {/* {user.userStatus ? "Online" : "Offline"} */}
                    {selectedChat.users[0].userStatus &&
                    selectedChat.users[1].userStatus
                      ? "Online"
                      : selectedChat.users[1].logOutTime ||
                        selectedChat.users[0].logOutTime}
                  </Text>
                  {/* <Text fontSize={{ base: "12px", md: "18px" }}>
                    
                    {selectedChat.users[0].userStatus === false ||
                    selectedChat.users[1].userStatus === false
                      ? logOutTime
                      : ""}
                  </Text> */}
                  {getSender(user, selectedChat.users)}
                  <Button
                    fontSize={{ base: "12px", md: "18px" }}
                    onClick={() => blockUser(user, selectedChat)}
                  >
                    Block {getSender(user, selectedChat.users)}
                  </Button>

                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="90%"
            borderRadius="lg"
            overflowY="hidden"
            backgroundImage={imga}
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  Typing...
                  {/* <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  /> */}
                </div>
              ) : (
                <></>
              )}
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
