import { generateChatResponseStream } from '../utils/ai_engine.js';

export default function chatSocketHandler(socket, io) {
  // ==================== CHAT STREAM ====================
  socket.on('chat_stream', async (data) => {
    try {
      const { message, topic = '', context = '', conversation_history = [] } = data;

      if (!message) {
        socket.emit('chat_error', { error: 'Message required' });
        return;
      }

      // Emit that chat started
      socket.emit('chat_start', { message });

      // Generate streaming response
      const result = await generateChatResponseStream(message, topic, context, conversation_history);

      // Stream the response in chunks
      for await (const chunk of result) {
        const text = chunk.text || '';
        if (text) {
          socket.emit('chat_delta', { chunk: text });
        }
      }

      socket.emit('chat_done', { message: 'Response complete' });
    } catch (error) {
      console.error('Chat stream error:', error);
      socket.emit('chat_error', { error: error.message });
    }
  });

  // ==================== JOIN ROOM ====================
  socket.on('join_room', (data) => {
    const room = data.room || socket.id;
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  // ==================== LEAVE ROOM ====================
  socket.on('leave_room', (data) => {
    const room = data.room || socket.id;
    socket.leave(room);
    console.log(`User ${socket.id} left room ${room}`);
  });
}
