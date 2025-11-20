import { useState, useEffect } from 'react'
import { useSocket } from './socket/socket.js'

function App() {
  const [username, setUsername] = useState('')
  const [inputUsername, setInputUsername] = useState('')
  const [message, setMessage] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [currentRoom, setCurrentRoom] = useState('general')
  const [newRoomName, setNewRoomName] = useState('')
  const [rooms, setRooms] = useState([])
  const [file, setFile] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const { isConnected, connectionStatus, connect, disconnect, messages, users, typingUsers, sendMessage, sendPrivateMessage, setTyping, joinRoom, createRoom, sendFile, addReaction, markAsRead, fetchMessages } = useSocket()

  // Update document title with unread count
  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) Socket.io Chat App`;
    } else {
      document.title = 'Socket.io Chat App';
    }
  }, [unreadCount]);

  // Handle focus/blur events to reset unread count
  useEffect(() => {
    const handleFocus = () => {
      setUnreadCount(0);
    };

    const handleBlur = () => {
      // Unread count will be incremented when messages arrive
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Increment unread count when new messages arrive and window is not focused
  useEffect(() => {
    if (!document.hasFocus() && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.system && lastMessage.sender !== username) {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [messages, username]);

  const handleConnect = () => {
    if (inputUsername.trim()) {
      setUsername(inputUsername.trim())
      connect(inputUsername.trim())
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setUsername('')
    setInputUsername('')
    setUnreadCount(0)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-8">
          Socket.io Chat App
        </h1>

        {!isConnected ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
              Connect to Chat
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter your username"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleConnect}
                disabled={!inputUsername.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Connect
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status and Users */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-gray-800 dark:text-white">
                      Connected as: <strong className="text-blue-600">{username}</strong>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status: <span className={`font-medium ${
                        connectionStatus === 'connected' ? 'text-green-600' :
                        connectionStatus === 'connecting' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {connectionStatus}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Online Users ({users.length})
                </h3>
                <ul className="space-y-2">
                  {users.map((user) => (
                    <li
                      key={user.id}
                      className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        selectedUser?.id === user.id
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      {user.username}
                    </li>
                  ))}
                </ul>
                {selectedUser && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Selected: <strong>{selectedUser.username}</strong> for private messaging
                    </p>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Clear selection
                    </button>
                  </div>
                )}
              </div>

              {/* Rooms */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Rooms
                </h3>
                <div className="space-y-2 mb-4">
                  {rooms.map((room) => (
                    <button
                      key={room}
                      onClick={() => handleJoinRoom(room)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        currentRoom === room
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      #{room}
                    </button>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="New room name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleCreateRoom}
                    disabled={!newRoomName.trim()}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm transition duration-200"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Messages - #{currentRoom}
                </h3>
                <div className="h-96 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-4 p-3 rounded-lg ${
                        msg.system
                          ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 italic'
                          : 'bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500'
                      }`}
                    >
                      {msg.system ? (
                        <em>{msg.message}</em>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <strong className={`text-blue-600 dark:text-blue-400 ${msg.isPrivate ? 'text-purple-600 dark:text-purple-400' : ''}`}>
                                {msg.sender}:{msg.isPrivate && ' (Private)'}
                              </strong>
                              {msg.file && (
                                <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                  📎 {msg.file.name}
                                </span>
                              )}
                            </div>
                            {msg.file ? (
                              msg.file.type.startsWith('image/') ? (
                                <img src={msg.file.url} alt={msg.file.name} className="max-w-xs max-h-48 mt-2 rounded" />
                              ) : (
                                <a href={msg.file.url} download={msg.file.name} className="text-blue-500 hover:underline mt-2 block">
                                  Download {msg.file.name}
                                </a>
                              )
                            ) : (
                              <p className="mt-1">{msg.message}</p>
                            )}
                            {msg.reactions && msg.reactions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {msg.reactions.map((reaction, idx) => (
                                  <span key={idx} className="text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-500">
                                    {reaction.emoji} {reaction.count}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <small className="text-gray-500 dark:text-gray-400">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </small>
                            {msg.readBy && msg.readBy.length > 0 && (
                              <small className="text-gray-400 dark:text-gray-500">
                                ✓ Read by {msg.readBy.length}
                              </small>
                            )}
                            <div className="flex space-x-1 mt-1">
                              <button onClick={() => addReaction(msg.id, '👍')} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500">👍</button>
                              <button onClick={() => addReaction(msg.id, '❤️')} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500">❤️</button>
                              <button onClick={() => addReaction(msg.id, '😂')} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500">😂</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {typingUsers.length > 0 && (
                  <div className="mt-4 text-gray-600 dark:text-gray-400 italic">
                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </div>
                )}

                {/* File Upload */}
                <div className="mt-4 flex space-x-2">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleSendFile}
                    disabled={!file}
                    className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                  >
                    Upload
                  </button>
                </div>

                {/* Message Input */}
                <div className="mt-4 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      setTyping(e.target.value.trim() !== '');
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && message.trim()) {
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  function handleSendMessage() {
    if (message.trim()) {
      if (selectedUser) {
        sendPrivateMessage(selectedUser.id, message.trim());
      } else {
        sendMessage(message.trim());
      }
      setMessage('');
      setTyping(false);
    }
  }

  function handleJoinRoom(roomName) {
    setCurrentRoom(roomName);
    joinRoom(roomName);
  }

  function handleCreateRoom() {
    if (newRoomName.trim() && !rooms.includes(newRoomName.trim())) {
      createRoom(newRoomName.trim());
      setRooms([...rooms, newRoomName.trim()]);
      setNewRoomName('');
    }
  }

  function handleSendFile() {
    if (file) {
      sendFile(file);
      setFile(null);
    }
  }
}

export default App
