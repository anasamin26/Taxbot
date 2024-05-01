import { useState, useEffect } from "react";

export default function Sidebar({ setSelectedChatboxId }) {
  const [isSideSelected, setIsSideSelected] = useState("side1");
  const [loggedInUser, setLoggedInUser] = useState({ id: "", chatboxes: [] });
  const [token, setToken] = useState("");
  const [chatboxes, setChatBoxes] = useState([]);

  const handleCreateNewChat = async () => {
    try {
      console.log("Id of Logged In user: ", loggedInUser?.id);
      console.log("token Logged In user: ", token);

      if (!token || !loggedInUser?.id) {
        throw new Error("User not authenticated");
      }

      const response = await fetch("http://localhost:8000/api/createChatBox/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "New Chat Box",
          user_id: loggedInUser?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create chatbox");
      } else {
        const newChatbox = await response.json();
        console.log("Chatbox created:", newChatbox);
        setChatBoxes((prevChatboxes) => [...prevChatboxes, newChatbox]);
      }
    } catch (error) {
      console.error("Error creating chatbox:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("loggedInUser");
    if (userString) {
      const userData = JSON.parse(userString);
      const fetchChatBoxes = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            return;
          }
          const response = await fetch(
            `http://localhost:8000/api/chatboxes/${loggedInUser.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) {
            throw new Error("Failed to fetch chat boxes");
          }
          const data = await response.json();
          setChatBoxes(data);
          handleIsSelectedChatbox(data[0]?.id);
          setSelectedChatboxId(data[0]?.id);
        } catch (error) {
          console.error("Error fetching chat boxes:", error);
        }
      };
      setLoggedInUser(userData);
      setToken(token);
      fetchChatBoxes();
    }
  }, []);

  const handleIsSelectedChatbox = (id) => {
    setIsSideSelected(id);
    localStorage.setItem("selectedChatboxId", JSON.stringify(id));
    setSelectedChatboxId(id);
  };

  return (
    <div className="flex flex-col">
      <div className="lg:mt-6 lg:ml-2">
        <a
          className=" ml-2 text-xl text-black font-bold cursor-pointer"
          href="/"
        >
          Taxbot
        </a>
      </div>
      <div className="divider divider-neutral"></div>
      <div>
        <ul className="text-black">
          {chatboxes.map((chatbox) => (
            <li
              key={chatbox.id}
              className={`mt-1 ml-2 p-2 hover:bg-lime-500 cursor-pointer hover:rounded-lg mr-2 ${
                isSideSelected === chatbox.id ? "bg-lime-500 rounded-lg" : ""
              }`}
              onClick={() => handleIsSelectedChatbox(chatbox.id)}
            >
              <div>
                <div className="avatar placeholder">
                  <div className="bg-neutral text-white rounded-full w-12">
                    <span>AI</span>{" "}
                  </div>
                </div>{" "}
                <a className="ml-2">{chatbox.name}</a>
              </div>
            </li>
          ))}
          <li
            className={`mt-1 ml-2 p-2 hover:bg-lime-500 cursor-pointer hover:rounded-lg mr-2`}
            onClick={handleCreateNewChat}
          >
            <div className="flex flex-row ml-2">
              <div className="placeholder justify-center">
                <div className="w-10 h-10">
                  <img src="/create.png" />
                </div>
              </div>
              <div className="mt-3 justify-center">
                <a className="ml-2  justify-center">Create a new chat</a>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
