import React, { useState } from "react";
import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  // console.log("chat");
  // console.log({ messages });

  return (
    <>
      <ScrollableFeed>
        {messages &&
          messages.map((m, i) => {
            // timeFun(m.createdAt);
            // console.log("chat message in console", m.createdAt.slice(11, 16));
            const d = new Date(m.createdAt);
            // console.log(d);
            const e = d.getHours();
            // console.log(e);
            const f = d.getMinutes();
            // console.log(f);
            let p;

            return (
              <div style={{ display: "flex" }} key={m._id}>
                {(isSameSender(messages, m, i, user._id) ||
                  isLastMessage(messages, i, user._id)) && (
                  <Tooltip
                    label={m.sender.name}
                    placement="bottom-start"
                    hasArrow
                  >
                    <Avatar
                      mt="7px"
                      mr={1}
                      size="sm"
                      cursor="pointer"
                      name={m.sender.name}
                      src={m.sender.pic}
                    />
                  </Tooltip>
                )}
                <span
                  style={{
                    backgroundColor: `${
                      m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                    }`,
                    marginLeft: isSameSenderMargin(messages, m, i, user._id),
                    marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                    borderRadius: "20px",
                    padding: "5px 15px",
                    maxWidth: "75%",
                  }}
                >
                  {m.content}
                  <div
                    style={{
                      fontSize: "8px",
                      // marginLeft: isSameSenderMargin(messages, m, i, user._id),
                    }}
                  >
                    {e > 12 ? e - 12 : e}:{f}
                    {e >= 12 ? (p = "PM") : (p = "AM")}
                    {/* {Date.now()} */}
                  </div>
                </span>
              </div>
            );
          })}
      </ScrollableFeed>
    </>
  );
};

export default ScrollableChat;
