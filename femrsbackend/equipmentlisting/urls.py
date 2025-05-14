from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf.urls.static import static
from femrsbackend import settings
from .views import EquipmentViewSet

# Create a router and register our viewset
router = DefaultRouter()
router.register(r'equipment', EquipmentViewSet, basename='equipment')

urlpatterns = [
    path('', include(router.urls)),  # Includes all auto-generated routes
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
