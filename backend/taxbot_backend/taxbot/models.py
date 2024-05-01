# models.py
import uuid
from django.db import models
from django_extensions.db.fields import AutoSlugField
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class Files(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pdf = models.FileField(upload_to='store/pdfs/')

    def __str__(self):
        return f"File: {self.pdf} - ID: {self.id}"

class Chat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.CharField(max_length=5000)
    sender = models.CharField(max_length=100)  
    source = models.CharField(max_length=200) 
    fileId = models.CharField(max_length=200)
    def __str__(self):
        return f"Chat message: {self.message} - ID: {self.id} - Sender: {self.sender}  - Source: {self.source} - File: {self.fileId}" 

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.password = make_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=200)
    slug = AutoSlugField(populate_from='name')  
    chatboxes = models.ManyToManyField('ChatBox')

    # Additional fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return f"User: {self.name} - ID: {self.id}"

class ChatBox(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = AutoSlugField(populate_from='name')  
    chats = models.ManyToManyField(Chat)

    def __str__(self):
        return f"Chat Box: {self.name} - ID: {self.id}"
