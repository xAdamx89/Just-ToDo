# from rest_framework import generics, status
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny
# from .serializers import RegisterSerializer, LoginSerializer
# from django.contrib.auth.models import User
# from rest_framework.views import APIView
# from rest_framework.views import APIView
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from rest_framework import status
# from .models import UserData


# class RegisterView(generics.CreateAPIView):
#     queryset = User.objects.all()
#     serializer_class = RegisterSerializer
#     permission_classes = [AllowAny]


# class LoginView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         serializer = LoginSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         return Response(serializer.validated_data, status=status.HTTP_200_OK)


# class MeView(APIView):
#     def get(self, request):
#         return Response({
#             "id": request.user.id,
#             "username": request.user.username,
#             "email": request.user.email
#         })

# class UserDataView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """Zwraca zaszyfrowane dane użytkownika"""
#         try:
#             userdata = request.user.userdata
#         except UserData.DoesNotExist:
#             # jeśli nie ma danych, tworzymy pusty rekord
#             userdata = UserData.objects.create(user=request.user)

#         return Response({
#             "tasks": userdata.encrypted_tasks,
#             "fifo": userdata.encrypted_fifo,
#             "settings": userdata.encrypted_settings,
#         })

#     def post(self, request):
#         """Aktualizuje zaszyfrowane dane użytkownika"""
#         try:
#             userdata = request.user.userdata
#         except UserData.DoesNotExist:
#             userdata = UserData.objects.create(user=request.user)

#         # spodziewamy się, że klient wysyła już zaszyfrowane JSONy
#         userdata.encrypted_tasks = request.data.get("tasks", userdata.encrypted_tasks)
#         userdata.encrypted_fifo = request.data.get("fifo", userdata.encrypted_fifo)
#         userdata.encrypted_settings = request.data.get("settings", userdata.encrypted_settings)
#         userdata.save()

#         return Response({"status": "ok"}, status=status.HTTP_200_OK)
    
    