from django.urls import path
from .views import RegisterView, LoginView, MeView, RefreshTokenView, TaskView, FetchAllUsers

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('refresh/', RefreshTokenView.as_view()),
    path('me/', MeView.as_view()),
    #path('objects/<str:object_type>/', EncryptedObjectView.as_view()),
    path("tasks/", TaskView.as_view()),
    path("allusers/", FetchAllUsers.as_view()),
]