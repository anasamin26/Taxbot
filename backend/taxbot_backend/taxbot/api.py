from ninja import NinjaAPI
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from taxbot.models import ChatBox, Chat, User, Files
from ninja.errors import HttpError
from django.contrib.auth.hashers import make_password
from ninja.security import HttpBearer
from django.http import JsonResponse
import jwt
from django.conf import settings
from typing import Union,List
from uuid import UUID
from ninja import  File
from rest_framework.request import Request
from .pdfutil import get_pdf_text, get_text_chunks,get_vectorstore,get_conversation_chain
from dotenv import load_dotenv


from taxbot.schemas import (
    ChatBoxSchema,
    ChatSchema,
    UserSchema,
    UserCreateSchema,
    ChatBoxCreateSchema,
    Error,
    UserChatboxPatch,
    LoginSchema,
    Error401Schema,
    ChatSchemaIn,
    ChatSchemaOut,
    InputAIChatSchemaIn
)

app = NinjaAPI()


@app.get("users/", response=List[UserSchema])
def get_users(request):
    return User.objects.all()


@app.get("users/{slug}/", response=UserSchema)
def get_user(request, slug: str):
    user = get_object_or_404(User, slug=slug)
    return user


@app.get("chatboxes/", response=list[ChatBoxSchema])
def get_chatboxes(request):
    return ChatBox.objects.all()


@app.get("chatboxes/{slug}/", response=ChatBoxSchema)
def get_chatbox(request, slug: str):
    chatbox = get_object_or_404(ChatBox, slug=slug)
    return chatbox


@app.get("chats/", response=List[ChatSchema])
def get_chats(request):
    return Chat.objects.all()


# post requests


@app.post("/register/", response=UserSchema)
def create_user(request, user_create: UserCreateSchema):
    chatbox_ids = user_create.chatbox_ids
    user_data = user_create.dict(exclude_unset=True)
    password = user_data.pop("password")
    user = User.objects.create_user(password=password, **user_data)
    if chatbox_ids:
        user.chatboxes.add(*chatbox_ids)
    return user


@app.post("/createChatBox/", response=ChatBoxSchema)
def create_chatbox(request, chatbox_create: ChatBoxCreateSchema):
    print("Inside: create_chatbox")
    print("Request: ",request)
    user_id = request.user.id  
    user = get_object_or_404(User, id=user_id)
    chat_ids = chatbox_create.chat_ids
    chatbox_data = chatbox_create.dict(exclude_unset=True)
    chatbox = ChatBox.objects.create(**chatbox_data)
    if chat_ids:
        chatbox.chats.add(*chat_ids)
    user.chatboxes.add(chatbox)
    return chatbox



from django.contrib.auth.hashers import check_password

@app.post("/login/", response=UserSchema)
def user_login(request, login_data: LoginSchema):
    email = login_data.email
    password = login_data.password
    user = User.objects.get(email=email)  # Assuming you have a User model
    stored_password = user.password  # Assuming the password is stored in the User model

    if check_password(password, stored_password):
        token = jwt.encode({'email': email}, settings.SECRET_KEY, algorithm='HS256')
        print("Password is correct")
        return JsonResponse({'token': token})
    else:
        raise HttpError(401, "Invalid email or password")


@app.get("/check-auth/", response=UserSchema)
def check_auth(request):
    token = request.headers.get('Authorization')
    
    if token:
        try:
            decoded_token = jwt.decode(token.split()[1], settings.SECRET_KEY, algorithms=['HS256'])
            user_email = decoded_token.get('email')
            user = User.objects.get(email=user_email)
            if user is not None:
                return user 
        except jwt.ExpiredSignatureError:
            return JsonResponse({"message": "Token has expired"}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({"message": "Invalid token"}, status=401)
    else:
        return JsonResponse({"message": "No token provided"}, status=401)

@app.get("/chatboxes/{user_id}")
def get_chat_boxes(request, user_id: int):
    try:
        user = User.objects.get(id=user_id)
        chat_boxes = user.chatboxes.all()  
        return chat_boxes
    except User.DoesNotExist:
        return 404, {"message": "User not found"}
    except Exception as e:
        return 500, {"message": "Failed to fetch chat boxes", "error": str(e)}



@app.get("/chatbox/chat/{id}", response=List[ChatSchema])
def get_chats(request, id: str):
    try:
        chatbox = ChatBox.objects.get(id=id)
        return chatbox.chats.all()
    except ChatBox.DoesNotExist:
        return 404, {"message": "Chatbox not found"}
    except Exception as e:
        return 500, {"message": f"Internal Server Error: {e}"}



@app.post("/newchatmessage/", response=ChatSchemaOut)
def create_chat(request, chat_data: ChatSchemaIn ):
  try:
    message = chat_data.userMessage
    selectedChatBoxId = chat_data.selectedChatboxId
    sender = chat_data.name
    source = chat_data.source
    fileId = chat_data.fileId

    chatbox = ChatBox.objects.get(id=selectedChatBoxId)
    chat_data = {
        "message": message,
        "sender": sender,
        "source": "Human", 
        "fileId":fileId,
    }

    print("chatbox body:", chat_data)  

    new_chat = Chat.objects.create(**chat_data)

    chatbox.chats.add(new_chat)

    return new_chat

  except Exception as e:
    return JsonResponse({"error": f"Error creating message: {str(e)}"})

@app.post("/airesponse/", response=ChatSchemaOut)
def create_aichat(request, chat_data: InputAIChatSchemaIn):
    try:
        load_dotenv()
        user_question = chat_data.message 
        fileId = chat_data.fileId
        print("Message body:", user_question)  
        print("File body:", fileId) 
        chatboxId = chat_data.selectedChatboxId
        chatbox = ChatBox.objects.get(id=chatboxId)
        print("chatbox body:", chatbox)  

        pdf = Files.objects.get(id=fileId)
        print("Relevent pdf file: ",pdf)
        relFile =pdf.pdf
        memory =  None
        if user_question:
            raw_text = get_pdf_text(relFile)
            text_chunks = get_text_chunks(raw_text)
            vectorstore = get_vectorstore(text_chunks)
            ai_response = get_conversation_chain(vectorstore, memory=memory).get_response(user_question)
            print("Response from ai",ai_response)
            chat_data = {
                "message": ai_response["response"],
                "sender": "TaxBot",
                "source": "AI", 
            }
            new_chat = Chat.objects.create(**chat_data)
            chatbox.chats.add(new_chat)
            return new_chat

    except Exception as e:
        return JsonResponse({"error": f"Error creating message: {str(e)}"})
  