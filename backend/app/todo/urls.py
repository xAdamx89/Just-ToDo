from rest_framework.routers import DefaultRouter
from .views import EncryptedTaskViewSet

router = DefaultRouter()
router.register(r"tasks", EncryptedTaskViewSet, basename="tasks")

urlpatterns = router.urls
