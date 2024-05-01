from django.contrib import admin
from taxbot.models import Chat, User,ChatBox,Files

# Register your models here.
admin.site.register(Chat)
admin.site.register(ChatBox)
admin.site.register(User)
admin.site.register(Files)

