from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EquipmentViewSet

# Create a router and register our viewset
router = DefaultRouter()
router.register(r'equipment', EquipmentViewSet, basename='equipment')

urlpatterns = [
    path('', include(router.urls)),  # Includes all auto-generated routes
]
