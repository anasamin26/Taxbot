# custom_middleware.py
import jwt
from django.http import JsonResponse
from django.conf import settings
from ninja.errors import HttpError
from taxbot.models import User

EXEMPT_URLS = ['/api/login/','/api/users/','/api/chatboxes/','/api/register/','/admin/','/admin/taxbot/user/','/admin/taxbot/chat/','/admin/taxbot/chatbox/','/admin/login/','/admin/taxbot/chatbox/02a84bdd-2204-41ea-af11-80b6a9dec6db/change/','/admin/taxbot/chat/db0c47a1-962e-4ebc-b4d2-11e81856c489/change/','/file/files/','/admin/taxbot/files/']

def jwt_middleware(get_response):
    def middleware(request):
        print("path: ",request.path)
        if request.path in EXEMPT_URLS:
            print("match: ",request.path)
            return get_response(request)

        authorization_header = request.headers.get('Authorization', '')
        if authorization_header:
            token = authorization_header.split(' ')[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                email = payload['email']
                user = User.objects.get(email=email)
                request.user = user
            except jwt.ExpiredSignatureError:
                raise HttpError(401, 'Token expired')
            except jwt.InvalidTokenError:
                raise HttpError(401, 'Invalid token')
        else:
            # Handle case where 'Authorization' header is not present
            raise HttpError(401, 'Authorization header missing')
        return get_response(request)
    return middleware
