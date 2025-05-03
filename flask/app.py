from flask import Flask,render_template
from flask_socketio import SocketIO,emit,join_room,leave_room

app = Flask(__name__)
socketio = SocketIO(app,cors_allowed_origins="*")

@socketio.on("signal")
def handleSignal(data):
   room = data.get("room")
   emit("signal",data,room=room,include_self=False)

@socketio.on("join")
def handle_join(data):
   room = data.get("room")
   join_room(join_room)
   emit("joined",{"msg":f"joined room {room}"},room=room)

   

if __name__ == '__main__':
   socketio.run(app,host="0.0.0.0",port=5000)
