from django.urls import path
from .views import RegisterView, LoginView, MeView, EncryptedObjectView
from rest_framework_simplejwt.views import TokenRefreshView
from .views import TaskView
#from .views import EncryptedObjectview

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('refresh/', TokenRefreshView.as_view()),
    path('me/', MeView.as_view()),
    path('objects/<str:object_type>/', EncryptedObjectView.as_view()),
    path("tasks/", TaskView.as_view()),
]