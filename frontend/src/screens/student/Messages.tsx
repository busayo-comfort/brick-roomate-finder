// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate, useSearch } from "@/lib/router-compat";
// import { useAuth } from "../../context/AuthContext";
// import { useChat } from "../../context/ChatContext";
// import Sidebar from "../../components/Sidebar";
// import { mockData } from "../../data/mockData";
// import { ArrowLeft, MessageCircle, Send } from "lucide-react";

// export default function Messages() { const { isAuthenticated, currentUser, authReady } = useAuth(); const { getConversations, getMessages, sendMessage, markConversationRead } = useChat(); const navigate = useNavigate(); const search = useSearch({ strict: false }) as { with?: string }; const [selected, setSelected] = useState<{ id: string; name: string; image: string } | null>(null); const [text, setText] = useState(""); const scrollRef = useRef<HTMLDivElement>(null); const conversations = useMemo(() => currentUser ? getConversations(currentUser.id) : [], [currentUser, getConversations]); const messages = useMemo(() => currentUser && selected ? getMessages(currentUser.id, selected.id) : [], [currentUser, selected, getMessages]); useEffect(() => { if (authReady && !isAuthenticated) navigate("/login"); }, [authReady, isAuthenticated, navigate]); useEffect(() => { if (!search.with || selected?.id === search.with) return; const conversation = conversations.find(item => item.otherUserId === search.with); const profile = mockData.students.find(item => item.id === search.with) ?? mockData.roommates.find(item => item.id === search.with); if (conversation) setSelected({ id: conversation.otherUserId, name: conversation.otherUserName, image: conversation.otherUserImage }); else if (profile) setSelected({ id: profile.id, name: profile.name, image: profile.image || "" }); }, [search.with, conversations, selected?.id]); useEffect(() => { if (!currentUser || !selected) return; markConversationRead(currentUser.id, selected.id); scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [currentUser, selected, messages.length, markConversationRead]); if (!authReady || !isAuthenticated || !currentUser) return null; const open = (id: string, name: string, image: string) => { setSelected({ id, name, image }); navigate(`/student/messages?with=${id}`, { replace: true }); }; 
// const send = async () => {
//   if (!text.trim() || !selected) return;
  
//   // Find the connection ID for this conversation
//   const conversation = conversations.find(c => c.otherUserId === selected.id);
//   if (!conversation) {
//     console.error('No connection found');
//     return;
//   }

//   try {
//     await sendMessage(
//       { id: currentUser.id, name: currentUser.name, image: currentUser.image },
//       { id: selected.id, name: selected.name, image: selected.image },
//       text,
//       conversation.id
//     );
//     setText("");
//   } catch (error) {
//     console.error('Failed to send message:', error);
//   }
// }; return <div className="min-h-[calc(100vh-70px)] bg-slate-50 lg:flex"><Sidebar /><main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10"><div className="mx-auto flex h-[calc(100vh-120px)] max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><aside className={`${selected ? "hidden lg:block" : "block"} w-full shrink-0 border-r border-slate-100 lg:w-80`}><div className="border-b border-slate-100 p-5"><p className="text-sm font-semibold uppercase tracking-wider text-teal-600">Communication</p><h1 className="mt-2 text-2xl font-bold text-slate-900">Messages</h1><p className="mt-1 text-sm text-slate-500">Chat with potential roommates.</p></div><div className="divide-y divide-slate-100">{conversations.length ? conversations.map(conversation => <button key={conversation.id} onClick={() => open(conversation.otherUserId, conversation.otherUserName, conversation.otherUserImage)} className={`flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50 ${selected?.id === conversation.otherUserId ? "bg-teal-50" : ""}`}><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-teal-100 font-bold text-teal-700">{conversation.otherUserImage ? <img src={conversation.otherUserImage} alt="" className="h-full w-full object-cover" /> : conversation.otherUserName[0]}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-800">{conversation.otherUserName}</p><p className="truncate text-sm text-slate-500">{conversation.lastMessage}</p></div>{conversation.unreadCount > 0 && <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">{conversation.unreadCount}</span>}</button>) : <div className="p-8 text-center"><MessageCircle className="mx-auto text-slate-300" size={36} /><p className="mt-3 text-sm text-slate-500">No conversations yet.</p><button onClick={() => navigate("/student/roommates")} className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white">Find roommates</button></div>}</div></aside><section className={`${selected ? "flex" : "hidden lg:flex"} min-w-0 flex-1 flex-col bg-slate-50`}>{selected ? <><header className="flex items-center gap-3 border-b border-slate-100 bg-white p-5"><button className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => { setSelected(null); navigate("/student/messages", { replace: true }); }}><ArrowLeft size={19} /></button><div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-teal-100 font-bold text-teal-700">{selected.image ? <img src={selected.image} alt="" className="h-full w-full object-cover" /> : selected.name[0]}</div><div><p className="font-semibold text-slate-900">{selected.name}</p><p className="text-xs text-slate-500">Potential roommate</p></div></header><div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">{messages.length ? messages.map(message => <div key={message.id} className={`flex ${message.senderId === currentUser.id ? "justify-end" : "justify-start"}`}><div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${message.senderId === currentUser.id ? "rounded-br-sm bg-slate-900 text-white" : "rounded-bl-sm border border-slate-200 bg-white text-slate-700"}`}><p>{message.content}</p><p className="mt-1 text-[11px] opacity-60">{new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div></div>) : <div className="m-auto text-center text-slate-400"><MessageCircle className="mx-auto" size={36} /><p className="mt-3 text-sm">Say hello to {selected.name.split(" ")[0]}.</p></div>}</div><div className="border-t border-slate-100 bg-white p-4"><div className="flex items-end gap-3"><textarea className="min-h-12 flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" placeholder="Write a message..." rows={1} value={text} onChange={event => setText(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} /><button className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white hover:bg-teal-700" onClick={send} aria-label="Send message"><Send size={18} /></button></div></div></> : <div className="m-auto hidden text-center lg:block"><MessageCircle className="mx-auto text-slate-300" size={50} /><h2 className="mt-4 text-xl font-semibold text-slate-800">Choose a conversation</h2><p className="mt-2 text-sm text-slate-500">Your roommate conversations will appear here.</p></div>}</section></div></main></div>; }

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearch } from "@/lib/router-compat";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import Sidebar from "../../components/Sidebar";
import { mockData } from "../../data/mockData";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";

export default function Messages() {
  const { isAuthenticated, currentUser, authReady } = useAuth();
  const { getConversations, getMessages, sendMessage, markConversationRead, loadMessages } = useChat();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { with?: string };
  const [selected, setSelected] = useState<{ id: string; name: string; image: string } | null>(null);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversations = useMemo(
    () => (currentUser ? getConversations(currentUser.id) : []),
    [currentUser, getConversations]
  );

  const messages = useMemo(
    () => (currentUser && selected ? getMessages(currentUser.id, selected.id) : []),
    [currentUser, selected, getMessages]
  );

  useEffect(() => {
    if (authReady && !isAuthenticated) navigate("/login");
  }, [authReady, isAuthenticated, navigate]);

  useEffect(() => {
    if (!search.with || selected?.id === search.with) return;
    const conversation = conversations.find((item) => item.otherUserId === search.with);
    const profile =
      mockData.students.find((item) => item.id === search.with) ??
      mockData.roommates.find((item) => item.id === search.with);
    if (conversation)
      setSelected({
        id: conversation.otherUserId,
        name: conversation.otherUserName,
        image: conversation.otherUserImage,
      });
    else if (profile) setSelected({ id: profile.id, name: profile.name, image: profile.image || "" });
  }, [search.with, conversations, selected?.id]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selected) return;
    const conversation = conversations.find((c) => c.otherUserId === selected.id);
    if (conversation) {
      loadMessages(conversation.id);
    }
  }, [selected, conversations, loadMessages]);

  useEffect(() => {
    if (!currentUser || !selected) return;
    markConversationRead(currentUser.id, selected.id);
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [currentUser, selected, messages.length, markConversationRead]);

  if (!authReady || !isAuthenticated || !currentUser) return null;

  const open = (id: string, name: string, image: string) => {
    setSelected({ id, name, image });
    navigate(`/student/messages?with=${id}`, { replace: true });
  };

  const send = async () => {
    if (!text.trim() || !selected) return;

    // Find the connection ID for this conversation
    const conversation = conversations.find((c) => c.otherUserId === selected.id);
    if (!conversation) {
      console.error("No connection found");
      return;
    }

    try {
      await sendMessage(
        { id: currentUser.id, name: currentUser.name, image: currentUser.image },
        { id: selected.id, name: selected.name, image: selected.image },
        text,
        conversation.id
      );
      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-slate-50 lg:flex">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto flex h-[calc(100vh-120px)] max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <aside
            className={`${selected ? "hidden lg:block" : "block"} w-full shrink-0 border-r border-slate-100 lg:w-80`}
          >
            <div className="border-b border-slate-100 p-5">
              <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">
                Communication
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900">Messages</h1>
              <p className="mt-1 text-sm text-slate-500">Chat with potential roommates.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {conversations.length ? (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() =>
                      open(conversation.otherUserId, conversation.otherUserName, conversation.otherUserImage)
                    }
                    className={`flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50 ${
                      selected?.id === conversation.otherUserId ? "bg-teal-50" : ""
                    }`}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-teal-100 font-bold text-teal-700">
                      {conversation.otherUserImage ? (
                        <img
                          src={conversation.otherUserImage}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        conversation.otherUserName[0]
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-800">{conversation.otherUserName}</p>
                      <p className="truncate text-sm text-slate-500">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-8 text-center">
                  <MessageCircle className="mx-auto text-slate-300" size={36} />
                  <p className="mt-3 text-sm text-slate-500">No conversations yet.</p>
                  <button
                    onClick={() => navigate("/student/roommates")}
                    className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Find roommates
                  </button>
                </div>
              )}
            </div>
          </aside>

          <section
            className={`${selected ? "flex" : "hidden lg:flex"} min-w-0 flex-1 flex-col bg-slate-50`}
          >
            {selected ? (
              <>
                <header className="flex items-center gap-3 border-b border-slate-100 bg-white p-5">
                  <button
                    className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                    onClick={() => {
                      setSelected(null);
                      navigate("/student/messages", { replace: true });
                    }}
                  >
                    <ArrowLeft size={19} />
                  </button>
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-teal-100 font-bold text-teal-700">
                    {selected.image ? (
                      <img src={selected.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      selected.name[0]
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{selected.name}</p>
                    <p className="text-xs text-slate-500">Potential roommate</p>
                  </div>
                </header>

                <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
                  {messages.length ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === currentUser.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${
                            message.senderId === currentUser.id
                              ? "rounded-br-sm bg-slate-900 text-white"
                              : "rounded-bl-sm border border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="mt-1 text-[11px] opacity-60">
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="m-auto text-center text-slate-400">
                      <MessageCircle className="mx-auto" size={36} />
                      <p className="mt-3 text-sm">Say hello to {selected.name.split(" ")[0]}.</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 bg-white p-4">
                  <div className="flex items-end gap-3">
                    <textarea
                      className="min-h-12 flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                      placeholder="Write a message..."
                      rows={1}
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          send();
                        }
                      }}
                    />
                    <button
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white hover:bg-teal-700"
                      onClick={send}
                      aria-label="Send message"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="m-auto hidden text-center lg:block">
                <MessageCircle className="mx-auto text-slate-300" size={50} />
                <h2 className="mt-4 text-xl font-semibold text-slate-800">Choose a conversation</h2>
                <p className="mt-2 text-sm text-slate-500">Your roommate conversations will appear here.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}