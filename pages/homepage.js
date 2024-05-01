import Chat from "../components/Chat";
import Sidebar from "../components/Sidebar";
import { useState } from "react";
import "../globals.css";

export default function ChatPage() {
  const [selectedChatboxId, setSelectedChatboxId] = useState("");

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="bg-black flex flex-grow">
          <div className="w-80 bg-lime-400">
            <Sidebar setSelectedChatboxId={setSelectedChatboxId} />
          </div>
          <div className="flex flex-col flex-grow relative">
            <div
              className="p-8 flex-grow flex justify-center items-start mt-10 overflow-y-auto"
              id="chatArea"
            >
              <Chat selectedChatboxId={selectedChatboxId} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
