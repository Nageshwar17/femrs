from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User, auth
from django.db import IntegrityError
from .models import Profile
from .serializers import UserSerializer, ProfileSerializer

class RegisterView(APIView):
    def post(self, request):
        data = request.data
        username = data.get('username')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        phone_number = data.get('phone_number')
        password1 = data.get('password1')
        password2 = data.get('password2')
        user_type = data.get('user_type')
        pan_number = data.get('pan_number')
        aadhaar_number = data.get('aadhaar_number')
        aadhaar_document = request.FILES.get('aadhaar_document')

        # Check if passwords match
        if password1 != password2:
            return Response({"error": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        # Check for existing username and email
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already registered."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Create the User
            user = User.objects.create_user(
                username=username, 
                password=password1, 
                email=email, 
                first_name=first_name, 
                last_name=last_name
            )

            # Create the Profile
            profile = Profile.objects.create(
                user=user,
                phone_number=phone_number,
                user_type=user_type,
                pan_number=pan_number,
                aadhaar_number=aadhaar_number,
                aadhaar_document=aadhaar_document
            )
            profile.save()
            user.save()

            return Response({"success": "User created successfully."}, status=status.HTTP_201_CREATED)

        except IntegrityError as e:
            if 'pan_number' in str(e):
                return Response({"error": "This PAN number is already registered."}, status=status.HTTP_400_BAD_REQUEST)
            if 'aadhaar_number' in str(e):
                return Response({"error": "This Aadhaar number is already registered."}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = auth.authenticate(username=username, password=password)
        if user is not None:
            auth.login(request, user)
            return Response({"success": "Login successful."}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        auth.logout(request)
        return Response({"success": "Logout successful."}, status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = Profile.objects.get(user=user)

        user_data = UserSerializer(user).data
        profile_data = ProfileSerializer(profile).data

        return Response({"user": user_data, "profile": profile_data}, status=status.HTTP_200_OK)


