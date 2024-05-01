import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Chat({ selectedChatboxId }) {
  const [fileName, setFileName] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [file, setFile] = useState([]);
  const [chats, setChats] = useState([]);
  const router = useRouter();
  const [fileId, setFileId] = useState("");
  const chatAreaRef = useRef(null);

  useEffect(() => {
    if (selectedChatboxId) {
      handlePopulateChats(selectedChatboxId);
    }
  }, [selectedChatboxId]);

  const handlePopulateChats = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/chatbox/chat/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }
      const data = await response.json();
      console.log(data);
      setChats(data);
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const handleFile = (event) => {
    if (event.target.files) {
      setFileName(event.target.files[0].name);
      setFile(event.target.files[0]);
    } else {
      setFileName("");
      setFile([]);
    }
  };
  const hiddenFileInput = useRef(null);

  const handleClick = () => {
    hiddenFileInput.current.click();
  };
  function scrollToBottom() {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }

  let api = "http://localhost:8000/file";

  async function addMessage() {
    try {
      const userString = JSON.parse(localStorage.getItem("loggedInUser"));
      let name = userString.name;
      let fid = "";

      if (file.size > 0) {
        fid = await saveFile();
      }

      const response = await fetch(
        "http://localhost:8000/api/newchatmessage/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userMessage: userMessage,
            name: name,
            selectedChatboxId: selectedChatboxId,
            source: "Human",
            fileId: fid,
          }),
        }
      );

      if (response.ok) {
        const newChat = await response.json();
        console.log("Chat created:", newChat);
        setChats((prevChats) => [...prevChats, newChat]);
        const responseFromAi = await fetch(
          "http://localhost:8000/api/airesponse/",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              selectedChatboxId: selectedChatboxId,
              message: newChat.message,
              fileId: newChat.fileId,
            }),
          }
        );
        if (responseFromAi.ok) {
          const newChat = await responseFromAi.json();
          console.log("Chat created:", newChat);
          setChats((prevChats) => [...prevChats, newChat]);
        }
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error adding message:", error);
    }
  }

  const saveFile = async () => {
    try {
      console.log("Button clicked");

      let formData = new FormData();
      formData.append("pdf", file);

      let axiosConfig = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      };

      console.log(formData);
      const response = await axios.post(api + "/files/", formData, axiosConfig);
      console.log(response);
      return response.data.id;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  return (
    <>
      {/* chat area */}
      <div
        className="p-8 flex-grow flex justify-center items-start  overflow-y-auto"
        id="chatArea"
      >
        <div className="w-3/4 chat-window" ref={chatAreaRef}>
          {chats?.map((chat, index) => (
            <div
              key={index}
              className={`chat ${
                chat.source === "AI" ? "chat-start" : "chat-end"
              }`}
            >
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <img
                    alt="User Avatar"
                    src={`${
                      chat.source === "AI"
                        ? "/artificial-intelligence.png"
                        : "/profile.png"
                    }`}
                  />
                </div>
              </div>
              <div className="chat-header">
                {chat.sender}
                <time className="text-xs opacity-50">{chat.time}</time>
              </div>
              <div className="chat-bubble">
                {chat.message}
                {chat?.file != null && (
                  <div>
                    <div className="divider"></div>
                    <div className="w-6 ">
                      <img
                        alt={
                          chat.fileType === "PDF" ? "PDF File" : "Image File"
                        }
                        src={chat.fileType === "PDF" ? "/pdf.png" : "/img.png"}
                      />
                    </div>
                    <p className="text-white">{chat.file}</p>
                  </div>
                )}
              </div>
              <div className="chat-footer opacity-50">{chat.footer}</div>
            </div>
          ))}
        </div>
      </div>

      {/* input component */}
      <div className="input-container w-3/4 bg-black p-6 absolute bottom-0 left-1/2 transform -translate-x-1/2">
        <div className="input input-bordered flex items-center gap-2">
          <div onClick={handleClick}>
            <img src="/attach-file.png" className="w-5 h-5 cursor-pointer" />
            <input
              type="file"
              ref={hiddenFileInput}
              style={{ display: "none" }}
              accept=".pdf, image/*"
              onChange={handleFile}
            />
          </div>
          <input
            type="text"
            className="flex-grow min-w-0"
            placeholder="Ask Anything"
            value={userMessage}
            onChange={(e) => {
              setUserMessage(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (userMessage !== "") {
                  addMessage(userMessage);
                  setUserMessage("");
                }
              }
            }}
          />
          <img
            src="/right-arrow.png"
            className="w-5 h-5 cursor-pointer"
            onClick={addMessage}
          />
        </div>
        {fileName && (
          <div className="mt-2 ml-3 timeline-box bg-white w-60 h-30 text-black">
            {fileName}
          </div>
        )}
      </div>
    </>
  );
}
