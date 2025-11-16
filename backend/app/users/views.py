from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import TwoFACode, ActivityFeed, CountryCurrency
from .serializers import UserRegistrationSerializer, UserLoginSerializer, TwoFASerializer, UserProfileSerializer, CountryCurrencySerializer

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .tasks import send_2fa_email
import pyotp
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Create initial account
        from app.bank.models import Account
        import random
        account_number = f"PW{random.randint(10000000, 99999999)}"
        Account.objects.create(user=user, account_number=account_number, routing_number="021000021")

        ActivityFeed.objects.create(
            user=user,
            action_type='profile_update',
            details={'action': 'user_registered'}
        )
        return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_user(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        seed_phrase = serializer.validated_data['seed_phrase']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if user.check_seed_phrase(seed_phrase):
            if user.two_fa_enabled:
                code = pyotp.random_base32()[:6]
                TwoFACode.objects.create(
                    user=user,
                    code=code,
                    expires_at=timezone.now() + timedelta(minutes=10)
                )
                send_2fa_email.delay(user.email, code)
                return Response({'message': '2FA code sent', 'requires_2fa': True}, status=status.HTTP_200_OK)
            else:
                from rest_framework_simplejwt.tokens import RefreshToken
                refresh = RefreshToken.for_user(user)
                ActivityFeed.objects.create(user=user, action_type='login', details={})
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': UserProfileSerializer(user).data
                }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_2fa(request):
    serializer = TwoFASerializer(data=request.data)
    if serializer.is_valid():
        code = serializer.validated_data['code']
        try:
            two_fa_code = TwoFACode.objects.get(code=code, is_used=False, expires_at__gt=timezone.now())
            user = two_fa_code.user
            two_fa_code.is_used = True
            two_fa_code.save()

            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            ActivityFeed.objects.create(user=user, action_type='login', details={'2fa': True})
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_200_OK)
        except TwoFACode.DoesNotExist:
            return Response({'error': 'Invalid or expired code'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
def get_profile(request):
    user = request.user
    if request.method == 'PUT':
        # Handle multipart form data for profile photo
        if request.content_type.startswith('multipart/form-data'):
            serializer = UserProfileSerializer(user, data=request.data, partial=True)
        else:
            serializer = UserProfileSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    serializer = UserProfileSerializer(user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_countries(request):
    countries = CountryCurrency.objects.filter(is_active=True)
    serializer = CountryCurrencySerializer(countries, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_activity_feed(request):
    activities = ActivityFeed.objects.filter(user=request.user).order_by('-timestamp')[:10]
    data = []
    for activity in activities:
        data.append({
            'id': str(activity.id),
            'action_type': activity.action_type,
            'details': activity.details,
            'timestamp': activity.timestamp.isoformat()
        })
    return Response(data)
