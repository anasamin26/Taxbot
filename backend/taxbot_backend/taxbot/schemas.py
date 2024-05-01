from ninja import ModelSchema, Schema
from taxbot.models import Chat,ChatBox,User,Files
from typing import Union,List
from fastapi import UploadFile, File
from typing import Optional
from rest_framework import serializers
import io
from uuid import UUID


class ChatSchema(ModelSchema):
    class Meta:
        model = Chat
        fields = ('id','message','sender','source','fileId')

class ChatBoxSchema(ModelSchema):
    chats: List[ChatSchema] = []

    class Meta:
        model = ChatBox
        fields = ('id','name','slug','chats')

class UserSchema(ModelSchema):
    chatboxes: List[ChatBoxSchema] = []

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'slug', 'chatboxes')

class LoginSchema(Schema):
    email: str
    password: str


class ChatBoxCreateSchema(Schema):
    name: str
    chat_ids: Union[List[int], None] = None 

class UserCreateSchema(Schema):
    name: str
    email: str
    password: str
    chatbox_ids: Union[List[int], None] = None


class Error(Schema):
    message : str    

class Error401Schema(Schema):
    message: str


class UserChatboxPatch(Schema):
    chatbox_id: Union[int,None] = None
    
class ChatSchemaIn(Schema):
    userMessage: str
    selectedChatboxId: str
    source : str
    name:str
    fileId:str
    
class ChatSchemaOut(Schema):
    message: str
    sender: str
    source: str
    fileId:str

class InputAIChatSchemaIn(Schema):
    message: str
    selectedChatboxId: str
    fileId:str

class FilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Files
        fields = ['id','pdf']